import { json, type DataFunctionArgs } from '@remix-run/node'
import { useFetcher, useNavigate, useParams } from '@remix-run/react'
import { useEffect } from 'react'
import SelectBox from '~/components/select-box.tsx'
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
	return json({ teams })
}

export function UserTeamsSelectBox() {
	const params = useParams()
	const navigate = useNavigate()
	const { load, data } = useFetcher<typeof loader>()
	useEffect(() => {
		load(`/resources/user/teams`)
	}, [load])

	const handleNavigate = (teamId: string) => {
		navigate(`/team/${teamId}/dashboard`)
	}

	const items =
		data?.teams.map(team => ({
			id: team.id,
			label: `${team.level.name} ${team.caliber.name} ${team.name}`,
		})) ?? []
	const defaultValue = items.find(item => item.id === params.teamId)?.id
	return (
		<SelectBox
			items={items}
			onValueChange={value => handleNavigate(value)}
			defaultValue={defaultValue}
		/>
	)
}
