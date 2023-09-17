import { json } from '@remix-run/node'
import { requireUserId } from './auth.server.ts'
import { prisma } from './db.server.ts'

export async function requireCoach(request: Request) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findFirst({
		select: {
			adminProfile: {
				select,
			},
			email: true,
			id: true,
			image: true,
		},
		where: { id: userId, coachProfile: { roles: { some: { name: 'coach' } } } },
	})
	if (!user) {
		throw json(
			{ error: 'Unauthorized', requiredRole: 'coach' },
			{ status: 403 },
		)
	}
	return user
}

export async function requirePlayer(request: Request) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findFirst({
		select: {
			adminProfile: {
				select,
			},
			email: true,
			id: true,
			image: true,
		},
		where: {
			id: userId,
			playerProfile: { roles: { some: { name: 'player' } } },
		},
	})
	if (!user) {
		throw json(
			{ error: 'Unauthorized', requiredRole: 'player' },
			{ status: 403 },
		)
	}
	return user
}

export async function requireAdmin(request: Request) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findFirst({
		select: {
			adminProfile: {
				select,
			},
			email: true,
			id: true,
			image: true,
		},
		where: { id: userId, adminProfile: { roles: { some: { name: 'admin' } } } },
	})
	if (!user) {
		throw json(
			{ error: 'Unauthorized', requiredRole: 'admin' },
			{ status: 403 },
		)
	}
	return user
}

const select = {
	firstName: true,
	id: true,
	lastName: true,
	roles: {
		select: {
			id: true,
			name: true,
			permissions: {
				select: {
					access: true,
					action: true,
					description: true,
					entity: true,
					id: true,
				},
			},
		},
	},
}
