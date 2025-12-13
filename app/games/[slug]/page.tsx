'use client'

import { notFound } from 'next/navigation'
import { getGameBySlug } from '../../../src/platform/games'
import { GameClient } from './GameClient'

export default function GamePage({ params }: { params: { slug: string } }) {
  const game = getGameBySlug(params.slug)
  if (!game) {
    notFound()
  }
  return <GameClient slug={params.slug} />
}
