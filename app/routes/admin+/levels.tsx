import { json, type DataFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useSearchParams } from '@remix-run/react'
import { useState } from 'react'
import AddModal from '~/components/add-modal.tsx'
import { Button } from '~/components/ui/button.tsx'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '~/components/ui/command.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { ScrollArea } from '~/components/ui/scroll-area.tsx'
import { prisma } from '~/utils/db.server.ts'
import { cn, sortAlph } from '~/utils/misc.ts'
import { AddLevelForm, DeleteLevelForm } from '../resources+/level.tsx'

export async function loader({ request }: DataFunctionArgs) {
	const url = new URL(request.url)
	const searchParams = url.searchParams
	const levelId = searchParams.get('levelId') ?? ''
	const levels = await prisma.level.findMany({
		select: { id: true, name: true },
	})
	const associations = await prisma.association.findMany({
		where: { levels: { some: { id: levelId } } },
		select: {
			id: true,
			name: true,
			teams: {
				select: {
					id: true,
					name: true,
					level: { select: { name: true } },
					caliber: { select: { name: true } },
				},
			},
		},
	})
	return json({ levels, associations })
}

export default function Levels() {
	const { levels, associations } = useLoaderData<typeof loader>()
	const [open, setOpen] = useState(false)
	const [searchParams] = useSearchParams()
	const levelId = searchParams.get('levelId') ?? ''
	return (
		<section className="my-12 flex h-full w-full gap-4">
			{/* <ErrorList errors={form.errors} id={form.errorId} /> */}
			<div>
				<ScrollArea>
					<ul className="flex w-52 flex-col gap-2">
						<div>
							<AddModal
								icon={<Icon name="plus">Add caliber</Icon>}
								form={<AddLevelForm setOpen={setOpen} />}
								title="Add Level"
								open={open}
								setOpen={setOpen}
							/>
						</div>
						{levels
							.sort((a, b) => sortAlph(a.name, b.name))
							.map(level => (
								<li
									className={cn(
										'group flex items-center justify-between rounded-md border border-input bg-background pr-1 hover:bg-accent hover:text-accent-foreground',
										levelId === level.id && 'border-teal-400',
									)}
									key={level.id}
								>
									<Button variant="ghost" asChild className="h-full">
										<Link to={`?levelId=${level.id}`} className="flex-1">
											{level.name}
										</Link>
									</Button>
									<DeleteLevelForm
										levelId={level.id}
										redirectTo="/admin/levels"
									/>
								</li>
							))}
					</ul>
				</ScrollArea>
			</div>
			<div>
				<Command>
					<CommandInput placeholder="Search team" />
					<CommandList>
						<CommandEmpty>No teams found for this level.</CommandEmpty>
						{associations.map(association => (
							<CommandGroup key={association.id} heading={association.name}>
								{association.teams.map(team => (
									<CommandItem key={team.id}>
										<Link to={`/teams/${team.id}`} className="h-full w-full">
											<span>
												{team.level.name} {team.caliber.name} {team.name}
											</span>
										</Link>
									</CommandItem>
								))}
							</CommandGroup>
						))}
					</CommandList>
				</Command>
			</div>
		</section>
	)
}
