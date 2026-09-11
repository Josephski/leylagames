'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import {
  getCountryByCode,
  getRandomCountry,
  shuffleLetters,
  tilesFromName,
  type Country,
  type LetterTile,
} from '../data/countries'
import Leaderboard from './Leaderboard'
import { useCurrentGame } from '../platform/GameContext'
import { useLanguage } from '../i18n/LanguageProvider'
import { readLocal, readLocalFlag, readLocalNumber, writeLocal } from '../lib/storage'
import { HelpOverlay } from './flag-game/HelpOverlay'
import { SettingsOverlay } from './flag-game/SettingsOverlay'
import { BASE_POINTS, STREAK_BONUS, difficultySettings, isDifficulty, type Difficulty } from './flag-game/constants'
import { IconEye, IconEyeOff, IconNext, IconSkip, IconSound } from './flag-game/icons'
import { useGameTimer } from './flag-game/useGameTimer'
import { useSpeech } from './flag-game/useSpeech'
import './FlagGame.css'

type MessageType = 'success' | 'error' | 'info'

const flagPath = (code: string) => {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}flags/${code.toLowerCase()}.png`
}

export default function FlagGame() {
  const { game, onExit } = useCurrentGame()
  const { language, t } = useLanguage()
  const { voices, selectedVoice, setSelectedVoice, speak, refreshVoices } = useSpeech(language)

  const [country, setCountry] = useState<Country | null>(null)
  const [selected, setSelected] = useState<LetterTile[]>([])
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('info')
  const [showAnswer, setShowAnswer] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const saved = readLocal('leyla-difficulty', 'medium')
    return isDifficulty(saved) ? saved : 'medium'
  })
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(() => readLocalNumber('leyla-best-streak', 0))
  const [roundsPlayed, setRoundsPlayed] = useState(0)
  const [correctRounds, setCorrectRounds] = useState(0)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [flagError, setFlagError] = useState(false)
  const [flagSrc, setFlagSrc] = useState<string | null>(null)
  const [roundScore, setRoundScore] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showRoundSummary, setShowRoundSummary] = useState(false)
  const [audioHelp, setAudioHelp] = useState(() => readLocalFlag('leyla-audio-help', true))
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(() => readLocalFlag('leyla-time-enabled', true))
  const [customTime, setCustomTime] = useState(() =>
    readLocalNumber('leyla-time-seconds', difficultySettings.medium.time),
  )
  const [devMode, setDevMode] = useState(false)
  const [roundId, setRoundId] = useState(0)

  const countryRef = useRef<Country | null>(null)
  const lastCountryCodeRef = useRef<string | null>(null)
  const completedRef = useRef(false)
  const messageTimeoutRef = useRef<number | null>(null)
  const dragIndexRef = useRef<number | null>(null)
  countryRef.current = country
  completedRef.current = completed

  const flashMessage = useCallback((text: string, type: MessageType, ms?: number) => {
    setMessage(text)
    setMessageType(type)
    if (messageTimeoutRef.current !== null) window.clearTimeout(messageTimeoutRef.current)
    if (ms) {
      messageTimeoutRef.current = window.setTimeout(() => setMessage(''), ms)
    }
  }, [])

  const handleTimeUp = useCallback(() => {
    const current = countryRef.current
    if (completedRef.current || !current) return
    completedRef.current = true
    setCompleted(true)
    flashMessage(t('flagGame.timeUp', { country: current.name }), 'error')
    setShowAnswer(true)
    setStreak(0)
    setRoundsPlayed((r) => r + 1)
  }, [flashMessage, t])

  const { timeLeft, setTimeLeft } = useGameTimer({
    enabled: timeLimitEnabled,
    seconds: customTime,
    running: Boolean(country) && !completed,
    roundKey: roundId,
    onExpire: handleTimeUp,
  })

  const loadNewCountry = useCallback(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const forced = params.get('country')?.toUpperCase() ?? null
    const newCountry =
      (forced ? getCountryByCode(forced, language) : undefined) ??
      getRandomCountry(language, lastCountryCodeRef.current)

    lastCountryCodeRef.current = newCountry.code
    countryRef.current = newCountry
    completedRef.current = false
    setCountry(newCountry)
    setSelected(shuffleLetters(newCountry.name))
    setCompleted(false)
    setMessage('')
    setMessageType('info')
    setShowAnswer(false)
    setFlagError(false)
    setShowRoundSummary(false)
    setFlagSrc(flagPath(newCountry.code))
    setRoundScore(0)
    setRoundId((id) => id + 1)
  }, [language])

  useEffect(() => {
    setDevMode(new URLSearchParams(window.location.search).get('dev') === '1')
  }, [])

  useEffect(() => {
    loadNewCountry()
  }, [loadNewCountry])

  useEffect(() => {
    writeLocal('leyla-best-streak', String(bestStreak))
  }, [bestStreak])

  useEffect(() => {
    writeLocal('leyla-difficulty', difficulty)
  }, [difficulty])

  useEffect(() => {
    writeLocal('leyla-audio-help', audioHelp ? '1' : '0')
  }, [audioHelp])

  useEffect(() => {
    writeLocal('leyla-time-enabled', timeLimitEnabled ? '1' : '0')
  }, [timeLimitEnabled])

  useEffect(() => {
    writeLocal('leyla-time-seconds', String(customTime))
  }, [customTime])

  useEffect(() => {
    if (!country || !audioHelp) return
    speak(country.name)
  }, [audioHelp, country, speak])

  useEffect(() => {
    if (dragIndex === null) return
    const onUp = () => {
      dragIndexRef.current = null
      setDragIndex(null)
    }
    window.addEventListener('pointerup', onUp)
    return () => window.removeEventListener('pointerup', onUp)
  }, [dragIndex])

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current !== null) window.clearTimeout(messageTimeoutRef.current)
    }
  }, [])

  const handleCheckAnswer = (override?: LetterTile[]) => {
    if (!country) return

    const attempt = (override ?? selected).map((tile) => tile.char).join('')
    if (attempt === country.name.toUpperCase()) {
      setCompleted(true)
      completedRef.current = true
      const timeBonus = timeLimitEnabled ? Math.max(0, timeLeft - 5) : 0
      const streakBonus = Math.max(0, streak) * STREAK_BONUS
      const multiplier = difficultySettings[difficulty].multiplier
      const total = Math.round((BASE_POINTS + timeBonus + streakBonus) * multiplier)
      setRoundScore(total)
      flashMessage(
        t('flagGame.correct', {
          total,
          base: BASE_POINTS,
          timeBonus,
          streakBonus,
          multiplier,
        }),
        'success',
      )
      setShowRoundSummary(true)
      setScore((s) => s + total)
      setRoundsPlayed((r) => r + 1)
      setCorrectRounds((c) => c + 1)
      setStreak((current) => {
        const next = current + 1
        setBestStreak((prev) => Math.max(prev, next))
        return next
      })
    } else {
      flashMessage(t('flagGame.incorrect'), 'error', 1500)
    }
  }

  const handleSkip = () => {
    if (country) {
      setRoundsPlayed((r) => r + 1)
      setStreak(0)
    }
    loadNewCountry()
  }

  const moveLetter = (from: number, to: number) => {
    if (from === to || to < 0) return
    setSelected((current) => {
      if (to >= current.length) return current
      const next = [...current]
      ;[next[from], next[to]] = [next[to], next[from]]
      return next
    })
    setDragIndex(to)
    dragIndexRef.current = to
  }

  const letterIndexFromPoint = (clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY)
    const box = el?.closest('[data-letter-index]') as HTMLElement | null
    if (!box) return null
    const index = Number(box.dataset.letterIndex)
    return Number.isInteger(index) ? index : null
  }

  const handleLetterPointerDown = (index: number, e: PointerEvent<HTMLDivElement>) => {
    if (completed) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragIndexRef.current = index
    setDragIndex(index)
  }

  const handleLetterPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const from = dragIndexRef.current
    if (completed || from === null) return
    const over = letterIndexFromPoint(e.clientX, e.clientY)
    if (over === null || over === from) return
    moveLetter(from, over)
  }

  const handleLetterPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    dragIndexRef.current = null
    setDragIndex(null)
  }

  const handleLetterKeyDown = (index: number, e: KeyboardEvent<HTMLDivElement>) => {
    if (completed) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      moveLetter(index, index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      moveLetter(index, index - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCheckAnswer()
    }
  }

  if (!country) {
    return <div className="flag-game">{t('flagGame.loading')}</div>
  }

  const accuracy = roundsPlayed > 0 ? Math.round((correctRounds / roundsPlayed) * 100) : 100
  const timePercent = timeLimitEnabled ? Math.max(0, Math.min(100, (timeLeft / customTime) * 100)) : 100

  return (
    <div className="flag-game">
      <div className="game-shell">
        <div className="content-row">
          <div className="game-container">
            <div className="flag-display">
              {!flagError && flagSrc ? (
                <img
                  src={flagSrc}
                  alt={t('flagGame.flagAlt', { country: country.name })}
                  className="flag-image"
                  onError={() => {
                    if (flagSrc && flagSrc.includes('flags/')) {
                      setFlagSrc(`https://flagcdn.com/h120/${country.code.toLowerCase()}.png`)
                    } else {
                      setFlagError(true)
                    }
                  }}
                />
              ) : (
                <div className="flag-fallback" aria-label={t('flagGame.flagAria', { country: country.name })}>
                  <span className="flag-emoji" aria-hidden="true">
                    {country.flag}
                  </span>
                </div>
              )}
            </div>

            <div className="progress-bar">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${timePercent}%` }} />
              </div>
            </div>

            {showSettings && (
              <SettingsOverlay
                difficulty={difficulty}
                timeLimitEnabled={timeLimitEnabled}
                customTime={customTime}
                selectedVoice={selectedVoice}
                voices={voices}
                onClose={() => setShowSettings(false)}
                onDifficulty={(level) => {
                  setDifficulty(level)
                  const newTime = difficultySettings[level].time
                  setCustomTime(newTime)
                  setTimeLeft(newTime)
                  flashMessage(
                    t('flagGame.difficultyNotice', { label: t(`flagGame.difficulty.${level}`) }),
                    'info',
                    1200,
                  )
                }}
                onTimeLimitEnabled={setTimeLimitEnabled}
                onCustomTime={(next) => {
                  setCustomTime(next)
                  setTimeLeft(next)
                }}
                onVoice={setSelectedVoice}
                onRefreshVoices={() => {
                  refreshVoices()
                  flashMessage(t('flagGame.voiceUpdated'), 'info', 1500)
                }}
              />
            )}

            {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}

            <div className="game-board">
              <div className="answer-card">
                <div className="card-label">{t('flagGame.arrangeLetters')}</div>
                <div className="letters-container">
                  {selected.map((tile, index) => (
                    <div
                      key={tile.id}
                      data-letter-index={index}
                      className={`letter-box ${dragIndex === index ? 'dragging' : ''}`}
                      tabIndex={0}
                      role="button"
                      aria-label={t('flagGame.letterAria', { letter: tile.char, position: index + 1 })}
                      onKeyDown={(e) => handleLetterKeyDown(index, e)}
                      onPointerDown={(e) => handleLetterPointerDown(index, e)}
                      onPointerMove={handleLetterPointerMove}
                      onPointerUp={handleLetterPointerUp}
                      onPointerCancel={handleLetterPointerUp}
                    >
                      {tile.char}
                    </div>
                  ))}
                </div>
              </div>

              {message && (
                <div className={`message ${messageType}`} aria-live="polite">
                  {message}
                </div>
              )}

              {!completed && (
                <button
                  className="btn btn-check"
                  onClick={() => handleCheckAnswer()}
                  aria-label={t('flagGame.checkAnswer')}
                >
                  ✓
                </button>
              )}

              <div className="button-group">
                <button
                  className="btn btn-sound icon-only"
                  onClick={() => speak(country.name)}
                  title={t('flagGame.listenTitle')}
                  aria-label={t('flagGame.listenAria')}
                >
                  <IconSound />
                  <span className="sr-only">{t('flagGame.listen')}</span>
                </button>

                {completed ? (
                  <button className="btn btn-next icon-only" onClick={loadNewCountry} aria-label={t('flagGame.nextRound')}>
                    <IconNext />
                    <span className="sr-only">{t('flagGame.next')}</span>
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-hint icon-only"
                      onClick={() => setShowAnswer((v) => !v)}
                      aria-label={t('flagGame.showAnswer')}
                    >
                      {showAnswer ? <IconEyeOff /> : <IconEye />}
                      <span className="sr-only">{showAnswer ? t('flagGame.hideAnswer') : t('flagGame.showAnswer')}</span>
                    </button>
                    {devMode && (
                      <button
                        className="btn btn-ghost"
                        onClick={() => {
                          const target = tilesFromName(country.name)
                          setSelected(target)
                          handleCheckAnswer(target)
                        }}
                      >
                        {t('flagGame.autoFill')}
                      </button>
                    )}
                    <button className="btn btn-skip icon-only" onClick={handleSkip} aria-label={t('flagGame.skip')}>
                      <IconSkip />
                      <span className="sr-only">{t('flagGame.skip')}</span>
                    </button>
                  </>
                )}
              </div>

              {showAnswer && !completed && (
                <div className="hint">
                  {t('flagGame.answer')} <strong>{country.name}</strong>
                </div>
              )}

              {showRoundSummary && completed && (
                <div className="hint summary-hint">
                  <div>
                    <strong>{t('flagGame.roundComplete')}</strong>
                  </div>
                  <div>
                    {t('flagGame.roundSummary', {
                      roundScore,
                      multiplier: difficultySettings[difficulty].multiplier,
                      streak,
                    })}
                  </div>
                  <div>{t('flagGame.totalScore', { score })}</div>
                  <button className="btn btn-ghost summary-close" onClick={() => setShowRoundSummary(false)}>
                    {t('flagGame.closeSummary')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <aside className="stats-panel" aria-label={t('flagGame.statsLabel')}>
            <button className="back-link" onClick={() => onExit?.()} aria-label={t('flagGame.backToLibrary')}>
              ← <span className="back-label-long">{t('flagGame.backToLibrary')}</span>
              <span className="back-label-short">{t('flagGame.backShort')}</span>
            </button>
            <div className="score-block">{t('flagGame.scoreLabel', { score })}</div>
            <div className="stats-actions">
              <button
                className="settings-btn"
                onClick={() => setShowSettings(true)}
                aria-label={t('flagGame.settings.title')}
                title={t('flagGame.settings.title')}
              >
                {t('flagGame.settings.title')}
              </button>
              <button
                className="settings-btn"
                onClick={() => setAudioHelp((v) => !v)}
                aria-label={t('flagGame.audioHelp')}
                title={t('flagGame.audioHelpTitle')}
              >
                {t('flagGame.audioHelpStatus', {
                  status: audioHelp ? t('flagGame.settings.on') : t('flagGame.settings.off'),
                })}
              </button>
              <button
                className="settings-btn"
                onClick={() => setShowHelp(true)}
                aria-label={t('flagGame.helpButton')}
                title={t('flagGame.helpButton')}
              >
                {t('flagGame.helpButton')}
              </button>
              <button
                className="settings-btn"
                onClick={() => setShowLeaderboard((v) => !v)}
                aria-label={t('flagGame.leaderboard')}
                title={t('flagGame.leaderboard')}
              >
                {showLeaderboard ? t('flagGame.closeLeaderboard') : t('flagGame.leaderboard')}
              </button>
            </div>
            <div className="stat-grid">
              <div className={`stat-pill ${timeLimitEnabled && timeLeft <= 10 ? 'danger' : ''}`}>
                ⏳ {timeLimitEnabled ? `${timeLeft}s` : '∞'}
              </div>
              <div className="stat-pill">
                🔥 {streak} <span className="muted">{t('flagGame.maxStreak', { best: bestStreak })}</span>
              </div>
              <div className="stat-pill">🎯 {accuracy}%</div>
              <div className="stat-pill">⭐ {roundScore}p</div>
              <div className="stat-pill">⚙️ {t(`flagGame.difficulty.${difficulty}`)}</div>
            </div>
            {showLeaderboard && (
              <div className="leaderboard-card">
                <Leaderboard gameId={game.id} currentScore={score} />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
