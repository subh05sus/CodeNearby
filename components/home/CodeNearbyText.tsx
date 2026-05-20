"use client";

import { useTheme } from "next-themes";
import { LineShadowText } from "../magicui/LineShadowText";

export function CodeNearbyText() {
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";
  return (
    <h1 className="text-balance text-6xl font-semibold leading-none tracking-wide md:text-7xl font-heading italic">
      Code
      <LineShadowText className="ml-1.5" shadowColor={shadowColor}>
        Nearby
      </LineShadowText>
    </h1>
  );
}
