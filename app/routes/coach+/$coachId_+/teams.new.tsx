import { json, type DataFunctionArgs } from '@remix-run/node'
import React from 'react'
import { requireCoach } from '~/utils/permissions.server.ts'

export async function loader({ request }: DataFunctionArgs) {
	await requireCoach(request)
	return json({})
}

export default function NewTeam() {
	return <main className="container"></main>
}
