'use client'

import Link from 'next/link'
import { notFound, useSearchParams } from 'next/navigation'
import { GameProvider } from '../../../src/platform/GameContext'
import { getGameBySlug } from '../../../src/platform/games'
import { useLanguage } from '../../../src/i18n/LanguageProvider'

export function GameClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const game = getGameBySlug(slug)
  const { t } = useLanguage()

  if (!game) {
    notFound()
  }

  // `game.component` är ett React-komponent (client) från vår befintliga kodbas.
  const GameComponent = game!.component

  return (
    <GameProvider game={game!}>
      <div className="app page-shell">
        <header className="menu">
          <h1>{t('home.title')}</h1>
          <p>{t('menu.playing', { gameName: t(`games.${game!.id}.name`) })}</p>
          <Link href={queryString ? `/?${queryString}` : '/'}><button>{t('menu.backToLibrary')}</button></Link>
        </header>
        <main>
          <GameComponent />
        </main>
      </div>
    </GameProvider>
  )
}
