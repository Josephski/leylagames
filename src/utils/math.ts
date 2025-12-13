export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}
