import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint } from '@conform-to/zod'
import { json } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { z } from 'zod'
import { Field } from '~/components/forms.tsx'
import { Button } from '~/components/ui/button.tsx'
import { prisma } from '~/utils/db.server.ts'
import { emailSchema, nameSchema } from '~/utils/user-validation.ts'

const CreateCoachFormSchema = z.object({
	firstName: nameSchema,
	lastName: nameSchema,
	email: emailSchema,
})

export async function action() {
	return json({ status: 'idle' })
}

export async function loader() {
	const coaches = await prisma.coachProfile.findMany({
		select: { id: true, firstName: true, lastName: true },
	})
	return json({ coaches })
}

export function CreateCoachForm() {
	const [form, fields] = useForm({
		id: 'create-coach-form',
		constraint: getFieldsetConstraint(CreateCoachFormSchema),
	})
	return (
		<Form method="POST" {...form.props} action="/admin/coaches">
			<input name="intent" value="create-coach" hidden readOnly />
			<Field
				inputProps={{ ...conform.input(fields.firstName) }}
				labelProps={{ children: 'First name' }}
				errors={fields.firstName.errors}
			/>
			<Field
				inputProps={{ ...conform.input(fields.lastName) }}
				labelProps={{ children: 'Last name' }}
				errors={fields.lastName.errors}
			/>
			<Field
				inputProps={{ ...conform.input(fields.email) }}
				labelProps={{ children: 'Email' }}
				errors={fields.email.errors}
			/>
			<Button type="submit" variant="outline">
				Submit
			</Button>
		</Form>
	)
}
