'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { GameLibrary } from '../src/components/GameLibrary'

function NextGameLink({
  slug,
  className,
  children,
}: {
  slug: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link href={`/games/${slug}`} className={className}>
      {children}
    </Link>
  )
}

export default function HomePage() {
  return (
    <div className="page-shell">
      <GameLibrary GameLink={NextGameLink} />
    </div>
  )
}
