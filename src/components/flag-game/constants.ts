export const BASE_POINTS = 10
export const STREAK_BONUS = 2

export type Difficulty = 'easy' | 'medium' | 'hard'

export const difficultySettings: Record<Difficulty, { time: number; multiplier: number }> = {
  easy: { time: 60, multiplier: 1 },
  medium: { time: 45, multiplier: 1.2 },
  hard: { time: 30, multiplier: 1.5 },
}

export const DIFFICULTY_LEVELS: Difficulty[] = ['easy', 'medium', 'hard']

export function isDifficulty(value: string): value is Difficulty {
  return value in difficultySettings
}
