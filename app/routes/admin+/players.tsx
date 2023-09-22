import { type V2_MetaFunction as MetaFunction } from '@remix-run/react'

export default function AdminPlayersRoute() {
	return <div>AdminPlayersRoute</div>
}

export const meta: MetaFunction = () => {
	return [
		{ title: 'Players | Admin - NextRink' },
		{
			name: 'description',
			content: 'Manage the players in NextRink.',
		},
	]
}
