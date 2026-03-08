"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import SwissButton from "./swiss/SwissButton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SwissButton variant="secondary" size="sm" className="w-10 h-10 p-0 border-2 border-black">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </SwissButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-none border-2 border-black bg-white">
        <DropdownMenuItem onClick={() => setTheme("light")} className="font-black uppercase text-xs  cursor-pointer focus:bg-black focus:text-white rounded-none">LIGHT_MODE</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="font-black uppercase text-xs  cursor-pointer focus:bg-black focus:text-white rounded-none">DARK_MODE</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="font-black uppercase text-xs  cursor-pointer focus:bg-black focus:text-white rounded-none">SYSTEM_SYNC</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
