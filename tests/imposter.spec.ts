import { expect, test } from '@playwright/test'

if (process.env.PW_CHANNEL) {
  test.use({ channel: process.env.PW_CHANNEL })
}

test('imposter pass-the-phone round follows the rules', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Engelska' }).click()
  await expect(page.getByRole('heading', { name: 'Choose a game' })).toBeVisible()
  await page.getByRole('link', { name: /Imposter/i }).click()

  await expect(page.getByRole('heading', { name: /Play together/i })).toBeVisible()
  await page.getByRole('button', { name: 'Arabic' }).click()
  await expect(page.getByRole('heading', { name: /العبوا معاً/ })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')

  await page.getByRole('button', { name: 'الإنجليزية' }).click()
  await expect(page.getByRole('heading', { name: /Play together/i })).toBeVisible()
  await page.getByPlaceholder('Name').fill('Leyla')
  await page.getByRole('button', { name: /In person/i }).click()
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
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole('button', { name: /Done – I said my word/i }).click()
  }

  await expect(page.getByRole('heading', { name: 'Next step' })).toBeVisible()
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole('button', { name: 'Go to the vote' }).click()
  }

  await expect(page.getByRole('heading', { name: 'Vote for the Imposter' })).toBeVisible()
})

test('imposter host survives a refresh', async ({ page }) => {
  await page.goto('/games/imposter')
  await page.getByPlaceholder('Namn').fill('Leyla')
  await page.getByRole('button', { name: /På plats/i }).click()
  await page.getByRole('button', { name: /Skapa spel och visa QR/i }).click()
  await expect(page.getByRole('heading', { name: 'Du hostar spelet' })).toBeVisible()
  const code = await page.locator('.imposter-code-readout').innerText()
  expect(code.trim()).toMatch(/^[A-Z0-9]{6}$/)

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Du hostar spelet' })).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.imposter-code-readout')).toHaveText(code.trim())
})
