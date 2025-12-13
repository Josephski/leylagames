import { create } from 'zustand'

interface GameState {
  score: number
  level: number
  isPaused: boolean
  isGameOver: boolean
  addScore: (points: number) => void
  setLevel: (level: number) => void
  togglePause: () => void
  setGameOver: (isOver: boolean) => void
  reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  level: 1,
  isPaused: false,
  isGameOver: false,
  
  addScore: (points: number) =>
    set((state) => ({ score: state.score + points })),
  
  setLevel: (level: number) =>
    set({ level }),
  
  togglePause: () =>
    set((state) => ({ isPaused: !state.isPaused })),
  
  setGameOver: (isOver: boolean) =>
    set({ isGameOver: isOver }),
  
  reset: () =>
    set({ score: 0, level: 1, isPaused: false, isGameOver: false }),
}))
