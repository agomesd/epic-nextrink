import { json } from '@remix-run/node'
import { prisma } from '~/utils/db.server.ts'

export async function loader() {
	const shotSides = await prisma.shotSide.findMany({
		select: { id: true, name: true },
	})

	return json({ shotSides })
}
