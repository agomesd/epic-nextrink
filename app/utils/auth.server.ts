import { type Password, type User } from '@prisma/client'
import { redirect } from '@remix-run/node'
import bcrypt from 'bcryptjs'
import { Authenticator } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import { prisma } from '~/utils/db.server.ts'
import { invariant } from './misc.ts'
import { sessionStorage } from './session.server.ts'

export type { User }

export const authenticator = new Authenticator<string>(sessionStorage, {
	sessionKey: 'sessionId',
})

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30

authenticator.use(
	new FormStrategy(async ({ form }) => {
		const email = form.get('email')
		const password = form.get('password')

		invariant(typeof email === 'string', 'email must be a string')
		invariant(email.length > 0, 'username must not be empty')

		invariant(typeof password === 'string', 'password must be a string')
		invariant(password.length > 0, 'password must not be empty')

		const user = await verifyLogin(email, password)
		if (!user) {
			throw new Error('Invalid username or password')
		}
		const session = await prisma.session.create({
			data: {
				expirationDate: new Date(Date.now() + SESSION_EXPIRATION_TIME),
				userId: user.id,
			},
			select: { id: true },
		})

		return session.id
	}),
	FormStrategy.name,
)

export async function requireUserId(
	request: Request,
	{ redirectTo }: { redirectTo?: string | null } = {},
) {
	const requestUrl = new URL(request.url)
	redirectTo =
		redirectTo === null
			? null
			: redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`
	const loginParams = redirectTo
		? new URLSearchParams([['redirectTo', redirectTo]])
		: null
	const failureRedirect = ['/login', loginParams?.toString()]
		.filter(Boolean)
		.join('?')
	const sessionId = await authenticator.isAuthenticated(request, {
		failureRedirect,
	})
	const session = await prisma.session.findFirst({
		where: { id: sessionId },
		select: { userId: true, expirationDate: true },
	})
	if (!session) {
		throw redirect(failureRedirect)
	}
	return session.userId
}

export async function getUserId(request: Request) {
	const sessionId = await authenticator.isAuthenticated(request)
	if (!sessionId) return null
	const session = await prisma.session.findUnique({
		where: { id: sessionId },
		select: { userId: true },
	})
	if (!session) {
		// Perhaps their session was deleted?
		await authenticator.logout(request, { redirectTo: '/' })
		return null
	}
	return session.userId
}

export async function requireAnonymous(request: Request) {
	await authenticator.isAuthenticated(request, {
		successRedirect: '/',
	})
}

export async function resetUserPassword({
	email,
	password,
}: {
	email: User['email']
	password: string
}) {
	const hashedPassword = await bcrypt.hash(password, 10)
	return prisma.user.update({
		where: { email },
		data: {
			password: {
				update: {
					hash: hashedPassword,
				},
			},
		},
	})
}

export async function signup({
	email,
	password,
}: {
	email: User['email']
	password: string
}) {
	const hashedPassword = await getPasswordHash(password)

	const session = await prisma.session.create({
		data: {
			expirationDate: new Date(Date.now() + SESSION_EXPIRATION_TIME),
			user: {
				create: {
					email: email.toLowerCase(),
					password: {
						create: {
							hash: hashedPassword,
						},
					},
				},
			},
		},
		select: { id: true, expirationDate: true },
	})
	return session
}

export async function getPasswordHash(password: string) {
	const hash = await bcrypt.hash(password, 10)
	return hash
}

export async function verifyLogin(
	email: User['email'],
	password: Password['hash'],
) {
	const userWithPassword = await prisma.user.findUnique({
		where: { email },
		select: { id: true, password: { select: { hash: true } } },
	})

	if (!userWithPassword || !userWithPassword.password) {
		return null
	}

	const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

	if (!isValid) {
		return null
	}

	return { id: userWithPassword.id }
}
