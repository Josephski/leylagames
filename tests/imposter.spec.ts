import { expect, test } from '@playwright/test'

test('imposter pass-the-phone round follows the rules', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Engelska' }).click()
  await expect(page.getByRole('heading', { name: /Play together/i })).toBeVisible()

  await page.getByRole('button', { name: 'Arabic' }).click()
  await expect(page.getByRole('heading', { name: /العبوا معاً/ })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')

  await page.getByRole('button', { name: 'الإنجليزية' }).click()
  await page.getByRole('link', { name: /Play Imposter/i }).first().click()

  await expect(page.getByRole('heading', { name: 'Imposter' })).toBeVisible()
  await page.getByPlaceholder('Name').fill('Leyla')
  await page.getByRole('button', { name: /Create game and show QR/i }).click()
  await expect(page.getByRole('heading', { name: 'You are hosting' })).toBeVisible()
  await expect(page.getByRole('img', { name: /Scan the QR code/i })).toBeVisible()

  await page.getByPlaceholder('Add a player on this phone').fill('Omar')
  await page.getByRole('button', { name: '+' }).click()
  await page.getByPlaceholder('Add a player on this phone').fill('Noor')
  await page.getByRole('button', { name: '+' }).click()
  await expect(page.getByText('Players 3/15')).toBeVisible()

  await page.getByRole('button', { name: 'Start game' }).click()
  await expect(page.getByText('Look only at your screen')).toBeVisible()

  for (let i = 0; i < 3; i += 1) {
    await page.getByRole('button', { name: /Tap to see your role/i }).click()
    await page.getByRole('button', { name: "I'm ready" }).click()
  }

  await expect(page.getByRole('heading', { name: 'Give a one-word clue' })).toBeVisible()
  for (const clue of ['fast', 'yellow', 'wild']) {
    await page.getByPlaceholder('One word').fill(clue)
    await page.getByRole('button', { name: 'Send' }).click()
  }

  await expect(page.getByRole('heading', { name: 'Discuss' })).toBeVisible()
  await page.getByRole('button', { name: 'Start the vote' }).click()
  await expect(page.getByRole('heading', { name: 'Vote for the Imposter' })).toBeVisible()
})
