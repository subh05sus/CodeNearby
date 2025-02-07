"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const modes = ["light", "dark", "system"];

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [modeIndex, setModeIndex] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setModeIndex(modes.indexOf(theme || "system"));
  }, [theme]);

  if (!mounted) return null; // Prevent mismatched UI during hydration

  const toggleMode = () => {
    const newIndex = (modeIndex + 1) % modes.length;
    setModeIndex(newIndex);
    setTheme(modes[newIndex]);
  };

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input transition-all",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      )}
      onClick={toggleMode}
    >
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: modeIndex === 0 ? 4 : modeIndex === 1 ? 20 : 36 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="pointer-events-none flex justify-center items-center text-center h-6 w-6 rounded-full bg-background shadow-lg ring-0"
      >
        {modeIndex === 0 ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-3 w-3 text-muted-foreground" />
          </motion.div>
        ) : modeIndex === 1 ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-3 w-3 text-muted-foreground dark:text-muted-foreground" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Monitor className="h-3 w-3 text-muted-foreground" />
          </motion.div>
        )}
      </motion.div>
    </SwitchPrimitives.Root>
  );
}
