import { expect, test } from '@playwright/test'

if (process.env.PW_CHANNEL) {
  test.use({ channel: process.env.PW_CHANNEL })
}

test('home library shows categories and opens a game', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Leyla Games').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Välj ett spel' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Spela tillsammans/ })).toHaveCount(0)

  await expect(page.getByRole('heading', { name: /Party/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Geografi/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Siffror/ })).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Imposter' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Gissa flaggan' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Flaggquiz' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Flaggmemory' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Räknespel' })).toBeVisible()

  await page.getByRole('link', { name: /Gissa flaggan/i }).click()
  await expect(page.getByRole('heading', { name: 'Gissa flaggan' })).toBeVisible()
  await expect(page.getByText(/Vilket land är det här/i)).toBeVisible()
})
