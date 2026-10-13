import { expect, test, type Page } from '@playwright/test'

if (process.env.PW_CHANNEL) {
  test.use({ channel: process.env.PW_CHANNEL })
}

function parseSum(text: string) {
  const match = text.replace(/\s/g, '').match(/^(\d+)([+\-−×÷])(\d+)=\?$/)
  if (!match) throw new Error(`Could not parse math sum: ${text}`)
  const a = Number(match[1])
  const b = Number(match[3])
  const symbol = match[2]
  const answer =
    symbol === '+' ? a + b : symbol === '−' || symbol === '-' ? a - b : symbol === '×' ? a * b : a / b
  return { a, b, symbol, answer }
}

async function playCorrectRound(page: Page, expectedSymbol?: string) {
  const sum = page.locator('.math-sum')
  await expect(sum).toBeVisible()
  const text = (await sum.innerText()).trim()
  const parsed = parseSum(text)
  if (expectedSymbol) expect(parsed.symbol).toBe(expectedSymbol)
  expect(parsed.a).toBeGreaterThanOrEqual(0)
  expect(parsed.a).toBeLessThanOrEqual(20)
  expect(parsed.b).toBeGreaterThanOrEqual(0)
  expect(parsed.b).toBeLessThanOrEqual(20)
  expect(parsed.answer).toBeGreaterThanOrEqual(0)
  expect(parsed.answer).toBeLessThanOrEqual(20)
  if (parsed.symbol === '÷') expect(parsed.b).not.toBe(0)

  const choices = page.locator('.choice-btn')
  await expect(choices).toHaveCount(4)
  const values = await choices.allTextContents()
  for (const value of values) {
    const n = Number(value.trim())
    expect(n).toBeGreaterThanOrEqual(0)
    expect(n).toBeLessThanOrEqual(20)
  }
  expect(values.map((value) => Number(value.trim()))).toContain(parsed.answer)

  await page.getByRole('button', { name: String(parsed.answer), exact: true }).click()
  await expect(page.getByText('Rätt!')).toBeVisible()
  await page.getByRole('button', { name: 'Nästa' }).click()
}

test('math quiz picker opens every operation within 0-20', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Räknespel' })).toBeVisible()
  await page.locator('a[href*="math-quiz"]').click()

  await expect(page.getByRole('heading', { name: 'Räknespel' })).toBeVisible()
  await expect(page.getByText('Vad vill du räkna?')).toBeVisible()
  await expect(page.getByText('Alla tal är mellan 0 och 20.')).toBeVisible()

  const modes = [
    { name: 'Addition', symbol: '+' },
    { name: 'Subtraktion', symbol: '−' },
    { name: 'Multiplikation', symbol: '×' },
    { name: 'Division', symbol: '÷' },
  ] as const

  for (const mode of modes) {
    await expect(page.getByRole('button', { name: mode.name })).toBeVisible()
    await page.getByRole('button', { name: mode.name }).click()
    await expect(page.getByText('Vad blir det?')).toBeVisible()
    await playCorrectRound(page, mode.symbol)
    await page.getByRole('button', { name: 'Tillbaka' }).click()
    await expect(page.getByText('Vad vill du räkna?')).toBeVisible()
  }

  await expect(page.getByRole('button', { name: 'Blandat' })).toBeVisible()
  await page.getByRole('button', { name: 'Blandat' }).click()
  await playCorrectRound(page)
})
