'use client'

import { useCallback, useEffect, useState } from 'react'
import { pickCountries, shuffleCopy, type Country } from '../data/countries'
import { useLanguage } from '../i18n/LanguageProvider'
import { FlagImage } from './FlagImage'
import { GameShell } from './GameShell'
import './GameShell.css'

interface MemoryCard {
  id: string
  country: Country
}

const PAIR_COUNT = 6

function buildBoard(language: ReturnType<typeof useLanguage>['language']): MemoryCard[] {
  const selected = pickCountries(language, PAIR_COUNT)
  const doubled = selected.flatMap((country) => [
    { id: `${country.code}-a`, country },
    { id: `${country.code}-b`, country },
  ])
  return shuffleCopy(doubled)
}

export default function FlagMemory() {
  const { language, t } = useLanguage()
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flipped, setFlipped] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [lock, setLock] = useState(false)
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)

  const restart = useCallback(() => {
    setCards(buildBoard(language))
    setFlipped([])
    setMatched([])
    setLock(false)
    setMoves(0)
    setScore(0)
  }, [language])

  useEffect(() => {
    restart()
  }, [restart])

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

  const won = matched.length === PAIR_COUNT

  return (
    <GameShell
      score={score}
      stats={[
        { label: t('flagMemory.moves'), value: String(moves) },
        { label: t('flagMemory.pairs'), value: `${matched.length}/${PAIR_COUNT}` },
      ]}
    >
      <p className="play-prompt">{t('flagMemory.prompt')}</p>
      <div className="memory-grid">
        {cards.map((card) => {
          const isOpen = flipped.includes(card.id) || matched.includes(card.country.code)
          return (
            <button
              key={card.id}
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
        <>
          <div className="play-message ok">{t('flagMemory.complete')}</div>
          <div className="play-actions">
            <button className="play-next" onClick={restart}>
              {t('play.again')}
            </button>
          </div>
        </>
      )}
    </GameShell>
  )
}
