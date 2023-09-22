import { type DataFunctionArgs, json } from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
	useSearchParams,
	type V2_MetaFunction as MetaFunction,
} from '@remix-run/react'
import AddModal from '~/components/add-modal.tsx'
import { Button } from '~/components/ui/button.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { ScrollArea } from '~/components/ui/scroll-area.tsx'
import { prisma } from '~/utils/db.server.ts'
import { cn, sortAlph } from '~/utils/misc.ts'
import { AddLevelForm } from '../resources+/level.tsx'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '~/components/ui/command.tsx'
import { useForm } from '@conform-to/react'
import { ErrorList } from '~/components/forms.tsx'
import { useState } from 'react'

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	const levelId = formData.get('levelId')
	if (typeof levelId !== 'string') {
		throw new Response('Invalid level ID', { status: 400 })
	}
	const level = await prisma.level.findFirst({
		where: { id: levelId },
		select: { teams: { select: { id: true } } },
	})
	if (!level) {
		throw new Response('Caliber not found', { status: 404 })
	}
	if (level.teams.length) {
		return json(
			{
				status: 'error',
				errors: ['Some teams belong to this level; level cannot be deleted.'],
			} as const,
			{ status: 400 },
		)
	}
	await prisma.level.delete({ where: { id: levelId } })

	return json({ status: 'success', errors: [] })
}

export async function loader({ request }: DataFunctionArgs) {
	const url = new URL(request.url)
	const searchParams = url.searchParams
	const levelId = searchParams.get('levelId') ?? ''
	const levels = await prisma.level.findMany({
		select: {
			id: true,
			associations: true,
			calibers: true,
			name: true,
			teams: true,
		},
	})

	const associations = await prisma.association.findMany({
		where: { levels: { some: { id: levelId } } },
		select: {
			id: true,
			name: true,
			teams: {
				select: {
					name: true,
					id: true,
					caliber: { select: { name: true } },
					level: { select: { name: true } },
				},
			},
		},
	})

	return json({ levels, associations })
}

export default function Levels() {
	const actionData = useActionData<typeof action>()
	const [open, setOpen] = useState(false)
	const { levels, associations } = useLoaderData<typeof loader>()
	const [searchParams] = useSearchParams()
	const levelId = searchParams.get('levelId')
	const [form] = useForm({
		id: 'delete-level',
	})

	return (
		<div className="h-full w-full">
			<h1 className="mb-8 text-h1">Levels</h1>
			<div className="my-2">
				<ErrorList errors={actionData?.errors} id={form.errorId} />
			</div>

			<Command className="flex w-full gap-2">
				<div className="flex w-full gap-4">
					<div className="w-60">
						<AddModal
							icon={<Icon name="plus">Add caliber</Icon>}
							form={<AddLevelForm setOpen={setOpen} />}
							title="Add Level"
							open={open}
							setOpen={setOpen}
						/>
					</div>
					<div className="flex-1">
						<CommandInput placeholder="Search team" />
					</div>
				</div>
				<div className="flex h-full gap-4">
					<ScrollArea className="w-60">
						<ul className="flex  flex-col gap-2">
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
										<Form
											className="hidden h-full duration-300 group-hover:block"
											method="POST"
											{...form.props}
										>
											<input name="levelId" hidden value={level.id} readOnly />
											<input
												name="intent"
												hidden
												value="delete-level"
												readOnly
											/>
											<input
												name="redirectTo"
												hidden
												value="/admin/levels"
												readOnly
											/>
											<Button variant="destructive" className="h-full">
												<Icon name="trash" />
											</Button>
										</Form>
									</li>
								))}
						</ul>
					</ScrollArea>
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
				</div>
			</Command>
		</div>
	)
}

export const meta: MetaFunction = () => {
	return [
		{ title: 'Levels | Admin - NextRink' },
		{
			name: 'description',
			content: 'Manage the levels in NextRink.',
		},
	]
}
