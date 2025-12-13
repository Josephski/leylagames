'use client'

import Link from 'next/link'
import { games, gameCategories } from '../src/platform/games'

export default function HomePage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const queryString = (() => {
    if (!searchParams) return ''
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      if (Array.isArray(v)) {
        v.forEach((val) => params.append(k, val))
      } else if (typeof v === 'string') {
        params.set(k, v)
      }
    }
    const qs = params.toString()
    return qs ? `?${qs}` : ''
  })()

  return (
    <div className="app page-shell">
      <div className="menu">
        <h1>Leyla Games</h1>
        <p>Spela direkt i webbläsaren. Den här portalen är redo att växa med fler spel.</p>
        <div style={{ marginTop: '1rem' }}>
          <Link href={`/games/flag-quiz${queryString}`}>
            <button>Start Game</button>
          </Link>
        </div>
        {gameCategories.map((cat) => (
          <section key={cat.id} style={{ marginTop: '1.5rem', textAlign: 'left', maxWidth: '640px' }}>
            <h2 style={{ marginBottom: '0.25rem' }}>{cat.name}</h2>
            {cat.description && <p style={{ marginTop: 0 }}>{cat.description}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              {cat.gameIds
                .map((id) => games.find((g) => g.id === id))
                .filter(Boolean)
                .map((game) => (
                  <Link key={game!.id} href={`/games/${game!.slug}`} className="game-card-link">
                    <div className="game-card">
                      <h3>{game!.name}</h3>
                      <p>{game!.shortDescription}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
