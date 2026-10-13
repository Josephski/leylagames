'use client'

import { useLanguage } from '../i18n/LanguageProvider'
import { LanguageSelect } from '../i18n/LanguageSelect'
import './LandingPage.css'

function homeHref() {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

export function PrivacyPage() {
  const { t } = useLanguage()

  return (
    <div className="landing is-home">
      <header className="landing-nav">
        <a className="landing-logo" href={homeHref()}>
          {t('home.title')}
        </a>
        <LanguageSelect id="lang-select-privacy" variant="pills" />
      </header>
      <section className="home-hero">
        <h1>{t('privacy.title')}</h1>
        <p className="landing-lead">{t('privacy.updated')}</p>
      </section>
      <div className="landing-library">
        <section className="landing-category">
          <h2>{t('privacy.collectTitle')}</h2>
          <p>{t('privacy.collectBody')}</p>
        </section>
        <section className="landing-category">
          <h2>{t('privacy.kidsTitle')}</h2>
          <p>{t('privacy.kidsBody')}</p>
        </section>
        <section className="landing-category">
          <h2>{t('privacy.contactTitle')}</h2>
          <p>{t('privacy.contactBody')}</p>
        </section>
      </div>
      <footer className="landing-footer">
        <p>
          <a href={homeHref()}>{t('privacy.back')}</a>
        </p>
      </footer>
    </div>
  )
}
