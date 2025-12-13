'use client'

import Link from 'next/link'
import { notFound, useSearchParams } from 'next/navigation'
import { GameProvider } from '../../../src/platform/GameContext'
import { getGameBySlug } from '../../../src/platform/games'

export function GameClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const game = getGameBySlug(slug)

  if (!game) {
    notFound()
  }

  // `game.component` är ett React-komponent (client) från vår befintliga kodbas.
  const GameComponent = game!.component

  return (
    <GameProvider game={game!}>
      <div className="app page-shell">
        <header className="menu">
          <h1>Leyla Games</h1>
          <p>Spelar: {game!.name}</p>
          <Link href={queryString ? `/?${queryString}` : '/'}><button>Till spelbiblioteket</button></Link>
        </header>
        <main>
          <GameComponent />
        </main>
      </div>
    </GameProvider>
  )
}
