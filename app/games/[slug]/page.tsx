import { Suspense } from 'react'
import { GameClient } from './GameClient'

export default function GamePage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={null}>
      <GameClient slug={params.slug} />
    </Suspense>
  )
}
