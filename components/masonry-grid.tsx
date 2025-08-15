"use client";

import Masonry from "react-masonry-css";
import type React from "react"; // Added import for React

interface MasonryGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: number; // optional override for column count
}

export function MasonryGrid({
  children,
  className,
  columns,
}: MasonryGridProps) {
  const breakpointColumns = {
    default: 2,
    1100: 2,
    700: 1,
    500: 1,
  };

  // Tighter gutters for higher column counts to avoid overflow
  const containerGutterClass =
    typeof columns === "number"
      ? columns >= 5
        ? "-ml-2"
        : columns >= 4
        ? "-ml-3"
        : "-ml-4"
      : "-ml-4";
  const columnGutterClass =
    typeof columns === "number"
      ? columns >= 5
        ? "pl-2"
        : columns >= 4
        ? "pl-3"
        : "pl-4"
      : "pl-4";

  return (
    <Masonry
      breakpointCols={typeof columns === "number" ? columns : breakpointColumns}
      className={`flex ${containerGutterClass} w-auto ${className ?? ""}`}
      columnClassName={`${columnGutterClass} bg-clip-padding`}
    >
      {children}
    </Masonry>
  );
}
