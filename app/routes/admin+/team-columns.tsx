import type { ColumnDef } from '@tanstack/react-table'
import type { Association, Caliber, CoachProfile, Level } from '@prisma/client'
import { Link } from '@remix-run/react'
import { Button } from '~/components/ui/button.tsx'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu.tsx'
import { MoreHorizontal } from 'lucide-react'

type Team = {
	id: string
	name: string
	association: Pick<Association, 'id' | 'name'>
	level: Pick<Level, 'id' | 'name'>
	caliber: Pick<Caliber, 'id' | 'name'>
	createdAt: string
	season: { from: string; to: string }
	updatedAt: string
	coach: Pick<CoachProfile, 'firstName' | 'lastName' | 'id'> | null
}

export const teamColumns: ColumnDef<Team>[] = [
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
		accessorKey: 'season-start',
		header: ({ column }) => (
			<Button
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				variant="ghost"
				className="flex w-full justify-start p-1 text-xs"
				size="sm"
			>
				Season Start
			</Button>
		),
		cell: ({ row }) => {
			const start = row.original.season.from
			return <span>{new Date(start).toLocaleDateString()}</span>
		},
	},
	{
		accessorKey: 'season-end',
		header: ({ column }) => (
			<Button
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				variant="ghost"
				className="flex w-full justify-start p-1 text-xs"
				size="sm"
			>
				Season End
			</Button>
		),
		cell: ({ row }) => {
			const end = row.original.season.to
			return <span>{new Date(end).toLocaleDateString()}</span>
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
	{
		accessorKey: 'updatedAt',
		header: ({ column }) => (
			<Button
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				variant="ghost"
				className="flex w-full justify-start p-1 text-xs"
				size="sm"
			>
				Updated
			</Button>
		),
		cell: ({ row }) => {
			const date = new Date(row.original.updatedAt).toLocaleString()
			return <span>{date}</span>
		},
	},
	{
		accessorKey: 'createdAt',
		header: ({ column }) => (
			<Button
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				variant="ghost"
				className="flex w-full justify-start p-1 text-xs"
				size="sm"
			>
				Created
			</Button>
		),
		cell: ({ row }) => {
			const date = new Date(row.original.createdAt).toLocaleString()
			return <span>{date}</span>
		},
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => {
			const team = row.original
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="w-full">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel className="border-b">Actions</DropdownMenuLabel>
						<DropdownMenuItem>
							<Link to={`/team/${team.id}`}>View team</Link>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Link to={`/team/${team.id}/update`}>Update team</Link>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Link
								to={`/team/${team.id}?intent=delete-team&${new URLSearchParams({
									redirectTo: '/admin/teams',
								})}`}
							>
								Delete team
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	},
]
