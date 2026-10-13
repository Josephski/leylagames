'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider'
import { useCurrentGame } from '../platform/GameContext'
import { GameShell } from './GameShell'
import {
  MATH_MODES,
  MATH_MODE_SYMBOLS,
  makeQuestion,
  type MathMode,
  type MathQuestion,
} from './mathQuestions'
import { IconFlame, IconHash, IconRepeat } from './flag-game/icons'
import './GameShell.css'

export default function MathQuiz() {
  const { t } = useLanguage()
  const { onExit } = useCurrentGame()
  const [mode, setMode] = useState<MathMode | null>(null)
  const [question, setQuestion] = useState<MathQuestion | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [rounds, setRounds] = useState(0)

  const nextRound = useCallback((nextMode: MathMode) => {
    setQuestion(makeQuestion(nextMode))
    setPicked(null)
  }, [])

  useEffect(() => {
    if (!mode) return
    nextRound(mode)
  }, [mode, nextRound])

  const startMode = (next: MathMode) => {
    setScore(0)
    setStreak(0)
    setRounds(0)
    setPicked(null)
    setMode(next)
  }

  const backToModes = () => {
    setMode(null)
    setQuestion(null)
    setPicked(null)
  }

  const cycleMode = () => {
    if (!mode) return
    const next = MATH_MODES[(MATH_MODES.indexOf(mode) + 1) % MATH_MODES.length]
    setMode(next)
  }

  if (!mode) {
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
            <h1 className="game-shell-title">{t('games.math-quiz.name')}</h1>
            <span />
          </header>
          <div className="game-shell-body">
            <p className="play-prompt">{t('mathQuiz.chooseTitle')}</p>
            <p className="math-choose-lead">{t('mathQuiz.chooseLead')}</p>
            <div className="math-mode-grid">
              {MATH_MODES.map((item) => (
                <button key={item} type="button" className="math-mode-btn" onClick={() => startMode(item)}>
                  <span className="math-mode-symbol">{MATH_MODE_SYMBOLS[item]}</span>
                  <strong>{t(`mathQuiz.${item}`)}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

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
      onBack={backToModes}
      stats={[
        {
          label: t(`mathQuiz.${mode}`),
          value: MATH_MODE_SYMBOLS[mode],
          onClick: cycleMode,
          ariaLabel: t(`mathQuiz.${mode}`),
          icon: <IconRepeat />,
        },
        { label: t('play.streak'), value: String(streak), icon: <IconFlame /> },
        { label: t('play.rounds'), value: String(rounds), icon: <IconHash /> },
      ]}
    >
      <p className="play-prompt">{t('mathQuiz.prompt')}</p>
      <div className="math-sum">
        {question.a} {question.symbol} {question.b} = ?
      </div>
      <div className="choice-grid">
        {question.options.map((option) => {
          const isPicked = picked === option
          const isCorrect = picked !== null && option === question.answer
          const isWrong = isPicked && option !== question.answer
          return (
            <button
              key={`${question.a}-${question.symbol}-${question.b}-${option}`}
              type="button"
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
            <button type="button" className="play-next" onClick={() => nextRound(mode)}>
              {t('play.next')}
            </button>
          </div>
        </>
      )}
    </GameShell>
  )
}
