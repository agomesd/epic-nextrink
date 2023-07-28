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
}

export default function SelectBox({
	placeholder = 'Select item...',
	items,
}: SelectBoxProps) {
	return (
		<Select>
			<SelectTrigger>
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
