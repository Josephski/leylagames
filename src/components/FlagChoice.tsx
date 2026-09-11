'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { countryChoices, getRandomCountry, type Country } from '../data/countries'
import { useLanguage } from '../i18n/LanguageProvider'
import { FlagImage } from './FlagImage'
import { GameShell } from './GameShell'
import './GameShell.css'

export default function FlagChoice() {
  const { language, t } = useLanguage()
  const [country, setCountry] = useState<Country | null>(null)
  const [options, setOptions] = useState<Country[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [rounds, setRounds] = useState(0)

  const lastCodeRef = useRef<string | null>(null)

  const nextRound = useCallback(() => {
    const next = getRandomCountry(language, lastCodeRef.current)
    lastCodeRef.current = next.code
    setCountry(next)
    setOptions(countryChoices(language, next, 4))
    setPicked(null)
  }, [language])

  useEffect(() => {
    nextRound()
  }, [nextRound])

  if (!country) {
    return <div className="game-shell-page">{t('flagGame.loading')}</div>
  }

  const handlePick = (code: string) => {
    if (picked) return
    setPicked(code)
    setRounds((value) => value + 1)
    if (code === country.code) {
      setScore((value) => value + 10 + streak * 2)
      setStreak((value) => value + 1)
    } else {
      setStreak(0)
    }
  }

  return (
    <GameShell
      score={score}
      stats={[
        { label: t('play.streak'), value: String(streak) },
        { label: t('play.rounds'), value: String(rounds) },
      ]}
    >
      <p className="play-prompt">{t('flagChoice.prompt')}</p>
      <div className="play-flag">
        <FlagImage country={country} />
      </div>
      <div className="choice-grid">
        {options.map((option) => {
          const isPicked = picked === option.code
          const isCorrect = picked !== null && option.code === country.code
          const isWrong = isPicked && option.code !== country.code
          return (
            <button
              key={option.code}
              className={`choice-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
              disabled={picked !== null}
              onClick={() => handlePick(option.code)}
            >
              {option.name}
            </button>
          )
        })}
      </div>
      {picked && (
        <>
          <div className={`play-message ${picked === country.code ? 'ok' : 'bad'}`}>
            {picked === country.code ? t('play.correct') : t('play.incorrect', { answer: country.name })}
          </div>
          <div className="play-actions">
            <button className="play-next" onClick={nextRound}>
              {t('play.next')}
            </button>
          </div>
        </>
      )}
    </GameShell>
  )
}
