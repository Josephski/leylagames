import type { GameDefinition } from './games'
import { saveScore, fetchTopScores } from '../lib/supabase'

export interface PlayerProfile {
  id: string
  displayName: string
  createdAt: string
}

export interface GameSession {
  id: string
  gameId: string
  startedAt: string
  finishedAt?: string
  score?: number
}

/**
 * En väldigt enkel “plattform‑SDK”.
 * Här kan vi successivt samla sådant som alla spel använder:
 * sessions, poäng, profiler, m.m.
 */

export function createLocalSession(game: GameDefinition): GameSession {
  const now = new Date().toISOString()
  return {
    id: `local-${game.id}-${now}`,
    gameId: game.id,
    startedAt: now,
  }
}

export async function saveGameScore(game: GameDefinition, playerName: string, score: number) {
  // Försök via Next API-route om den finns (Next-app), annars direkt mot Supabase (Vite).
  if (typeof window !== 'undefined' && window?.location?.pathname.startsWith('/')) {
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, name: playerName, score }),
      })
      if (res.ok) {
        return res.json()
      }
    } catch {
      // Faller tillbaka nedan
    }
  }
  return saveScore(game.id, playerName, score)
}

export async function fetchGameLeaderboard(game: GameDefinition | string, limit = 10) {
  const gameId = typeof game === 'string' ? game : game.id
  if (typeof window !== 'undefined' && window?.location?.pathname.startsWith('/')) {
    try {
      const url = new URL('/api/leaderboard', window.location.origin)
      url.searchParams.set('gameId', gameId)
      url.searchParams.set('limit', String(limit))
      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data?.data)) return data.data
      }
    } catch {
      // fallback nedan
    }
  }
  return fetchTopScores(gameId, limit)
}
