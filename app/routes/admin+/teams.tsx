import { json } from '@remix-run/node'
import { prisma } from '~/utils/db.server.ts'
import { DataTable } from '~/components/data-table.tsx'
import { useLoaderData } from '@remix-run/react'
import { teamColumns } from './team-columns.tsx'
import { type V2_MetaFunction as MetaFunction } from '@remix-run/node'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog.tsx'
import { Button } from '~/components/ui/button.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { TeamEditor } from '../teams+/__team-editor.tsx'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Teams | Admin - NextRink' },
		{ name: 'description', content: 'View and manage all teams' },
	]
}

export async function loader() {
	const teams = await prisma.team.findMany({
		select: {
			association: { select: { id: true, name: true } },
			caliber: { select: { id: true, name: true } },
			name: true,
			id: true,
			level: { select: { id: true, name: true } },
			updatedAt: true,
			createdAt: true,
			season: {
				select: {
					from: true,
					to: true,
				},
			},
			coach: { select: { id: true, firstName: true, lastName: true } },
		},
	})
	return json({ teams })
}

export default function AdminTeams() {
	const { teams } = useLoaderData<typeof loader>()
	return (
		<div className="flex h-full w-full flex-col p-4">
			<h1 className="mb-12">Teams</h1>
			<Dialog>
				<Button asChild variant="outline" className="border-emerald-400">
					<DialogTrigger className="w-full items-end justify-center p-2">
						<Icon name="plus">Add team</Icon>
					</DialogTrigger>
				</Button>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add a team</DialogTitle>
					</DialogHeader>
					<TeamEditor />
				</DialogContent>
			</Dialog>
			<DataTable columns={teamColumns} data={teams} />
		</div>
	)
}
