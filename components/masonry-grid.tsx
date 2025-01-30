"use client"

import Masonry from "react-masonry-css"
import type React from "react" // Added import for React

interface MasonryGridProps {
  children: React.ReactNode
  className?: string
}

export function MasonryGrid({ children, className }: MasonryGridProps) {
  const breakpointColumns = {
    default: 2,
    1100: 2,
    700: 1,
    500: 1,
  }

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className={`flex -ml-4 w-auto ${className}`}
      columnClassName="pl-4 bg-clip-padding"
    >
      {children}
    </Masonry>
  )
}

