import { useCallback, useEffect, useState } from 'react'
import type { Language } from '../../i18n/translations'

export function useSpeech(language: Language) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null)
  const voiceLanguagePrefix = language === 'da' ? 'da' : 'sv'
  const defaultVoiceLang = language === 'da' ? 'da-DK' : 'sv-SE'

  const loadVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const available = window.speechSynthesis.getVoices() || []
    setVoices(available)
    const preferred = available.find((v) => v.lang && v.lang.toLowerCase().startsWith(voiceLanguagePrefix))
    if (preferred) setSelectedVoice(preferred.name)
  }, [voiceLanguagePrefix])

  useEffect(() => {
    loadVoices()
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.onvoiceschanged = () => loadVoices()
    return () => {
      window.speechSynthesis.onvoiceschanged = null
      window.speechSynthesis.cancel()
    }
  }, [loadVoices])

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        const voice = selectedVoice
          ? voices.find((v) => v.name === selectedVoice)
          : voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(voiceLanguagePrefix))
        if (voice) utterance.voice = voice
        utterance.lang = voice?.lang || defaultVoiceLang
        utterance.rate = 0.95
        utterance.pitch = 1.0
        utterance.volume = 1.0
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
      } catch (err) {
        console.error(err)
      }
    },
    [defaultVoiceLang, selectedVoice, voiceLanguagePrefix, voices],
  )

  return { voices, selectedVoice, setSelectedVoice, speak, refreshVoices: loadVoices }
}
