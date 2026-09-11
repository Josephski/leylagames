import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SentryInit } from '../src/SentryInit'
import { LanguageProvider } from '../src/i18n/LanguageProvider'

export const metadata: Metadata = {
  title: 'Leyla Games',
  description: 'Play Imposter and family games in the browser. Create a room, scan a QR code, and play together.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#07070f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <SentryInit />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
