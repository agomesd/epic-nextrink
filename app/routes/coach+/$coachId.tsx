import { json, type DataFunctionArgs, redirect } from '@remix-run/node'
import { prisma } from '~/utils/db.server.ts'
import { getUserId, authenticator } from '~/utils/auth.server.ts'
import { time, makeTimings } from '~/utils/timing.server.ts'
import { invariant } from '~/utils/misc.ts'
import {
	Link,
	useLoaderData,
	type V2_MetaFunction as MetaFunction,
} from '@remix-run/react'
import Calendar from '~/components/calendar.tsx'
import RecordTable from '~/components/record-table.tsx'

export const meta: MetaFunction = () => {
	return [{ title: 'Coach | Dashboard' }]
}

export async function loader({ params, request }: DataFunctionArgs) {
	invariant(params.coachId, 'params.coachId is not defined')
	const timings = makeTimings('coachId route')
	const userId = await time(() => getUserId(request), {
		timings,
		type: 'getUserId',
		desc: 'getUserId in coachId',
	})
	const user = userId
		? await time(
				() =>
					prisma.user.findUnique({
						where: { id: userId },
						select: {
							coachProfile: {
								select: {
									coachedTeams: true,
									id: true,
									firstName: true,
									supportedTeams: true,
								},
							},
						},
					}),
				{ timings, type: 'find user', desc: 'find user in coachId' },
		  )
		: null
	if (userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await authenticator.logout(request, { redirectTo: '/' })
	}

	// if the current user profile's coachId doesn't match the params coachId the logout?
	if (user?.coachProfile?.id !== params.coachId) {
		const requestUrl = new URL(request.url)
		const loginParams = new URLSearchParams([
			['redirectTo', `${requestUrl.pathname}${requestUrl.search}`],
		])
		const redirectTo = `/login?${loginParams}`
		await authenticator.logout(request, { redirectTo })
		return redirect(redirectTo)
	}

	const teams = await prisma.team.findMany({
		select: {
			association: { select: { name: true } },
			caliber: { select: { name: true } },
			id: true,
			level: { select: { name: true } },
			name: true,
			roster: {
				select: {
					status: { select: { name: true } },
					firstName: true,
					lastName: true,
					jerseyNumber: true,
					id: true,
				},
			},
			record: {
				select: {
					wins: true,
					goalsAgainst: true,
					francJeux: true,
					goalsFor: true,
					id: true,
					losses: true,
					played: true,
					plusMinus: true,
					ties: true,
					points: true,
				},
			},
		},
		where: {
			// TODO TEST SUPPORT STAFF AS WELL
			OR: [
				{ coachId: user.coachProfile.id },
				{ supportStaff: { some: { id: user.coachProfile.id } } },
			],
		},
	})

	return json({ teams, user })
}

export default function CoachIdRoute() {
	const { teams, user } = useLoaderData<typeof loader>()

	return (
		<div className="container">
			<div className="p-8">
				<h1 className="mb-8 text-h1">
					Welcome Coach {user.coachProfile?.firstName}!
				</h1>
				<main className="m-2">
					<p className="mb-4 text-lg">
						Here is an overview of how your teams are doing
					</p>
					<div className="flex gap-8">
						<ul className="flex-1">
							{teams.map(team => {
								const injured = team.roster.filter(
									p => p.status.name === 'Injured',
								)
								const sick = team.roster.filter(p => p.status.name === 'Sick')
								const suspended = team.roster.filter(
									p => p.status.name === 'Suspended',
								)
								const present = team.roster.filter(
									p => p.status.name === 'Present',
								)
								return (
									<li
										key={team.id}
										className="relative list-none rounded-lg border border-border bg-background p-2"
									>
										<div className="mb-4 flex justify-start">
											<Link
												to={`/team/${team.id}/dashboard`}
												className="rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground"
											>
												Manage team
											</Link>
										</div>
										<div className="container mb-2 grid grid-cols-2">
											<div>
												<p className="text-lg font-bold">{team.name}</p>
												<p>{team.association.name}</p>
												<p>
													<span>{team.level.name}</span>{' '}
													<span>{team.caliber.name}</span>
												</p>
											</div>
											<div>
												{team.record ? (
													<RecordTable data={[{ ...team.record }]} />
												) : null}
											</div>
										</div>
										<div className="container">
											<p>
												Available players:{' '}
												<span className="font-bold text-primary">
													{present.length}/{team.roster.length}
												</span>
											</p>
											{injured.length ? (
												<ul>
													<p>Injured players</p>
													{injured.map(p => (
														<li key={p.id}>
															<span>{p.jerseyNumber}</span>
															<span>{p.firstName}</span>
															<span>{p.lastName}</span>
														</li>
													))}
												</ul>
											) : null}
											{sick.length ? (
												<ul>
													<p>Sick players</p>
													{sick.map(p => (
														<li key={p.id}>
															<span>{p.jerseyNumber}</span>
															<span>{p.firstName}</span>
															<span>{p.lastName}</span>
														</li>
													))}
												</ul>
											) : null}
											{suspended.length ? (
												<ul>
													<p>Suspended players</p>
													{suspended.map(p => (
														<li key={p.id}>
															<span>{p.jerseyNumber}</span>
															<span>{p.firstName}</span>
															<span>{p.lastName}</span>
														</li>
													))}
												</ul>
											) : null}
										</div>
									</li>
								)
							})}
						</ul>
						<div>
							<Calendar />
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}
