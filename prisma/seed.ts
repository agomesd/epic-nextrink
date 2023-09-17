import fs from 'fs'
import { faker } from '@faker-js/faker'
import { createPlayer, createRecord } from 'tests/db-utils.ts'
import { prisma } from '~/utils/db.server.ts'
import { deleteAllData } from 'tests/setup/utils.ts'
import { getPasswordHash } from '~/utils/auth.server.ts'
import { addMonths } from 'date-fns'

async function seed() {
	console.log('🌱 Seeding...')
	console.time(`🌱 Database has been seeded`)

	console.time('🧹 Cleaned up the database...')
	deleteAllData()
	console.timeEnd('🧹 Cleaned up the database...')

	const entities = [
		'role',
		'permission',
		'team',
		'game',
		'practice',
		'coachProfile',
		'playerProfile',
		'associationProfile',
		'arena',
		'user',
	]
	const actions = ['create', 'read', 'update', 'delete']
	const accesses = ['own', 'any', 'restricted']
	console.time(`🤖 Create permissions...`)
	for (const entity of entities) {
		for (const action of actions) {
			for (const access of accesses) {
				await prisma.permission.create({ data: { access, action, entity } })
			}
		}
	}
	console.timeEnd(`🤖 Create permissions...`)

	console.time(`👑 Created coach role/permission...`)
	const coachRole = await prisma.role.create({
		select: { id: true },
		data: {
			name: 'coach',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: {
						AND: [
							{ access: 'restricted', action: 'create', entity: 'team' },
							{ access: 'restricted', action: 'delete', entity: 'team' },
							{ access: 'own', action: 'update', entity: 'team' },
							{ access: 'own', action: 'read', entity: 'team' },
							{ access: 'restricted', action: 'create', entity: 'game' },
							{ access: 'restricted', action: 'delete', entity: 'game' },
							{ access: 'restricted', action: 'update', entity: 'game' },
							{ access: 'any', action: 'read', entity: 'game' },
							{ access: 'restricted', action: 'create', entity: 'practice' },
							{ access: 'restricted', action: 'delete', entity: 'practice' },
							{ access: 'restricted', action: 'update', entity: 'practice' },
							{ access: 'own', action: 'read', entity: 'practice' },
							{ access: 'own', action: 'update', entity: 'coachProfile' },
							{ access: 'any', action: 'read', entity: 'coachProfile' },
							{ access: 'own', action: 'create', entity: 'playerProfile' },
							{ access: 'own', action: 'delete', entity: 'playerProfile' },
							{ access: 'own', action: 'update', entity: 'playerProfile' },
							{ access: 'any', action: 'read', entity: 'playerProfile' },
							{ access: 'any', action: 'read', entity: 'association' },
							{ access: 'restricted', action: 'update', entity: 'arena' },
							{ access: 'any', action: 'read', entity: 'arena' },
							{ access: 'own', action: 'delete', entity: 'user' },
							{ access: 'own', action: 'update', entity: 'user' },
							{ access: 'own', action: 'read', entity: 'user' },
						],
					},
				}),
			},
		},
	})
	console.timeEnd(`👑 Created coach role/permission...`)

	console.time(`👑 Created player role/permission...`)
	const playerRole = await prisma.role.create({
		select: { id: true },
		data: {
			name: 'player',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: {
						AND: [
							{ access: 'any', action: 'read', entity: 'team' },
							{ access: 'any', action: 'read', entity: 'game' },
							{ access: 'own', action: 'read', entity: 'practice' },
							{ access: 'any', action: 'read', entity: 'coachProfile' },
							{ access: 'own', action: 'create', entity: 'playerProfile' },
							{ access: 'own', action: 'delete', entity: 'playerProfile' },
							{ access: 'own', action: 'update', entity: 'playerProfile' },
							{ access: 'any', action: 'read', entity: 'playerProfile' },
							{ access: 'any', action: 'read', entity: 'association' },
							{ access: 'any', action: 'read', entity: 'arena' },
							{ access: 'own', action: 'delete', entity: 'user' },
							{ access: 'own', action: 'update', entity: 'user' },
						],
					},
				}),
			},
		},
	})
	console.timeEnd(`👑 Created player role/permission...`)

	console.time(`👑 Created admin role/permission...`)
	const adminRole = await prisma.role.create({
		select: {
			id: true,
		},
		data: {
			name: 'admin',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: {
						access: 'any',
					},
				}),
			},
		},
	})
	console.timeEnd(`👑 Created admin role/permission...`)

	const positions = ['LW', 'RW', 'C', 'LD', 'RD', 'G', 'PK-1', 'PK-2']
	console.time(`🥅 Created positions...`)
	for (const position of positions) {
		await prisma.position.create({
			data: {
				name: position,
			},
		})
	}
	console.timeEnd(`🥅 Created positions...`)

	const depthLevels = [
		'fm-1',
		'fm-2',
		'fm-3',
		'fm-4',
		'pk-1',
		'pk-2',
		'pk-3',
		'pp-1',
		'pp-2',
		'pp-3',
		'backup',
		'starter',
	]
	console.time(`👽 Created positions...`)
	for (const depthLevel of depthLevels) {
		await prisma.depthLevel.create({
			data: {
				name: depthLevel,
			},
		})
	}
	console.timeEnd(`👽 Created positions...`)

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

	const statuses = ['Injured', 'Suspended', 'Sick', 'Other']
	console.time(`⚕️ Created other statuses...`)
	for (const status of statuses) {
		await prisma.status.create({
			select: { id: true },
			data: { name: status },
		})
	}
	console.timeEnd(`⚕️ Created other statuses...`)

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
	console.timeEnd(`❄️ Created DDO arena...`)

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
	const pfdsRecord = createRecord()
	const royals = await prisma.team.create({
		select: { id: true },
		data: {
			name: 'Royals',
			season: {
				create: {
					from: addMonths(new Date(Date.now()), 2),
					to: addMonths(new Date(Date.now()), 6),
				},
			},
			association: { connect: { id: pierrefonds.id } },
			caliber: { connect: { id: caliberA.id } },
			level: { connect: { id: bantam.id } },
			preferedArenas: { connect: { id: pfdsArena.id } },
			record: {
				create: { ...pfdsRecord },
			},
		},
	})
	console.timeEnd(`🏰 Created Pierrefonds Royals hockey team...`)

	console.time(`🐍 Created Dollard Vipers hockey team...`)
	const vipersRecord = createRecord()
	const vipers = await prisma.team.create({
		select: { id: true },
		data: {
			name: 'Vipers',
			season: {
				create: {
					from: addMonths(new Date(Date.now()), 2),
					to: addMonths(new Date(Date.now()), 6),
				},
			},
			association: { connect: { id: dollard.id } },
			caliber: { connect: { id: caliberA.id } },
			level: { connect: { id: bantam.id } },
			preferedArenas: { connect: { id: ddoArena.id } },
			record: {
				create: {
					...vipersRecord,
				},
			},
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
					status: { connect: { id: present.id } },
					position: { connect: { name: 'LW' } },
					shotSide: { connect: { name: 'Left' } },
					team: { connect: { id: royals.id } },
					roles: { connect: { id: playerRole.id } },
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
					status: { connect: { id: present.id } },
					position: { connect: { name: 'LW' } },
					shotSide: { connect: { name: 'Left' } },
					team: { connect: { id: vipers.id } },
					roles: { connect: { id: playerRole.id } },
				},
			})
		}),
	)
	console.timeEnd(`🏒 Created ${pierrefondsPlayers} players`)

	console.time(`🧔‍♂️ Created user "coach@ddo.com" with the password "dollard"...`)
	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'coach@ddo.com',
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
					roles: { connect: { id: coachRole.id } },
				},
			},
		},
	})
	console.timeEnd(
		`🧔‍♂️ Created user "coach@ddo.com" with the password "dollard"...`,
	)

	console.time(`🧔‍♂️ Created admin essaris...`)
	await prisma.user.create({
		select: { id: true },
		data: {
			adminProfile: {
				create: {
					firstName: 'Alex',
					lastName: 'Essaris',
					roles: { connect: [{ id: adminRole.id }, { id: coachRole.id }] },
				},
			},
			email: 'alex.essaris@nextrink.com',
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
					hash: await getPasswordHash('nextrink1234'),
				},
			},
		},
	})
	console.timeEnd(`🧔‍♂️ Created admin essaris...`)

	console.time(`🧔‍♂️ Created admin gomes...`)
	await prisma.user.create({
		select: { id: true },
		data: {
			adminProfile: {
				create: {
					firstName: 'Alex',
					lastName: 'Gomes',
					roles: { connect: [{ id: adminRole.id }, { id: coachRole.id }] },
				},
			},
			email: 'alex.gomes@nextrink.com',
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
					hash: await getPasswordHash('nextrink1234'),
				},
			},
		},
	})
	console.timeEnd(`🧔‍♂️ Created admin gomes...`)

	console.time(
		`🧔‍♂️ Created user "coach@pfds.com" with the password "pierrefonds"...`,
	)
	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'coach@pfds.com',
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
					roles: { connect: { id: coachRole.id } },
				},
			},
		},
	})
	console.timeEnd(
		`🧔‍♂️ Created user "coach@pfds.com" with the password "pierrefonds"...`,
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
