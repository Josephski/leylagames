'use client'

import type { ReactNode } from 'react'
import { useCurrentGame } from '../platform/GameContext'
import { useLanguage } from '../i18n/LanguageProvider'
import './GameShell.css'

export function GameShell({
  score,
  stats,
  children,
  onBack,
  fit,
}: {
  score: number
  stats?: { label: string; value: string; onClick?: () => void; ariaLabel?: string; icon?: ReactNode }[]
  children: ReactNode
  onBack?: () => void
  fit?: boolean
}) {
  const { game, onExit } = useCurrentGame()
  const { t } = useLanguage()

  return (
    <div className={`game-shell-page${fit ? ' is-fit' : ''}`}>
      <div className="game-shell-inner">
        <header className="game-shell-bar">
          <button className="game-shell-back" onClick={() => (onBack ?? onExit)?.()} aria-label={t('flagGame.backToLibrary')}>
            ← <span className="back-label-long">{t('flagGame.backToLibrary')}</span>
            <span className="back-label-short">{t('flagGame.backShort')}</span>
          </button>
          <h1 className="game-shell-title">{t(`games.${game.id}.name`)}</h1>
          <div className="game-shell-score">{t('play.score', { score })}</div>
        </header>
        {stats && stats.length > 0 && (
          <div className="game-shell-stats" role="toolbar">
            {stats.map((stat) =>
              stat.onClick ? (
                <button
                  key={stat.label}
                  type="button"
                  className="icon-chip is-active"
                  onClick={stat.onClick}
                  aria-label={stat.ariaLabel ?? `${stat.label} ${stat.value}`}
                >
                  {stat.icon}
                  <span className="game-shell-stat-value">{stat.value}</span>
                  <span className="game-shell-stat-label">{stat.label}</span>
                </button>
              ) : (
                <div key={stat.label} className="icon-chip">
                  {stat.icon}
                  <span className="game-shell-stat-value">{stat.value}</span>
                  <span className="game-shell-stat-label">{stat.label}</span>
                </div>
              ),
            )}
          </div>
        )}
        <div className="game-shell-body">{children}</div>
      </div>
    </div>
  )
}
