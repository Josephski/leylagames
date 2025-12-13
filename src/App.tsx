import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import { games, getGameBySlug, gameCategories } from './platform/games'
import { GameProvider } from './platform/GameContext'
import './App.css'

function GamePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const game = slug ? getGameBySlug(slug) : undefined

  if (!game) {
    return (
      <div className="app">
        <div className="menu">
          <h1>Spelet hittades inte</h1>
          <button onClick={() => navigate('/')}>Tillbaka till start</button>
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

  return (
    <div className="app">
      <div className="menu">
        <h1>Leyla Games</h1>
        <p>En liten spelplattform där vi kan lägga till fler spel över tid.</p>
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => {
              const search = typeof window !== 'undefined' ? window.location.search : ''
              navigate(`/games/flag-quiz${search}`)
            }}
          >
            Start Game
          </button>
        </div>
        {gameCategories.map((cat) => (
          <section key={cat.id} style={{ marginTop: '1.5rem', textAlign: 'left', maxWidth: '640px' }}>
            <h2 style={{ marginBottom: '0.25rem' }}>{cat.name}</h2>
            {cat.description && <p style={{ marginTop: 0 }}>{cat.description}</p>}
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
                      <h3>{game!.name}</h3>
                      <p>{game!.shortDescription}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ))}
        <div style={{ marginTop: '2rem', fontSize: '0.85rem', opacity: 0.8 }}>
          <p>
            Plattformen är byggd så att vi enkelt kan lägga till fler spel, koppla på global leaderboard och senare flytta
            till t.ex. Next.js/edge utan att ändra varje spel.
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/:slug" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
