import { useForm, conform } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { type DataFunctionArgs, json, Response } from '@remix-run/node'
import { Form, useActionData, useFetcher } from '@remix-run/react'
import { useEffect, useId } from 'react'
import { safeRedirect } from 'remix-utils'
import { z } from 'zod'
import { ErrorList, Field } from '~/components/forms.tsx'
import { Button } from '~/components/ui/button.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { prisma } from '~/utils/db.server.ts'
import { redirectWithToast } from '~/utils/flash-session.server.ts'

const routePath = '/resources/level'
const AddLevelFormSchema = z.object({
	name: z.string().min(3).max(20),
})

const DeleteLevelFormSchema = z.object({
	levelId: z.string().min(25).max(35),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('intent')
	const redirectTo = formData.get('redirectTo')
	const safeRedirectTo = safeRedirect(redirectTo)
	switch (intent) {
		case 'delete-level': {
			const submission = await parse(formData, {
				schema: DeleteLevelFormSchema,
			})
			if (submission.intent !== 'submit') {
				return json({ status: 'idle', submission } as const)
			}
			if (!submission.value) {
				return json({ status: 'error', submission } as const, { status: 400 })
			}

			const { levelId } = submission.value
			await prisma.level.delete({ where: { id: levelId } })
			return redirectWithToast(safeRedirectTo, {
				variant: 'default',
				title: 'Success',
				description: 'The level has been deleted.',
			})
		}
		case 'create-level': {
			const submission = await parse(formData, {
				schema: AddLevelFormSchema.superRefine(async (data, ctx) => {
					const existingLevel = await prisma.level.findFirst({
						where: { name: data.name },
						select: { id: true },
					})
					if (existingLevel) {
						ctx.addIssue({
							path: ['name'],
							code: z.ZodIssueCode.custom,
							message: 'This level already exists',
						})
						return
					}
				}),
				async: true,
			})

			if (submission.intent !== 'submit') {
				return json({ status: 'idle', submission } as const)
			}

			if (!submission.value) {
				return json({ status: 'error', submission } as const, { status: 400 })
			}

			const { name } = submission.value
			await prisma.level.create({ data: { name } })
			return json({ status: 'successful', submission } as const, {
				status: 200,
			})
		}
		default: {
			throw new Response(`invalid action on level`, { status: 400 })
		}
	}
}

export async function loader() {
	const levels = await prisma.level.findMany({
		select: { id: true, name: true },
	})
	return json({ levels })
}

export interface AddLevelFormProps {
	setOpen: (value: boolean) => void
}

export function AddLevelForm({ setOpen }: AddLevelFormProps) {
	const id = useId()
	const { Form, data } = useFetcher()
	const [form, fields] = useForm({
		id,
		constraint: getFieldsetConstraint(AddLevelFormSchema),
		lastSubmission: data?.submission,
		onValidate({ formData }) {
			const result = parse(formData, { schema: AddLevelFormSchema })
			return result
		},

		shouldRevalidate: 'onBlur',
	})

	useEffect(() => {
		if (data && data['status'] === 'successful') {
			setOpen(false)
		}
	}, [data, setOpen])

	return (
		<Form action={routePath} method="POST" {...form.props}>
			<input name="intent" hidden readOnly value="create-level" />
			<Field
				inputProps={{ autoFocus: true, ...conform.input(fields.name) }}
				labelProps={{ children: 'Level' }}
				errors={fields.name.errors}
			/>
			<ErrorList errors={form.errors} id={form.errorId} />
			<Button type="submit" variant="outline">
				Submit
			</Button>
		</Form>
	)
}

export interface DeleteLevelFormProps {
	levelId: string
	redirectTo?: string
}

export function DeleteLevelForm({ levelId, redirectTo }: DeleteLevelFormProps) {
	const actionData = useActionData<typeof action>()

	const [form] = useForm({
		id: 'delete-level-form',
		constraint: getFieldsetConstraint(DeleteLevelFormSchema),
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			const result = parse(formData, { schema: DeleteLevelFormSchema })
			return result
		},
	})

	return (
		<Form
			className="hidden h-full duration-300 group-hover:block"
			method="POST"
			action={routePath}
			{...form.props}
		>
			<input name="levelId" hidden value={levelId} readOnly />
			<input name="intent" hidden value="delete-level" readOnly />
			<input name="redirectTo" hidden value={redirectTo} readOnly />
			<Button variant="destructive" className="h-full">
				<Icon name="trash" />
			</Button>
		</Form>
	)
}
