import { redirect, type DataFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import React from 'react'
import { DataTable } from '~/components/data-table.tsx'
import DepthChart from '~/components/depth-chart.tsx'
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx'
import { playerColumns } from '~/components/player-columns.tsx'
import { getCoachProfileId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { invariant } from '~/utils/misc.ts'

export async function loader({ request, params }: DataFunctionArgs) {
	invariant(
		params.teamId,
		`params.teamId is not defined in /team+/$teamId_+dashboard.index.tsx`,
	)
	const profileId = getCoachProfileId(request)
	if (!profileId) return redirect(`/team/${params.teamId}`)
	const team = await prisma.team.findUnique({
		select: {
			association: { select: { name: true } },
			caliber: { select: { name: true } },
			level: { select: { name: true } },
			name: true,
			depthChart: {
				select: {
					id: true,
					depthLevel: { select: { name: true } },
					player: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							jerseyNumber: true,
							status: { select: { id: true, name: true } },
						},
					},
					position: { select: { name: true } },
				},
			},
			roster: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					status: { select: { name: true, id: true } },
					jerseyNumber: true,
					position: { select: { name: true } },
					shotSide: { select: { name: true } },
				},
			},
			record: {
				select: {
					francJeux: true,
					goalsAgainst: true,
					goalsFor: true,
					losses: true,
					played: true,
					plusMinus: true,
					points: true,
					ties: true,
					wins: true,
				},
			},
			feedbackForms: {
				select: {
					id: true,
					game: {
						select: {
							awayTeam: { select: { name: true } },
							homeTeam: { select: { name: true } },
							startTime: true,
							endTime: true,
						},
					},
				},
			},
			awayGames: {
				select: {
					awayTeam: {
						select: {
							name: true,
							id: true,
							association: { select: { name: true } },
						},
					},
					homeTeam: {
						select: {
							association: { select: { name: true } },
							name: true,
							id: true,
						},
					},
					endTime: true,
					id: true,
					location: { select: { name: true } },
					startTime: true,
					outcome: { select: { id: true } },
				},
			},
			homeGames: {
				select: {
					awayTeam: {
						select: {
							name: true,
							id: true,
							association: { select: { name: true } },
						},
					},
					homeTeam: {
						select: {
							association: { select: { name: true } },
							name: true,
							id: true,
						},
					},
					endTime: true,
					id: true,
					location: { select: { name: true } },
					startTime: true,
					outcome: { select: { id: true } },
				},
			},
		},
		where: { id: params.teamId },
	})

	const roster =
		team?.roster.map(p => ({
			...p,
			position: p.position?.name,
			shotSide: p.shotSide?.name,
			status: {
				id: p.status.id,
				name: p.status.name,
			},
		})) ?? []

	const depthChart =
		team?.depthChart.map(dc => ({
			id: dc.id,
			depthLevel: dc.depthLevel.name,
			position: dc.position.name,
			player: dc.player,
		})) ?? []

	return json({ team, depthChart, roster, teamId: params.teamId })
}

export default function Dashboard() {
	const { team, depthChart, roster, teamId } = useLoaderData<typeof loader>()

	const tableData = roster.map(p => ({
		id: p.id,
		firstName: p.firstName,
		lastName: p.lastName,
		statusId: p.status.id,
		jerseyNumber: p.jerseyNumber,
		statusName: p.status.name,
	}))

	return (
		<div className="container mt-8">
			<h1 className="mb-4 text-h1">
				{team?.level.name} {team?.caliber.name} {team?.name}
			</h1>
			<div className="grid gap-2 lg:grid-cols-2">
				<div className="rounded-lg border border-border bg-background p-4">
					<h2 className="mb-4 text-h2">Roster</h2>
					<DataTable columns={playerColumns} data={tableData} />
				</div>
				<div className="rounded-lg border border-border bg-background p-4">
					<h2 className="mb-4 text-h2">Depth Chart</h2>
					<DepthChart data={depthChart} roster={roster} teamId={teamId} />
				</div>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
