import { Link } from '@remix-run/react'
import { UserDropdown } from './user-dropdown.tsx'
import { Button } from './ui/button.tsx'
import { UserTeamsSelectBox } from '~/routes/resources+/user.teams.tsx'
import type { Theme } from '~/routes/resources+/theme/theme.server.ts'

export interface HeaderProps {
	user: any
	logoUrl: string
	theme: Theme
}

export function Header({ user, logoUrl, theme }: HeaderProps) {
	return (
		<nav className="flex items-center justify-between p-4">
			<Link to="/">
				<span className="text-3xl font-bold text-teal-400">NextRink</span>
			</Link>
			<div className="flex items-center gap-10">
				{user ? (
					<div className="flex gap-4">
						<UserTeamsSelectBox />
						<UserDropdown theme={theme} />
					</div>
				) : (
					<Button asChild variant="default" size="sm">
						<Link to="/login">Log In</Link>
					</Button>
				)}
			</div>
		</nav>
	)
}
