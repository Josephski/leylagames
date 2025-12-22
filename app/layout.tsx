import type { Metadata } from 'next'
import './globals.css'
import { initSentry } from '../src/sentry.client'
import { LanguageProvider } from '../src/i18n/LanguageProvider'

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
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
