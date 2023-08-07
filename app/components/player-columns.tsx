import type { PlayerProfile } from '@prisma/client'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from './ui/button.tsx'
import { PlayerStatusSelectBox } from '~/routes/resources+/status.tsx'
import { Link } from '@remix-run/react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from './ui/dropdown-menu.tsx'
import { MoreHorizontal } from 'lucide-react'
type Player = Pick<
	PlayerProfile,
	'firstName' | 'id' | 'jerseyNumber' | 'lastName'
>
type PlayerTableData = Player & { statusId: string; statusName: string }

export interface PlayerTablesProps {
	data: PlayerTableData[]
}

export const playerColumns: ColumnDef<PlayerTableData>[] = [
	{
		accessorKey: 'jerseyNumber',
		id: 'jerseyNumber',
		header: ({ column }) => {
			return (
				<Button
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					variant="outline"
					className="w-full"
					size="sm"
				>
					#
				</Button>
			)
		},
		cell: ({ row }) => (
			<div className="text-center">{row.getValue('jerseyNumber')}</div>
		),
	},
	{
		accessorKey: 'firstName',
		id: 'firstName',
		header: ({ column }) => {
			return (
				<Button
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					variant="outline"
					className="w-full"
					size="sm"
				>
					First name
				</Button>
			)
		},
		cell: ({ row }) => <div>{row.getValue('firstName')}</div>,
	},
	{
		accessorKey: 'lastName',
		id: 'lastName',
		header: ({ column }) => {
			return (
				<Button
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					variant="outline"
					className="w-full"
					size="sm"
				>
					Last Name
				</Button>
			)
		},
		cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
	},
	{
		accessorKey: 'statusId',
		id: 'statusId',
		header: ({ column }) => {
			return (
				<Button
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					variant="outline"
					className="w-full"
					size="sm"
				>
					Status
				</Button>
			)
		},
		cell: ({ row }) => {
			const player = row.original
			return (
				<PlayerStatusSelectBox
					defaultValue={row.getValue('statusId')}
					statusName={player.statusName}
					playerId={player.id}
				/>
			)
		},
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => {
			const player = row.original
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="w-full">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem>
							<Link to={`/player/${player.id}`}>View player profile</Link>
						</DropdownMenuItem>
						<DropdownMenuItem>Delete player profile</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	},
]
