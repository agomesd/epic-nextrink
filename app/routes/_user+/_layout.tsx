import React from 'react'
import { Outlet } from '@remix-run/react'
import Navbar from '~/components/navbar.tsx'
import SelectBox from '~/components/select-box.tsx'

export default function UsersLayout() {
	return (
		<div className="h-full">
			<div className="flex w-full items-center justify-between p-4">
				<div className="w-40">
					<SelectBox items={[{ id: 'ndhu238e', label: 'Royals' }]} />
				</div>
				{/* <UserDropdown /> */}
			</div>
			<div className="flex h-full">
				<Navbar logoUrl="" />
				<div>
					<Outlet />
				</div>
			</div>
		</div>
	)
}
