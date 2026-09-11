const isBrowser = () => typeof window !== 'undefined'

export function readLocal(key: string, fallback: string): string {
  if (!isBrowser()) return fallback
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export function writeLocal(key: string, value: string) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Private mode / quota — ignore.
  }
}

export function readLocalFlag(key: string, fallback: boolean): boolean {
  const raw = readLocal(key, fallback ? '1' : '0')
  return raw === '1'
}

export function readLocalNumber(key: string, fallback: number): number {
  const asNumber = Number(readLocal(key, String(fallback)))
  return Number.isFinite(asNumber) ? asNumber : fallback
}
