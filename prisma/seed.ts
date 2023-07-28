import fs from 'fs'
import { faker } from '@faker-js/faker'
import { createPassword, createPlayer, createUser } from 'tests/db-utils.ts'
import { prisma } from '~/utils/db.server.ts'
import { deleteAllData } from 'tests/setup/utils.ts'
import { getPasswordHash } from '~/utils/auth.server.ts'

const SEASON = '2023/2024'

async function seed() {
	console.log('🌱 Seeding...')
	console.time(`🌱 Database has been seeded`)

	console.time('🧹 Cleaned up the database...')
	deleteAllData()
	console.timeEnd('🧹 Cleaned up the database...')

	console.time(`👑 Created admin role/permission...`)
	const adminRole = await prisma.role.create({
		data: {
			name: 'admin',
			permissions: {
				create: { name: 'admin' },
			},
		},
	})
	console.timeEnd(`👑 Created admin role/permission...`)

	const positions = ['LW', 'RW', 'C', 'LD', 'RD', 'G']
	console.time(`🥅 Created positions...`)
	for (const position of positions) {
		await prisma.position.create({
			data: {
				name: position,
			},
		})
	}
	console.timeEnd(`🥅 Created positions...`)

	const shotSides = ['Left', 'Right']
	console.time(`🎯 Created shot sides...`)
	for (const shotSide of shotSides) {
		await prisma.shotSide.create({
			select: { id: true },
			data: {
				name: shotSide,
			},
		})
	}
	console.timeEnd(`🎯 Created shot sides...`)

	console.time(`⚕️ Created present status...`)
	const present = await prisma.status.create({
		select: { id: true },
		data: {
			name: 'Present',
		},
	})
	console.timeEnd(`⚕️ Created present status...`)

	console.time(`❄️ Created Pierrefonds arena...`)
	const pfdsArena = await prisma.arena.create({
		select: { id: true },
		data: {
			name: 'Pierrefonds Arena',
			address: {
				create: {
					addressLine: '14700 Pierrefonds Blvd.',
					city: 'Pierrefonds',
					postCode: 'H9H 4Y6',
					province: 'Quebec',
					country: 'Canada',
				},
			},
			phoneNumber: ' +1 877-333-2757',
			websiteUrl: 'https://www.sportplexe.ca/en/',
		},
	})
	console.timeEnd(`❄️ Created Pierrefonds arena...`)

	console.time(`❄️ Created DDO arena...`)
	const ddoArena = await prisma.arena.create({
		select: { id: true },
		data: {
			name: 'Dollard Civic Center',
			address: {
				create: {
					addressLine: '12001 Salaberry Blvd.',
					city: 'Dollard-Des Ormeaux',
					postCode: 'H9B 2A7',
					province: 'Quebec',
					country: 'Canada',
				},
			},
			phoneNumber: '+1 514-684-1010',
			websiteUrl:
				'https://ville.ddo.qc.ca/en/play/sports-and-leisure/arenas-and-skating-rinks/',
		},
	})
	console.timeEnd(`❄️ Created Pierrefonds arena...`)

	console.time(`🅰️ Created caliber A...`)
	const caliberA = await prisma.caliber.create({
		select: { id: true },
		data: {
			name: 'A',
		},
	})
	console.timeEnd(`🅰️ Created caliber A...`)

	console.time(`🏅 Created level Bantam...`)
	const bantam = await prisma.level.create({
		select: { id: true },
		data: {
			name: 'Bantam',
			calibers: { connect: { id: caliberA.id } },
		},
	})
	console.timeEnd(`🏅 Created level Bantam...`)

	console.time(`🏒 Created Dollard Hockey Association...`)
	const dollard = await prisma.association.create({
		select: { id: true },
		data: {
			name: 'Dollard Hockey Association',
			calibers: { connect: { id: caliberA.id } },
			levels: { connect: { id: bantam.id } },
			websiteUrl: 'https://www.dollardhockey.ca/',
		},
	})
	console.timeEnd(`🏒 Created Dollard Hockey Association...`)

	console.time(`🏒 Created Pierrefonds Hockey Association...`)
	const pierrefonds = await prisma.association.create({
		select: { id: true },
		data: {
			name: 'Pierrefonds Hockey Association',
			calibers: { connect: { id: caliberA.id } },
			levels: { connect: { id: bantam.id } },
			websiteUrl: 'https://www.hockeypfds.com',
		},
	})
	console.timeEnd(`🏒 Created Pierrefonds Hockey Association...`)

	console.time(`🏰 Created Pierrefonds Royals hockey team...`)
	const royals = await prisma.team.create({
		select: { id: true },
		data: {
			name: 'Royals',
			season: SEASON,
			association: { connect: { id: pierrefonds.id } },
			caliber: { connect: { id: caliberA.id } },
			level: { connect: { id: bantam.id } },
			preferedArenas: { connect: { id: pfdsArena.id } },
		},
	})
	console.timeEnd(`🏰 Created Pierrefonds Royals hockey team...`)

	console.time(`🐍 Created Dollard Vipers hockey team...`)
	const vipers = await prisma.team.create({
		select: { id: true },
		data: {
			name: 'Vipers',
			season: SEASON,
			association: { connect: { id: dollard.id } },
			caliber: { connect: { id: caliberA.id } },
			level: { connect: { id: bantam.id } },
			preferedArenas: { connect: { id: ddoArena.id } },
		},
	})
	console.timeEnd(`🐍 Created Dollard Vipers hockey team...`)

	const pierrefondsPlayers = 15
	console.time(`🏒 Created ${pierrefondsPlayers} players`)
	const pfdsPlayers = await Promise.all(
		Array.from({ length: pierrefondsPlayers }, async (_, index) => {
			const playerData = createPlayer()
			const user = await prisma.playerProfile.create({
				select: { id: true },
				data: {
					...playerData,
					activeTeam: { connect: { id: royals.id } },
					status: { connect: { id: present.id } },
				},
			})
		}),
	)
	console.timeEnd(`🏒 Created ${pierrefondsPlayers} players`)

	const dollardPlayers = 15
	console.time(`🏒 Created ${dollardPlayers} players`)
	const ddoPlayers = await Promise.all(
		Array.from({ length: dollardPlayers }, async (_, index) => {
			const playerData = createPlayer()
			const user = await prisma.playerProfile.create({
				select: { id: true },
				data: {
					...playerData,
					activeTeam: { connect: { id: vipers.id } },
					status: { connect: { id: present.id } },
				},
			})
		}),
	)
	console.timeEnd(`🏒 Created ${pierrefondsPlayers} players`)

	console.time(
		`🧔‍♂️ Created user "coach@ddo.com" with the password "dollard" and admin role`,
	)
	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'coach@ddo.com',
			roles: { connect: { id: adminRole.id } },
			image: {
				create: {
					contentType: 'image/png',
					file: {
						create: {
							blob: await fs.promises.readFile(
								'./tests/fixtures/images/user/kody.png',
							),
						},
					},
				},
			},
			password: {
				create: {
					hash: await getPasswordHash('dollard'),
				},
			},
			coachProfile: {
				create: {
					firstName: 'Alex',
					lastName: 'Essaris',
					coachedTeams: {
						connect: { id: vipers.id },
					},
				},
			},
		},
	})
	console.timeEnd(
		`🧔‍♂️ Created user "coach@ddo.com" with the password "dollard" and admin role`,
	)

	console.time(
		`🧔‍♂️ Created user "coach@pfds.com" with the password "pierrefonds" and admin role`,
	)
	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'coach@pfds.com',
			roles: { connect: { id: adminRole.id } },
			image: {
				create: {
					contentType: 'image/png',
					file: {
						create: {
							blob: await fs.promises.readFile(
								'./tests/fixtures/images/user/kody.png',
							),
						},
					},
				},
			},
			password: {
				create: {
					hash: await getPasswordHash('pierrefonds'),
				},
			},
			coachProfile: {
				create: {
					firstName: 'Alex',
					lastName: 'Gomes',
					coachedTeams: {
						connect: { id: royals.id },
					},
				},
			},
		},
	})
	console.timeEnd(
		`🧔‍♂️ Created user "coach@pfds.com" with the password "pierrefonds" and admin role`,
	)

	console.timeEnd(`🌱 Database has been seeded`)
}

function getCreatedAndUpdated(from: Date = new Date(2020, 0, 1)) {
	const createdAt = faker.date.between({ from, to: new Date() })
	const updatedAt = faker.date.between({ from: createdAt, to: new Date() })
	return { createdAt, updatedAt }
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

/*
eslint
	@typescript-eslint/no-unused-vars: "off",
*/
