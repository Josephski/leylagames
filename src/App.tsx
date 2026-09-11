import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { getGameBySlug } from './platform/games'
import { GameProvider } from './platform/GameContext'
import { useLanguage } from './i18n/LanguageProvider'
import { GameLibrary } from './components/GameLibrary'
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
}: {
  slug: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link to={`/games/${slug}`} className={className}>
      {children}
    </Link>
  )
}

function HomePage() {
  return <GameLibrary GameLink={RouterGameLink} />
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
