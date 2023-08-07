import { json, type DataFunctionArgs } from '@remix-run/node'
import { z } from 'zod'
import { parse } from '@conform-to/zod'
import { prisma } from '~/utils/db.server.ts'

const UpdatePlayerStatusSchema = z.object({
	statusId: z.string(),
	playerId: z.string(),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	const actionId = formData.get('actionId')

	switch (actionId) {
		case 'update-status': {
			const submission = parse(formData, {
				schema: UpdatePlayerStatusSchema,
				acceptMultipleErrors: () => true,
			})

			if (submission.intent !== 'submit') {
				return json({ status: 'idle', submission } as const)
			}

			if (!submission.value) {
				return json({ status: 'error', submission } as const, { status: 400 })
			}

			const { playerId, statusId } = submission.value
			await prisma.playerProfile.update({
				select: { id: true },
				where: { id: playerId },
				data: { statusId },
			})
			const status = await prisma.status.findMany({
				select: { id: true, name: true },
			})
			return json({ playerStatus: status })
		}
	}
}
