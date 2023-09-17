import { json, type DataFunctionArgs } from '@remix-run/node'
import { z } from 'zod'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { prisma } from '~/utils/db.server.ts'
import { useFetcher } from '@remix-run/react'
import {
	DatePicker,
	Field,
	SelectBox,
	SliderField,
} from '~/components/forms.tsx'
import { useForm, conform } from '@conform-to/react'
import { StatusButton } from '~/components/ui/status-button.tsx'

const createPlayerFormSchema = z.object({
	firstName: z.string().min(3).max(20),
	lastName: z.string().min(3).max(20),
	positionId: z.string(),
	shotSideId: z.string(),
	hometown: z.string().optional(),
	dob: z.string().optional(),
	weight: z.string().optional(),
	height: z.number().optional(),
	jerseyNumber: z.number(),
	teamId: z.string(),
})

const updatePlayerFormSchema = createPlayerFormSchema.extend({
	id: z.string(),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	const actionId = formData.get('actionId')

	switch (actionId) {
		case 'update-status': {
			const submission = parse(formData, {
				schema: updatePlayerFormSchema,
				acceptMultipleErrors: () => true,
			})

			if (submission.intent !== 'submit') {
				return json({ status: 'idle', submission } as const)
			}

			if (!submission.value) {
				return json({ status: 'error', submission } as const, { status: 400 })
			}

			const {
				teamId,
				firstName,
				id,
				jerseyNumber,
				lastName,
				positionId,
				shotSideId,
				dob,
				height,
				hometown,
				weight,
			} = submission.value
			await prisma.playerProfile.update({
				select: { id: true },
				where: { id },
				data: {
					firstName,
					jerseyNumber,
					lastName,
					position: { connect: { id: positionId } },
					shotSide: { connect: { id: shotSideId } },
					team: { connect: { id: teamId } },
					dob,
					height,
					hometown,
					weight: weight ? parseInt(weight) : null,
				},
			})

			return json({ status: 'success', submission } as const)
		}
		case 'create-player': {
			const submission = parse(formData, {
				schema: createPlayerFormSchema,
				acceptMultipleErrors: () => true,
			})

			if (submission.intent !== 'submit') {
				return json({ status: 'idle', submission } as const)
			}

			if (!submission.value) {
				return json({ status: 'error', submission } as const, { status: 400 })
			}

			const {
				firstName,
				jerseyNumber,
				lastName,
				positionId,
				shotSideId,
				dob,
				height,
				hometown,
				weight,
				teamId,
			} = submission.value
			await prisma.playerProfile.create({
				data: {
					firstName,
					lastName,
					team: { connect: { id: teamId } },
					position: { connect: { id: positionId } },
					shotSide: { connect: { id: shotSideId } },
					status: { connect: { name: 'Present' } },
					dob,
					height,
					jerseyNumber,
					hometown,
					weight: weight ? parseInt(weight) : null,
				},
			})
			return json({ status: 'success', submission } as const, { status: 200 })
		}
		default:
			return json({ status: 'idle' } as const, { status: 400 })
	}
}

export function CreatePlayerForm({ redirectTo }: { redirectTo?: string }) {
	const { Form, data, state } = useFetcher<typeof action>()
	const [form, fields] = useForm({
		id: 'create-player',
		defaultValue: { redirectTo },
		constraint: getFieldsetConstraint(createPlayerFormSchema),
		onValidate({ formData }) {
			return parse(formData, { schema: createPlayerFormSchema })
		},
	})

	return (
		<div>
			<Form
				method="POST"
				action="/resources/player/new"
				{...form.props}
				name="create-player"
				{...form.props}
			>
				<div className="flex gap-4">
					<Field
						className="flex-1"
						labelProps={{ children: 'First name' }}
						inputProps={{ ...conform.input(fields.firstName), autoFocus: true }}
						errors={fields.firstName.errors}
					/>
					<Field
						className="flex-1"
						labelProps={{ children: 'Last name' }}
						inputProps={conform.input(fields.lastName)}
						errors={fields.lastName.errors}
					/>
				</div>
				<SelectBox
					labelProps={{ children: 'Position' }}
					selectProps={conform.select(fields.positionId)}
					routePath="/resources/position"
					errors={fields.positionId.errors}
					placeholder="Select position..."
					accessorKey="positions"
				/>
				<SelectBox
					labelProps={{ children: 'Shot side' }}
					selectProps={conform.select(fields.shotSideId)}
					routePath="/resources/shotside"
					errors={fields.shotSideId.errors}
					placeholder="Player shoots..."
					accessorKey="shotSides"
				/>
				<Field
					labelProps={{ children: 'Hometown' }}
					inputProps={conform.input(fields.hometown)}
					errors={fields.hometown.errors}
				/>

				<DatePicker
					labelProps={{ children: 'Date of birth' }}
					onSelect={value =>
						(conform.input(fields.dob).value = value.toDateString())
					}
				/>

				<SliderField
					inputProps={{
						...conform.input(fields.weight),
						min: 50,
						max: 130,
						step: 1,
					}}
					labelProps={{ children: 'Weight(kg)' }}
					className="mb-2"
				/>

				<StatusButton
					className="w-full"
					status={state === 'submitting' ? 'pending' : data?.status ?? 'idle'}
					type="submit"
					disabled={state !== 'idle'}
				>
					Create player
				</StatusButton>
			</Form>
		</div>
	)
}
