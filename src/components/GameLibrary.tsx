'use client'

import type { ComponentType, ReactNode } from 'react'
import { gameCategories, games } from '../platform/games'
import { useLanguage } from '../i18n/LanguageProvider'
import { LanguageSelect } from '../i18n/LanguageSelect'
import {
  IconFlag,
  IconGlobe,
  IconLayers,
  IconParty,
  IconPlus,
  IconType,
} from './flag-game/icons'
import './LandingPage.css'

function privacyHref() {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.endsWith('/') ? base : `${base}/`}privacy`
}

const CATEGORY_ICONS: Record<string, ReactNode> = {
  party: <IconParty />,
  geography: <IconGlobe />,
  numbers: <IconPlus />,
}

const GAME_ICONS: Record<string, ReactNode> = {
  imposter: <IconParty />,
  'flag-choice': <IconFlag />,
  'flag-quiz': <IconType />,
  'flag-memory': <IconLayers />,
  'math-quiz': <IconPlus />,
}

export function GameLibrary({
  GameLink,
}: {
  GameLink: ComponentType<{ slug: string; className?: string; children: ReactNode; 'aria-label'?: string }>
}) {
  const { t } = useLanguage()

  return (
    <div className="landing is-home">
      <header className="landing-nav">
        <span className="landing-logo">{t('home.title')}</span>
        <LanguageSelect id="lang-select-app" variant="pills" />
      </header>

      <section className="home-hero">
        <h1>{t('home.chooseTitle')}</h1>
        <p className="landing-lead">{t('home.lead')}</p>
      </section>

      <nav className="home-jump" aria-label={t('home.chooseCategory')}>
        {gameCategories.map((item) => (
          <a key={item.id} href={`#category-${item.id}`}>
            <span className="home-jump-icon" aria-hidden="true">
              {CATEGORY_ICONS[item.id] ?? <IconFlag />}
            </span>
            {t(`categories.${item.id}.name`)}
          </a>
        ))}
      </nav>

      <div className="landing-library">
        {gameCategories.map((category) => {
          const categoryGames = category.gameIds
            .map((id) => games.find((game) => game.id === id))
            .filter((game): game is NonNullable<typeof game> => Boolean(game))

          return (
            <section key={category.id} id={`category-${category.id}`} className="landing-category">
              <h2>
                <span className="home-jump-icon" aria-hidden="true">
                  {CATEGORY_ICONS[category.id] ?? <IconFlag />}
                </span>
                {t(`categories.${category.id}.name`)}
              </h2>
              <p>{t(`categories.${category.id}.description`)}</p>
              <div className="landing-grid">
                {categoryGames.map((game) => (
                  <GameLink
                    key={game.id}
                    slug={game.slug}
                    className="landing-game-link"
                    aria-label={t(`games.${game.id}.name`)}
                  >
                    <article className={`landing-game${game.id === 'imposter' ? ' is-featured' : ''}`}>
                      <span className="landing-game-icon" aria-hidden="true">
                        {GAME_ICONS[game.id] ?? game.icon}
                      </span>
                      <h3>{t(`games.${game.id}.name`)}</h3>
                      <p>{t(`games.${game.id}.shortDescription`)}</p>
                    </article>
                  </GameLink>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <footer className="landing-footer">
        <p>{t('home.footerNote')}</p>
        <p>
          <a href={privacyHref()}>{t('home.privacy')}</a>
        </p>
      </footer>
    </div>
  )
}
