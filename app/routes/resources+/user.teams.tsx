import { json, type DataFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { useEffect } from 'react'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'

export async function loader({ request }: DataFunctionArgs) {
	const userId = await requireUserId(request)
	const userTeams = await prisma.user.findUnique({
		select: {
			coachProfile: {
				select: {
					coachedTeams: {
						select: {
							id: true,
							caliber: { select: { name: true } },
							level: { select: { name: true } },
							name: true,
						},
					},
					supportedTeams: {
						select: {
							id: true,
							caliber: { select: { name: true } },
							level: { select: { name: true } },
							name: true,
						},
					},
				},
			},
		},
		where: { id: userId },
	})
	let teams: {
		id: string
		caliber: { name: string }
		level: { name: string }
		name: string
	}[] = []
	if (userTeams?.coachProfile) {
		teams = [
			...userTeams.coachProfile.coachedTeams,
			...userTeams.coachProfile.supportedTeams,
		]
	}
	const defaultTeam = teams.find(team => ({ id: team.id }))?.id
	const items = teams.map(team => ({
		id: team.id,
		label: `${team.level.name} ${team.caliber.name} ${team.name}`,
	}))
	return json({ items, defaultTeam })
}

export interface UserTeamsSelectBoxProps {
	onCurrentTeamId?: string
}

export function UserTeamsSelectBox({
	onCurrentTeamId,
}: UserTeamsSelectBoxProps) {
	// const navigate = useNavigate()
	const { load } = useFetcher<typeof loader>()
	useEffect(() => {
		load(`/resources/user/teams`)
	}, [load])

	// const handleNavigate = (teamId: string) => {
	// 	navigate(`/team/${teamId}/dashboard`)
	// }

	return null
}
