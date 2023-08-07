import { useState, useRef, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button.tsx'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog.tsx'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from './ui/table.tsx'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx'
import { useFetcher } from 'react-router-dom'

type PlayerData = {
	id: string
	firstName: string
	lastName: string
	jerseyNumber: number | null
	position?: string
	shotSide?: string
	status: {
		id: string
		name: string
	}
}

interface DepthChartProps {
	teamId: string
	data: {
		id: string
		depthLevel: string
		player: PlayerData
		position: string
	}[]
	roster: PlayerData[]
}

export default function DepthChart({ data, roster, teamId }: DepthChartProps) {
	const constraintsRef = useRef<HTMLDivElement>(null)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [updateKey, setUpdateKey] = useState<{
		position: string
		depthLevel: string
	} | null>(null)
	const { submit } = useFetcher()
	const starter = data.find(d => d.depthLevel === 'starter')?.player
	const backup = data.find(d => d.depthLevel === 'backup')?.player

	const fm1 = data.filter(d => d.depthLevel === 'fm-1')
	const fm1LW = fm1.find(p => p.position === 'LW')?.player
	const fm1RW = fm1.find(p => p.position === 'RW')?.player
	const fm1C = fm1.find(p => p.position === 'C')?.player
	const fm1LD = fm1.find(p => p.position === 'LD')?.player
	const fm1RD = fm1.find(p => p.position === 'RD')?.player

	const fm2 = data.filter(d => d.depthLevel === 'fm-2')
	const fm2LW = fm2.find(p => p.position === 'LW')?.player
	const fm2RW = fm2.find(p => p.position === 'RW')?.player
	const fm2C = fm2.find(p => p.position === 'C')?.player
	const fm2LD = fm2.find(p => p.position === 'LD')?.player
	const fm2RD = fm2.find(p => p.position === 'RD')?.player

	const fm3 = data.filter(d => d.depthLevel === 'fm-3')
	const fm3LW = fm3.find(p => p.position === 'LW')?.player
	const fm3RW = fm3.find(p => p.position === 'RW')?.player
	const fm3C = fm3.find(p => p.position === 'C')?.player
	const fm3LD = fm3.find(p => p.position === 'LD')?.player
	const fm3RD = fm3.find(p => p.position === 'RD')?.player

	const fm4 = data.filter(d => d.depthLevel === 'fm-4')
	const fm4LW = fm4.find(p => p.position === 'LW')?.player
	const fm4RW = fm4.find(p => p.position === 'RW')?.player
	const fm4C = fm4.find(p => p.position === 'C')?.player
	const fm4LD = fm4.find(p => p.position === 'LD')?.player
	const fm4RD = fm4.find(p => p.position === 'RD')?.player

	const pp1 = data.filter(d => d.depthLevel === 'pp-1')
	const pp1LW = pp1.find(p => p.position === 'LW')?.player
	const pp1RW = pp1.find(p => p.position === 'RW')?.player
	const pp1C = pp1.find(p => p.position === 'C')?.player
	const pp1LD = pp1.find(p => p.position === 'LD')?.player
	const pp1RD = pp1.find(p => p.position === 'RD')?.player

	const pp2 = data.filter(d => d.depthLevel === 'pp-2')
	const pp2LW = pp2.find(p => p.position === 'LW')?.player
	const pp2RW = pp2.find(p => p.position === 'RW')?.player
	const pp2C = pp2.find(p => p.position === 'C')?.player
	const pp2LD = pp2.find(p => p.position === 'LD')?.player
	const pp2RD = pp2.find(p => p.position === 'RD')?.player

	const pp3 = data.filter(d => d.depthLevel === 'pp-3')
	const pp3LW = pp3.find(p => p.position === 'LW')?.player
	const pp3RW = pp3.find(p => p.position === 'RW')?.player
	const pp3C = pp3.find(p => p.position === 'C')?.player
	const pp3LD = pp3.find(p => p.position === 'LD')?.player
	const pp3RD = pp3.find(p => p.position === 'RD')?.player

	const pk1 = data.filter(d => d.depthLevel === 'pk-1')
	const pk1LW = pk1.find(p => p.position === 'LW')?.player
	const pk1C = pk1.find(p => p.position === 'C')?.player
	const pk1LD = pk1.find(p => p.position === 'LD')?.player
	const pk1RD = pk1.find(p => p.position === 'RD')?.player

	const pk2 = data.filter(d => d.depthLevel === 'pk-2')
	const pk2LW = pk2.find(p => p.position === 'LW')?.player
	const pk2C = pk2.find(p => p.position === 'C')?.player
	const pk2LD = pk2.find(p => p.position === 'LD')?.player
	const pk2RD = pk2.find(p => p.position === 'RD')?.player

	const handleUpdateLine = (position: string, depthLevel: string) => {
		setDialogOpen(true)
		setUpdateKey({ position, depthLevel })
	}

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<Tabs defaultValue="fullman">
				<TabsList className="mb-4 flex justify-end">
					<TabsTrigger value="fullman">Full man</TabsTrigger>
					<TabsTrigger value="pp">PP</TabsTrigger>
					<TabsTrigger value="pk">PK</TabsTrigger>
				</TabsList>
				<div className="space-y-2">
					<label>Goalies</label>
					<div className="flex gap-2">
						<Button
							className="flex flex-1 items-center justify-center"
							variant="outline"
						>
							{starter ? <div></div> : <span>Starter</span>}
						</Button>
						<Button
							className="flex flex-1 items-center justify-center"
							variant="outline"
						>
							{backup ? <div></div> : <span>Backup</span>}
						</Button>
					</div>
				</div>
				<TabsContent value="fullman" className="space-y-2">
					<motion.div ref={constraintsRef}>
						<ul className="space-y-2" id="fullman-forwards">
							<label htmlFor="fullman-forwards">Forwards</label>
							<FMLineFwds
								c={fm1C}
								lw={fm1LW}
								rw={fm1RW}
								depthLevel="fm-1"
								onHandleClick={handleUpdateLine}
							/>
							<FMLineFwds
								c={fm2C}
								lw={fm2LW}
								rw={fm2RW}
								depthLevel="fm-2"
								onHandleClick={handleUpdateLine}
							/>
							<FMLineFwds
								c={fm3C}
								lw={fm3LW}
								rw={fm3RW}
								depthLevel="fm-3"
								onHandleClick={handleUpdateLine}
							/>
							<FMLineFwds
								c={fm4C}
								lw={fm4LW}
								rw={fm4RW}
								depthLevel="fm-4"
								onHandleClick={handleUpdateLine}
							/>
						</ul>
						<ul className="space-y-2" id="fullman-defense">
							<label htmlFor="fullman-defense">Defense</label>
							<LineDefs
								ld={fm1LD}
								rd={fm1RD}
								depthLevel="fm-1"
								onHandleClick={handleUpdateLine}
							/>
							<LineDefs
								ld={fm2LD}
								rd={fm2RD}
								depthLevel="fm-2"
								onHandleClick={handleUpdateLine}
							/>
							<LineDefs
								ld={fm3LD}
								rd={fm3RD}
								depthLevel="fm-3"
								onHandleClick={handleUpdateLine}
							/>
							<LineDefs
								ld={fm4LD}
								rd={fm4RD}
								depthLevel="fm-4"
								onHandleClick={handleUpdateLine}
							/>
						</ul>
					</motion.div>
				</TabsContent>
				<TabsContent value="pp" className="space-y-2">
					<ul className="space-y-2" id="fullman-forwards">
						<label htmlFor="fullman-forwards">Powerplay 1</label>
						<FMLineFwds
							c={pp1C}
							lw={pp1LW}
							rw={pp1RW}
							depthLevel="pp-1"
							onHandleClick={handleUpdateLine}
						/>
						<LineDefs
							ld={pp1LD}
							rd={pp1RD}
							depthLevel="pp-1"
							onHandleClick={handleUpdateLine}
						/>
					</ul>
					<ul className="space-y-2" id="fullman-forwards">
						<label htmlFor="fullman-forwards">Powerplay 2</label>
						<FMLineFwds
							c={pp2C}
							lw={pp2LW}
							rw={pp2RW}
							depthLevel="pp-2"
							onHandleClick={handleUpdateLine}
						/>
						<LineDefs
							ld={pp2LD}
							rd={pp2RD}
							depthLevel="pp-2"
							onHandleClick={handleUpdateLine}
						/>
					</ul>
					<ul className="space-y-2" id="fullman-defense">
						<label htmlFor="fullman-defense">Powerplay 3</label>
						<FMLineFwds
							c={pp3C}
							lw={pp3LW}
							rw={pp3RW}
							depthLevel="pp-3"
							onHandleClick={handleUpdateLine}
						/>
						<LineDefs
							ld={pp3LD}
							rd={pp3RD}
							depthLevel="pp-3"
							onHandleClick={handleUpdateLine}
						/>
					</ul>
				</TabsContent>
				<TabsContent value="pk">
					<ul className="space-y-2" id="fullman-forwards">
						<label htmlFor="fullman-forwards">Penalty kill 1</label>
						<PKLineFwds
							pk1={pk1LW}
							pk2={pk1C}
							depthLevel="pk-1"
							onHandleClick={handleUpdateLine}
						/>
						<LineDefs
							ld={pk1LD}
							rd={pk1RD}
							depthLevel="pk-1"
							onHandleClick={handleUpdateLine}
						/>
					</ul>
					<ul className="space-y-2" id="fullman-defense">
						<label htmlFor="fullman-forwards">Penalty kill 2</label>
						<PKLineFwds
							pk1={pk2LW}
							pk2={pk2C}
							depthLevel="pk-2"
							onHandleClick={handleUpdateLine}
						/>
						<LineDefs
							ld={pk2LD}
							rd={pk2RD}
							depthLevel="pk-2"
							onHandleClick={handleUpdateLine}
						/>
					</ul>
				</TabsContent>
			</Tabs>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Roster</DialogTitle>
					<DialogDescription>
						Select a player from your roster
					</DialogDescription>
				</DialogHeader>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="text-left">#</TableHead>
							<TableHead className="text-left">First name</TableHead>
							<TableHead className="text-left">Last name</TableHead>
							<TableHead className="text-left">Status</TableHead>
							<TableHead className="text-left">Position</TableHead>
							<TableHead className="text-left">Shoots</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{roster.map(p => (
							<TableRow
								key={p.id}
								onClick={() => {
									setDialogOpen(false)
									submit(
										{
											playerId: p.id,
											position: updateKey?.position ?? '',
											depthLevel: updateKey?.depthLevel ?? '',
											teamId,
										},
										{
											method: 'post',
											action: '/resources/depthchart-update',
										},
									)
								}}
							>
								<TableCell>{p.jerseyNumber}</TableCell>
								<TableCell>{p.firstName}</TableCell>
								<TableCell>{p.lastName}</TableCell>
								<TableCell>{p.status.name}</TableCell>
								<TableCell>{p.position ?? 'N/A'}</TableCell>
								<TableCell>{p.shotSide ?? 'N/A'}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</DialogContent>
		</Dialog>
	)
}

interface LineProps extends React.HTMLAttributes<HTMLDivElement> {
	depthLevel: string
	onHandleClick: (position: string, depthLevel: string) => void
}

interface FMLineFwdsProps extends LineProps {
	lw: PlayerData | undefined
	c: PlayerData | undefined
	rw: PlayerData | undefined
}

const FMLineFwds = forwardRef<HTMLDivElement, FMLineFwdsProps>(
	({ c, lw, rw, depthLevel, onHandleClick, ...props }, ref) => {
		return (
			<li className="flex gap-2">
				<PlayerCell
					player={lw}
					position="LW"
					onClick={() => onHandleClick('LW', depthLevel)}
				/>
				<PlayerCell
					player={c}
					position="C"
					onClick={() => onHandleClick('C', depthLevel)}
				/>
				<PlayerCell
					player={rw}
					position="RW"
					onClick={() => onHandleClick('RW', depthLevel)}
				/>
			</li>
		)
	},
)

FMLineFwds.displayName = 'FMLineFwds'

interface LineDefsProps extends LineProps {
	ld: PlayerData | undefined
	rd: PlayerData | undefined
}

function LineDefs({ ld, rd, depthLevel, onHandleClick }: LineDefsProps) {
	return (
		<li className="flex gap-2">
			<PlayerCell
				player={ld}
				position="LD"
				onClick={() => onHandleClick('LD', depthLevel)}
			/>
			<PlayerCell
				player={rd}
				position="RD"
				onClick={() => onHandleClick('RD', depthLevel)}
			/>
		</li>
	)
}

interface PKLineFwdsProps extends LineProps {
	pk1: PlayerData | undefined
	pk2: PlayerData | undefined
}

function PKLineFwds({ pk1, pk2, depthLevel, onHandleClick }: PKLineFwdsProps) {
	return (
		<li className="flex gap-2">
			<PlayerCell
				player={pk1}
				position="PK-1"
				onClick={() => onHandleClick('PK-1', depthLevel)}
			/>
			<PlayerCell
				player={pk2}
				position="PK-2"
				onClick={() => onHandleClick('PK-2', depthLevel)}
			/>
		</li>
	)
}

interface PlayerCellProps extends React.HTMLAttributes<HTMLDivElement> {
	player: PlayerData | undefined
	position: string
	onClick: () => void
}

const PlayerCell = forwardRef<HTMLDivElement, PlayerCellProps>(
	({ position, player, onClick, ...props }, ref) => {
		return (
			<div
				className="flex flex-1 items-center justify-center"
				{...props}
				ref={ref}
			>
				{player ? (
					<motion.div className="w-full space-x-2 rounded-md border border-border p-2">
						<span>{player.jerseyNumber}</span>
						<span>{player.firstName.charAt(0)}.</span>
						<span>{player.lastName}</span>
					</motion.div>
				) : (
					<DialogTrigger
						className="w-full rounded-md border border-border p-2"
						onClick={onClick}
					>
						{position}
					</DialogTrigger>
				)}
			</div>
		)
	},
)
PlayerCell.displayName = 'PlayerCell'
