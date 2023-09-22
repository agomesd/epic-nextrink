import { type DataFunctionArgs, json } from '@remix-run/node'
import {
	Form,
	useFetcher,
	useLoaderData,
	type V2_MetaFunction as MetaFunction,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import AddModal from '~/components/add-modal.tsx'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '~/components/ui/accordion.tsx'
import { Button } from '~/components/ui/button.tsx'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { ScrollArea } from '~/components/ui/scroll-area.tsx'
import { prisma } from '~/utils/db.server.ts'

import { type loader as teamsLoader } from '../resources+/teams.tsx'
import { CreateCoachForm } from '../resources+/coach.tsx'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Coaches | Admin - NextRink' },
		{
			name: 'description',
			content: 'Manage the coache profiles in NextRink.',
		},
	]
}

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('intent')
	switch (intent) {
		case 'add-supported-team': {
			const coachId = formData.get('coachId')
			const teamId = formData.get('teamId')
			if (typeof coachId !== 'string' || typeof teamId !== 'string') {
				throw new Response('Invalid coach or team ID', { status: 400 })
			}
			const coach = await prisma.coachProfile.findFirst({
				where: { id: coachId },
				select: { id: true },
			})
			if (!coach) {
				throw new Response('Coach not found', { status: 404 })
			}
			const team = await prisma.team.findFirst({
				where: { id: teamId },
				select: { id: true },
			})
			if (!team) {
				throw new Response('Team not found', { status: 404 })
			}
			await prisma.coachProfile.update({
				where: { id: coachId },
				data: { supportedTeams: { connect: { id: teamId } } },
			})
			return json({ status: 'success', errors: [] })
		}
		case 'remove-supported-team': {
			const coachId = formData.get('coachId')
			const teamId = formData.get('teamId')
			if (typeof coachId !== 'string' || typeof teamId !== 'string') {
				throw new Response('Invalid coach or team ID', { status: 400 })
			}
			const coach = await prisma.coachProfile.findFirst({
				where: { id: coachId },
				select: { id: true },
			})
			if (!coach) {
				throw new Response('Coach not found', { status: 404 })
			}
			const team = await prisma.team.findFirst({
				where: { id: teamId },
				select: { id: true },
			})
			if (!team) {
				throw new Response('Team not found', { status: 404 })
			}
			await prisma.coachProfile.update({
				where: { id: coachId },
				data: { supportedTeams: { disconnect: { id: teamId } } },
			})
			return json({ status: 'success', errors: [] })
		}
		case 'delete-coach': {
			const coachId = formData.get('coachId')
			if (typeof coachId !== 'string') {
				throw new Response('Invalid coach ID', { status: 400 })
			}
			const coach = await prisma.coachProfile.findFirst({
				where: { id: coachId },
				select: { id: true },
			})
			if (!coach) {
				throw new Response('Coach not found', { status: 404 })
			}
			await prisma.coachProfile.delete({ where: { id: coachId } })
			return json({ status: 'success', errors: [] })
		}
		default:
			throw new Response(`Invalid intent: ${intent}`, { status: 400 })
	}
}

export async function loader() {
	const coaches = await prisma.coachProfile.findMany({
		select: {
			createdAt: true,
			updatedAt: true,
			coachedTeams: {
				select: {
					level: { select: { name: true } },
					caliber: { select: { name: true } },
					name: true,
					id: true,
				},
			},
			firstName: true,
			id: true,
			lastName: true,
			supportedTeams: {
				select: {
					level: { select: { name: true } },
					caliber: { select: { name: true } },
					name: true,
					id: true,
				},
			},
			user: { select: { email: true, id: true } },
		},
	})
	return json({ coaches })
}

export default function AdminCoachesRoute() {
	const [open, setOpen] = useState(false)
	const { coaches } = useLoaderData<typeof loader>()
	return (
		<div className="w-full">
			<h1 className="mb-8 text-h1">Coaches</h1>
			<AddModal
				form={<CreateCoachForm />}
				icon={<Icon name="plus">New coach</Icon>}
				title="Create Coach Profile"
				open={open}
				setOpen={setOpen}
			/>
			<AccordionTable data={coaches} />
		</div>
	)
}

export interface AccordionTableProps {
	data: {
		updatedAt: string
		createdAt: string
		firstName: string
		lastName: string
		id: string
		user: {
			email: string
			id: string
		}
		coachedTeams: {
			name: string
			id: string
			level: {
				name: string
			}
			caliber: {
				name: string
			}
		}[]
		supportedTeams: {
			name: string
			id: string
			level: {
				name: string
			}
			caliber: {
				name: string
			}
		}[]
	}[]
}

