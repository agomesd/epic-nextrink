import { json } from '@remix-run/node'
import { prisma } from '~/utils/db.server.ts'

export async function loader() {
	const coaches = await prisma.coachProfile.findMany({
		select: { id: true, firstName: true, lastName: true },
	})
	return json({ coaches })
}
