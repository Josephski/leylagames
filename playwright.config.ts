import { defineConfig, devices } from '@playwright/test'

const isNext = process.env.E2E_TARGET === 'next'
const port = process.env.PORT || (isNext ? 4310 : 4900)
const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: isNext
    ? {
        command: `npm run start:next -- --port ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 90_000,
      }
    : {
        command: `npm run dev -- --host --port ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
})
