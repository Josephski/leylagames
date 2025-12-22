import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchGameLeaderboard } from '../platform/sdk'
import { useCurrentGame } from '../platform/GameContext'
import { useLanguage } from '../i18n/LanguageProvider'

interface ScoreEntry {
  user_name: string
  score: number
  created_at?: string
}

export default function Leaderboard({ gameId }: { gameId?: string }) {
  const ctx = useCurrentGame()
  const { t } = useLanguage()
  const resolvedGameId = gameId ?? ctx.game.id
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchGameLeaderboard(resolvedGameId, 10)
      setScores(data || [])
    } catch (err: any) {
      setError(err.message || t('leaderboard.error'))
    } finally {
      setLoading(false)
    }
  }, [resolvedGameId, t])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>{t('leaderboard.title')}</h3>
      {!isSupabaseConfigured && (
        <div style={{ marginBottom: '0.5rem', color: '#555', fontSize: '0.9rem' }}>
          {t('leaderboard.configureNote')}
        </div>
      )}
      {loading && <div>{t('leaderboard.loading')}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && scores.length === 0 && (
        <div>{t('leaderboard.empty')}</div>
      )}
      <ol>
        {scores.map((s: ScoreEntry, i: number) => (
          <li key={`${s.user_name}-${i}`}>{s.user_name} – {s.score}</li>
        ))}
      </ol>
    </div>
  )
}
