import { LanguageSelect } from '../../i18n/LanguageSelect'
import { useLanguage } from '../../i18n/LanguageProvider'
import { DIFFICULTY_LEVELS, type Difficulty } from './constants'
import { Overlay } from './Overlay'

export function SettingsOverlay({
  difficulty,
  timeLimitEnabled,
  customTime,
  selectedVoice,
  voices,
  onClose,
  onDifficulty,
  onTimeLimitEnabled,
  onCustomTime,
  onVoice,
  onRefreshVoices,
}: {
  difficulty: Difficulty
  timeLimitEnabled: boolean
  customTime: number
  selectedVoice: string | null
  voices: SpeechSynthesisVoice[]
  onClose: () => void
  onDifficulty: (level: Difficulty) => void
  onTimeLimitEnabled: (enabled: boolean) => void
  onCustomTime: (seconds: number) => void
  onVoice: (voice: string | null) => void
  onRefreshVoices: () => void
}) {
  const { t } = useLanguage()

  return (
    <Overlay title={t('flagGame.settings.title')} onClose={onClose}>
      <LanguageSelect id="lang-select-settings" />

      <label className="field-label">{t('flagGame.settings.difficulty')}</label>
      <div className="button-row wrap">
        {DIFFICULTY_LEVELS.map((level) => (
          <button
            key={level}
            className={`btn ${difficulty === level ? 'btn-selected' : 'btn-ghost'}`}
            onClick={() => onDifficulty(level)}
            aria-pressed={difficulty === level}
          >
            {t(`flagGame.difficulty.${level}`)}
          </button>
        ))}
      </div>

      <label className="field-label">{t('flagGame.settings.timeLimit')}</label>
      <div className="button-row wrap">
        <button
          className={`btn ${timeLimitEnabled ? 'btn-selected' : 'btn-ghost'}`}
          onClick={() => onTimeLimitEnabled(true)}
          aria-pressed={timeLimitEnabled}
        >
          {t('flagGame.settings.on')}
        </button>
        <button
          className={`btn ${!timeLimitEnabled ? 'btn-selected' : 'btn-ghost'}`}
          onClick={() => onTimeLimitEnabled(false)}
          aria-pressed={!timeLimitEnabled}
        >
          {t('flagGame.settings.off')}
        </button>
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
