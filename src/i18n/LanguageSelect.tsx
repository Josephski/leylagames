'use client'

import { isLanguage } from './translations'
import { useLanguage } from './LanguageProvider'

const LANGUAGES = ['en', 'ar', 'sv', 'da'] as const

export function LanguageSelect({
  id,
  variant = 'select',
}: {
  id: string
  variant?: 'select' | 'pills'
}) {
  const { language, setLanguage, t } = useLanguage()

  if (variant === 'pills') {
    return (
      <div className="lang-pills" id={id} role="group" aria-label={t('labels.language')}>
        {LANGUAGES.map((code) => (
          <button
            key={code}
            type="button"
            className={language === code ? 'is-active' : ''}
            onClick={() => setLanguage(code)}
          >
            {t(`language.${code}`)}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="lang-row">
      <label htmlFor={id}>{t('labels.language')}</label>
      <select
        id={id}
        value={language}
        onChange={(e) => {
          if (isLanguage(e.target.value)) setLanguage(e.target.value)
        }}
      >
        {LANGUAGES.map((code) => (
          <option key={code} value={code}>
            {t(`language.${code}`)}
          </option>
        ))}
      </select>
    </div>
  )
}
