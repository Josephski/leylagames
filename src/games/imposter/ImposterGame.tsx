'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IMPOSTER_CATEGORIES } from '../../data/imposterWords'
import { useLanguage } from '../../i18n/LanguageProvider'
import { LanguageSelect } from '../../i18n/LanguageSelect'
import { translateList } from '../../i18n/translations'
import { useCurrentGame } from '../../platform/GameContext'
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  assignImposters,
  displayWord,
  getPlayer,
  guessMatchesWord,
  majorityVote,
  maxImposters,
  newPlayerId,
  newRoomCode,
  suggestedImposters,
  type ImposterPlayer,
  type ImposterRoom,
} from './engine'
import {
  fetchRoom,
  fetchRoomRetry,
  imposterJoinUrl,
  isSupabaseConfigured,
  patchRoom,
  saveRoom,
  subscribeRoom,
} from './room'
import { pickImposterWord } from '../../data/imposterWords'
import { InviteQr } from './InviteQr'
import {
  connectGuestWithRetry,
  guestJoin,
  startHostPeer,
  stopPeerSync,
  waitForPeerRoom,
} from './peerSync'
import './ImposterGame.css'

const NAME_KEY = 'imposter-player-name'
const ID_KEY = 'imposter-player-id'
const LOCALS_KEY = 'imposter-local-ids'

function readRoomFromUrl() {
  if (typeof window === 'undefined') return ''
  return (new URLSearchParams(window.location.search).get('room') || '').toUpperCase()
}

function readStoredId() {
  if (typeof window === 'undefined') return newPlayerId()
  const existing = window.sessionStorage.getItem(ID_KEY)
  if (existing) return existing
  const id = newPlayerId()
  window.sessionStorage.setItem(ID_KEY, id)
  return id
}

function readLocals(code: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.sessionStorage.getItem(`${LOCALS_KEY}-${code}`)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeLocals(code: string, ids: string[]) {
  window.sessionStorage.setItem(`${LOCALS_KEY}-${code}`, JSON.stringify(ids))
}

function syncRoomUrl(code: string) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('room', code)
  window.history.replaceState(null, '', url.toString())
}

function clearRoomUrl() {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.delete('room')
  window.history.replaceState(null, '', url.toString())
}

function oneWord(value: string) {
  return value.trim().split(/\s+/)[0]?.slice(0, 24) ?? ''
}

function settleMobileViewport() {
  if (typeof window === 'undefined') return
  const focused = document.activeElement
  if (focused instanceof HTMLElement) focused.blur()
  window.scrollTo(0, 0)
  window.setTimeout(() => window.scrollTo(0, 0), 50)
  window.setTimeout(() => window.scrollTo(0, 0), 320)
}

function emptyRoom(code: string, host: ImposterPlayer): ImposterRoom {
  return {
    code,
    version: 0,
    phase: 'lobby',
    categoryId: 'animals',
    word: { en: '', ar: '', sv: '' },
    imposterCount: 1,
    players: [host],
    clueOrder: [],
    clues: [],
    votes: {},
    accusedId: null,
    guess: null,
    winner: null,
    discussEndsAt: null,
  }
}

