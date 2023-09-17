/**
 * @vitest-environment node
 */
import { faker } from '@faker-js/faker'
import { BASE_URL } from 'tests/vitest-utils.ts'
import { expect, test } from 'vitest'
import { ROUTE_PATH, action } from './delete-image.tsx'

const RESOURCE_URL = `${BASE_URL}${ROUTE_PATH}`

test('requires auth', async () => {
	const form = new FormData()
	form.set('intent', 'submit')
	form.set('imageId', faker.string.uuid())
	const request = new Request(RESOURCE_URL, {
		method: 'POST',
		body: form,
	})
	const response = await action({ request, params: {}, context: {} }).catch(
		r => r,
	)
	if (!(response instanceof Response)) {
		throw new Error('Expected response to be a Response')
	}
	expect(response.headers.get('Location')).toEqual('/login')
})
