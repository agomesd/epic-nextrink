import React from 'react'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog.tsx'
import { Button } from './ui/button.tsx'

export interface AddModalProps {
	icon: React.ReactNode
	title: string
	form: React.ReactNode
	open?: boolean
	setOpen?: (value: boolean) => void
}

export default function AddModal({
	form,
	icon,
	title,
	open,
	setOpen,
}: AddModalProps) {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button asChild variant="outline" className="border-emerald-400">
				<DialogTrigger className="w-full items-end justify-center p-2">
					{icon}
				</DialogTrigger>
			</Button>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{form}
			</DialogContent>
		</Dialog>
	)
}
