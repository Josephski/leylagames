import type { ReactNode } from 'react'

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  )
}

export const IconSound = () => (
  <Svg>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" {...stroke} />
    <path d="M15.5 8.5a4.5 4.5 0 0 1 0 7" {...stroke} />
    <path d="M18.2 6a7.5 7.5 0 0 1 0 12" {...stroke} />
  </Svg>
)

export const IconSoundOff = () => (
  <Svg>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" {...stroke} />
    <path d="m22 9-6 6M16 9l6 6" {...stroke} />
  </Svg>
)

export const IconEye = () => (
  <Svg>
    <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" {...stroke} />
    <circle cx="12" cy="12" r="2.4" {...stroke} />
  </Svg>
)

export const IconEyeOff = () => (
  <Svg>
    <path d="m4 4 16 16" {...stroke} />
    <path d="M9.9 5.7A9.3 9.3 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3.2 3.5" {...stroke} />
    <path d="M6.6 7.8C4.2 9.6 2.5 12 2.5 12S6 18.5 12 18.5c1.3 0 2.5-.3 3.6-.7" {...stroke} />
  </Svg>
)

export const IconSkip = () => (
  <Svg>
    <path d="m6 6 8 6-8 6V6Z" {...stroke} />
    <path d="M18 6v12" {...stroke} />
  </Svg>
)

export const IconNext = () => (
  <Svg>
    <path d="M5 12h14M13 6l6 6-6 6" {...stroke} />
  </Svg>
)

export const IconClock = () => (
  <Svg>
    <circle cx="12" cy="12" r="8.25" {...stroke} />
    <path d="M12 8v4.2l2.8 1.6" {...stroke} />
  </Svg>
)

export const IconSliders = () => (
  <Svg>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" {...stroke} />
    <circle cx="16" cy="7" r="2.2" {...stroke} />
    <circle cx="8" cy="17" r="2.2" {...stroke} />
  </Svg>
)

export const IconHelp = () => (
  <Svg>
    <circle cx="12" cy="12" r="8.25" {...stroke} />
    <path d="M9.6 9.4a2.4 2.4 0 1 1 3.3 2.2c-.7.4-1.4.8-1.4 1.7" {...stroke} />
    <path d="M12 16.7h.01" {...stroke} />
  </Svg>
)

export const IconTrophy = () => (
  <Svg>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" {...stroke} />
    <path d="M7 8H5.2A2.7 2.7 0 0 0 8 11.2M17 8h1.8A2.7 2.7 0 0 1 16 11.2" {...stroke} />
  </Svg>
)

export const IconGlobe = () => (
  <Svg>
    <circle cx="12" cy="12" r="8.25" {...stroke} />
    <path d="M3.8 12h16.4M12 3.8c2.2 2.4 3.3 5.2 3.3 8.2s-1.1 5.8-3.3 8.2c-2.2-2.4-3.3-5.2-3.3-8.2s1.1-5.8 3.3-8.2Z" {...stroke} />
  </Svg>
)

export const IconCheck = () => (
  <Svg>
    <path d="m5 12.5 5 5 9-11" {...stroke} />
  </Svg>
)

export const IconFlame = () => (
  <Svg>
    <path d="M12 21a6.2 6.2 0 0 0 6.2-6.4c0-3.3-2.2-5.6-4-7.6-.4 2.2-1.6 3.3-2.7 3.8.2-2.6.1-5.4-1.7-7.8-3.1 2.6-3.8 6.2-3.8 8.6A6.1 6.1 0 0 0 12 21Z" {...stroke} />
  </Svg>
)

export const IconTarget = () => (
  <Svg>
    <circle cx="12" cy="12" r="8.25" {...stroke} />
    <circle cx="12" cy="12" r="4.5" {...stroke} />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </Svg>
)

export const IconStar = () => (
  <Svg>
    <path d="m12 4 2.1 5.2 5.6.5-4.2 3.7 1.3 5.5L12 16.2 7.2 18.9l1.3-5.5-4.2-3.7 5.6-.5L12 4Z" {...stroke} />
  </Svg>
)

export const IconRepeat = () => (
  <Svg>
    <path d="M4 8h12.5a3.5 3.5 0 0 1 0 7H10" {...stroke} />
    <path d="M7 5 4 8l3 3" {...stroke} />
    <path d="M20 16H7.5a3.5 3.5 0 0 1 0-7H14" {...stroke} />
    <path d="m17 19 3-3-3-3" {...stroke} />
  </Svg>
)

export const IconLayers = () => (
  <Svg>
    <path d="m12 4 8 4-8 4-8-4 8-4Z" {...stroke} />
    <path d="m4 12 8 4 8-4" {...stroke} />
    <path d="m4 16 8 4 8-4" {...stroke} />
  </Svg>
)

export const IconHash = () => (
  <Svg>
    <path d="M5 9h14M5 15h14M9.2 4 7.5 20M16.5 4 14.8 20" {...stroke} />
  </Svg>
)

export const IconParty = () => (
  <Svg>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...stroke} />
    <circle cx="9" cy="7" r="3.5" {...stroke} />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...stroke} />
  </Svg>
)

export const IconType = () => (
  <Svg>
    <path d="M4 7V5h16v2M12 5v14M8 19h8" {...stroke} />
  </Svg>
)

export const IconPlus = () => (
  <Svg>
    <path d="M5 12h14M12 5v14" {...stroke} />
  </Svg>
)

export const IconFlag = () => (
  <Svg>
    <path d="M4 22V4" {...stroke} />
    <path d="M4 4c1.2 1 3.2 1.6 5.5 1.6 3.3 0 4.3-1.6 7.6-1.6 1.6 0 2.9.4 2.9.4v9.4s-1.3-.5-2.9-.5c-3.3 0-4.3 1.7-7.6 1.7-2.3 0-4.3-.6-5.5-1.6Z" {...stroke} />
  </Svg>
)
