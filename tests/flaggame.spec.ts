import { test, expect } from '@playwright/test'

test('start game and see letters', async ({ page }) => {
  await page.goto('/games/flag-quiz?country=SE&dev=1')

  // Stäng onboarding/tutorial om den dyker upp
  const tutorialOverlay = page.locator('.settings-overlay')
  if (await tutorialOverlay.isVisible()) {
    const nextBtn = page.getByRole('button', { name: /nästa/i })
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      if (await nextBtn.isVisible()) await nextBtn.click()
    }
    const doneBtn = page.getByRole('button', { name: /klart/i })
    if (await doneBtn.isVisible()) {
      await doneBtn.click()
    } else {
      // fallback: klicka utanför panelen
      await tutorialOverlay.first().click({ position: { x: 5, y: 5 } })
    }
  }

  await page.waitForSelector('.flag-game', { timeout: 15000 })
  const letters = page.locator('.letter-box')
  await expect(letters.first()).toBeVisible()
  await expect(page.getByText(/Streak/i)).toBeVisible({ timeout: 10000 })

  await page.getByRole('button', { name: /visa svar/i }).click()
  await expect(page.getByText(/Svar:/i)).toBeVisible()

  // Trigger a wrong answer to ensure messaging works
  await page.getByRole('button', { name: /kontrollera svar/i }).click()
  await expect(page.getByText(/Inte rätt/i)).toBeVisible()

  // Skip to next round
  await page.getByRole('button', { name: /hoppa över/i }).click()
  await expect(letters.first()).toBeVisible()

  // Open settings and toggle difficulty
  await page.getByRole('button', { name: /inställningar/i }).click()
  await page.getByRole('button', { name: /Svår/ }).click()
  await page.getByRole('button', { name: /Stäng/ }).click()

  // Open help overlay
  await page.getByRole('button', { name: /Hjälp/ }).click()
  await expect(page.getByText(/Hur spelar jag?/i)).toBeVisible()
  await page.getByRole('button', { name: /Stäng/ }).click()

  // Autofill (dev) and verify success
  await page.getByRole('button', { name: /Autofyll svar/i }).click()
  await expect(page.getByText(/Rätt!/i)).toBeVisible()
})
