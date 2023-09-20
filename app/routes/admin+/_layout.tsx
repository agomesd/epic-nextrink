import { NavLink, Outlet } from '@remix-run/react'
import { Button } from '~/components/ui/button.tsx'

const adminLinks = [
	{ id: 'calibers', label: 'Calibers', slug: 'calibers' },
	{ id: 'coaches', label: 'Coaches', slug: 'coaches' },
	{ id: 'levels', label: 'Levels', slug: 'levels' },
	{ id: 'players', label: 'Players', slug: 'players' },
	{ id: 'teams', label: 'Teams', slug: 'teams' },
]

export default function AdminLayout() {
	return (
		<main className="flex h-full w-full">
			<nav className="flex h-full w-[320px] flex-col space-y-2 p-2">
				{adminLinks.map(link => (
					<NavLink key={link.id} to={link.slug}>
						<Button variant="outline" className="w-full">
							{link.label}
						</Button>
					</NavLink>
				))}
			</nav>
			<section className="container">
				<Outlet />
			</section>
		</main>
	)
}
