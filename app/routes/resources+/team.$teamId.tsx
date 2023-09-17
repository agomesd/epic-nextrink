import { parse } from '@conform-to/zod'
import { json, type DataFunctionArgs } from '@remix-run/node'
import { z } from 'zod'
import { prisma } from '~/utils/db.server.ts'

const createTeamSchema = z.object({
	name: z.string(),
	associationId: z.string(),
	levelId: z.string(),
	caliberId: z.string(),
	season: z.object({
		to: z.date(),
		from: z.date(),
	}),
})

export async function loader({ request, params }: DataFunctionArgs) {
	// TODO get the user's profile
	// TODO get the profile's roles
	// TODO perform action on team given the access

	const formData = await request.formData()
	const actionId = formData.get('actionId')
	switch (actionId) {
		case 'create-team': {
			const submission = parse(formData, {
				schema: createTeamSchema,
				acceptMultipleErrors: () => true,
			})
			if (submission.intent !== 'submit') {
				return json({ status: 'idle', submission } as const)
			}
			if (!submission.value) {
				return json({ status: 'error', submission } as const, { status: 400 })
			}
			await prisma.team.create({
				select: { id: true },
				data: {
					name: submission.value.name,
					association: { connect: { id: submission.value.associationId } },
					caliber: { connect: { id: submission.value.caliberId } },
					level: { connect: { id: submission.value.levelId } },
					season: {
						create: {
							from: submission.value.season.from,
							to: submission.value.season.to,
						},
					},
				},
			})
		}
	}
	return json({})
}
