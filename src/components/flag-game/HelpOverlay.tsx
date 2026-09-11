import { useLanguage } from '../../i18n/LanguageProvider'
import { translateList } from '../../i18n/translations'
import { Overlay } from './Overlay'

export function HelpOverlay({ onClose }: { onClose: () => void }) {
  const { language, t } = useLanguage()
  const items = translateList(language, 'flagGame.help.items')

  return (
    <Overlay title={t('flagGame.help.title')} onClose={onClose}>
      <ul className="help-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="button-row">
        <button className="btn" onClick={onClose}>
          {t('flagGame.help.close')}
        </button>
      </div>
    </Overlay>
  )
}
