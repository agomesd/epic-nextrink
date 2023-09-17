import { z } from 'zod'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { prisma } from '~/utils/db.server.ts'
import { redirectWithToast } from '~/utils/flash-session.server.ts'
import { invariant, invariantResponse, useIsSubmitting } from '~/utils/misc.ts'
import { requireAdmin } from '~/utils/permissions.server.ts'
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from '@remix-run/react'
import { useForm } from '@conform-to/react'
import { StatusButton } from '~/components/ui/status-button.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { ErrorList } from '~/components/forms.tsx'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog.tsx'
import { useEffect, useState } from 'react'
import { safeRedirect } from 'remix-utils'

export const DeleteTeamSchema = z.object({
	intent: z.literal('delete-team'),
	teamId: z.string(),
	redirectTo: z.string(),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	const submission = parse(formData, {
		schema: DeleteTeamSchema,
	})
	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}

	if (!submission.value) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}

	const { teamId, redirectTo } = submission.value

	const safeRedirectTo = safeRedirect(redirectTo)

	const team = await prisma.team.findFirst({
		select: { id: true },
		where: { id: teamId },
	})
	invariantResponse(team, 'Team not found', { status: 404 })

	await requireAdmin(request)

	await prisma.team.delete({ where: { id: teamId } })

	return redirectWithToast(safeRedirectTo, {
		variant: 'default',
		title: 'Success',
		description: 'Team successfully deleted.',
	})
}

export async function loader({ params }: DataFunctionArgs) {
	invariant(
		params.teamId,
		'params.teamId is not defined in /teams+/$teamId.tsx',
	)

	return json({ teamId: params.teamId })
}

export default function TeamId() {
	const [showDialog, setShowDialog] = useState(false)
	const { teamId } = useLoaderData<typeof loader>()
	const [searcParams] = useSearchParams()
	const intent = searcParams.get('intent')
	const redirectTo = searcParams.get('redirectTo')
	const navigate = useNavigate()

	useEffect(() => {
		if (intent === 'delete-team' && teamId) {
			setShowDialog(true)
		} else {
			setShowDialog(false)
		}
	}, [intent, teamId])

	const handleOpenChange = (value: boolean) => {
		if (value === false && redirectTo) {
			const safeRedirectTo = safeRedirect(redirectTo)
			setShowDialog(false)
			navigate(safeRedirectTo)
		} else {
			setShowDialog(value)
		}
	}

	return (
		<div className="container">
			<Dialog open={showDialog} onOpenChange={value => handleOpenChange(value)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete team?</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this team?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DeleteTeam id={teamId} />
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

interface DeleteTeamProps {
	id: string
}

export function DeleteTeam({ id }: DeleteTeamProps) {
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')
	const actionData = useActionData<typeof action>()
	const isSubmitting = useIsSubmitting()
	const [form] = useForm({
		id: 'delete-team',
		lastSubmission: actionData?.submission,
		constraint: getFieldsetConstraint(DeleteTeamSchema),
		onValidate({ formData }) {
			return parse(formData, { schema: DeleteTeamSchema })
		},
	})

	return (
		<Form method="POST" {...form.props}>
			<input type="hidden" name="teamId" value={id} />
			<input type="hidden" name="redirectTo" value={redirectTo ?? '/'} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-team"
				variant="destructive"
				status={isSubmitting ? 'pending' : actionData?.status ?? 'idle'}
				disabled={isSubmitting}
				size="icon"
			>
				<Icon name="trash" className="scale-125 max-md:scale-150"></Icon>
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}
