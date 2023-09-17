import { useInputEvent } from '@conform-to/react'
import React, { useId, useRef, useEffect, useState } from 'react'
import { Input } from '~/components/ui/input.tsx'
import { Label } from '~/components/ui/label.tsx'
import { Checkbox, type CheckboxProps } from '~/components/ui/checkbox.tsx'
import { Textarea } from '~/components/ui/textarea.tsx'
import type { SelectProps } from '@radix-ui/react-select'
import { useFetcher } from '@remix-run/react'

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select.tsx'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover.tsx'
import { Button } from './ui/button.tsx'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from './ui/calendar.tsx'
import { Slider } from '~/components/ui/slider.tsx'
import { cn } from '~/utils/misc.ts'

export type ListOfErrors = Array<string | null | undefined> | null | undefined

export function ErrorList({
	id,
	errors,
}: {
	errors?: ListOfErrors
	id?: string
}) {
	const errorsToRender = errors?.filter(Boolean)
	if (!errorsToRender?.length) return null
	return (
		<ul id={id} className="flex flex-col gap-1">
			{errorsToRender.map(e => (
				<li key={e} className="text-[10px] text-foreground-danger">
					{e}
				</li>
			))}
		</ul>
	)
}

export function Field({
	labelProps,
	inputProps,
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	inputProps: React.InputHTMLAttributes<HTMLInputElement>
	errors?: ListOfErrors
	className?: string
}) {
	const fallbackId = useId()
	const id = inputProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={className}>
			<Label htmlFor={id} {...labelProps} />
			<Input
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				{...inputProps}
			/>
			<div className="min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export function TextareaField({
	labelProps,
	textareaProps,
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	textareaProps: React.InputHTMLAttributes<HTMLTextAreaElement>
	errors?: ListOfErrors
	className?: string
}) {
	const fallbackId = useId()
	const id = textareaProps.id ?? textareaProps.name ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={className}>
			<Label htmlFor={id} {...labelProps} />
			<Textarea
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				{...textareaProps}
			/>
			<div className="min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export function CheckboxField({
	labelProps,
	buttonProps,
	errors,
	className,
}: {
	labelProps: JSX.IntrinsicElements['label']
	buttonProps: CheckboxProps
	errors?: ListOfErrors
	className?: string
}) {
	const fallbackId = useId()
	const buttonRef = useRef<HTMLButtonElement>(null)
	// To emulate native events that Conform listen to:
	// See https://conform.guide/integrations
	const control = useInputEvent({
		// Retrieve the checkbox element by name instead as Radix does not expose the internal checkbox element
		// See https://github.com/radix-ui/primitives/discussions/874
		ref: () =>
			buttonRef.current?.form?.elements.namedItem(buttonProps.name ?? ''),
		onFocus: () => buttonRef.current?.focus(),
	})
	const id = buttonProps.id ?? buttonProps.name ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={className}>
			<div className="flex gap-2">
				<Checkbox
					id={id}
					ref={buttonRef}
					aria-invalid={errorId ? true : undefined}
					aria-describedby={errorId}
					{...buttonProps}
					onCheckedChange={state => {
						control.change(Boolean(state.valueOf()))
						buttonProps.onCheckedChange?.(state)
					}}
					onFocus={event => {
						control.focus()
						buttonProps.onFocus?.(event)
					}}
					onBlur={event => {
						control.blur()
						buttonProps.onBlur?.(event)
					}}
					type="button"
				/>
				<label
					htmlFor={id}
					{...labelProps}
					className="self-center text-body-xs text-muted-foreground"
				/>
			</div>
			<div className="px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export interface SelectBoxProps {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	selectProps: React.SelectHTMLAttributes<HTMLSelectElement>
	errors?: ListOfErrors
	className?: string
	placeholder?: string
	routePath: string
	accessorKey: string
}

export function SelectBox({
	labelProps,
	selectProps,
	className,
	errors,
	placeholder = 'Select an item...',
	routePath,
	accessorKey,
}: SelectBoxProps) {
	const [items, setItems] = useState<{ id: string; name: string }[]>([])
	const { load, data } = useFetcher()

	const fallbackId = useId()
	const id = selectProps.name ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined

	useEffect(() => {
		load(routePath)
	}, [load, routePath])

	useEffect(() => {
		if (!data) return
		setItems(data[accessorKey])
	}, [data, accessorKey])
	return (
		<div className={className}>
			<Label htmlFor={id} {...labelProps} />
			<Select {...(selectProps as SelectProps)}>
				<SelectTrigger className="h-full text-xs">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent id={id}>
					{items.map(item => (
						<SelectItem key={item.id} value={item.id}>
							{item.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<div className="px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export interface DatePickerProps {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	onSelect: (value: Date) => void
}

export function DatePicker({ labelProps }: DatePickerProps) {
	const [date, setDate] = useState<Date>()
	return (
		<div className="flex flex-col">
			<Label {...labelProps} className="mb-1" />
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline">
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? format(date, 'PPP') : <span>Pick a date</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent>
					{/* <Input type="text" placeholder="year" /> */}

					<Calendar
						mode="single"
						selected={date}
						onSelect={setDate}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}

export interface SliderFieldProps {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	inputProps: React.InputHTMLAttributes<HTMLInputElement>
	className?: string
}

export function SliderField({
	labelProps,
	inputProps,
	className,
}: SliderFieldProps) {
	const [value, setValue] = useState((inputProps.defaultValue as number) ?? 75)
	const baseInputRef = useRef<HTMLInputElement>(null)
	const customInputRef = useRef<HTMLInputElement>(null)
	const control = useInputEvent({
		ref: baseInputRef,
		onReset: () => setValue((inputProps.defaultValue as number) ?? 75),
	})
	const stringToNumber = (value: string | number | undefined) => {
		if (typeof value === 'string') {
			return parseInt(value)
		}
		return value
	}
	return (
		<div
			className={cn(
				className,
				'space-y-1 rounded-md border border-slate-800 p-1',
			)}
		>
			<div className="flex w-full items-center justify-between p-1">
				<Label {...labelProps} />
				<input
					value={value}
					ref={baseInputRef}
					{...inputProps}
					onChange={e => setValue(parseInt(e.target.value))}
					onFocus={() => customInputRef.current?.focus()}
					className="bg-transparent text-right font-bold"
				/>
			</div>
			<Slider
				ref={customInputRef}
				value={[value]}
				onValueChange={value => control.change(value[0].toString())}
				className="cursor-pointer"
				max={stringToNumber(inputProps.max)}
				min={stringToNumber(inputProps.min)}
				step={stringToNumber(inputProps.step)}
			/>
			<div className="flex justify-between">
				<span className="text-sm">min: {inputProps.min}</span>
				<span className="text-sm">max: {inputProps.max}</span>
			</div>
		</div>
	)
}
