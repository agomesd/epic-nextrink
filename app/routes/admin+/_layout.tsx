import { NavLink, Outlet } from '@remix-run/react'
import { Button } from '~/components/ui/button.tsx'

const adminLinks = [
	{ id: 'teams', label: 'Teams', slug: 'teams' },
	{ id: 'coaches', label: 'Coaches', slug: 'coaches' },
	{ id: 'players', label: 'Players', slug: 'players' },
]

export default function AdminLayout() {
	return (
		<main className="flex h-full w-full">
			<nav className="flex h-full w-[320px] flex-col space-y-2 p-2">
				{adminLinks.map(link => (
					<NavLink to={link.slug} className="w-full" key={link.id}>
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
