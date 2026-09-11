import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchGameLeaderboard, saveGameScore, type LeaderboardEntry } from '../platform/sdk'
import { useCurrentGame } from '../platform/GameContext'
import { useLanguage } from '../i18n/LanguageProvider'

export default function Leaderboard({
  gameId,
  currentScore = 0,
}: {
  gameId?: string
  currentScore?: number
}) {
  const ctx = useCurrentGame()
  const { t } = useLanguage()
  const resolvedGameId = gameId ?? ctx.game.id
  const [scores, setScores] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchGameLeaderboard(resolvedGameId, 10)
      setScores(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('leaderboard.error')
      setError(message || t('leaderboard.error'))
    } finally {
      setLoading(false)
    }
  }, [resolvedGameId, t])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    if (currentScore <= 0) {
      setError(t('leaderboard.needScore'))
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await saveGameScore(resolvedGameId, name.trim() || 'Spelare', currentScore)
      setSaved(true)
      await load()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('leaderboard.saveError')
      setError(message || t('leaderboard.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="leaderboard">
      <h3>{t('leaderboard.title')}</h3>
      {!isSupabaseConfigured && (
        <div className="leaderboard-note">{t('leaderboard.configureNote')}</div>
      )}
      <form
        className="leaderboard-form"
        onSubmit={(e) => {
          e.preventDefault()
          void handleSave()
        }}
      >
        <label htmlFor="leaderboard-name">{t('leaderboard.nameLabel')}</label>
        <input
          id="leaderboard-name"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('leaderboard.namePlaceholder')}
        />
        <button type="submit" className="btn btn-ghost" disabled={saving || currentScore <= 0}>
          {t('leaderboard.save')}
        </button>
      </form>
      {saved && <div className="leaderboard-saved">{t('leaderboard.saved')}</div>}
      {loading && <div>{t('leaderboard.loading')}</div>}
      {error && <div className="leaderboard-error">{error}</div>}
      {!loading && !error && scores.length === 0 && <div>{t('leaderboard.empty')}</div>}
      <ol>
        {scores.map((s, i) => (
          <li key={`${s.user_name}-${s.score}-${s.created_at ?? i}`}>
            {s.user_name} – {s.score}
          </li>
        ))}
      </ol>
    </div>
  )
}
