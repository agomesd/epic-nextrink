import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select.tsx'

export interface SelectBoxProps {
	placeholder?: string
	items: { id: string; label: string }[]
	onValueChange: (value: string) => void
	defaultValue?: string
	statusMarker?: React.ReactNode
}

export default function SelectBox({
	placeholder = 'Select item...',
	items,
	onValueChange,
	defaultValue,
	statusMarker,
}: SelectBoxProps) {
	return (
		<Select onValueChange={onValueChange} defaultValue={defaultValue}>
			<SelectTrigger className="h-full text-xs">
				{statusMarker ? statusMarker : null}
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{items.map(item => (
					<SelectItem key={item.id} value={item.id}>
						{item.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
