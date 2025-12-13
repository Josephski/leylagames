import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL

const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_KEY

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.VITE_SUPABASE_KEY

const API_KEY = process.env.LEADERBOARD_API_KEY

type RateEntry = { reset: number; count: number }

declare global {
  // eslint-disable-next-line no-var
  var __leaderboardCache: Map<string, CacheEntry> | undefined
  // eslint-disable-next-line no-var
  var __leaderboardRate: Map<string, RateEntry> | undefined
}

type CacheEntry = { expires: number; data: any }
const cache = globalThis.__leaderboardCache || new Map<string, CacheEntry>()
globalThis.__leaderboardCache = cache

const CACHE_TTL_MS = 15_000
const RATE_LIMIT_WINDOW_MS = 10_000
const RATE_LIMIT_MAX = 30

const rateMap = globalThis.__leaderboardRate || new Map<string, RateEntry>()
globalThis.__leaderboardRate = rateMap

function getClient(mode: 'read' | 'write') {
  if (!SUPABASE_URL) {
    throw new Error('Supabase URL saknas')
  }
  if (mode === 'write') {
    if (!SUPABASE_SERVICE_KEY) {
      throw new Error('Supabase service key saknas (writes kräver SERVICE_ROLE)')
    }
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  if (!SUPABASE_ANON_KEY) {
    throw new Error('Supabase anon key saknas (reads kräver public key)')
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

function sanitizeName(name: string) {
  return name.trim().substring(0, 40) || 'Spelare'
}

function clampScore(score: number) {
  if (Number.isNaN(score)) return 0
  return Math.max(0, Math.min(score, 10_000_000))
}

function rateLimit(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown'
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || entry.reset < now) {
    rateMap.set(ip, { reset: now + RATE_LIMIT_WINDOW_MS, count: 1 })
    return null
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.max(0, Math.ceil((entry.reset - now) / 1000))
    return retryAfter
  }
  entry.count += 1
  rateMap.set(ip, entry)
  return null
}

export async function GET(req: NextRequest) {
  const retryAfter = rateLimit(req)
  if (retryAfter !== null) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
  }

  const { searchParams } = new URL(req.url)
  const gameId = searchParams.get('gameId')
  const limit = Number(searchParams.get('limit') || '10')

  if (!gameId) {
    return NextResponse.json({ error: 'gameId saknas' }, { status: 400 })
  }

  const cacheKey = `${gameId}:${limit}`
  const now = Date.now()
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > now) {
    return NextResponse.json({ data: cached.data, cached: true })
  }

  try {
    const supabase = getClient('read')
    const { data, error } = await supabase
      .from('leaderboards')
      .select('user_name,score,created_at')
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(isNaN(limit) ? 10 : limit)

    if (error) {
      throw error
    }

    cache.set(cacheKey, { data, expires: now + CACHE_TTL_MS })

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Kunde inte hämta topplista' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const retryAfter = rateLimit(req)
  if (retryAfter !== null) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
  }

  if (API_KEY) {
    const provided =
      req.headers.get('x-api-key') ||
      new URL(req.url).searchParams.get('key') ||
      (await req.clone().json().catch(() => ({})) as any)?.key
    if (provided !== API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const body = await req.json().catch(() => null)
  const gameId = body?.gameId as string | undefined
  const name = body?.name as string | undefined
  const score = clampScore(Number(body?.score))

  if (!gameId || !name || Number.isNaN(score)) {
    return NextResponse.json({ error: 'gameId, name och score krävs' }, { status: 400 })
  }

  try {
    const supabase = getClient('write')
    const { error } = await supabase
      .from('leaderboards')
      .insert([{ game_id: gameId, user_name: sanitizeName(name), score }])

    if (error) {
      throw error
    }

    cache.delete(`${gameId}:10`)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Kunde inte spara poäng' }, { status: 500 })
  }
}
