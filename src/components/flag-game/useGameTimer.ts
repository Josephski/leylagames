import { useCallback, useEffect, useRef, useState } from 'react'

export function useGameTimer({
  enabled,
  seconds,
  running,
  roundKey,
  onExpire,
}: {
  enabled: boolean
  seconds: number
  running: boolean
  roundKey: string | number
  onExpire: () => void
}) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  const reset = useCallback(() => {
    expiredRef.current = false
    setTimeLeft(seconds)
  }, [seconds])

  useEffect(() => {
    if (!running) return
    reset()
  }, [running, reset, roundKey, enabled])

  useEffect(() => {
    if (!enabled || !running) return

    const id = window.setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => window.clearInterval(id)
  }, [enabled, running, seconds])

  useEffect(() => {
    if (!enabled || !running || timeLeft > 0 || expiredRef.current) return
    expiredRef.current = true
    onExpireRef.current()
  }, [enabled, running, timeLeft])

  return { timeLeft, setTimeLeft, reset }
}
