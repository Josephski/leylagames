'use client'

import { useEffect, useState } from 'react'
import type { Country } from '../data/countries'
import { flagSrc } from '../lib/paths'
import { useLanguage } from '../i18n/LanguageProvider'

export function FlagImage({ country, className }: { country: Country; className?: string }) {
  const { t } = useLanguage()
  const [src, setSrc] = useState(() => flagSrc(country.code))
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setSrc(flagSrc(country.code))
    setFailed(false)
  }, [country.code])

  if (failed) {
    return (
      <div className={`flag-fallback ${className ?? ''}`} aria-label={t('flagGame.flagAria', { country: country.name })}>
        <span className="flag-emoji" aria-hidden="true">
          {country.flag}
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={t('flagGame.flagAlt', { country: country.name })}
      className={className ?? 'flag-image'}
      onError={() => {
        if (src.includes('flags/')) {
          setSrc(`https://flagcdn.com/h120/${country.code.toLowerCase()}.png`)
        } else {
          setFailed(true)
        }
      }}
    />
  )
}
