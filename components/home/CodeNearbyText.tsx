"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { LineShadowText } from "../magicui/LineShadowText";

export function CodeNearbyText() {
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";
  return (
    <h1 className="flex items-center justify-center gap-4 text-balance text-6xl font-semibold leading-none tracking-wide md:text-7xl font-heading italic">
      <Image
        src="/logo.png"
        alt="CodeNearby"
        width={72}
        height={72}
        className="rounded-2xl animate-spin [animation-duration:6s]"
      />
      Code
      <LineShadowText className="-ml-2" shadowColor={shadowColor}>
        Nearby
      </LineShadowText>
    </h1>
  );
}
