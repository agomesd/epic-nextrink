import { json } from '@remix-run/node'
import { prisma } from '~/utils/db.server.ts'

export async function loader() {
	const seasons = await prisma.season.findMany({
		select: { id: true, from: true, to: true },
	})
	return json({ seasons })
}
