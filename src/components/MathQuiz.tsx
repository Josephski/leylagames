'use client'

import { useCallback, useEffect, useState } from 'react'
import { shuffleCopy } from '../data/countries'
import { useLanguage } from '../i18n/LanguageProvider'
import { GameShell } from './GameShell'
import './GameShell.css'

interface MathQuestion {
  a: number
  b: number
  answer: number
  options: number[]
}

function makeQuestion(): MathQuestion {
  const a = 1 + Math.floor(Math.random() * 10)
  const b = 1 + Math.floor(Math.random() * 10)
  const answer = a + b
  const options = new Set<number>([answer])
  while (options.size < 4) {
    const candidate = answer + (Math.floor(Math.random() * 9) - 4)
    if (candidate > 0) options.add(candidate)
  }
  return { a, b, answer, options: shuffleCopy([...options]) }
}

export default function MathQuiz() {
  const { t } = useLanguage()
  const [question, setQuestion] = useState<MathQuestion | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [rounds, setRounds] = useState(0)

  const nextRound = useCallback(() => {
    setQuestion(makeQuestion())
    setPicked(null)
  }, [])

  useEffect(() => {
    nextRound()
  }, [nextRound])

  if (!question) {
    return <div className="game-shell-page">{t('flagGame.loading')}</div>
  }

  const handlePick = (value: number) => {
    if (picked !== null) return
    setPicked(value)
    setRounds((count) => count + 1)
    if (value === question.answer) {
      setScore((current) => current + 10 + streak * 2)
      setStreak((current) => current + 1)
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
      <p className="play-prompt">{t('mathQuiz.prompt')}</p>
      <div className="math-sum">
        {question.a} + {question.b} = ?
      </div>
      <div className="choice-grid">
        {question.options.map((option) => {
          const isPicked = picked === option
          const isCorrect = picked !== null && option === question.answer
          const isWrong = isPicked && option !== question.answer
          return (
            <button
              key={option}
              className={`choice-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
              disabled={picked !== null}
              onClick={() => handlePick(option)}
            >
              {option}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <>
          <div className="play-message">
            {picked === question.answer
              ? t('play.correct')
              : t('play.incorrect', { answer: question.answer })}
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
