'use client'

import type { ComponentType, ReactNode } from 'react'
import { gameCategories, games, getGameById } from '../platform/games'
import { useLanguage } from '../i18n/LanguageProvider'
import { LanguageSelect } from '../i18n/LanguageSelect'
import './LandingPage.css'

export function GameLibrary({
  GameLink,
}: {
  GameLink: ComponentType<{ slug: string; className?: string; children: ReactNode }>
}) {
  const { t } = useLanguage()
  const featured = getGameById('imposter') ?? games[0]

  return (
    <div className="landing">
      <header className="landing-nav">
        <span className="landing-logo">{t('landing.kicker')}</span>
        <LanguageSelect id="lang-select-app" variant="pills" />
      </header>

      <section className="landing-hero">
        <p className="landing-kicker">
          {t('landing.featuredBadge')} · {t('landing.players')}
        </p>
        <h1>{t('landing.heroTitle')}</h1>
        <p className="landing-lead">{t('landing.heroLead')}</p>
        <div className="landing-cta">
          <GameLink slug={featured.slug} className="landing-cta-primary">
            {t('landing.playImposter')}
          </GameLink>
          <a href="#library" className="landing-cta-ghost">
            {t('landing.browseGames')}
          </a>
        </div>
      </section>

      <section className="landing-how" aria-labelledby="how-title">
        <h2 id="how-title">{t('landing.howTitle')}</h2>
        <div className="landing-steps">
          <article>
            <span>1</span>
            <h3>{t('landing.step1Title')}</h3>
            <p>{t('landing.step1Text')}</p>
          </article>
          <article>
            <span>2</span>
            <h3>{t('landing.step2Title')}</h3>
            <p>{t('landing.step2Text')}</p>
          </article>
          <article>
            <span>3</span>
            <h3>{t('landing.step3Title')}</h3>
            <p>{t('landing.step3Text')}</p>
          </article>
        </div>
      </section>

      <section id="library" className="landing-library">
        <h2>{t('landing.libraryTitle')}</h2>
        {gameCategories.map((cat) => (
          <section key={cat.id} className="landing-category">
            <h3>{t(`categories.${cat.id}.name`)}</h3>
            <p>{t(`categories.${cat.id}.description`)}</p>
            <div className="landing-grid">
              {cat.gameIds
                .map((id) => games.find((game) => game.id === id))
                .filter((game): game is NonNullable<typeof game> => Boolean(game))
                .map((game) => (
                  <GameLink key={game.id} slug={game.slug} className="landing-game-link">
                    <article className={`landing-game${game.id === 'imposter' ? ' is-featured' : ''}`}>
                      <span className="landing-game-icon" aria-hidden="true">
                        {game.icon}
                      </span>
                      <h4>{t(`games.${game.id}.name`)}</h4>
                      <p>{t(`games.${game.id}.shortDescription`)}</p>
                    </article>
                  </GameLink>
                ))}
            </div>
          </section>
        ))}
      </section>

      <footer className="landing-footer">
        <p>{t('home.footerNote')}</p>
      </footer>
    </div>
  )
}
