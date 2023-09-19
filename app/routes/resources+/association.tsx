import { json } from '@remix-run/node'
import { prisma } from '~/utils/db.server.ts'

export async function loader() {
	const associations = await prisma.association.findMany({
		select: { id: true, name: true },
	})
	return json({ associations })
}
