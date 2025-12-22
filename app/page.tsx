'use client'

import Link from 'next/link'
import { games, gameCategories } from '../src/platform/games'
import { useLanguage } from '../src/i18n/LanguageProvider'

export default function HomePage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const { language, setLanguage, t } = useLanguage()
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
        <h1>{t('home.title')}</h1>
        <p>{t('home.lead')}</p>
        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
          <label htmlFor="lang-select-home">{t('labels.language')}</label>
          <select
            id="lang-select-home"
            value={language}
            onChange={(e) => setLanguage(e.target.value === 'da' ? 'da' : 'sv')}
          >
            <option value="sv">{t('language.sv')}</option>
            <option value="da">{t('language.da')}</option>
          </select>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Link href={`/games/flag-quiz${queryString}`}>
            <button>{t('home.startGame')}</button>
          </Link>
        </div>
        {gameCategories.map((cat) => (
          <section key={cat.id} style={{ marginTop: '1.5rem', textAlign: 'left', maxWidth: '640px' }}>
            <h2 style={{ marginBottom: '0.25rem' }}>{t(`categories.${cat.id}.name`)}</h2>
            {cat.description && <p style={{ marginTop: 0 }}>{t(`categories.${cat.id}.description`)}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              {cat.gameIds
                .map((id) => games.find((g) => g.id === id))
                .filter(Boolean)
                .map((game) => (
                  <Link key={game!.id} href={`/games/${game!.slug}`} className="game-card-link">
                    <div className="game-card">
                      <h3>{t(`games.${game!.id}.name`)}</h3>
                      <p>{t(`games.${game!.id}.shortDescription`)}</p>
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
