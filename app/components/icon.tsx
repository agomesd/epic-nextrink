import React from 'react'
import { AiFillHome } from 'react-icons/ai/index.js'

export interface IconProps {
	name: IconName
}

type IconName = 'home'

export default function Icon({ name }: IconProps) {
	switch (name) {
		case 'home':
			return <AiFillHome />
		default:
			throw new Error('Invalid icon name')
	}
}
