import type { Metadata } from 'next'
import './globals.css'
import { initSentry } from '../src/sentry.client'

export const metadata: Metadata = {
  title: 'Leyla Games',
  description: 'Spela direkt i webbläsaren. Flaggquiz och fler spel.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (typeof window !== 'undefined') {
    initSentry()
  }
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  )
}
