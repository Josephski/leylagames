export interface GameDefinition {
  id: string
  slug: string
  name: string
  shortDescription: string
  tags?: string[]
  component: () => JSX.Element
}

export interface GameCategory {
  id: string
  name: string
  description?: string
  gameIds: string[]
}

/**
 * Central register för alla spel.
 * Här lägger du till nya spel allteftersom plattformen växer.
 */
import FlagGame from '../components/FlagGame'

export const games: GameDefinition[] = [
  {
    id: 'flag-quiz',
    slug: 'flag-quiz',
    name: 'Flaggquiz',
    shortDescription: 'Gissa landet från flaggan och ordna bokstäverna.',
    tags: ['geografi', 'bokstäver', 'barn'],
    component: FlagGame,
  },
]

export const gameCategories: GameCategory[] = [
  {
    id: 'featured',
    name: 'Utvalda spel',
    description: 'Snabbstarta med våra populäraste spel.',
    gameIds: ['flag-quiz'],
  },
]

export function getGameBySlug(slug: string): GameDefinition | undefined {
  return games.find((g) => g.slug === slug)
}

