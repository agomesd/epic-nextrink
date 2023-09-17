import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import React from 'react'
import { prisma } from '~/utils/db.server.ts'

export async function loader() {
	const coaches = await prisma.coachProfile.findMany({
		select: {
			coachedTeams: true,
			firstName: true,
			id: true,
			lastName: true,
			supportedTeams: true,
			user: { select: { email: true, id: true } },
		},
	})
	return json({ coaches })
}

export default function AdminCoachesRoute() {
	const { coaches } = useLoaderData<typeof loader>()
	return (
		<section>
			{coaches.length ? (
				<ul>
					{coaches.map(coach => (
						<li key={coach.id} className="flex space-x-2">
							<p>{coach.firstName}</p>
							<p>{coach.lastName}</p>
							<p>{coach.user.email}</p>
							<p>{coach.supportedTeams.length}</p>
							<p>{coach.coachedTeams.length}</p>
						</li>
					))}
				</ul>
			) : (
				<p>No coaches in the database</p>
			)}
		</section>
	)
}
