import { json } from '@remix-run/node'
import { prisma } from '~/utils/db.server.ts'

export async function loader() {
	const teams = await prisma.team.findMany({
		select: {
			id: true,
			name: true,
			level: { select: { name: true } },
			caliber: { select: { name: true } },
		},
	})
	return json({ teams })
}
