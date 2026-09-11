import { getSupabase, isSupabaseConfigured } from '../../lib/supabase'
import type { ImposterRoom } from './engine'
import {
  guestCommit,
  getPeerRoom,
  hostBroadcast,
  isGuestPeerConnected,
  watchPeerRoom,
} from './peerSync'

const TABLE = 'imposter_rooms'
const STORAGE_PREFIX = 'imposter-room-'
const CHANNEL = 'leyla-imposter-rooms'

export { isSupabaseConfigured }

function cloneRoom(room: ImposterRoom): ImposterRoom {
  return JSON.parse(JSON.stringify(room)) as ImposterRoom
}

function storageKey(code: string) {
  return `${STORAGE_PREFIX}${code}`
}

function readLocalRoom(code: string): ImposterRoom | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey(code))
    return raw ? (JSON.parse(raw) as ImposterRoom) : null
  } catch {
    return null
  }
}

function writeLocalRoom(room: ImposterRoom) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(room.code), JSON.stringify(room))
    window.dispatchEvent(new CustomEvent(CHANNEL, { detail: room }))
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL)
      channel.postMessage(room)
      channel.close()
    }
  } catch {
    // Private mode / quota
  }
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function fetchRoom(code: string): Promise<ImposterRoom | null> {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase.from(TABLE).select('payload').eq('code', code).maybeSingle()
    if (!error && data?.payload) {
      const room = data.payload as ImposterRoom
      writeLocalRoom(room)
      return room
    }
  }
  return readLocalRoom(code) ?? (getPeerRoom()?.code === code ? getPeerRoom() : null)
}

export async function fetchRoomRetry(code: string, attempts = 8, delayMs = 400) {
  let room = await fetchRoom(code)
  for (let attempt = 1; attempt < attempts && !room; attempt += 1) {
    await wait(delayMs)
    room = await fetchRoom(code)
  }
  return room
}

export async function saveRoom(room: ImposterRoom) {
  writeLocalRoom(room)
  hostBroadcast(room)
  const supabase = getSupabase()
  if (!supabase) return
  const { error } = await supabase.from(TABLE).upsert({
    code: room.code,
    payload: room,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function patchRoom(code: string, mutator: (room: ImposterRoom) => ImposterRoom) {
  const current = (await fetchRoom(code)) ?? null
  if (!current) throw new Error('missing')
  const next = mutator(cloneRoom(current))
  next.version = (current.version ?? 0) + 1
  if (isGuestPeerConnected()) {
    guestCommit(current.version ?? 0, next)
    writeLocalRoom(next)
    return next
  }
  let lastError: unknown
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await saveRoom(next)
      return next
    } catch (error) {
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error('save-failed')
}

export function subscribeRoom(code: string, onRoom: (room: ImposterRoom) => void) {
  let active = true
  const notify = (room: ImposterRoom | null) => {
    if (active && room && room.code === code) onRoom(room)
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey(code) || !event.newValue) return
    try {
      notify(JSON.parse(event.newValue) as ImposterRoom)
    } catch {
      // ignore
    }
  }
  const onLocal = (event: Event) => {
    notify((event as CustomEvent<ImposterRoom>).detail)
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener(CHANNEL, onLocal)
  const unwatchPeer = watchPeerRoom(notify)

  let broadcast: BroadcastChannel | null = null
  if ('BroadcastChannel' in window) {
    broadcast = new BroadcastChannel(CHANNEL)
    broadcast.onmessage = (event) => notify(event.data as ImposterRoom)
  }

  const supabase = getSupabase()
  const realtime = supabase
    ? supabase
        .channel(`imposter:${code}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: TABLE, filter: `code=eq.${code}` },
          (payload) => {
            const row = payload.new as { payload?: ImposterRoom } | null
            if (row?.payload) notify(row.payload)
          },
        )
        .subscribe()
    : null

  const poll = window.setInterval(() => {
    void fetchRoom(code).then(notify)
  }, 2000)

  const kickoff = window.setTimeout(() => {
    void fetchRoom(code).then(notify)
  }, 0)

  return () => {
    active = false
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CHANNEL, onLocal)
    unwatchPeer()
    broadcast?.close()
    window.clearInterval(poll)
    window.clearTimeout(kickoff)
    if (realtime && supabase) void supabase.removeChannel(realtime)
  }
}

export function shareOrigin() {
  if (typeof window === 'undefined') return ''
  const host = window.location.hostname
  const lan = typeof __DEV_LAN_ORIGIN__ === 'string' ? __DEV_LAN_ORIGIN__ : ''
  if ((host === 'localhost' || host === '127.0.0.1') && lan) return lan
  return window.location.origin
}

export function imposterJoinUrl(code: string) {
  if (typeof window === 'undefined') return ''
  const base = import.meta.env.BASE_URL || '/'
  const root = `${shareOrigin()}${base.endsWith('/') ? base : `${base}/`}`
  return `${root}?room=${encodeURIComponent(code)}`
}
