import { json, type DataFunctionArgs, redirect } from '@remix-run/node'
import { time, makeTimings } from '~/utils/timing.server.ts'
import { getUserId, authenticator } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'

export async function loader({ request }: DataFunctionArgs) {
	const timings = makeTimings('root index')
	const userId = await time(() => getUserId(request), {
		timings,
		type: 'getUserId',
		desc: 'getUserId in root',
	})
	const user = userId
		? await time(
				() =>
					prisma.user.findUnique({
						where: { id: userId },
						select: {
							coachProfile: true,
							playerProfile: true,
						},
					}),
				{ timings, type: 'find user', desc: 'find user in root' },
		  )
		: null
	if (userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await authenticator.logout(request, { redirectTo: '/' })
	}

	if (user?.coachProfile) return redirect(`/coach/${user.coachProfile.id}`)
	return json({})
}

export default function HomeRoute() {
	return <div>HomeRoute</div>
}
