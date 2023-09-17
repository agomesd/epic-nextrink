import { useForm, conform } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { type Team } from '@prisma/client'
import {
	json,
	type DataFunctionArgs,
	type SerializeFrom,
} from '@remix-run/node'
import { Form, useFetcher } from '@remix-run/react'
import { z } from 'zod'
import { Field } from '~/components/forms.tsx'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { useIsSubmitting } from '~/utils/misc.ts'

export async function action({ request }: DataFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()

	const submission = await parse(formData, {
		schema: TeamEditorSchema,
		acceptMultipleErrors: () => true,
	})

	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}

	if (!submission.value) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}

	const {
		id: teamId,
		associationId,
		caliberId,
		coachId,
		levelId,
		name,
		seasonId,
	} = submission.value

	const updateTeam = await prisma.team.upsert({
		select: { id: true },
		where: { id: teamId ?? '__new_team__' },
		create: {
			name,
			associationId,
			caliberId,
			levelId,
			seasonId,
			coachId,
		},
		update: {
			name,
			associationId,
			caliberId,
			levelId,
			seasonId,
			coachId,
		},
	})

	return json({ updateTeam, submission } as const)
}

const nameMinLength = 3
const nameMaxLength = 20
const cuidLength = 30

const TeamEditorSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(nameMinLength).max(nameMaxLength),
	associationId: z.string().length(cuidLength),
	levelId: z.string().length(cuidLength),
	caliberId: z.string().length(cuidLength),
	coachId: z.string().length(cuidLength),
	seasonId: z.string().length(cuidLength),
})

export function TeamEditor({
	team,
}: {
	team?: SerializeFrom<
		Pick<
			Team,
			| 'associationId'
			| 'caliberId'
			| 'coachId'
			| 'id'
			| 'levelId'
			| 'name'
			| 'seasonId'
		>
	>
}) {
	const teamFetcher = useFetcher<typeof action>()
	const isSubmitting = useIsSubmitting()

	const [form, fields] = useForm({
		id: 'team-editor',
		constraint: getFieldsetConstraint(TeamEditorSchema),
		lastSubmission: teamFetcher.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: TeamEditorSchema })
		},
		defaultValue: {
			name: team?.name ?? '',
			associationId: team?.associationId ?? '',
			caliberId: team?.caliberId ?? '',
			coachId: team?.coachId ?? '',
			levelId: team?.id ?? '',
			seasonId: team?.id ?? '',
		},
	})

	return (
		<div>
			<Form method="POST" {...form.props}>
				{team ? <input type="hidden" name="id" value={team.id} /> : null}
				<div>
					<Field
						labelProps={{ children: 'Team name' }}
						inputProps={{
							autoFocus: true,
							...conform.input(fields.name, { ariaAttributes: true }),
						}}
						errors={fields.name.errors}
					/>
				</div>
			</Form>
		</div>
	)
}
