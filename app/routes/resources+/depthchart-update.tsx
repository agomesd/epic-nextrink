import { type DataFunctionArgs, json } from '@remix-run/node'
import { z } from 'zod'
import { parse } from '@conform-to/zod'
import { prisma } from '~/utils/db.server.ts'

const updateDepthChartSchema = z.object({
	playerId: z.string().nonempty(),
	position: z.string().nonempty(),
	depthLevel: z.string().nonempty(),
	teamId: z.string().nonempty(),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	const submission = parse(formData, {
		schema: updateDepthChartSchema,
	})

	if (!submission.value) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}

	const { depthLevel, playerId, position, teamId } = submission.value
	const depthChartExists = await prisma.depthChart.findFirst({
		where: {
			AND: [
				{ teamId },
				{ position: { name: position } },
				{ depthLevel: { name: depthLevel } },
			],
		},
	})
	const positionId = await prisma.position.findFirst({
		where: { name: position },
		select: { id: true },
	})
	const depthLevelId = await prisma.depthLevel.findFirst({
		where: { name: depthLevel },
		select: { id: true },
	})

	if (!positionId) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}

	if (!depthLevelId) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}

	if (depthChartExists) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}
	// await prisma.$queryRaw`SELECT id FROM Team WHERE id = ${teamId} AND (
	// 	SELECT id FROM DepthChart
	// 	WHERE position = ${position}
	// 	AND depthLevel = ${depthLevel}
	// )`
	await prisma.depthChart.create({
		data: {
			depthLevelId: depthLevelId.id,
			playerId,
			positionId: positionId.id,
			teamId,
		},
		select: { id: true },
	})

	return json({})
}
