import { Link } from '@remix-run/react'
import { UserDropdown } from './user-dropdown.tsx'
import { Button } from './ui/button.tsx'

export interface HeaderProps {
	user: any
	logoUrl: string
}

export function Header({ user, logoUrl }: HeaderProps) {
	return (
		<nav className="flex items-center justify-between p-4">
			<Link to="/">
				<div className="w-20">
					<img src={logoUrl} alt="" className="h-full w-full object-contain" />
				</div>
			</Link>
			<div className="flex items-center gap-10">
				{user ? (
					<UserDropdown />
				) : (
					<Button asChild variant="default" size="sm">
						<Link to="/login">Log In</Link>
					</Button>
				)}
			</div>
		</nav>
	)
}
