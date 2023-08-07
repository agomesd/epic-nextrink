import { json } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { useEffect, useState } from 'react'
import SelectBox from '~/components/select-box.tsx'
import { prisma } from '~/utils/db.server.ts'
import { cn } from '~/utils/misc.ts'

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
	const [status, setStatus] = useState<{ name: string; id: string }[]>([])
	const { load, data, submit } = useFetcher<typeof loader>()
	useEffect(() => {
		load('/resources/status')
	}, [load])

	useEffect(() => {
		if (!data) return
		setStatus(data.playerStatus)
	}, [data])
	return (
		<SelectBox
			items={status.map(item => ({ ...item, label: item.name }))}
			onValueChange={value =>
				submit(
					{
						actionId: 'update-status',
						statusId: value,
						playerId,
					},
					{ method: 'post', action: '/resources/player-editor' },
				)
			}
			defaultValue={defaultValue}
			statusMarker={<StatusMarker statusName={statusName} />}
		/>
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
