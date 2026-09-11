import type { ComponentType } from 'react'
import FlagGame from '../components/FlagGame'
import FlagChoice from '../components/FlagChoice'
import FlagMemory from '../components/FlagMemory'
import MathQuiz from '../components/MathQuiz'
import ImposterGame from '../games/imposter/ImposterGame'

export interface GameDefinition {
  id: string
  slug: string
  name: string
  shortDescription: string
  icon: string
  tags?: string[]
  component: ComponentType
}

export interface GameCategory {
  id: string
  name: string
  description?: string
  gameIds: string[]
}

export const games: GameDefinition[] = [
  {
    id: 'imposter',
    slug: 'imposter',
    name: 'Imposter',
    shortDescription: 'A secret word. An imposter. Vote wisely.',
    icon: '🎭',
    tags: ['party', 'multiplayer'],
    component: ImposterGame,
  },
  {
    id: 'flag-choice',
    slug: 'flag-choice',
    name: 'Gissa flaggan',
    shortDescription: 'Se flaggan och välj rätt land.',
    icon: '🏳️',
    tags: ['geografi', 'barn'],
    component: FlagChoice,
  },
  {
    id: 'flag-quiz',
    slug: 'flag-quiz',
    name: 'Flaggquiz',
    shortDescription: 'Gissa landet från flaggan och ordna bokstäverna.',
    icon: '🔤',
    tags: ['geografi', 'bokstäver', 'barn'],
    component: FlagGame,
  },
  {
    id: 'flag-memory',
    slug: 'flag-memory',
    name: 'Flaggmemory',
    shortDescription: 'Hitta två likadana flaggor.',
    icon: '🧠',
    tags: ['geografi', 'minne', 'barn'],
    component: FlagMemory,
  },
  {
    id: 'math-quiz',
    slug: 'math-quiz',
    name: 'Räknespel',
    shortDescription: 'Räkna plus med fyra svarsalternativ.',
    icon: '➕',
    tags: ['matte', 'barn'],
    component: MathQuiz,
  },
]

export const gameCategories: GameCategory[] = [
  {
    id: 'party',
    name: 'Party',
    description: 'Games for the whole room.',
    gameIds: ['imposter'],
  },
  {
    id: 'geography',
    name: 'Geografi',
    description: 'Flaggspel för att lära sig länder.',
    gameIds: ['flag-choice', 'flag-quiz', 'flag-memory'],
  },
  {
    id: 'numbers',
    name: 'Siffror',
    description: 'Korta räknespel.',
    gameIds: ['math-quiz'],
  },
]

export function getGameBySlug(slug: string): GameDefinition | undefined {
  return games.find((g) => g.slug === slug)
}

export function getGameById(id: string): GameDefinition | undefined {
  return games.find((g) => g.id === id)
}