export default function ImposterGame() {
  const { onExit } = useCurrentGame()
  const { language, t } = useLanguage()
  const rules = translateList(language, 'imposter.rules')

  const [selfId] = useState(readStoredId)
  const [name, setName] = useState(() =>
    typeof window === 'undefined' ? '' : window.localStorage.getItem(NAME_KEY) || '',
  )
  const [room, setRoom] = useState<ImposterRoom | null>(null)
  const [restoring, setRestoring] = useState(() => Boolean(readRoomFromUrl()))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [clue, setClue] = useState('')
  const [guess, setGuess] = useState('')
  const [activeId, setActiveId] = useState(selfId)
  const [localName, setLocalName] = useState('')
  const [now, setNow] = useState(Date.now())

  const creatingRef = useRef(false)
  const navLockedUntil = useRef(0)

  const me = room ? getPlayer(room, activeId) || getPlayer(room, selfId) : undefined
  const hostOnDevice = Boolean(
    room?.players.some(
      (player) => player.isHost && (player.id === selfId || readLocals(room.code).includes(player.id)),
    ),
  )
  const isHost = hostOnDevice
  const joinUrl = room ? imposterJoinUrl(room.code) : ''
  const roomCode = room?.code

  useEffect(() => {
    if (!roomCode) return
    let unsubscribe: (() => void) | undefined
    const timer = window.setTimeout(() => {
      unsubscribe = subscribeRoom(roomCode, (next) => setRoom(next))
    }, 150)
    return () => {
      window.clearTimeout(timer)
      unsubscribe?.()
    }
  }, [roomCode])

  useEffect(() => {
    const code = readRoomFromUrl()
    if (!code) {
      setRestoring(false)
      return
    }
    let cancelled = false
    void fetchRoom(code)
      .then((existing) => {
        if (cancelled) return
        if (existing?.players.some((player) => player.id === selfId)) {
          writeLocals(code, Array.from(new Set([...readLocals(code), selfId])))
          setActiveId(selfId)
          setRoom(existing)
          const mine = existing.players.find((player) => player.id === selfId)
          if (!isSupabaseConfigured) {
            if (mine?.isHost) void startHostPeer(code, existing, saveRoom)
            else void connectGuestWithRetry(code).catch(() => undefined)
          }
        }
        setRestoring(false)
      })
      .catch(() => {
        if (!cancelled) setRestoring(false)
      })
    return () => {
      cancelled = true
    }
  }, [selfId])

  useEffect(() => {
    if (room?.phase !== 'discuss' || !room.discussEndsAt) return
    const tick = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(tick)
  }, [room?.phase, room?.discussEndsAt])

  useEffect(() => {
    if (!room || room.phase !== 'clues') return
    const turnId = room.clueOrder[room.clues.length]
    if (turnId && readLocals(room.code).includes(turnId)) setActiveId(turnId)
  }, [room])

  useEffect(() => {
    if (!room || room.phase !== 'discuss' || !room.discussEndsAt || Date.now() < room.discussEndsAt) return
    void patchRoom(room.code, (current) =>
      current.phase === 'discuss' ? { ...current, phase: 'vote', discussEndsAt: null } : current,
    )
  }, [now, room])

  const categoryLabel = useCallback(
    (id: string) => t(`imposter.categories.${id}`),
    [t],
  )

  const rememberLocal = (code: string, playerId: string) => {
    const ids = Array.from(new Set([...readLocals(code), playerId]))
    writeLocals(code, ids)
  }

  const persistName = (value: string) => {
    setName(value)
    window.localStorage.setItem(NAME_KEY, value)
  }

  const handleError = (err: unknown, fallback: string) => {
    const message = err instanceof Error ? err.message : fallback
    const map: Record<string, string> = {
      missing: t('imposter.roomMissing'),
      full: t('imposter.roomFull'),
      started: t('imposter.alreadyStarted'),
      nameless: t('imposter.nameNeeded'),
    }
    setError(map[message] || fallback)
  }

  const createGame = async () => {
    if (creatingRef.current) return
    const trimmed = name.trim()
    if (!trimmed) return setError(t('imposter.nameNeeded'))
    creatingRef.current = true
    navLockedUntil.current = Date.now() + 700
    setBusy(true)
    setError('')
    persistName(trimmed)
    const host: ImposterPlayer = {
      id: selfId,
      name: trimmed,
      isHost: true,
      isImposter: false,
      ready: false,
      joinedVia: 'local',
    }
    const created = emptyRoom(newRoomCode(), host)
    rememberLocal(created.code, selfId)
    syncRoomUrl(created.code)
    setActiveId(selfId)
    setRoom(created)
    setBusy(false)
    settleMobileViewport()
    try {
      await saveRoom(created)
      if (!isSupabaseConfigured) {
        window.setTimeout(() => {
          void startHostPeer(created.code, created, saveRoom)
        }, 450)
      }
    } catch (err) {
      handleError(err, t('imposter.shareFailed'))
      setRoom(null)
      clearRoomUrl()
    } finally {
      creatingRef.current = false
    }
  }

  const joinGame = async () => {
    const trimmedName = name.trim()
    const trimmedCode = readRoomFromUrl()
    if (!trimmedName) return setError(t('imposter.nameNeeded'))
    if (!/^[A-Z0-9]{6}$/.test(trimmedCode)) return setError(t('imposter.invalidCode'))
    setBusy(true)
    setError('')
    try {
      persistName(trimmedName)
      let existing = await fetchRoomRetry(trimmedCode)
      if (!existing && !isSupabaseConfigured) existing = await connectGuestWithRetry(trimmedCode)
      if (!existing) throw new Error('missing')
      const already = existing.players.find((player) => player.id === selfId)
      if (already) {
        if (!already.isHost && !isSupabaseConfigured) void connectGuestWithRetry(trimmedCode).catch(() => undefined)
        rememberLocal(trimmedCode, selfId)
        syncRoomUrl(trimmedCode)
        setActiveId(selfId)
        setRoom(existing)
        return
      }
      if (existing.phase !== 'lobby') throw new Error('started')
      if (existing.players.length >= MAX_PLAYERS) throw new Error('full')
      const guest: ImposterPlayer = {
        id: selfId,
        name: trimmedName,
        isHost: false,
        isImposter: false,
        ready: false,
        joinedVia: 'qr',
      }
      if (!isSupabaseConfigured) {
        guestJoin(guest)
        const next = await waitForPeerRoom((current) => current.players.some((player) => player.id === selfId))
        rememberLocal(trimmedCode, selfId)
        syncRoomUrl(trimmedCode)
        setActiveId(selfId)
        setRoom(next)
        return
      }
      const next = await patchRoom(trimmedCode, (current) => {
        if (current.players.some((player) => player.id === selfId)) return current
        if (current.phase !== 'lobby') throw new Error('started')
        if (current.players.length >= MAX_PLAYERS) throw new Error('full')
        return {
          ...current,
          players: [...current.players, guest],
        }
      })
      rememberLocal(trimmedCode, selfId)
      syncRoomUrl(trimmedCode)
      setActiveId(selfId)
      setRoom(next)
    } catch (err) {
      handleError(err, t('imposter.roomMissing'))
    } finally {
      setBusy(false)
    }
  }

  const updateLobby = (partial: Partial<ImposterRoom>) => {
    if (!room || !isHost) return
    if (room.phase !== 'lobby' && room.phase !== 'result') return
    void patchRoom(room.code, (current) => ({ ...current, ...partial }))
  }

  const addLocalPlayer = async () => {
    if (!room || room.phase !== 'lobby') return
    const trimmed = localName.trim()
    if (!trimmed) return setError(t('imposter.nameNeeded'))
    if (room.players.length >= MAX_PLAYERS) return setError(t('imposter.roomFull'))
    const id = newPlayerId()
    const next = await patchRoom(room.code, (current) => {
      if (current.players.length >= MAX_PLAYERS) throw new Error('full')
      return {
        ...current,
        players: [...current.players, { id, name: trimmed, isHost: false, isImposter: false, ready: false, joinedVia: 'local' }],
      }
    })
    rememberLocal(room.code, id)
    setLocalName('')
    setRoom(next)
  }

  const startGame = async () => {
    if (!room || !isHost) return
    if (room.players.length < MIN_PLAYERS) return setError(t('imposter.needPlayers', { count: MIN_PLAYERS }))
    const count = Math.min(room.imposterCount, maxImposters(room.players.length))
    await patchRoom(room.code, (current) => {
      const assigned = assignImposters(current.players, count)
      const order = [...assigned].sort(() => Math.random() - 0.5).map((player) => player.id)
      return {
        ...current,
        phase: 'reveal',
        word: pickImposterWord(current.categoryId),
        imposterCount: count,
        players: assigned,
        clueOrder: order,
        clues: [],
        votes: {},
        accusedId: null,
        guess: null,
        winner: null,
        discussEndsAt: null,
      }
    })
    setRevealed(false)
  }

  const markReady = async () => {
    if (!room || !me) return
    await patchRoom(room.code, (current) => {
      const players = current.players.map((player) =>
        player.id === me.id ? { ...player, ready: true } : player,
      )
      const allReady = players.length >= MIN_PLAYERS && players.every((player) => player.ready)
      return { ...current, players, phase: allReady ? 'clues' : current.phase }
    })
    setRevealed(false)
    const locals = readLocals(room.code)
    const nextSeat = room.players.find((player) => locals.includes(player.id) && player.id !== me.id && !player.ready)
    if (nextSeat) setActiveId(nextSeat.id)
  }

  const sendClue = async () => {
    if (!room || !me) return
    const text = oneWord(clue)
    if (!text) return
    if (guessMatchesWord(text, room.word)) return setError(t('imposter.cluePlaceholder'))
    await patchRoom(room.code, (current) => {
      if (current.phase !== 'clues') return current
      const expected = current.clueOrder[current.clues.length]
      if (expected !== me.id) return current
      const clues = [...current.clues, { playerId: me.id, text }]
      const done = clues.length === current.players.length
      return {
        ...current,
        clues,
        phase: done ? 'discuss' : 'clues',
        discussEndsAt: done ? Date.now() + 60_000 : null,
      }
    })
    setClue('')
    setError('')
  }

  const startVote = () => {
    if (!room) return
    void patchRoom(room.code, (current) =>
      current.phase === 'discuss' ? { ...current, phase: 'vote', discussEndsAt: null } : current,
    )
  }

  const castVote = (targetId: string) => {
    if (!room || !me || targetId === me.id) return
    void patchRoom(room.code, (current) => {
      if (current.phase !== 'vote') return current
      const votes = { ...current.votes, [me.id]: targetId }
      if (Object.keys(votes).length < current.players.length) {
        return { ...current, votes }
      }
      const accusedId = majorityVote(
        votes,
        current.players.map((player) => player.id),
      )
      if (!accusedId) {
        return { ...current, votes, accusedId: null, winner: 'imposters', phase: 'result' }
      }
      const accused = current.players.find((player) => player.id === accusedId)
      if (!accused?.isImposter) {
        return { ...current, votes, accusedId, winner: 'imposters', phase: 'result' }
      }
      return { ...current, votes, accusedId, phase: 'guess' }
    })
  }

  const submitGuess = async (gaveUp = false) => {
    if (!room || !me?.isImposter) return
    const text = guess.trim()
    await patchRoom(room.code, (current) => {
      if (current.phase !== 'guess') return current
      const correct = !gaveUp && guessMatchesWord(text, current.word)
      return {
        ...current,
        guess: gaveUp ? '' : text,
        winner: correct ? 'imposters' : 'civilians',
        phase: 'result',
      }
    })
  }

  const playAgain = () => {
    if (!room || !isHost) return
    void patchRoom(room.code, (current) => ({
      ...current,
      phase: 'lobby',
      word: { en: '', ar: '', sv: '' },
      players: current.players.map((player) => ({ ...player, isImposter: false, ready: false })),
      clueOrder: [],
      clues: [],
      votes: {},
      accusedId: null,
      guess: null,
      winner: null,
      discussEndsAt: null,
      imposterCount: suggestedImposters(current.players.length),
    }))
    setRevealed(false)
  }

  const kick = (playerId: string) => {
    if (!room || !isHost || playerId === selfId) return
    void patchRoom(room.code, (current) => ({
      ...current,
      players: current.players.filter((player) => player.id !== playerId),
    }))
  }

  const leave = () => {
    if (Date.now() < navLockedUntil.current) return
    if (room && me && !me.isHost) {
      void patchRoom(room.code, (current) => ({
        ...current,
        players: current.players.filter((player) => player.id !== selfId),
      }))
    }
    setRoom(null)
    clearRoomUrl()
    stopPeerSync()
    onExit?.()
  }

  const copyLink = async () => {
    if (!joinUrl) return
    try {
      await navigator.clipboard.writeText(joinUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setError(t('imposter.shareFailed'))
    }
  }

  const wordLabel = room?.word.en ? displayWord(room.word, language) : ''
  const remainingDiscuss =
    room?.discussEndsAt ? Math.max(0, Math.ceil((room.discussEndsAt - now) / 1000)) : 0

  const localPlayers = useMemo(() => {
    if (!room) return []
    const ids = readLocals(room.code)
    return room.players.filter((player) => ids.includes(player.id))
  }, [room])

  if (restoring && !room) {
    return (
      <div className="imposter-page">
        <main className="imposter-card">
          <p className="imposter-tagline">{t('games.imposter.name')}</p>
        </main>
      </div>
    )
  }

  if (!room) {
    const invited = Boolean(readRoomFromUrl())
    return (
      <div className="imposter-page">
        <header className="imposter-top">
          <button type="button" className="imposter-text-btn" onClick={() => onExit?.()}>
            {t('flagGame.backShort')}
          </button>
          <h1>{t('games.imposter.name')}</h1>
          <span />
        </header>
        <main className="imposter-card">
          <LanguageSelect id="imposter-lang" variant="pills" />
          <h2>{invited ? t('imposter.invitedTitle') : t('imposter.hostTitle')}</h2>
          <p className="imposter-tagline">{invited ? t('imposter.invitedLead') : t('imposter.hostLead')}</p>
          <label className="imposter-field">
            {t('imposter.yourName')}
            <input
              value={name}
              onChange={(e) => persistName(e.target.value)}
              placeholder={t('imposter.namePlaceholder')}
              autoComplete="nickname"
              maxLength={18}
            />
          </label>
          {invited ? (
            <button type="button" className="imposter-primary" onClick={() => void joinGame()} disabled={busy}>
              {t('imposter.joinCta')}
            </button>
          ) : (
            <button type="button" className="imposter-primary" onClick={() => void createGame()} disabled={busy}>
              {t('imposter.create')}
            </button>
          )}
          {error && <p className="imposter-error">{error}</p>}
          <section className="imposter-rules">
            <h2>{t('imposter.rulesTitle')}</h2>
            <ol>
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </section>
        </main>
      </div>
    )
  }

  const currentClueId = room.clueOrder[room.clues.length]
  const currentCluePlayer = getPlayer(room, currentClueId)

  return (
    <div className="imposter-page">
      <header className="imposter-top">
        <button type="button" className="imposter-text-btn" onClick={leave}>
          {t('imposter.leave')}
        </button>
        <div className="imposter-code-chip" aria-label={t('imposter.roomCode')}>
          {room.code}
        </div>
        <span className="imposter-phase">{t(`imposter.${room.phase === 'lobby' ? 'lobby' : 'tagline'}`)}</span>
      </header>

      {localPlayers.length > 1 && room.phase !== 'result' && (
        <div className="imposter-seats" role="tablist">
          {localPlayers.map((player) => (
            <button
              key={player.id}
              type="button"
              className={player.id === me?.id ? 'is-active' : ''}
              onClick={() => {
                setActiveId(player.id)
                setRevealed(false)
              }}
            >
              {player.name}
            </button>
          ))}
        </div>
      )}

      {room.phase === 'lobby' && (
        <main className="imposter-card">
          <h2>{isHost ? t('imposter.hostTitle') : t('imposter.lobby')}</h2>
          {isHost && (
            <section className="imposter-invite">
              <h3>{t('imposter.showQrTitle')}</h3>
              <p>{t('imposter.showQrLead')}</p>
              <InviteQr url={joinUrl} alt={t('imposter.scanQr')} />
              <p className="imposter-code-readout">{room.code}</p>
              <p className="imposter-link">{joinUrl}</p>
              <p>{t('imposter.wifiHint')}</p>
              <button type="button" className="imposter-secondary" onClick={() => void copyLink()}>
                {copied ? t('imposter.copied') : t('imposter.copyLink')}
              </button>
            </section>
          )}
          <p className={isSupabaseConfigured ? 'imposter-ok' : 'imposter-warn'}>
            {isSupabaseConfigured ? t('imposter.onlineReady') : t('imposter.localOnly')}
          </p>
          <h3>{t('imposter.players', { count: room.players.length, max: MAX_PLAYERS })}</h3>
          <p className="imposter-waiting">{t('imposter.waitingJoiners')}</p>
          <ul className="imposter-players">
            {room.players.map((player) => (
              <li key={player.id} className={player.joinedVia === 'qr' ? 'via-qr' : undefined}>
                <span>
                  {player.name}
                  {player.isHost ? ` · ${t('imposter.host')}` : ''}
                  {player.id === me?.id ? ` · ${t('imposter.you')}` : ''}
                  {player.joinedVia === 'qr' ? ` · ${t('imposter.viaQr')}` : ''}
                </span>
                {isHost && !player.isHost && (
                  <button type="button" className="imposter-text-btn" onClick={() => kick(player.id)}>
                    {t('imposter.kick')}
                  </button>
                )}
              </li>
            ))}
          </ul>
          {isHost && (
            <>
              <label className="imposter-field">
                {t('imposter.category')}
                <select
                  value={room.categoryId}
                  onChange={(e) => updateLobby({ categoryId: e.target.value })}
                >
                  {IMPOSTER_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {categoryLabel(category.id)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="imposter-field">
                {t('imposter.imposters')}
                <select
                  value={room.imposterCount}
                  onChange={(e) => updateLobby({ imposterCount: Number(e.target.value) })}
                >
                  {Array.from({ length: maxImposters(Math.max(room.players.length, MIN_PLAYERS)) }, (_, i) => i + 1).map(
                    (count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </>
          )}
          {room.players.length < MAX_PLAYERS && (
            <div className="imposter-add-local">
              <input
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder={t('imposter.addOnPhone')}
                maxLength={18}
              />
              <button type="button" className="imposter-secondary" onClick={() => void addLocalPlayer()}>
                +
              </button>
            </div>
          )}
          {isHost ? (
            <button
              type="button"
              className="imposter-primary"
              onClick={() => void startGame()}
              disabled={room.players.length < MIN_PLAYERS}
            >
              {room.players.length < MIN_PLAYERS
                ? t('imposter.needPlayers', { count: MIN_PLAYERS })
                : t('imposter.start')}
            </button>
          ) : (
            <p>{t('imposter.waitingHost')}</p>
          )}
          {error && <p className="imposter-error">{error}</p>}
        </main>
      )}

      {room.phase === 'reveal' && me && (
        <main className="imposter-card imposter-reveal">
          <h2>{t('imposter.revealTitle')}</h2>
          {!revealed ? (
            <button type="button" className="imposter-primary" onClick={() => setRevealed(true)}>
              {t('imposter.tapReveal')} · {me.name}
            </button>
          ) : (
            <>
              <p className={me.isImposter ? 'imposter-role bad' : 'imposter-role good'}>
                {me.isImposter ? t('imposter.youAreImposter') : t('imposter.youAreCivilian')}
              </p>
              <p>{t('imposter.categoryHint', { category: categoryLabel(room.categoryId) })}</p>
              {me.isImposter ? (
                <p>{t('imposter.noWord')}</p>
              ) : (
                <p className="imposter-word">
                  {t('imposter.secretWord')}: {wordLabel}
                </p>
              )}
              <button type="button" className="imposter-secondary" onClick={() => void markReady()} disabled={me.ready}>
                {me.ready ? t('imposter.waitingReady') : t('imposter.ready')}
              </button>
              <button type="button" className="imposter-text-btn" onClick={() => setRevealed(false)}>
                {t('imposter.hideRole')}
              </button>
            </>
          )}
        </main>
      )}

      {room.phase === 'clues' && me && (
        <main className="imposter-card">
          <h2>{t('imposter.cluesTitle')}</h2>
          <p>{t('imposter.categoryHint', { category: categoryLabel(room.categoryId) })}</p>
          <p className="imposter-turn">
            {currentClueId === me.id
              ? t('imposter.yourTurn')
              : t('imposter.waitingTurn', { name: currentCluePlayer?.name || '…' })}
          </p>
          {currentClueId === me.id && (
            <div className="imposter-add-local">
              <input
                value={clue}
                onChange={(e) => setClue(e.target.value)}
                placeholder={t('imposter.cluePlaceholder')}
                maxLength={24}
              />
              <button type="button" className="imposter-primary" onClick={() => void sendClue()}>
                {t('imposter.sendClue')}
              </button>
            </div>
          )}
          <h3>{t('imposter.cluesList')}</h3>
          <ul className="imposter-clues">
            {room.clues.map((entry) => (
              <li key={entry.playerId}>
                <strong>{getPlayer(room, entry.playerId)?.name}:</strong> {entry.text}
              </li>
            ))}
          </ul>
          {error && <p className="imposter-error">{error}</p>}
        </main>
      )}

      {room.phase === 'discuss' && (
        <main className="imposter-card">
          <h2>{t('imposter.discussTitle')}</h2>
          <p>{t('imposter.discussLead')}</p>
          {room.discussEndsAt && <p className="imposter-timer">{remainingDiscuss}s</p>}
          <ul className="imposter-clues">
            {room.clues.map((entry) => (
              <li key={entry.playerId}>
                <strong>{getPlayer(room, entry.playerId)?.name}:</strong> {entry.text}
              </li>
            ))}
          </ul>
          <button type="button" className="imposter-primary" onClick={startVote}>
            {t('imposter.voteNow')}
          </button>
        </main>
      )}

      {room.phase === 'vote' && me && (
        <main className="imposter-card">
          <h2>{t('imposter.voteTitle')}</h2>
          <p>{t('imposter.voteLead')}</p>
          <div className="imposter-vote-grid">
            {room.players
              .filter((player) => player.id !== me.id)
              .map((player) => (
                <button
                  key={player.id}
                  type="button"
                  className={room.votes[me.id] === player.id ? 'is-picked' : ''}
                  onClick={() => castVote(player.id)}
                  disabled={Boolean(room.votes[me.id])}
                >
                  {player.name}
                </button>
              ))}
          </div>
          {room.votes[me.id] ? (
            <p>{t('imposter.youVoted', { name: getPlayer(room, room.votes[me.id])?.name || '' })}</p>
          ) : (
            <p>{t('imposter.waitingVotes')}</p>
          )}
        </main>
      )}

      {room.phase === 'guess' && (
        <main className="imposter-card">
          <h2>{t('imposter.guessTitle')}</h2>
          <p>{t('imposter.guessLead')}</p>
          <p>{t('imposter.accused', { name: getPlayer(room, room.accusedId || '')?.name || '' })}</p>
          {me?.isImposter ? (
            <>
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder={t('imposter.guessPlaceholder')}
              />
              <button type="button" className="imposter-primary" onClick={() => void submitGuess(false)}>
                {t('imposter.submitGuess')}
              </button>
              <button type="button" className="imposter-text-btn" onClick={() => void submitGuess(true)}>
                {t('imposter.skipGuess')}
              </button>
            </>
          ) : (
            <p>{t('imposter.waitingReady')}</p>
          )}
        </main>
      )}

      {room.phase === 'result' && (
        <main className="imposter-card">
          <h2>{room.winner === 'civilians' ? t('imposter.civiliansWin') : t('imposter.impostersWin')}</h2>
          <p className="imposter-word">{t('imposter.wordWas', { word: wordLabel })}</p>
          <p>
            {t('imposter.impostersWere', {
              names: room.players
                .filter((player) => player.isImposter)
                .map((player) => player.name)
                .join(', '),
            })}
          </p>
          {room.accusedId ? (
            <p>
              {t('imposter.accused', { name: getPlayer(room, room.accusedId)?.name || '' })}
              {!getPlayer(room, room.accusedId)?.isImposter ? ` — ${t('imposter.civilianAccused')}` : ''}
            </p>
          ) : (
            <p>{t('imposter.tie')}</p>
          )}
          {isHost && (
            <>
              <label className="imposter-field">
                {t('imposter.category')}
                <select
                  value={room.categoryId}
                  onChange={(e) => updateLobby({ categoryId: e.target.value })}
                >
                  {IMPOSTER_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {categoryLabel(category.id)}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="imposter-primary" onClick={() => void startGame()}>
                {t('imposter.startNow')}
              </button>
              <button type="button" className="imposter-secondary" onClick={playAgain}>
                {t('imposter.backToLobby')}
              </button>
            </>
          )}
        </main>
      )}
    </div>
  )
}
