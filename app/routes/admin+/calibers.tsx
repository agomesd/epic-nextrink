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
import { AddCaliberForm } from '../resources+/caliber.tsx'
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
	const caliberId = formData.get('caliberId')
	if (typeof caliberId !== 'string') {
		throw new Response('Invalid caliber ID', { status: 400 })
	}
	const caliber = await prisma.caliber.findFirst({
		where: { id: caliberId },
		select: { teams: { select: { id: true } } },
	})
	if (!caliber) {
		throw new Response('Caliber not found', { status: 404 })
	}
	if (caliber.teams.length) {
		return json(
			{
				status: 'error',
				errors: [
					'Some teams belong to this caliber; caliber cannot be deleted.',
				],
			} as const,
			{ status: 400 },
		)
	}
	await prisma.caliber.delete({ where: { id: caliberId } })

	return json({ status: 'success', errors: [] })
}

export async function loader({ request }: DataFunctionArgs) {
	const url = new URL(request.url)
	const searchParams = url.searchParams
	const caliberId = searchParams.get('caliberId') ?? ''
	const calibers = await prisma.caliber.findMany({
		select: {
			id: true,
			associations: true,
			levels: true,
			name: true,
			teams: true,
		},
	})

	const associations = await prisma.association.findMany({
		where: { calibers: { some: { id: caliberId } } },
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

	return json({ calibers, associations })
}

export default function Calibers() {
	const actionData = useActionData<typeof action>()
	const [open, setOpen] = useState(false)
	const { calibers, associations } = useLoaderData<typeof loader>()
	const [searchParams] = useSearchParams()
	const caliberId = searchParams.get('caliberId')
	const [form] = useForm({
		id: 'delete-caliber',
	})

	return (
		<div className="h-full w-full">
			<h1 className="mb-8 text-h1">Calibers</h1>
			<div className="my-2">
				<ErrorList errors={actionData?.errors} id={form.errorId} />
			</div>

			<Command className="flex w-full gap-2">
				<div className="flex w-full gap-4">
					<div className="w-60">
						<AddModal
							icon={<Icon name="plus">Add caliber</Icon>}
							form={<AddCaliberForm setOpen={setOpen} />}
							title="Add Caliber"
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
							{calibers
								.sort((a, b) => sortAlph(a.name, b.name))
								.map(caliber => (
									<li
										className={cn(
											'group flex items-center justify-between rounded-md border border-input bg-background pr-1 hover:bg-accent hover:text-accent-foreground',
											caliberId === caliber.id && 'border-teal-400',
										)}
										key={caliber.id}
									>
										<Button variant="ghost" asChild className="h-full">
											<Link to={`?caliberId=${caliber.id}`} className="flex-1">
												{caliber.name}
											</Link>
										</Button>
										<Form
											className="hidden h-full duration-300 group-hover:block"
											method="POST"
											{...form.props}
										>
											<input
												name="caliberId"
												hidden
												value={caliber.id}
												readOnly
											/>
											<input
												name="intent"
												hidden
												value="delete-caliber"
												readOnly
											/>
											<input
												name="redirectTo"
												hidden
												value="/admin/calibers"
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
						<CommandEmpty>No teams found for this caliber.</CommandEmpty>
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
		{ title: 'Calibers | Admin - NextRink' },
		{
			name: 'description',
			content: 'Manage the calibers in NextRink.',
		},
	]
}
