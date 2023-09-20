import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { Form, useActionData, useFetcher } from '@remix-run/react'
import { useEffect, useId } from 'react'
import { safeRedirect } from 'remix-utils'
import { z } from 'zod'
import { ErrorList, Field } from '~/components/forms.tsx'
import { Button } from '~/components/ui/button.tsx'
import { Icon } from '~/components/ui/icon.tsx'
import { prisma } from '~/utils/db.server.ts'
import { redirectWithToast } from '~/utils/flash-session.server.ts'

const routePath = '/resources/caliber'
const AddCaliberFormSchema = z.object({
	name: z.string().min(1).max(10),
})

const DeleteCaliberFormSchema = z.object({
	caliberId: z.string().min(25).max(35),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('intent')
	const redirectTo = formData.get('redirectTo')
	const safeRedirectTo = safeRedirect(redirectTo)
	switch (intent) {
		case 'delete-caliber': {
			const submission = await parse(formData, {
				schema: DeleteCaliberFormSchema,
			})
			if (submission.intent !== 'submit') {
				return json({ status: 'idle', submission } as const)
			}
			if (!submission.value) {
				return json({ status: 'error', submission } as const, { status: 400 })
			}

			const { caliberId } = submission.value
			await prisma.caliber.delete({ where: { id: caliberId } })
			return redirectWithToast(safeRedirectTo, {
				variant: 'default',
				title: 'Success',
				description: 'The caliber has been deleted.',
			})
		}
		case 'create-caliber': {
			const submission = await parse(formData, {
				schema: AddCaliberFormSchema.superRefine(async (data, ctx) => {
					const existingCaliber = await prisma.caliber.findFirst({
						where: { name: data.name.toUpperCase() },
						select: { id: true },
					})
					if (existingCaliber) {
						ctx.addIssue({
							path: ['name'],
							code: z.ZodIssueCode.custom,
							message: 'This caliber already exists',
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
			const upperCaseName = name.toUpperCase()
			await prisma.caliber.create({ data: { name: upperCaseName } })
			return json({ status: 'successful', submission } as const, {
				status: 200,
			})
		}
		default:
			throw new Response('Invalid action for caliber data type', {
				status: 400,
			})
	}
}

export async function loader() {
	const calibers = await prisma.caliber.findMany({
		select: { id: true, name: true },
	})
	return json({ calibers })
}

export interface AddCaliberFormProps {
	setOpen: (value: boolean) => void
}

export function AddCaliberForm({ setOpen }: AddCaliberFormProps) {
	const id = useId()
	const { Form, data } = useFetcher()
	const [form, fields] = useForm({
		id,
		constraint: getFieldsetConstraint(AddCaliberFormSchema),
		lastSubmission: data?.submission,
		onValidate({ formData }) {
			const result = parse(formData, { schema: AddCaliberFormSchema })
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
			<input name="intent" hidden value="create-caliber" readOnly />
			<Field
				inputProps={{ autoFocus: true, ...conform.input(fields.name) }}
				labelProps={{ children: 'Caliber' }}
				errors={fields.name.errors}
			/>
			<ErrorList errors={form.errors} id={form.errorId} />
			<Button type="submit" variant="outline">
				Submit
			</Button>
		</Form>
	)
}

export interface DeleteCaliberFormProps {
	caliberId: string
	redirectTo?: string
}

export function DeleteCaliberForm({
	caliberId,
	redirectTo,
}: DeleteCaliberFormProps) {
	const actionData = useActionData<typeof action>()

	const [form] = useForm({
		id: 'delete-caliber-form',
		constraint: getFieldsetConstraint(DeleteCaliberFormSchema),
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			const result = parse(formData, { schema: DeleteCaliberFormSchema })
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
			<input name="caliberId" hidden value={caliberId} readOnly />
			<input name="intent" hidden value="delete-caliber" readOnly />
			<input name="redirectTo" hidden value={redirectTo} readOnly />
			<Button variant="destructive" className="h-full">
				<Icon name="trash" />
			</Button>
		</Form>
	)
}