function AccordionTable({ data }: AccordionTableProps) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const { load, data: teamData } = useFetcher<typeof teamsLoader>()
	useEffect(() => {
		console.log(teamData)
	}, [teamData])
	return (
		<Accordion type="single" collapsible className="w-full">
			<div className="flex w-full">
				<span className="w-1/4">Name</span>
				<span className="w-1/4">Email</span>
				<span className="w-1/4">Created</span>
				<span className="w-1/4">Updated</span>
				<div className="w-4" />
			</div>
			{data.map(d => (
				<AccordionItem value={d.id} key={d.id}>
					<AccordionTrigger className="flex text-left">
						<span className="w-1/4">
							{d.firstName} {d.lastName}
						</span>
						<span className="w-1/4">{d.user.email}</span>
						<span className="w-1/4">
							{new Date(d.createdAt).toLocaleDateString()}
						</span>
						<span className="w-1/4">
							{new Date(d.updatedAt).toLocaleDateString()}
						</span>
					</AccordionTrigger>
					<AccordionContent className="rounded-md bg-secondary p-2">
						<div className="flex">
							<div className="flex-1">
								<p>Coached teams</p>
								{d.coachedTeams.length ? (
									<ScrollArea>
										{d.coachedTeams.map(team => (
											<li key={team.id}>
												{team.name} {team.level.name} {team.caliber.name}
											</li>
										))}
									</ScrollArea>
								) : (
									<p>No coached teams</p>
								)}
							</div>
							<Dialog
								onOpenChange={data => {
									if (data === true) {
										load('/resources/teams')
									}
								}}
							>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<p>Supported teams</p>
										<DialogTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="h-4 rounded-sm hover:bg-emerald-400 hover:text-slate-900"
											>
												<Icon name="plus" />
											</Button>
										</DialogTrigger>
									</div>
									{d.supportedTeams.length ? (
										<ScrollArea>
											{d.supportedTeams.map(team => (
												<li key={team.id} className="flex gap-2">
													{team.level.name} {team.caliber.name} {team.name}
													<Form method="POST">
														<input
															name="coachId"
															value={d.id}
															hidden
															readOnly
														/>
														<input
															name="teamId"
															value={team.id}
															hidden
															readOnly
														/>
														<input
															name="intent"
															value="remove-supported-team"
															hidden
															readOnly
														/>
														<Button
															variant="ghost"
															type="submit"
															className="h-4 rounded-sm hover:bg-rose-800"
														>
															-
														</Button>
													</Form>
												</li>
											))}
										</ScrollArea>
									) : (
										<p>No supported teams</p>
									)}
								</div>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Add supported team</DialogTitle>
									</DialogHeader>
									<ScrollArea className="divide-y">
										{teamData?.teams.map(team => (
											<Form key={team.id} method="POST">
												<input name="coachId" value={d.id} hidden readOnly />
												<input name="teamId" value={team.id} hidden readOnly />
												<input
													name="intent"
													value="add-supported-team"
													hidden
													readOnly
												/>
												<button
													type="submit"
													className="p-1 hover:bg-slate-700"
												>
													{team.level.name} {team.caliber.name} {team.name}
												</button>
											</Form>
										))}
									</ScrollArea>
								</DialogContent>
							</Dialog>
							<div>
								<Dialog
									open={deleteDialogOpen}
									onOpenChange={setDeleteDialogOpen}
								>
									<Button variant="destructive" size="sm" asChild>
										<DialogTrigger>
											<Icon name="trash">Delete coach</Icon>
										</DialogTrigger>
									</Button>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Delete coach</DialogTitle>
											<DialogDescription>
												Are you sure you want to delete this coach profile?
											</DialogDescription>
											<div className="flex gap-2">
												<Form method="POST">
													<input name="coachId" value={d.id} hidden readOnly />
													<input
														name="intent"
														value="delete-coach"
														hidden
														readOnly
													/>
													<Button variant="outline" type="submit">
														Delete
													</Button>
												</Form>
												<Button
													variant="outline"
													onClick={() => setDeleteDialogOpen(false)}
												>
													Cancel
												</Button>
											</div>
										</DialogHeader>
									</DialogContent>
								</Dialog>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	)
}
