import { expect, test } from '@playwright/test'

test('home library lists games and opens one', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Leyla Games').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Imposter' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Gissa flaggan' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Flaggquiz' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Flaggmemory' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Räknespel' })).toBeVisible()

  await page.getByRole('link', { name: /Gissa flaggan/i }).click()
  await expect(page.getByRole('heading', { name: 'Gissa flaggan' })).toBeVisible()
  await expect(page.getByText(/Vilket land är det här/i)).toBeVisible()
})
