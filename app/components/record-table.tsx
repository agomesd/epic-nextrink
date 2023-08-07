import type { Record } from '@prisma/client'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from './ui/table.js'

export interface TableProps {
	caption?: string
	data: Pick<
		Record,
		| 'francJeux'
		| 'goalsAgainst'
		| 'goalsFor'
		| 'losses'
		| 'id'
		| 'played'
		| 'plusMinus'
		| 'points'
		| 'ties'
		| 'wins'
	>[]
}

const cellClass = 'p-2 text-center text-xs'

export default function RecordTable({ caption, data }: TableProps) {
	return (
		<Table>
			{caption ? <TableCaption>{caption}</TableCaption> : null}
			<TableHeader>
				<TableRow>
					<TableHead className={cellClass}>Pts</TableHead>
					<TableHead className={cellClass}>GP</TableHead>
					<TableHead className={cellClass}>W</TableHead>
					<TableHead className={cellClass}>L</TableHead>
					<TableHead className={cellClass}>T</TableHead>
					<TableHead className={cellClass}>GF</TableHead>
					<TableHead className={cellClass}>GA</TableHead>
					<TableHead className={cellClass}>+/-</TableHead>
					<TableHead className={cellClass}>FJ</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map(d => (
					<TableRow key={d.id}>
						<TableCell className={cellClass}>{d.points}</TableCell>
						<TableCell className={cellClass}>{d.played}</TableCell>
						<TableCell className={cellClass}>{d.wins}</TableCell>
						<TableCell className={cellClass}>{d.losses}</TableCell>
						<TableCell className={cellClass}>{d.ties}</TableCell>
						<TableCell className={cellClass}>{d.goalsFor}</TableCell>
						<TableCell className={cellClass}>{d.goalsAgainst}</TableCell>
						<TableCell className={cellClass}>{d.plusMinus}</TableCell>
						<TableCell className={cellClass}>{d.francJeux}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
