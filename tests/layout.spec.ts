import { expect, Page, test } from '@playwright/test'

async function dismissTutorialIfVisible(page: Page) {
  const tutorialOverlay = page.locator('.settings-overlay')
  if (await tutorialOverlay.isVisible({ timeout: 2000 }).catch(() => false)) {
    const nextBtn = page.getByRole('button', { name: /nästa/i })
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click()
      if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click()
    }
    const doneBtn = page.getByRole('button', { name: /klart/i })
    if (await doneBtn.isVisible().catch(() => false)) {
      await doneBtn.click()
    } else {
      await tutorialOverlay.first().click({ position: { x: 5, y: 5 } })
    }
  }
}

test('game layout stays within viewport height', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/games/flag-quiz?country=SE&dev=1')

  await dismissTutorialIfVisible(page)
  await page.waitForSelector('.game-shell', { timeout: 15000 })

  const fitInfo = await page.evaluate(() => {
    const shell = document.querySelector('.game-shell')
    if (!shell) return null
    const rect = shell.getBoundingClientRect()
    return {
      ok: rect.top >= 0 && rect.bottom <= window.innerHeight + 1,
      rect: { top: rect.top, bottom: rect.bottom, height: rect.height },
      innerHeight: window.innerHeight,
    }
  })

  expect(fitInfo).not.toBeNull()
  expect(fitInfo!.ok, `Spelytan sticker utanför viewporten: bottom=${fitInfo!.rect.bottom}, viewport=${fitInfo!.innerHeight}`).toBeTruthy()
})
