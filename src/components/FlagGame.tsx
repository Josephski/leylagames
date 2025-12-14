import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRandomCountry, shuffleLetters, type Country, getCountryByCode } from '../data/countries'
import Leaderboard from './Leaderboard'
import { saveScore } from '../lib/supabase'
import { useCurrentGame } from '../platform/GameContext'
import './FlagGame.css'

const IconSound = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4.5 9.5v5h3L12 18v-11l-4.5 3.5h-3Zm12.75 2.5a3.25 3.25 0 0 0-2.45-3.15v6.3a3.25 3.25 0 0 0 2.45-3.15Zm-2.45-7.2v1.72a5.75 5.75 0 0 1 0 10.96v1.72a7.25 7.25 0 0 0 0-14.4Z"
      fill="currentColor"
    />
  </svg>
)

const IconEye = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 5c-5 0-9.27 3.11-11 7 1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 11.25A4.25 4.25 0 1 1 12 8a4.25 4.25 0 0 1 0 8.5Zm0-2a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
      fill="currentColor"
    />
  </svg>
)

const IconEyeOff = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="m4.5 4.5 15 15m-4.47-4.47A4.25 4.25 0 0 1 9.97 9.97m5.25-3.12A9.75 9.75 0 0 0 12 5C7 5 2.73 8.11 1 12c.67 1.5 1.78 2.86 3.12 4m4.1 2.15A9.76 9.76 0 0 0 12 19c5 0 9.27-3.11 11-7a10.68 10.68 0 0 0-2.29-3.27M9.97 9.97 12 12m2.53 2.53L12 12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

const IconShuffle = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 7h3.8c1 0 1.96.47 2.56 1.27L12 10.5l1.64-2.23A3.2 3.2 0 0 1 16.2 7H20m-16 10h3.8c1 0 1.96-.47 2.56-1.27L12 13.5l1.64 2.23A3.2 3.2 0 0 0 16.2 17H20M20 7l-2-2m2 2-2 2m2 8-2-2m2 2-2 2M4 7v2m0 6v2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

const IconSkip = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="m6 6 7 6-7 6V6Zm8.5 0v12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

const IconNext = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="m7 5 8 7-8 7V5Z"
      fill="currentColor"
    />
  </svg>
)

const IconSave = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M6 4h9.17L20 8.83V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm0 0h9v5H6V4Zm0 7h12v9H6v-9Zm2 2v5h8v-5H8Z"
      fill="currentColor"
    />
  </svg>
)

const IconReplay = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 5a7 7 0 1 1-6.18 3.7M5 9V4m0 0h5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

const BASE_POINTS = 10
const STREAK_BONUS = 2

type Difficulty = 'easy' | 'medium' | 'hard'
const difficultySettings: Record<Difficulty, { time: number; multiplier: number; label: string }> = {
  easy: { time: 60, multiplier: 1, label: 'Lätt' },
  medium: { time: 45, multiplier: 1.2, label: 'Mellan' },
  hard: { time: 30, multiplier: 1.5, label: 'Svår' },
}

