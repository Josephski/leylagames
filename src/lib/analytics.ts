export type AnalyticsEvent =
  | 'game_open'
  | 'imposter_room_created'
  | 'imposter_join'
  | 'imposter_round_started'
  | 'imposter_round_finished'

type Props = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Props }) => void
  }
}

export function initAnalytics() {
  if (typeof document === 'undefined') return
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined
  if (!domain || document.querySelector('script[data-analytics="plausible"]')) return
  const script = document.createElement('script')
  script.defer = true
  script.dataset.domain = domain
  script.dataset.analytics = 'plausible'
  script.src = 'https://plausible.io/js/script.js'
  document.head.appendChild(script)
}

export function track(event: AnalyticsEvent, props?: Props) {
  if (typeof window === 'undefined') return
  window.plausible?.(event, props ? { props } : undefined)
}
