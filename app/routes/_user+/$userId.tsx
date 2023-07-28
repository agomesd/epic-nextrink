import {
	json,
	type DataFunctionArgs,
	type V2_MetaFunction,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx'
import { Spacer } from '~/components/spacer.tsx'
import { prisma } from '~/utils/db.server.ts'
import { getUserImgSrc, invariantResponse } from '~/utils/misc.ts'

export async function loader({ params }: DataFunctionArgs) {
	invariantResponse(params.userId, 'Missing username')
	const user = await prisma.user.findUnique({
		where: { id: params.userId },
		select: {
			id: true,
			email: true,
			imageId: true,
			createdAt: true,
		},
	})
	if (!user) {
		throw new Response('not found', { status: 404 })
	}
	return json({ user, userJoinedDisplay: user.createdAt.toLocaleDateString() })
}

export default function UserIdRoute() {
	const data = useLoaderData<typeof loader>()
	const user = data.user
	const userDisplayName = user.email

	return (
		<div className="container mt-12 flex flex-col items-center justify-center">
			<Spacer size="4xs" />

			<div className="container flex flex-col rounded-3xl bg-muted p-8">
				<div className="relative flex w-full justify-between rounded-xl  border p-2">
					<div className="flex flex-wrap  justify-center gap-4">
						<h1 className="text-center text-h2">Coach {userDisplayName}</h1>
					</div>
					<img
						src={getUserImgSrc(data.user.imageId)}
						alt={userDisplayName}
						className="h-52 w-52 rounded-full object-cover"
					/>
				</div>

				<Spacer size="sm" />

				<div className="flex flex-col items-center">
					<ul>{}</ul>
				</div>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}

export const meta: V2_MetaFunction<typeof loader> = ({ data, params }) => {
	const displayName = data?.user.email ?? 'User'
	return [
		{ title: `${displayName} | Epic Notes` },
		{
			name: 'description',
			content: `Profile of ${displayName} on Epic Notes`,
		},
	]
}
