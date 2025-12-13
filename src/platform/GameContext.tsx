import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { GameDefinition } from './games'

export interface GameContextValue {
  game: GameDefinition
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ game, children }: { game: GameDefinition; children: ReactNode }) {
  return (
    <GameContext.Provider value={{ game }}>
      {children}
    </GameContext.Provider>
  )
}

export function useCurrentGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error('useCurrentGame måste användas innanför GameProvider')
  }
  return ctx
}
