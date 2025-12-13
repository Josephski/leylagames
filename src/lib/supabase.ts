import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Miljöer: Vite (import.meta.env.VITE_*) och Next (process.env.NEXT_PUBLIC_*)
const SUPABASE_URL =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined) ||
  (typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_URL as string | undefined) : undefined)

const SUPABASE_KEY =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_KEY : undefined) ||
  (typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_KEY as string | undefined) : undefined)

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY)

const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_KEY!)
  : null

export async function saveScore(gameId: string, name: string, score: number) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY')
  }
  const { data, error } = await supabase.from('leaderboards').insert([{ game_id: gameId, user_name: name, score }])
  if (error) throw error
  return data
}

export async function fetchTopScores(gameId: string, limit = 10) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY')
  }
  const { data, error } = await supabase
    .from('leaderboards')
    .select('user_name,score,created_at')
    .eq('game_id', gameId)
    .order('score', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
