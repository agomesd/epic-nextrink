import { faker } from '@faker-js/faker'
import { expect, insertNewUser, test } from '../playwright-utils.ts'
import { createUser } from '../../tests/db-utils.ts'
import { verifyLogin } from '~/utils/auth.server.ts'

test.skip('Users can update their basic info', async ({ login, page }) => {
	await login()
	await page.goto('/settings/profile')

	const newUserData = createUser()

	// await page.getByRole('textbox', { name: /^name/i }).fill(newUserData.name)
	await page.getByRole('textbox', { name: /^email/i }).fill(newUserData.email)
	// TODO: support changing the email... probably test this in another test though
	// await page.getByRole('textbox', {name: /^email/i}).fill(newUserData.email)

	await page.getByRole('button', { name: /^save/i }).click()

	await expect(page).toHaveURL(`/users/${newUserData.email}`)
})

test.skip('Users can update their password', async ({ login, page }) => {
	const oldPassword = faker.internet.password()
	const newPassword = faker.internet.password()
	const user = await insertNewUser({ password: oldPassword })
	await login(user)
	await page.goto('/settings/profile')

	const fieldset = page.getByRole('group', { name: /change password/i })

	await fieldset
		.getByRole('textbox', { name: /^current password/i })
		.fill(oldPassword)
	await fieldset
		.getByRole('textbox', { name: /^new password/i })
		.fill(newPassword)

	await page.getByRole('button', { name: /^save/i }).click()

	await expect(page).toHaveURL(`/users/${user.email}`)

	expect(
		await verifyLogin(user.email, oldPassword),
		'Old password still works',
	).toEqual(null)
	expect(
		await verifyLogin(user.email, newPassword),
		'New password does not work',
	).toEqual({ id: user.id })
})

test.skip('Users can update their profile photo', async ({ login, page }) => {
	const user = await login()
	await page.goto('/settings/profile')

	const beforeSrc = await page
		.getByRole('img', { name: user.email })
		.getAttribute('src')

	await page.getByRole('link', { name: /change profile photo/i }).click()

	await expect(page).toHaveURL(`/settings/profile/photo`)

	await page
		.getByRole('textbox', { name: /change/i })
		.setInputFiles('./tests/fixtures/test-profile.jpg')

	await page.getByRole('button', { name: /save/i }).click()

	await expect(
		page,
		'Was not redirected after saving the profile photo',
	).toHaveURL(`/settings/profile`)

	const afterSrc = await page
		.getByRole('img', { name: user.email })
		.getAttribute('src')

	expect(beforeSrc).not.toEqual(afterSrc)
})
