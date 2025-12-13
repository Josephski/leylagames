import * as Sentry from '@sentry/react'

const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env?.[key]) return process.env[key]
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) return import.meta.env[key] as string
  return undefined
}

export function initSentry() {
  const dsn = getEnv('SENTRY_DSN') || getEnv('VITE_SENTRY_DSN')
  if (!dsn) return
  Sentry.init({
    dsn,
    environment: getEnv('SENTRY_ENVIRONMENT') || 'development',
    release: getEnv('SENTRY_RELEASE'),
    tracesSampleRate: 0.1,
  })
}
