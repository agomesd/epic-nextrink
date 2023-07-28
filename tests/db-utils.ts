import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import { UniqueEnforcer } from 'enforce-unique'

const uniqueUsernameEnforcer = new UniqueEnforcer()

export function createPlayer() {
	return {
		dob: faker.date.birthdate(),
		height: faker.number.int({ min: 165, max: 210 }),
		hometown: faker.location.city(),
		jerseyNumber: faker.number.int({ min: 1, max: 99 }),
		weight: faker.number.int({ min: 60, max: 130 }),
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
	}
}

export function createUser() {
	const firstName = faker.person.firstName()
	const lastName = faker.person.lastName()

	const username = uniqueUsernameEnforcer
		.enforce(() => {
			return (
				faker.string.alphanumeric({ length: 5 }) +
				' ' +
				faker.internet.userName({
					firstName: firstName.toLowerCase(),
					lastName: lastName.toLowerCase(),
				})
			)
		})
		.slice(0, 20)
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, '_')
	return {
		username,
		name: `${firstName} ${lastName}`,
		email: `${username}@example.com`,
	}
}

export function createPassword(username: string = faker.internet.userName()) {
	return {
		hash: bcrypt.hashSync(username, 10),
	}
}
