import { useLanguage } from '../../i18n/LanguageProvider'

export function ImposterIntro() {
  const { t } = useLanguage()

  return (
    <>
      <section className="imposter-intro">
        <p className="imposter-kicker">
          {t('landing.featuredBadge')} · {t('landing.players')}
        </p>
        <h1>{t('landing.heroTitle')}</h1>
        <p className="imposter-intro-lead">{t('landing.heroLead')}</p>
      </section>
      <section className="imposter-how" aria-labelledby="imposter-how-title">
        <h2 id="imposter-how-title">{t('landing.howTitle')}</h2>
        <div className="imposter-steps">
          <article>
            <span>1</span>
            <h3>{t('landing.step1Title')}</h3>
            <p>{t('landing.step1Text')}</p>
          </article>
          <article>
            <span>2</span>
            <h3>{t('landing.step2Title')}</h3>
            <p>{t('landing.step2Text')}</p>
          </article>
          <article>
            <span>3</span>
            <h3>{t('landing.step3Title')}</h3>
            <p>{t('landing.step3Text')}</p>
          </article>
        </div>
      </section>
    </>
  )
}
