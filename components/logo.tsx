'use client';

import Image from "next/image";

export default function Logo() {
  return (
    <span className="flex items-center gap-2 leading-none group">
      <Image src="/logo.png" alt="CodeNearby" width={28} height={28} className="rounded-md transition-transform duration-1000 ease-in-out group-hover:rotate-[360deg]" />
      <span className="text-3xl font-heading font-medium">CodeNearby</span>
    </span>
  );
}
