import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { useEffect, useId } from 'react'
import { z } from 'zod'
import { ErrorList, Field } from '~/components/forms.tsx'
import { Button } from '~/components/ui/button.tsx'
import { prisma } from '~/utils/db.server.ts'

const routePath = '/resources/caliber'
const AddCaliberFormSchema = z.object({
	name: z.string().min(1).max(10),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
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
	return json({ status: 'successful', submission } as const, { status: 200 })
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
			<Field
				inputProps={{ autoFocus: true, ...conform.input(fields.name) }}
				labelProps={{ children: 'Label' }}
				errors={fields.name.errors}
			/>
			<ErrorList errors={form.errors} id={form.errorId} />
			<Button type="submit" variant="outline">
				Submit
			</Button>
		</Form>
	)
}
