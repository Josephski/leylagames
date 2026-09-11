'use client'

import { useEffect } from 'react'
import { initSentry } from './sentry.client'

export function SentryInit() {
  useEffect(() => {
    initSentry()
  }, [])
  return null
}
