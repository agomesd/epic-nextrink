import { json, type DataFunctionArgs, redirect } from '@remix-run/node'
import {
	Link,
	useLoaderData,
	type V2_MetaFunction as MetaFunction,
} from '@remix-run/react'
import { type ColumnDef } from '@tanstack/react-table'
import { z } from 'zod'
import { DataTable } from '~/components/data-table.tsx'
import { Button } from '~/components/ui/button.tsx'
import { prisma } from '~/utils/db.server.ts'

export const meta: MetaFunction = () => [{ title: 'NextRink | Teams' }]

const TeamSearchResultSchema = z.object({
	id: z.string(),
	name: z.string(),
	association: z.object({
		name: z.string(),
	}),
	caliber: z.object({
		name: z.string(),
	}),
	coach: z
		.object({
			firstName: z.string(),
			lastName: z.string(),
			id: z.string(),
		})
		.nullable(),
	level: z.object({
		name: z.string(),
	}),
	season: z.object({
		to: z.date(),
		from: z.date(),
	}),
})

const TeamSearchResultsSchema = TeamSearchResultSchema.array()

export async function loader({ request }: DataFunctionArgs) {
	const searchTerm = new URL(request.url).searchParams.get('search')
	if (searchTerm === '') {
		return redirect('/teams')
	}

	const teams = await prisma.team.findMany({
		select: {
			id: true,
			name: true,
			association: { select: { name: true } },
			caliber: { select: { name: true } },
			coach: { select: { firstName: true, lastName: true, id: true } },
			level: { select: { name: true } },
			season: { select: { from: true, to: true } },
		},
	})

	const result = TeamSearchResultsSchema.safeParse(teams)
	if (!result.success) {
		return json({ status: 'error', error: result.error.message } as const, {
			status: 400,
		})
	}
	const formattedTeams = result.data.map(team => ({
		...team,
		season: {
			to: new Date(team.season.to).toLocaleDateString(),
			from: new Date(team.season.from).toLocaleDateString(),
		},
	}))
	return json({ status: 'idle', teams: formattedTeams } as const)
}

export default function TeamsHomeRoute() {
	const data = useLoaderData<typeof loader>()

	if (data.status === 'error') {
		console.error(data.error)
	}
	return (
		<div className="container my-12">
			<h1 className="text-h2">Teams</h1>
			<div></div>
			<main>
				{data.status === 'idle' ? (
					data.teams.length ? (
						<DataTable data={data.teams} columns={teamsDataColumns} />
					) : (
						<p>No teams</p>
					)
				) : null}
			</main>
		</div>
	)
}

type TeamsData = {
	id: string
	association: { name: string }
	caliber: { name: string }
	coach: {
		firstName: string
		lastName: string
		id: string
	} | null
	level: {
		name: string
	}
	name: string
	season: { to: string; from: string }
}

const teamsDataColumns: ColumnDef<TeamsData>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<Button
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				variant="ghost"
				className="flex w-full justify-start p-1 text-xs"
				size="sm"
			>
				Name
			</Button>
		),
	},
	{
		accessorKey: 'association',
		header: ({ column }) => (
			<Button
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				variant="ghost"
				className="flex w-full justify-start p-1 text-xs"
				size="sm"
			>
				Association
			</Button>
		),
		cell: ({ row }) => {
			const name = row.original.association.name
			return <span>{name}</span>
		},
	},
	{
		accessorKey: 'level',
		header: ({ column }) => (
			<Button
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				variant="ghost"
				className="flex w-full justify-start p-1 text-xs"
				size="sm"
			>
				Level
			</Button>
		),
		cell: ({ row }) => {
			const name = row.original.level.name
			return <span>{name}</span>
		},
	},
	{
		accessorKey: 'caliber',
		header: ({ column }) => (
			<Button
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				variant="ghost"
				className="flex w-full justify-start p-1 text-xs"
				size="sm"
			>
				Caliber
			</Button>
		),
		cell: ({ row }) => {
			const name = row.original.caliber.name
			return <span>{name}</span>
		},
	},
	{
		accessorKey: 'season',
		header: ({ column }) => (
			<Button
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				variant="ghost"
				className="flex w-full justify-start p-1 text-xs"
				size="sm"
			>
				Season
			</Button>
		),
		cell: ({ row }) => {
			const start = row.original.season.from
			const end = row.original.season.to
			return <span>{`${start} - ${end}`}</span>
		},
	},
	{
		accessorKey: 'coach',
		header: ({ column }) => (
			<Button
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				variant="ghost"
				className="flex w-full justify-start p-1 text-xs"
				size="sm"
			>
				Coach
			</Button>
		),
		cell: ({ row }) => {
			const coach = row.original.coach
			if (!coach) return <span>N/A</span>
			return (
				<Link to={coach.id}>
					<span>{`${coach.firstName} ${coach.lastName}`}</span>
				</Link>
			)
		},
	},
]
