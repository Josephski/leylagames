'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { pickCountries, shuffleCopy, type Country } from '../data/countries'
import { useLanguage } from '../i18n/LanguageProvider'
import { useCurrentGame } from '../platform/GameContext'
import { FlagImage } from './FlagImage'
import { GameShell } from './GameShell'
import { IconHash, IconLayers } from './flag-game/icons'
import './GameShell.css'

interface MemoryCard {
  id: string
  country: Country
}

const MEMORY_PAIR_COUNTS = [4, 6, 8, 10] as const

const FLAG_ASPECT = 13 / 8

function buildBoard(language: ReturnType<typeof useLanguage>['language'], pairs: number): MemoryCard[] {
  const selected = pickCountries(language, pairs)
  const doubled = selected.flatMap((country) => [
    { id: `${country.code}-a`, country },
    { id: `${country.code}-b`, country },
  ])
  return shuffleCopy(doubled)
}

function bestMemoryLayout(cardCount: number, width: number, height: number) {
  const gap = 6
  let best = { cols: 4, rows: Math.ceil(cardCount / 4), score: Number.POSITIVE_INFINITY }

  const scoreLayout = (cols: number, minCell = false) => {
    const rows = Math.ceil(cardCount / cols)
    const cellW = (width - gap * (cols - 1)) / cols
    const cellH = (height - gap * (rows - 1)) / rows
    if (minCell && (cellW < 44 || cellH < 36)) return
    const aspect = cellW / Math.max(cellH, 1)
    const empty = cols * rows - cardCount
    const skinny = cols === 2 && cardCount > 8 ? 0.6 : 0
    const score = empty * 8 + Math.abs(aspect - FLAG_ASPECT) + skinny
    if (score < best.score) best = { cols, rows, score }
  }

  const maxCols = Math.min(6, cardCount)
  for (let cols = 2; cols <= maxCols; cols++) scoreLayout(cols, true)
  if (!Number.isFinite(best.score) || best.score === Number.POSITIVE_INFINITY) {
    for (let cols = 2; cols <= maxCols; cols++) scoreLayout(cols, false)
  }

  return { cols: best.cols, rows: best.rows }
}

export default function FlagMemory() {
  const { language, t } = useLanguage()
  const { onExit } = useCurrentGame()
  const gridRef = useRef<HTMLDivElement>(null)
  const [pairs, setPairs] = useState<number | null>(null)
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flipped, setFlipped] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [lock, setLock] = useState(false)
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [layout, setLayout] = useState({ cols: 4, rows: 3 })

  const resetBoard = useCallback(
    (count: number) => {
      setCards(buildBoard(language, count))
      setFlipped([])
      setMatched([])
      setLock(false)
      setMoves(0)
      setScore(0)
    },
    [language],
  )

  useEffect(() => {
    if (!pairs) return
    resetBoard(pairs)
  }, [pairs, resetBoard])

  useLayoutEffect(() => {
    if (!pairs) return
    const el = gridRef.current
    if (!el) return

    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width < 8 || height < 8) return
      setLayout(bestMemoryLayout(pairs * 2, width, height))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [pairs, matched.length])

  const startSize = (count: number) => {
    setPairs(count)
  }

  const cyclePairs = () => {
    if (!pairs) return
    const index = MEMORY_PAIR_COUNTS.indexOf(pairs as (typeof MEMORY_PAIR_COUNTS)[number])
    const next = MEMORY_PAIR_COUNTS[(Math.max(index, 0) + 1) % MEMORY_PAIR_COUNTS.length]
    setPairs(next)
  }

  const backToSizes = () => {
    setPairs(null)
    setCards([])
    setFlipped([])
    setMatched([])
  }

  if (pairs === null) {
    return (
      <div className="game-shell-page">
        <div className="game-shell-inner">
          <header className="game-shell-bar">
            <button
              type="button"
              className="game-shell-back"
              onClick={() => onExit?.()}
              aria-label={t('flagGame.backToLibrary')}
            >
              ← <span className="back-label-long">{t('flagGame.backToLibrary')}</span>
              <span className="back-label-short">{t('flagGame.backShort')}</span>
            </button>
            <h1 className="game-shell-title">{t('games.flag-memory.name')}</h1>
            <span />
          </header>
          <div className="game-shell-body">
            <p className="play-prompt">{t('flagMemory.chooseTitle')}</p>
            <p className="math-choose-lead">{t('flagMemory.chooseLead')}</p>
            <div className="math-mode-grid">
              {MEMORY_PAIR_COUNTS.map((count) => (
                <button key={count} type="button" className="math-mode-btn" onClick={() => startSize(count)}>
                  <span className="math-mode-symbol">{count}</span>
                  <strong>{t('flagMemory.pairCount', { count })}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleFlip = (card: MemoryCard) => {
    if (lock || flipped.includes(card.id) || matched.includes(card.country.code)) return
    const nextFlipped = [...flipped, card.id]
    setFlipped(nextFlipped)
    if (nextFlipped.length < 2) return

    setMoves((value) => value + 1)
    const [firstId, secondId] = nextFlipped
    const first = cards.find((item) => item.id === firstId)
    const second = cards.find((item) => item.id === secondId)
    if (!first || !second) return

    if (first.country.code === second.country.code) {
      setMatched((value) => [...value, first.country.code])
      setScore((value) => value + 20)
      setFlipped([])
    } else {
      setLock(true)
      window.setTimeout(() => {
        setFlipped([])
        setLock(false)
      }, 800)
    }
  }

  const won = matched.length === pairs

  return (
    <GameShell
      score={score}
      fit
      onBack={backToSizes}
      stats={[
        { label: t('flagMemory.moves'), value: String(moves), icon: <IconHash /> },
        {
          label: t('flagMemory.pairs'),
          value: `${matched.length}/${pairs}`,
          onClick: cyclePairs,
          ariaLabel: t('flagMemory.pairCount', { count: pairs }),
          icon: <IconLayers />,
        },
      ]}
    >
      <div className="memory-play">
        <p className="play-prompt">{t('flagMemory.prompt')}</p>
        <div
          ref={gridRef}
          className="memory-grid"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
          }}
        >
          {cards.map((card) => {
            const isOpen = flipped.includes(card.id) || matched.includes(card.country.code)
            return (
              <button
                key={card.id}
                type="button"
                className={`memory-card ${isOpen ? 'open' : 'back'} ${matched.includes(card.country.code) ? 'matched' : ''}`}
                onClick={() => handleFlip(card)}
                disabled={lock || isOpen}
                aria-label={isOpen ? card.country.name : t('flagMemory.hiddenCard')}
              >
                {isOpen ? <FlagImage country={card.country} /> : '?'}
              </button>
            )
          })}
        </div>
        {won && (
          <div className="memory-win">
            <span className="play-message ok">{t('flagMemory.complete')}</span>
            <button type="button" className="play-next" onClick={() => resetBoard(pairs)}>
              {t('play.again')}
            </button>
          </div>
        )}
      </div>
    </GameShell>
  )
}
