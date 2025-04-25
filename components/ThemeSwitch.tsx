"use client";

import * as React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const modes = ["system", "light", "dark"];

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent mismatched UI during hydration

  const currentTheme = theme || "system";

  return (
    <div className="flex items-center gap-1 rounded-full border bg-background p-1">
      {modes.map((mode) => (
        <Button
          key={mode}
          variant={currentTheme === mode ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme(mode)}
          className={cn(
            "h-7 w-7 rounded-full p-0",
            currentTheme === mode && "bg-primary text-primary-foreground"
          )}
          aria-label={`Switch to ${mode} theme`}
        >
          {mode === "system" && <Monitor className="h-3 w-3" />}
          {mode === "light" && <Sun className="h-3 w-3" />}
          {mode === "dark" && <Moon className="h-3 w-3" />}
        </Button>
      ))}
    </div>
  );
}