export default function FlagGame() {
  const { game } = useCurrentGame()
  const navigate = useNavigate()
  const [country, setCountry] = useState<Country | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [showAnswer, setShowAnswer] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(() => {
    if (typeof window === 'undefined') return 0
    const stored = window.localStorage.getItem('leyla-best-streak')
    return stored ? Number(stored) || 0 : 0
  })
  const [roundsPlayed, setRoundsPlayed] = useState(0)
  const [correctRounds, setCorrectRounds] = useState(0)
  const [flagError, setFlagError] = useState(false)
  const [flagSrc, setFlagSrc] = useState<string | null>(null)
  const [roundScore, setRoundScore] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showRoundSummary, setShowRoundSummary] = useState(false)
  const [checklistHints, setChecklistHints] = useState([
    { id: 'drag', text: 'Flytta bokstäver (dra eller piltangenter)', done: false },
    { id: 'sound', text: 'Lyssna på landets namn', done: false },
    { id: 'difficulty', text: 'Testa att byta svårighet', done: false },
  ])
  const [audioHelp, setAudioHelp] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = window.localStorage.getItem('leyla-audio-help')
    return saved ? saved === '1' : true
  })
  const [devMode] = useState(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.get('dev') === '1'
  })
  const [forcedCountryCode] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    const code = params.get('country')
    return code ? code.toUpperCase() : null
  })
  const [timeLimitEnabled, setTimeLimitEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const saved = window.localStorage.getItem('leyla-time-enabled')
    return saved ? saved === '1' : true
  })
  const [customTime, setCustomTime] = useState<number>(() => {
    if (typeof window === 'undefined') return difficultySettings['medium'].time
    const saved = window.localStorage.getItem('leyla-time-seconds')
    const asNumber = saved ? Number(saved) : NaN
    return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : difficultySettings['medium'].time
  })
  const [timeLeft, setTimeLeft] = useState<number>(customTime)

  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const totalDragDistance = useRef(0)
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleTimeUp = useCallback(() => {
    if (completed || !country || !timeLimitEnabled) return
    setCompleted(true)
    setMessage(`Tiden är ute! Rätt svar: ${country.name}`)
    setMessageType('error')
    setShowAnswer(true)
    setStreak(0)
    setRoundsPlayed((r) => r + 1)
    clearTimer()
  }, [clearTimer, completed, country, timeLimitEnabled])

  const startTimer = useCallback(() => {
    if (!timeLimitEnabled) {
      clearTimer()
      setTimeLeft(customTime)
      return
    }
    clearTimer()
    setTimeLeft(customTime)
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer()
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer, customTime, handleTimeUp, timeLimitEnabled])

  const pickCountry = useCallback(() => {
    if (forcedCountryCode) {
      const specific = getCountryByCode(forcedCountryCode)
      if (specific) return specific
    }
    return getRandomCountry()
  }, [forcedCountryCode])

  const loadNewCountry = useCallback(() => {
    clearTimer()
    const newCountry = pickCountry()
    setCountry(newCountry)
    setSelected(shuffleLetters(newCountry.name))
    setCompleted(false)
    setMessage('')
    setMessageType('info')
    setShowAnswer(false)
    setDraggedIndex(null)
    setTimeLeft(customTime)
    setFlagError(false)
    setShowRoundSummary(false)
    if (newCountry) {
      const flagPath = `${import.meta.env.BASE_URL}flags/${newCountry.code.toLowerCase()}.png`
      setFlagSrc(flagPath)
    }
    setRoundScore(0)
  }, [clearTimer, customTime, pickCountry])

  useEffect(() => {
    loadNewCountry()
  }, [loadNewCountry])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('leyla-best-streak', String(bestStreak))
  }, [bestStreak])

  // Tutorial disabled on start; can be opened manually via Guide button if needed.

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedDifficulty = window.localStorage.getItem('leyla-difficulty') as Difficulty | null
    if (savedDifficulty && difficultySettings[savedDifficulty]) {
      setDifficulty(savedDifficulty)
      setTimeLeft(difficultySettings[savedDifficulty].time)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('leyla-difficulty', difficulty)
  }, [difficulty])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('leyla-audio-help', audioHelp ? '1' : '0')
  }, [audioHelp])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('leyla-time-enabled', timeLimitEnabled ? '1' : '0')
  }, [timeLimitEnabled])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('leyla-time-seconds', String(customTime))
  }, [customTime])

  const tutorialSlides = [
    {
      title: 'Välkommen!',
      body: 'Dra bokstäver eller använd piltangenterna för att flytta dem. Enter/Space kontrollerar svaret.',
    },
    {
      title: 'Poäng',
      body: 'Baspoäng + tidsbonus + streakbonus. Svårighet multiplicerar poängen (Lätt/Mellan/Svår).',
    },
    {
      title: 'Hjälp och ljud',
      body: 'Lyssna-knappen läser upp landets namn. Hjälp-knappen visar tips. Supabase krävs för topplista.',
    },
  ]

  const playCountryName = useCallback(() => {
    if (!country || !audioHelp) return
    try {
      const utterance = new SpeechSynthesisUtterance(country.name)
      const voice = selectedVoice
        ? voices.find((v) => v.name === selectedVoice)
        : voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('sv'))
      if (voice) utterance.voice = voice
      utterance.lang = voice?.lang || 'sv-SE'
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.volume = 1.0
      speechSynthesis.cancel()
      speechSynthesis.speak(utterance)
      setChecklistHints((hints) => hints.map(h => h.id === 'sound' ? { ...h, done: true } : h))
    } catch (err) {
      console.error(err)
    }
  }, [audioHelp, country, selectedVoice, voices])

  useEffect(() => {
    if (!country || completed) return
    if (!timeLimitEnabled) {
      clearTimer()
      setTimeLeft(customTime)
      return
    }
    startTimer()
    return () => clearTimer()
  }, [clearTimer, country, completed, customTime, startTimer, timeLimitEnabled])

  useEffect(() => {
    if (!country || !audioHelp) return
    playCountryName()
  }, [audioHelp, country, playCountryName])

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    if (completed) return
    e.preventDefault()
    setDraggedIndex(index)
    dragStartX.current = e.clientX
    isDragging.current = true
    totalDragDistance.current = 0
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || draggedIndex === null) return

    const currentDistance = e.clientX - dragStartX.current
    totalDragDistance.current += currentDistance
    dragStartX.current = e.clientX

    if (Math.abs(totalDragDistance.current) > 40) {
      if (totalDragDistance.current > 0) {
        if (draggedIndex < selected.length - 1) {
          const newSelected = [...selected]
          ;[newSelected[draggedIndex], newSelected[draggedIndex + 1]] = [newSelected[draggedIndex + 1], newSelected[draggedIndex]]
          setSelected(newSelected)
          setDraggedIndex(draggedIndex + 1)
          totalDragDistance.current = 0
        }
      } else {
        if (draggedIndex > 0) {
          const newSelected = [...selected]
          ;[newSelected[draggedIndex], newSelected[draggedIndex - 1]] = [newSelected[draggedIndex - 1], newSelected[draggedIndex]]
          setSelected(newSelected)
          setDraggedIndex(draggedIndex - 1)
          totalDragDistance.current = 0
        }
      }
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
    setDraggedIndex(null)
  }

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    if (completed) return
    setDraggedIndex(index)
    dragStartX.current = e.touches[0].clientX
    isDragging.current = true
    totalDragDistance.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || draggedIndex === null) return
    const clientX = e.touches[0].clientX
    const currentDistance = clientX - dragStartX.current
    totalDragDistance.current += currentDistance
    dragStartX.current = clientX

    if (Math.abs(totalDragDistance.current) > 40) {
      if (totalDragDistance.current > 0) {
        if (draggedIndex < selected.length - 1) {
          const newSelected = [...selected]
          ;[newSelected[draggedIndex], newSelected[draggedIndex + 1]] = [newSelected[draggedIndex + 1], newSelected[draggedIndex]]
          setSelected(newSelected)
          setDraggedIndex(draggedIndex + 1)
          totalDragDistance.current = 0
        }
      } else if (draggedIndex > 0) {
        const newSelected = [...selected]
        ;[newSelected[draggedIndex], newSelected[draggedIndex - 1]] = [newSelected[draggedIndex - 1], newSelected[draggedIndex]]
        setSelected(newSelected)
        setDraggedIndex(draggedIndex - 1)
        totalDragDistance.current = 0
      }
    }
  }

  const handleTouchEnd = () => {
    isDragging.current = false
    setDraggedIndex(null)
  }

  const handleCheckAnswer = (override?: string[]) => {
    if (!country) return

    const attempt = override ?? selected
    if (attempt.join('') === country.name.toUpperCase()) {
      setCompleted(true)
      const timeBonus = timeLimitEnabled ? Math.max(0, timeLeft - 5) : 0
      const streakBonus = Math.max(0, streak) * STREAK_BONUS
      const multiplier = difficultySettings[difficulty].multiplier
      const total = Math.round((BASE_POINTS + timeBonus + streakBonus) * multiplier)
      setRoundScore(total)
      setMessage(`Rätt! +${total} poäng (bas ${BASE_POINTS}, tid ${timeBonus}, streak ${streakBonus}, x${multiplier})`)
      setMessageType('success')
      setShowRoundSummary(true)
      setScore((s) => s + total)
      setRoundsPlayed((r) => r + 1)
      setCorrectRounds((c) => c + 1)
      setStreak((current) => {
        const next = current + 1
        setBestStreak((prev) => Math.max(prev, next))
        return next
      })
      clearTimer()
    } else {
      setMessage('Inte rätt. Försök igen!')
      setMessageType('error')
      setTimeout(() => setMessage(''), 1500)
    }
  }

  const handleSkip = () => {
    if (country) {
      setRoundsPlayed((r) => r + 1)
      setStreak(0)
    }
    loadNewCountry()
  }

  const toggleShowAnswer = () => {
    setShowAnswer(!showAnswer)
  }

  const shuffleCurrentLetters = () => {
    if (!country) return
    setSelected(shuffleLetters(country.name))
    setChecklistHints((hints) => hints.map(h => h.id === 'drag' ? { ...h, done: true } : h))
  }

  const handleLetterKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
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

  const moveLetter = (from: number, to: number) => {
    if (from === to || to < 0 || !country || to >= selected.length) return
    const newSelected = [...selected]
    ;[newSelected[from], newSelected[to]] = [newSelected[to], newSelected[from]]
    setSelected(newSelected)
    setDraggedIndex(to)
  }

  useEffect(() => {
    const load = () => {
      const available = speechSynthesis.getVoices() || []
      setVoices(available)
      const sv = available.find((v) => v.lang && v.lang.toLowerCase().startsWith('sv'))
      if (sv) setSelectedVoice(sv.name)
    }

    load()
    speechSynthesis.onvoiceschanged = () => load()
    return () => {
      speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const refreshVoices = () => {
    const available = speechSynthesis.getVoices() || []
    setVoices(available)
    const sv = available.find((v) => v.lang && v.lang.toLowerCase().startsWith('sv'))
    if (sv) setSelectedVoice(sv.name)
    setMessage('Röster uppdaterade')
    setMessageType('info')
    setTimeout(() => setMessage(''), 1500)
  }

  const submitScore = async () => {
    if (!completed) {
      setMessage('Du måste klara banan först för att spara poäng.')
      setMessageType('info')
      setTimeout(() => setMessage(''), 2000)
      return
    }
    const name = window.prompt('Ange ditt namn för topplistan (max 20 tecken):', 'Spelare') || ''
    const trimmed = name.substring(0, 20) || 'Spelare'
    try {
      await saveScore(game.id, trimmed, score)
      setMessage('Poäng sparade!')
      setMessageType('success')
    } catch (err: any) {
      console.error(err)
      setMessage('Kunde inte spara poäng (konfigurera Supabase).')
      setMessageType('error')
    }
    setTimeout(() => setMessage(''), 2000)
  }

  if (!country) {
    return <div className="flag-game">Laddar...</div>
  }

  const accuracy = roundsPlayed > 0 ? Math.round((correctRounds / roundsPlayed) * 100) : 100
  const timePercent = timeLimitEnabled
    ? Math.max(0, Math.min(100, (timeLeft / customTime) * 100))
    : 100

  return (
    <div className="flag-game">
      <div className="game-shell">
        <div className="content-row">
          <div className="game-container">
            <div className="flag-display">
            {!flagError && flagSrc ? (
              <img
                src={flagSrc}
                alt={`Flagga för ${country.name}`}
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
              <div className="flag-fallback" aria-label={`Flagga för ${country.name}`}>
                <span className="flag-emoji" aria-hidden="true">{country.flag}</span>
              </div>
            )}
        </div>

            <div className="progress-bar">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${timePercent}%` }} />
              </div>
            </div>

            {showSettings && (
              <div className="settings-overlay" onClick={() => setShowSettings(false)}>
                <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
                  <h3>Inställningar</h3>
                  <label style={{ display: 'block', margin: '0.5rem 0' }}>Svårighet</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    {(['easy','medium','hard'] as Difficulty[]).map((level) => (
                      <button
                        key={level}
                        className={`btn ${difficulty === level ? 'btn-selected' : 'btn-ghost'}`}
                        onClick={() => {
                          setDifficulty(level)
                          const newTime = difficultySettings[level].time
                          setCustomTime(newTime)
                          setTimeLeft(newTime)
                          setMessage(`Svårighet: ${difficultySettings[level].label}`)
                          setMessageType('info')
                          setChecklistHints((hints) => hints.map(h => h.id === 'difficulty' ? { ...h, done: true } : h))
                          setTimeout(() => setMessage(''), 1200)
                        }}
                        aria-pressed={difficulty === level}
                      >
                        {difficultySettings[level].label}
                      </button>
                    ))}
                  </div>
                  <label style={{ display: 'block', margin: '0.5rem 0' }}>
                    Tidsbegränsning
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      className={`btn ${timeLimitEnabled ? 'btn-selected' : 'btn-ghost'}`}
                      onClick={() => {
                        setTimeLimitEnabled(true)
                        setTimeLeft(customTime)
                        startTimer()
                      }}
                      aria-pressed={timeLimitEnabled}
                    >
                      På
                    </button>
                    <button
                      className={`btn ${!timeLimitEnabled ? 'btn-selected' : 'btn-ghost'}`}
                      onClick={() => {
                        setTimeLimitEnabled(false)
                        clearTimer()
                        setTimeLeft(customTime)
                      }}
                      aria-pressed={!timeLimitEnabled}
                    >
                      Av
                    </button>
                    <input
                      type="number"
                      min={10}
                      max={180}
                      value={customTime}
                      onChange={(e) => {
                        const next = Math.max(10, Math.min(180, Number(e.target.value) || 0))
                        setCustomTime(next)
                        setTimeLeft(next)
                        if (timeLimitEnabled) startTimer()
                      }}
                      className="time-input"
                      aria-label="Tidsgräns i sekunder"
                    />
                    <span style={{ fontSize: '0.95rem' }}>sekunder</span>
                  </div>
                  <label style={{ display: 'block', margin: '0.5rem 0' }}>Röst</label>
                  <select
                    value={selectedVoice ?? ''}
                    onChange={(e) => setSelectedVoice(e.target.value || null)}
                    className="voice-select"
                  >
                    <option value="">(Auto röst)</option>
                    {voices.map((v) => (
                      <option key={v.name} value={v.name}>{v.name} – {v.lang}</option>
                    ))}
                  </select>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button className="btn" onClick={refreshVoices}>Uppdatera röster</button>
                    <button className="btn" onClick={() => setShowSettings(false)}>Stäng</button>
                  </div>
                </div>
              </div>
            )}

            {showHelp && (
              <div className="settings-overlay" onClick={() => setShowHelp(false)}>
                <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
                  <h3>Hur spelar jag?</h3>
                  <ul style={{ paddingLeft: '1.2rem', lineHeight: 1.5 }}>
                    <li>Dra bokstäver eller använd vänster/höger piltangenter för att flytta dem.</li>
                    <li>Tid kvar + streak ger bonuspoäng. Svårighet multiplicerar poängen.</li>
                    <li>Lyssna-knappen läser upp landsnamnet om TTS finns.</li>
                    <li>Topplista kräver Supabase (miljövariabler VITE_SUPABASE_URL/KEY).</li>
                  </ul>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button className="btn" onClick={() => setShowHelp(false)}>Stäng</button>
                  </div>
                </div>
              </div>
            )}

            <div className="game-board">
              <div
                className="answer-card"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="card-label">Arrangera bokstäverna:</div>
                <div
                  className="letters-container"
                  ref={containerRef}
                >
                  {selected.map((letter, index) => (
                    <div
                      key={`${letter}-${index}`}
                      className={`letter-box ${draggedIndex === index ? 'dragging' : ''}`}
                      onMouseDown={(e) => handleMouseDown(index, e)}
                      onTouchStart={(e) => handleTouchStart(index, e)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Bokstav ${letter}, position ${index + 1}`}
                      onKeyDown={(e) => handleLetterKeyDown(index, e)}
                    >
                      {letter}
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
                  aria-label="Kontrollera svar"
                >
                  ✓
                </button>
              )}

              <div className="button-group">
                <button
                  className="btn btn-sound icon-only"
                  onClick={playCountryName}
                  title="Spela upp landets namn"
                  aria-label="Lyssna på landets namn"
                >
                  <IconSound />
                  <span className="sr-only">Lyssna</span>
                </button>

                {completed ? (
                  <button className="btn btn-next icon-only" onClick={loadNewCountry} aria-label="Nästa runda">
                    <IconNext />
                    <span className="sr-only">Nästa</span>
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-hint icon-only"
                      onClick={toggleShowAnswer}
                      aria-label="Visa svar"
                    >
                      {showAnswer ? <IconEyeOff /> : <IconEye />}
                      <span className="sr-only">{showAnswer ? 'Dölj svar' : 'Visa svar'}</span>
                    </button>
                    <button className="btn btn-ghost icon-only" onClick={shuffleCurrentLetters} aria-label="Blanda bokstäver">
                      <IconShuffle />
                      <span className="sr-only">Blanda</span>
                    </button>
                    {devMode && (
                      <button
                        className="btn btn-ghost"
                        onClick={() => {
                          if (!country) return
                          const target = country.name.toUpperCase().split('')
                          setSelected(target)
                          handleCheckAnswer(target)
                        }}
                      >
                        Autofyll svar (dev)
                      </button>
                    )}
                    <button
                      className="btn btn-skip icon-only"
                      onClick={handleSkip}
                      aria-label="Hoppa över"
                    >
                      <IconSkip />
                      <span className="sr-only">Hoppa över</span>
                    </button>
                </>
              )}
            </div>

            {showAnswer && !completed && (
              <div className="hint">
                Svar: <strong>{country.name}</strong>
              </div>
            )}

            {completed && (
              <div className="button-group completed-group">
                <button className="btn icon-only" onClick={submitScore} aria-label="Spara poäng">
                  <IconSave />
                  <span className="sr-only">Spara poäng</span>
                </button>
                <button className="btn btn-ghost icon-only" onClick={loadNewCountry} aria-label="Spela igen">
                  <IconReplay />
                  <span className="sr-only">Spela igen</span>
                </button>
                <button className="btn btn-next icon-only" onClick={loadNewCountry} aria-label="Nästa runda">
                  <IconNext />
                  <span className="sr-only">Nästa</span>
                </button>
              </div>
            )}

              {showRoundSummary && completed && (
                <div className="hint" style={{ marginTop: '0.5rem' }}>
                  <div><strong>Runda klar</strong></div>
                  <div>+{roundScore}p (svårighet x{difficultySettings[difficulty].multiplier}, streak {streak})</div>
                  <div>Totalt: {score}p</div>
                  <button
                    className="btn btn-ghost"
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => setShowRoundSummary(false)}
                  >
                    Stäng sammanfattning
                  </button>
                </div>
              )}
            </div>
          </div>

          <aside className="stats-panel" aria-label="Statistik">
            <button
              className="back-link"
              onClick={() => navigate('/')}
              aria-label="Tillbaka till spelbiblioteket"
            >
              ← Till spelbiblioteket
            </button>
            <div className="score-block">Poäng: {score}</div>
            <div className="stats-actions">
              <button
                className="settings-btn"
                onClick={() => setShowSettings(true)}
                aria-label="Inställningar"
                title="Inställningar"
              >
                Inställningar
              </button>
              <button
                className="settings-btn"
                onClick={() => setAudioHelp((v) => !v)}
                aria-label="Ljudhjälp"
                title="Ljudhjälp på/av"
              >
                Ljudhjälp: {audioHelp ? 'På' : 'Av'}
              </button>
              <button
                className="settings-btn"
                onClick={() => setShowHelp(true)}
                aria-label="Hjälp"
                title="Hjälp"
              >
                Hjälp
              </button>
              <button
                className="settings-btn"
                onClick={() => setShowTutorial(true)}
                aria-label="Guide"
                title="Guide"
              >
                Guide
              </button>
              <button
                className="settings-btn"
                onClick={() => setShowLeaderboard((v) => !v)}
                aria-label="Topplista"
                title="Topplista"
              >
                {showLeaderboard ? 'Stäng topplista' : 'Topplista'}
              </button>
            </div>
          <div className="stat-grid">
            <div className={`stat-pill ${timeLimitEnabled && timeLeft <= 10 ? 'danger' : ''}`}>
                ⏳ {timeLimitEnabled ? `${timeLeft}s` : '∞'}
              </div>
              <div className="stat-pill">
                🔥 {streak} <span className="muted">(max {bestStreak})</span>
              </div>
              <div className="stat-pill">
                🎯 {accuracy}%
              </div>
              <div className="stat-pill">
                ⭐ {roundScore}p
              </div>
              <div className="stat-pill">
                ⚙️ {difficultySettings[difficulty].label}
              </div>
            </div>
            {showLeaderboard && (
              <div className="leaderboard-card">
                <Leaderboard />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
