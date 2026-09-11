import type { DataConnection, Peer } from 'peerjs'
import type { ImposterPlayer, ImposterRoom } from './engine'

type PeerMsg =
  | { type: 'state'; room: ImposterRoom }
  | { type: 'join'; player: ImposterPlayer }
  | { type: 'commit'; baseVersion: number; room: ImposterRoom }
  | { type: 'error'; error: string }

const listeners = new Set<(room: ImposterRoom) => void>()
const hostConns = new Set<DataConnection>()

let hostPeer: Peer | null = null
let guestPeer: Peer | null = null
let guestConn: DataConnection | null = null
let latest: ImposterRoom | null = null
let hostCode = ''
let persist: ((room: ImposterRoom) => Promise<void>) | null = null

function peerIdFor(code: string) {
  return `leyla-imp-${code.toLowerCase()}`
}

function emit(room: ImposterRoom) {
  latest = room
  for (const listener of listeners) listener(room)
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function loadPeer() {
  const mod = await import('peerjs')
  return mod.default
}

function waitPeerOpen(peer: Peer) {
  return new Promise<void>((resolve, reject) => {
    if (peer.open) {
      resolve()
      return
    }
    const fail = (error: unknown) => reject(error instanceof Error ? error : new Error('peer'))
    peer.once('open', () => resolve())
    peer.once('error', fail)
  })
}

function waitConnOpen(conn: DataConnection) {
  return new Promise<void>((resolve, reject) => {
    if (conn.open) {
      resolve()
      return
    }
    conn.once('open', () => resolve())
    conn.once('error', (error) => reject(error instanceof Error ? error : new Error('conn')))
    window.setTimeout(() => reject(new Error('missing')), 8000)
  })
}

function send(conn: DataConnection, msg: PeerMsg) {
  if (conn.open) conn.send(msg)
}

function broadcast(room: ImposterRoom) {
  latest = room
  for (const conn of hostConns) send(conn, { type: 'state', room })
  emit(room)
}

async function onHostMessage(msg: PeerMsg) {
  if (!latest) return
  if (msg.type === 'join') {
    if (latest.phase !== 'lobby') return
    if (latest.players.some((player) => player.id === msg.player.id)) {
      broadcast(latest)
      return
    }
    if (latest.players.length >= 15) return
    const next: ImposterRoom = {
      ...latest,
      version: (latest.version ?? 0) + 1,
      players: [...latest.players, { ...msg.player, joinedVia: 'qr', isHost: false }],
    }
    if (persist) await persist(next)
    broadcast(next)
    return
  }
  if (msg.type === 'commit') {
    if ((latest.version ?? 0) !== msg.baseVersion) {
      broadcast(latest)
      return
    }
    const next = { ...msg.room, version: (latest.version ?? 0) + 1, code: latest.code }
    if (persist) await persist(next)
    broadcast(next)
  }
}

export function watchPeerRoom(onRoom: (room: ImposterRoom) => void) {
  listeners.add(onRoom)
  return () => listeners.delete(onRoom)
}

export function getPeerRoom() {
  return latest
}

export function isGuestPeerConnected() {
  return Boolean(guestConn?.open)
}

export function isHostPeerReady() {
  return Boolean(hostPeer?.open)
}

export async function startHostPeer(code: string, room: ImposterRoom, save: (next: ImposterRoom) => Promise<void>) {
  persist = save
  latest = room
  hostCode = code
  if (hostPeer?.open && hostCode === code) {
    broadcast(room)
    return
  }
  stopPeerSync()
  persist = save
  latest = room
  hostCode = code
  const Peer = await loadPeer()
  const peer = new Peer(peerIdFor(code))
  hostPeer = peer
  await waitPeerOpen(peer)
  peer.on('connection', (conn) => {
    hostConns.add(conn)
    conn.on('open', () => {
      if (latest) send(conn, { type: 'state', room: latest })
    })
    conn.on('data', (data) => {
      void onHostMessage(data as PeerMsg)
    })
    conn.on('close', () => hostConns.delete(conn))
  })
}

export async function startGuestPeer(code: string) {
  stopPeerSync()
  const Peer = await loadPeer()
  const peer = new Peer()
  guestPeer = peer
  await waitPeerOpen(peer)
  const conn = peer.connect(peerIdFor(code), { reliable: true })
  guestConn = conn
  await waitConnOpen(conn)
  return new Promise<ImposterRoom>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('missing')), 10000)
    conn.on('data', (data) => {
      const msg = data as PeerMsg
      if (msg.type === 'state' && msg.room) {
        window.clearTimeout(timer)
        emit(msg.room)
        resolve(msg.room)
      }
      if (msg.type === 'error') {
        window.clearTimeout(timer)
        reject(new Error(msg.error))
      }
    })
  })
}

export async function connectGuestWithRetry(code: string) {
  let lastError: unknown
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await startGuestPeer(code)
    } catch (error) {
      lastError = error
      stopPeerSync()
      await wait(600)
    }
  }
  throw lastError instanceof Error ? lastError : new Error('missing')
}

export function guestJoin(player: ImposterPlayer) {
  if (!guestConn?.open) return
  send(guestConn, { type: 'join', player })
}

export function guestCommit(baseVersion: number, room: ImposterRoom) {
  if (!guestConn?.open) return
  send(guestConn, { type: 'commit', baseVersion, room })
}

export function hostBroadcast(room: ImposterRoom) {
  if (!hostPeer?.open) return
  broadcast(room)
}

export function waitForPeerRoom(ok: (room: ImposterRoom) => boolean, timeoutMs = 8000) {
  if (latest && ok(latest)) return Promise.resolve(latest)
  return new Promise<ImposterRoom>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      unsubscribe()
      reject(new Error('missing'))
    }, timeoutMs)
    const unsubscribe = watchPeerRoom((room) => {
      if (!ok(room)) return
      window.clearTimeout(timer)
      unsubscribe()
      resolve(room)
    })
  })
}

export function stopPeerSync() {
  for (const conn of hostConns) conn.close()
  hostConns.clear()
  guestConn?.close()
  guestConn = null
  hostPeer?.destroy()
  guestPeer?.destroy()
  hostPeer = null
  guestPeer = null
  persist = null
  hostCode = ''
}
