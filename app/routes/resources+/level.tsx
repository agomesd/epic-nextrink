import { json } from '@remix-run/node'
import { prisma } from '~/utils/db.server.ts'

export async function loader() {
	const levels = await prisma.level.findMany({
		select: { id: true, name: true },
	})
	return json({ levels })
}
