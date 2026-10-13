import { expect, test } from '@playwright/test'

if (process.env.PW_CHANNEL) {
  test.use({ channel: process.env.PW_CHANNEL })
}

async function openMemory(page: import('@playwright/test').Page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Flaggmemory' })).toBeVisible()
  await page.locator('a[href*="flag-memory"]').click()
  await expect(page.getByText('Hur många par?')).toBeVisible()
}

test('flag memory picker then board fits the viewport', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await openMemory(page)

  await expect(page.getByText('Spelet ryms på skärmen – du behöver inte skrolla.')).toBeVisible()
  await expect(page.getByRole('button', { name: /4 par/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /6 par/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /8 par/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /10 par/ })).toBeVisible()

  await page.getByRole('button', { name: /4 par/ }).click()
  await expect(page.locator('.memory-card')).toHaveCount(8)

  const noScroll = await page.evaluate(() => {
    const root = document.scrollingElement
    if (!root) return false
    return root.scrollHeight <= root.clientHeight + 2
  })
  expect(noScroll).toBe(true)

  const viewport = page.viewportSize()
  const grid = await page.locator('.memory-grid').boundingBox()
  expect(viewport).toBeTruthy()
  expect(grid).toBeTruthy()
  if (viewport && grid) {
    expect(grid.y + grid.height).toBeLessThanOrEqual(viewport.height + 2)
    expect(grid.x + grid.width).toBeLessThanOrEqual(viewport.width + 2)
  }

  await page.getByRole('button', { name: 'Tillbaka' }).click()
  await expect(page.getByText('Hur många par?')).toBeVisible()

  await page.getByRole('button', { name: /10 par/ }).click()
  await expect(page.locator('.memory-card')).toHaveCount(20)
  const noScrollLarge = await page.evaluate(() => {
    const root = document.scrollingElement
    if (!root) return false
    return root.scrollHeight <= root.clientHeight + 2
  })
  expect(noScrollLarge).toBe(true)
})
