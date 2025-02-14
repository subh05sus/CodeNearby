"use client";

import { useTheme } from "next-themes";
import { LineShadowText } from "../magicui/LineShadowText";

export function CodeNearbyText() {
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";
  return (
    <h1 className="text-balance text-5xl font-semibold leading-none tracking-tighter  md:text-7xl">
      Code
      <LineShadowText className="italic" shadowColor={shadowColor}>
        Nearby
      </LineShadowText>
    </h1>
  );
}
