import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initAnalytics } from './lib/analytics'
import { initSentry } from './sentry.client'
import { LanguageProvider } from './i18n/LanguageProvider'

void initSentry()
initAnalytics()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)
