import { json } from '@remix-run/node'
import { prisma } from '~/utils/db.server.ts'

export async function loader() {
	const positions = await prisma.position.findMany({
		select: { id: true, name: true },
	})

	return json({ positions })
}
