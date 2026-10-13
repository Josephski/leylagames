import { expect, test } from '@playwright/test'

if (process.env.PW_CHANNEL) {
  test.use({ channel: process.env.PW_CHANNEL })
}

test('privacy page is reachable from home', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Integritet' }).click()
  await expect(page.getByRole('heading', { name: 'Integritet' })).toBeVisible()
  await expect(page.getByText(/Inga konton/i)).toBeVisible()
  await page.getByRole('link', { name: 'Tillbaka till spelen' }).click()
  await expect(page.getByRole('heading', { name: 'Välj ett spel' })).toBeVisible()
})
