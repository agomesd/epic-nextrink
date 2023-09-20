import { type DataFunctionArgs, json } from '@remix-run/node'
import {
	Link,
	useActionData,
	useLoaderData,
	useSearchParams,
} from '@remix-run/react'
import AddModal from '~/components/add-modal.tsx'
import { Button } from '~/components/ui/button.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { ScrollArea } from '~/components/ui/scroll-area.tsx'
import { prisma } from '~/utils/db.server.ts'
import { cn, sortAlph } from '~/utils/misc.ts'
import { AddCaliberForm, DeleteCaliberForm } from '../resources+/caliber.tsx'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '~/components/ui/command.tsx'
import { z } from 'zod'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { useForm } from '@conform-to/react'
import { ErrorList } from '~/components/forms.tsx'
import { useState } from 'react'

const DeleteCaliberFormSchema = z.object({
	caliberId: z.string().min(15).max(30),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()

	const submission = await parse(formData, {
		schema: DeleteCaliberFormSchema.superRefine(async (data, ctx) => {
			const caliberHasTeams = await prisma.team.findFirst({
				where: { caliberId: data.caliberId },
			})
			if (caliberHasTeams) {
				ctx.addIssue({
					path: ['caliberId'],
					code: z.ZodIssueCode.custom,
					message: 'Cannot delete, there are teams within this caliber.',
				})
				return
			}
		}),
		async: true,
	})

	console.log(submission)

	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}

	if (!submission.value) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}
	const { caliberId } = submission.value
	await prisma.caliber.delete({ where: { id: caliberId } })
	return json({ status: 'successful', submission } as const, { status: 200 })
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
	const [open, setOpen] = useState(false)
	const actionData = useActionData<typeof action>()
	const { calibers, associations } = useLoaderData<typeof loader>()
	const [searchParams] = useSearchParams()
	const caliberId = searchParams.get('caliberId')
	const [form] = useForm({
		id: 'delete-caliber',
		lastSubmission: actionData?.submission,
		constraint: getFieldsetConstraint(DeleteCaliberFormSchema),
		onValidate({ formData }) {
			const result = parse(formData, { schema: DeleteCaliberFormSchema })
			return result
		},
	})

	return (
		<section className="my-12 flex h-full w-full gap-4">
			<ErrorList errors={form.errors} id={form.errorId} />
			<div>
				<ScrollArea>
					<ul className="flex w-52 flex-col gap-2">
						<div>
							<AddModal
								icon={<Icon name="plus">Add caliber</Icon>}
								form={<AddCaliberForm setOpen={setOpen} />}
								title="Add Caliber"
								open={open}
								setOpen={setOpen}
							/>
						</div>
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
									<DeleteCaliberForm
										caliberId={caliber.id}
										redirectTo="/admin/calibers"
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
				</Command>
			</div>
		</section>
	)
}
