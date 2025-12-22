'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { defaultLanguage, isLanguage, translate, type Language } from './translations'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return defaultLanguage
    const stored = window.localStorage.getItem('leyla-language')
    return isLanguage(stored) ? stored : defaultLanguage
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('leyla-language', language)
    document.documentElement.lang = language
  }, [language])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(language, key, params),
    [language],
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage måste användas innanför LanguageProvider')
  }
  return ctx
}
