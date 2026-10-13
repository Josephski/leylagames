import { LanguageSelect } from '../../i18n/LanguageSelect'
import { useLanguage } from '../../i18n/LanguageProvider'
import { Overlay } from './Overlay'

export function SettingsOverlay({
  customTime,
  selectedVoice,
  voices,
  onClose,
  onCustomTime,
  onVoice,
  onRefreshVoices,
}: {
  customTime: number
  selectedVoice: string | null
  voices: SpeechSynthesisVoice[]
  onClose: () => void
  onCustomTime: (seconds: number) => void
  onVoice: (voice: string | null) => void
  onRefreshVoices: () => void
}) {
  const { t } = useLanguage()

  return (
    <Overlay title={t('flagGame.settings.title')} onClose={onClose}>
      <LanguageSelect id="lang-select-settings" />

      <label className="field-label">{t('flagGame.settings.timeLimit')}</label>
      <div className="button-row wrap">
        <input
          type="number"
          min={10}
          max={180}
          value={customTime}
          onChange={(e) => onCustomTime(Math.max(10, Math.min(180, Number(e.target.value) || 0)))}
          className="time-input"
          aria-label={t('flagGame.settings.timeInputAria')}
        />
        <span className="field-hint">{t('flagGame.settings.seconds')}</span>
      </div>

      <label className="field-label">{t('flagGame.settings.voice')}</label>
      <select
        value={selectedVoice ?? ''}
        onChange={(e) => onVoice(e.target.value || null)}
        className="voice-select"
      >
        <option value="">{t('flagGame.settings.autoVoice')}</option>
        {voices.map((v) => (
          <option key={`${v.name}-${v.lang}`} value={v.name}>
            {v.name} – {v.lang}
          </option>
        ))}
      </select>

      <div className="button-row">
        <button className="btn" onClick={onRefreshVoices}>
          {t('flagGame.settings.updateVoices')}
        </button>
        <button className="btn" onClick={onClose}>
          {t('flagGame.settings.close')}
        </button>
      </div>
    </Overlay>
  )
}
