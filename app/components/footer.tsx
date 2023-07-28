import { Link } from '@remix-run/react'
import type { Theme } from '~/routes/resources+/theme/theme.server.ts'
import { ThemeSwitch } from '~/routes/resources+/theme/index.tsx'

interface FooterProps {
	logoUrl: string
	theme: Theme
}

export function Footer({ theme, logoUrl }: FooterProps) {
	return (
		<div className="container flex items-center justify-between p-5">
			<Link to="/">
				<div className="w-20">
					<img src={logoUrl} alt="" className="h-full w-full object-contain" />
				</div>
			</Link>
			<ThemeSwitch userPreference={theme} />
		</div>
	)
}
