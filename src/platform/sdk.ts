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

export interface LeaderboardEntry {
  user_name: string
  score: number
  created_at?: string
}

function canUseLeaderboardApi() {
  return typeof window !== 'undefined' && '__NEXT_DATA__' in window
}

export function createLocalSession(game: GameDefinition): GameSession {
  const now = new Date().toISOString()
  return {
    id: `local-${game.id}-${now}`,
    gameId: game.id,
    startedAt: now,
  }
}

export async function saveGameScore(game: GameDefinition | string, playerName: string, score: number) {
  const gameId = typeof game === 'string' ? game : game.id

  if (canUseLeaderboardApi()) {
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, name: playerName, score }),
      })
      if (res.ok) {
        return res.json()
      }
    } catch {
      // Fall back to the public Supabase client on Vite / GitHub Pages.
    }
  }

  return saveScore(gameId, playerName, score)
}

export async function fetchGameLeaderboard(
  game: GameDefinition | string,
  limit = 10,
): Promise<LeaderboardEntry[]> {
  const gameId = typeof game === 'string' ? game : game.id

  if (canUseLeaderboardApi()) {
    try {
      const url = new URL('/api/leaderboard', window.location.origin)
      url.searchParams.set('gameId', gameId)
      url.searchParams.set('limit', String(limit))
      const res = await fetch(url.toString())
      if (res.ok) {
        const payload: unknown = await res.json()
        if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
          return (payload as { data: LeaderboardEntry[] }).data
        }
      }
    } catch {
      // Fall back below.
    }
  }

  return (await fetchTopScores(gameId, limit)) ?? []
}
