import React from 'react'

export interface LayoutProps {
	navbar?: React.ReactNode
	header?: React.ReactNode
	footer?: React.ReactNode
	children?: React.ReactNode
}

export default function Layout({
	children,
	footer,
	header,
	navbar,
}: LayoutProps) {
	return (
		<div className="flex h-screen ">
			{navbar}
			<div className="flex-1">
				<header className="container py-6">{header}</header>

				<div className=" container relative flex-1">{children}</div>
			</div>
		</div>
	)
}
