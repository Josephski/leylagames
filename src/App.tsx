import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import { games, getGameBySlug, gameCategories } from './platform/games'
import { GameProvider } from './platform/GameContext'
import { useLanguage } from './i18n/LanguageProvider'
import './App.css'

function GamePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const game = slug ? getGameBySlug(slug) : undefined
  const { t } = useLanguage()

  if (!game) {
    return (
      <div className="app">
        <div className="menu">
          <h1>{t('errors.gameNotFound')}</h1>
          <button onClick={() => navigate('/')}>{t('errors.backToStart')}</button>
        </div>
      </div>
    )
  }

  return (
    <GameProvider game={game}>
      <game.component />
    </GameProvider>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="app">
      <div className="menu">
        <h1>{t('home.title')}</h1>
        <p>{t('home.leadAlt')}</p>
        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
          <label htmlFor="lang-select-app">{t('labels.language')}</label>
          <select
            id="lang-select-app"
            value={language}
            onChange={(e) => setLanguage(e.target.value === 'da' ? 'da' : 'sv')}
          >
            <option value="sv">{t('language.sv')}</option>
            <option value="da">{t('language.da')}</option>
          </select>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => {
              const search = typeof window !== 'undefined' ? window.location.search : ''
              navigate(`/games/flag-quiz${search}`)
            }}
          >
            {t('home.startGame')}
          </button>
        </div>
        {gameCategories.map((cat) => (
          <section key={cat.id} style={{ marginTop: '1.5rem', textAlign: 'left', maxWidth: '640px' }}>
            <h2 style={{ marginBottom: '0.25rem' }}>{t(`categories.${cat.id}.name`)}</h2>
            {cat.description && <p style={{ marginTop: 0 }}>{t(`categories.${cat.id}.description`)}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              {cat.gameIds
                .map((id) => games.find((g) => g.id === id))
                .filter(Boolean)
                .map((game) => (
                  <Link
                    key={game!.id}
                    to={`/games/${game!.slug}`}
                    className="game-card-link"
                  >
                    <div className="game-card">
                      <h3>{t(`games.${game!.id}.name`)}</h3>
                      <p>{t(`games.${game!.id}.shortDescription`)}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ))}
        <div style={{ marginTop: '2rem', fontSize: '0.85rem', opacity: 0.8 }}>
          <p>{t('home.footerNote')}</p>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/:slug" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
