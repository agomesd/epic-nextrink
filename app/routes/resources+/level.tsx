import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { useEffect, useId } from 'react'
import { z } from 'zod'
import { ErrorList, Field } from '~/components/forms.tsx'
import { Button } from '~/components/ui/button.tsx'
import { prisma } from '~/utils/db.server.ts'

const routePath = '/resources/level'
const AddLevelFormSchema = z.object({
	name: z.string().min(1).max(10),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()

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
					message: `he level: ${data.name} already exists`,
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
	return json({ status: 'success', submission } as const)
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
		if (data && data['status'] === 'success') {
			setOpen(false)
		}
	}, [data, setOpen])

	return (
		<Form action={routePath} method="POST" {...form.props}>
			<input name="intent" hidden value="create-level" readOnly />
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
