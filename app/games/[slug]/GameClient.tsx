'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { GameProvider } from '../../../src/platform/GameContext'
import { getGameBySlug } from '../../../src/platform/games'
import { useLanguage } from '../../../src/i18n/LanguageProvider'

export function GameClient({ slug }: { slug: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const game = getGameBySlug(slug)
  const { t } = useLanguage()

  if (!game) {
    return (
      <div className="app">
        <div className="menu">
          <h1>{t('errors.gameNotFound')}</h1>
          <Link href="/">{t('errors.backToStart')}</Link>
        </div>
      </div>
    )
  }

  const GameComponent = game.component

  return (
    <GameProvider
      game={game}
      onExit={() => router.push(queryString ? `/?${queryString}` : '/')}
    >
      <GameComponent />
    </GameProvider>
  )
}
