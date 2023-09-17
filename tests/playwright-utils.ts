import { test as base, type Page } from '@playwright/test'
import { parse } from 'cookie'
import { authenticator, getPasswordHash } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { commitSession, getSession } from '~/utils/session.server.ts'
import { createUser } from '../tests/db-utils.ts'

export const dataCleanup = {
	users: new Set<string>(),
}

export function deleteUserByEmail(email: string) {
	return prisma.user.delete({ where: { email } })
}

export async function insertNewUser({
	email,
	password,
	profileType = 'coach',
}: {
	email?: string
	password?: string
	profileType?: 'coach' | 'player' | 'admin'
} = {}) {
	const userData = createUser()
	const user = await prisma.user.create({
		data: {
			...userData,
			email: email ?? userData.email,
			password: {
				create: {
					hash: await getPasswordHash(password || userData.email),
				},
			},
		},
		select: { id: true, email: true },
	})
	dataCleanup.users.add(user.id)
	return user
}

export const test = base.extend<{
	login: (user?: { id: string }) => ReturnType<typeof loginPage>
}>({
	login: [
		async ({ page, baseURL }, use) => {
			await use(user => loginPage({ page, baseURL, user }))
		},
		{ auto: true },
	],
})

export const { expect } = test

export async function loginPage({
	page,
	baseURL = `http://localhost:${process.env.PORT}/`,
	user: givenUser,
}: {
	page: Page
	baseURL: string | undefined
	user?: { id: string }
}) {
	const user = givenUser
		? await prisma.user.findUniqueOrThrow({
				where: { id: givenUser.id },
				select: {
					id: true,
					email: true,
				},
		  })
		: await insertNewUser()
	const session = await prisma.session.create({
		data: {
			expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			userId: user.id,
		},
		select: { id: true },
	})

	const cookieSession = await getSession()
	cookieSession.set(authenticator.sessionKey, session.id)
	const cookieValue = await commitSession(cookieSession)
	const { _session } = parse(cookieValue)
	await page.context().addCookies([
		{
			name: '_session',
			sameSite: 'Lax',
			url: baseURL,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			value: _session,
		},
	])
	return user
}

test.afterEach(async () => {
	type Delegate = {
		deleteMany: (opts: {
			where: { id: { in: Array<string> } }
		}) => Promise<unknown>
	}
	async function deleteAll(items: Set<string>, delegate: Delegate) {
		if (items.size > 0) {
			await delegate.deleteMany({
				where: { id: { in: [...items] } },
			})
		}
	}
	await deleteAll(dataCleanup.users, prisma.user)
})
