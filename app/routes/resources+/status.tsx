import { parse } from '@conform-to/zod'
import { type DataFunctionArgs, json } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select.tsx'
import { prisma } from '~/utils/db.server.ts'
import { cn } from '~/utils/misc.ts'

const ROUTE_PATH = '/resources/status'

const updatePlayerPositionSchema = z.object({
	playerId: z.string(),
	statusId: z.string(),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	const submission = parse(formData, {
		schema: updatePlayerPositionSchema,
		acceptMultipleErrors: () => true,
	})
	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}

	if (!submission.value) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}

	const { playerId, statusId } = submission.value

	await prisma.playerProfile.update({
		select: { id: true },
		where: { id: playerId },
		data: {
			status: { connect: { id: statusId } },
		},
	})
	const playerStatus = await prisma.status.findMany({
		select: { id: true, name: true },
	})
	return json({ status: 'success', submission, playerStatus } as const, {
		status: 200,
	})
}

export async function loader() {
	const playerStatus = await prisma.status.findMany({
		select: { id: true, name: true },
	})

	return json({ playerStatus })
}

export interface PlayerStatusSelectBoxProps {
	defaultValue: string
	statusName: string
	playerId: string
}

export function PlayerStatusSelectBox({
	defaultValue,
	statusName,
	playerId,
}: PlayerStatusSelectBoxProps) {
	const [items, setItems] = useState<{ name: string; id: string }[]>([])
	const { load, data, submit } = useFetcher<typeof loader>()
	useEffect(() => {
		load(ROUTE_PATH)
	}, [load])

	useEffect(() => {
		if (!data) return
		setItems(data.playerStatus)
	}, [data, defaultValue])
	return (
		<Select
			defaultValue={defaultValue}
			onValueChange={value =>
				submit(
					{ statusId: value, playerId },
					{ method: 'POST', action: ROUTE_PATH },
				)
			}
		>
			<SelectTrigger>
				<StatusMarker statusName={statusName} />
				<SelectValue placeholder="Select tatus..." />
			</SelectTrigger>
			<SelectContent>
				{items?.map(item => (
					<SelectItem value={item.id} key={item.id}>
						<span>{item.name}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}

function StatusMarker({ statusName }: { statusName: string }) {
	const colourClass =
		statusName === 'Present'
			? 'bg-emerald-500'
			: statusName === 'Injured' || statusName === 'Suspended'
			? 'bg-red-500'
			: 'bg-amber-400'
	return <div className={cn('h-2 w-2 rounded-full', colourClass)} />
}
