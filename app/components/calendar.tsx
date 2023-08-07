import { useState } from 'react'
import { Calendar as CalendarCN } from './ui/calendar.tsx'

export default function Calendar() {
	const [date, setDate] = useState<Date | undefined>(new Date())
	return <CalendarCN mode="single" selected={date} onSelect={setDate} />
}
