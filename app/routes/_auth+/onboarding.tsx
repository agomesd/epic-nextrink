import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import {
	json,
	redirect,
	type DataFunctionArgs,
	type V2_MetaFunction,
} from '@remix-run/node'
import {
	Form,
	useActionData,
	useFormAction,
	useLoaderData,
	useNavigation,
	useSearchParams,
} from '@remix-run/react'
import { safeRedirect } from 'remix-utils'
import { z } from 'zod'
import { Spacer } from '~/components/spacer.tsx'
import { StatusButton } from '~/components/ui/status-button.tsx'
import { authenticator, requireAnonymous, signup } from '~/utils/auth.server.ts'
import { CheckboxField, ErrorList, Field } from '~/components/forms.tsx'
import { commitSession, getSession } from '~/utils/session.server.ts'
import { nameSchema, passwordSchema } from '~/utils/user-validation.ts'
import { checkboxSchema } from '~/utils/zod-extensions.ts'
import { redirectWithConfetti } from '~/utils/flash-session.server.ts'

export const onboardingEmailSessionKey = 'onboardingEmail'

const onboardingFormSchema = z
	.object({
		fullName: nameSchema,
		password: passwordSchema,
		confirmPassword: passwordSchema,
		agreeToTermsOfServiceAndPrivacyPolicy: checkboxSchema(
			'You must agree to the terms of service and privacy policy',
		),
		agreeToMailingList: checkboxSchema(),
		remember: checkboxSchema(),
		redirectTo: z.string().optional(),
	})
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				path: ['confirmPassword'],
				code: 'custom',
				message: 'The passwords did not match',
			})
		}
	})

export async function loader({ request }: DataFunctionArgs) {
	await requireAnonymous(request)
	const session = await getSession(request.headers.get('cookie'))
	const error = session.get(authenticator.sessionErrorKey)
	const onboardingEmail = session.get(onboardingEmailSessionKey)
	if (typeof onboardingEmail !== 'string' || !onboardingEmail) {
		return redirect('/signup')
	}
	const message = error?.message ?? null
	return json(
		{ formError: typeof message === 'string' ? message : null },
		{
			headers: {
				'Set-Cookie': await commitSession(session),
			},
		},
	)
}

export async function action({ request }: DataFunctionArgs) {
	const cookieSession = await getSession(request.headers.get('cookie'))
	const email = cookieSession.get(onboardingEmailSessionKey)
	if (typeof email !== 'string' || !email) {
		return redirect('/signup')
	}

	const formData = await request.formData()
	const submission = await parse(formData, {
		schema: onboardingFormSchema.superRefine(async (data, ctx) => {}),
		acceptMultipleErrors: () => true,
		async: true,
	})
	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}
	if (!submission.value) {
		return json(
			{
				status: 'error',
				submission,
			} as const,
			{ status: 400 },
		)
	}
	const {
		fullName,
		password,
		// TODO: add user to mailing list if they agreed to it
		// agreeToMailingList,
		remember,
		redirectTo,
	} = submission.value

	const session = await signup({ email, fullName, password })

	cookieSession.set(authenticator.sessionKey, session.id)
	cookieSession.unset(onboardingEmailSessionKey)

	const newCookie = await commitSession(cookieSession, {
		expires: remember ? session.expirationDate : undefined,
	})
	return redirectWithConfetti(safeRedirect(redirectTo, '/'), {
		headers: { 'Set-Cookie': newCookie },
	})
}

export const meta: V2_MetaFunction = () => {
	return [{ title: 'Setup Epic Notes Account' }]
}

export default function OnboardingPage() {
	const [searchParams] = useSearchParams()
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const navigation = useNavigation()
	const formAction = useFormAction()

	const [form, fields] = useForm({
		id: 'onboarding',
		constraint: getFieldsetConstraint(onboardingFormSchema),
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: onboardingFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	const redirectTo = searchParams.get('redirectTo') || '/'

	return (
		<div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-lg">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Welcome to NextRink!</h1>
					<p className="text-body-md text-muted-foreground">
						Please enter your details.
					</p>
				</div>
				<Spacer size="xs" />
				<Form
					method="POST"
					className="mx-auto min-w-[368px] max-w-sm"
					{...form.props}
				>
					<Field
						labelProps={{ htmlFor: fields.fullName.id, children: 'Full name' }}
						inputProps={{
							...conform.input(fields.fullName),
							autoComplete: 'fullname',
							autoFocus:
								typeof actionData === 'undefined' ||
								typeof fields.fullName.initialError !== 'undefined',
						}}
						errors={fields.fullName.errors}
					/>

					<Field
						labelProps={{ htmlFor: fields.password.id, children: 'Password' }}
						inputProps={{
							...conform.input(fields.password, { type: 'password' }),
							autoComplete: 'new-password',
						}}
						errors={fields.password.errors}
					/>

					<Field
						labelProps={{
							htmlFor: fields.confirmPassword.id,
							children: 'Confirm Password',
						}}
						inputProps={{
							...conform.input(fields.confirmPassword, { type: 'password' }),
							autoComplete: 'new-password',
						}}
						errors={fields.confirmPassword.errors}
					/>

					<CheckboxField
						labelProps={{
							htmlFor: fields.agreeToTermsOfServiceAndPrivacyPolicy.id,
							children:
								'Do you agree to our Terms of Service and Privacy Policy?',
						}}
						buttonProps={conform.input(
							fields.agreeToTermsOfServiceAndPrivacyPolicy,
							{ type: 'checkbox' },
						)}
						errors={fields.agreeToTermsOfServiceAndPrivacyPolicy.errors}
					/>

					<CheckboxField
						labelProps={{
							htmlFor: fields.remember.id,
							children: 'Remember me',
						}}
						buttonProps={conform.input(fields.remember, { type: 'checkbox' })}
						errors={fields.remember.errors}
					/>

					<input
						name={fields.redirectTo.name}
						type="hidden"
						value={redirectTo}
					/>

					<ErrorList
						errors={[...form.errors, data.formError]}
						id={form.errorId}
					/>

					<div className="flex items-center justify-between gap-6">
						<StatusButton
							className="w-full"
							status={
								navigation.state === 'submitting' &&
								navigation.formAction === formAction &&
								navigation.formMethod === 'POST'
									? 'pending'
									: actionData?.status ?? 'idle'
							}
							type="submit"
							disabled={navigation.state !== 'idle'}
						>
							Create an account
						</StatusButton>
					</div>
				</Form>
			</div>
		</div>
	)
}
