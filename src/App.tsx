import { BrowserRouter, Routes, Route, Link, Navigate, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { getGameBySlug } from './platform/games'
import { GameProvider } from './platform/GameContext'
import { useLanguage } from './i18n/LanguageProvider'
import { GameLibrary } from './components/GameLibrary'
import { PrivacyPage } from './components/PrivacyPage'
import './App.css'

function safeRedir(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('://')) return null
  return value
}

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

  const GameComponent = game.component

  return (
    <GameProvider game={game} onExit={() => navigate('/')}>
      <GameComponent />
    </GameProvider>
  )
}

function RouterGameLink({
  slug,
  className,
  children,
  ...rest
}: {
  slug: string
  className?: string
  children: ReactNode
  'aria-label'?: string
}) {
  return (
    <Link to={`/games/${slug}`} className={className} {...rest}>
      {children}
    </Link>
  )
}

function HomePage() {
  const [params] = useSearchParams()
  const redir = safeRedir(params.get('redir'))
  if (redir) return <Navigate to={redir} replace />
  const room = params.get('room')
  if (room) {
    return <Navigate to={`/games/imposter?room=${encodeURIComponent(room)}`} replace />
  }
  return <GameLibrary GameLink={RouterGameLink} />
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/games/:slug" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
