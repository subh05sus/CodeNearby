"use client";

import * as React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const modes = ["system", "light", "dark"] as const;

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme || "system";

  return (
    <div className="flex items-center gap-0 border-2 border-black bg-white p-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => setTheme(mode)}
          className={cn(
            "h-10 px-4 flex items-center justify-center gap-2 border-r-2 last:border-r-0 border-black transition-colors relative group overflow-hidden",
            currentTheme === mode ? "bg-black text-white" : "bg-white text-black hover:bg-muted"
          )}
          aria-label={`Switch to ${mode} theme`}
        >
          {mode === "system" && <Monitor className="h-4 w-4" />}
          {mode === "light" && <Sun className="h-4 w-4" />}
          {mode === "dark" && <Moon className="h-4 w-4" />}
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
            {mode}
          </span>
          {currentTheme === mode && (
            <div className="absolute top-0 left-0 w-full h-1 bg-swiss-red" />
          )}
        </button>
      ))}
    </div>
  );
}
