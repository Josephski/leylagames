'use client'

import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { GameDefinition } from './games'

export interface GameContextValue {
  game: GameDefinition
  onExit?: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({
  game,
  onExit,
  children,
}: {
  game: GameDefinition
  onExit?: () => void
  children: ReactNode
}) {
  const value = useMemo(() => ({ game, onExit }), [game, onExit])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useCurrentGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error('useCurrentGame måste användas innanför GameProvider')
  }
  return ctx
}
