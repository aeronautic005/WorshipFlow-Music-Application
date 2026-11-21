"use client"

import { Moon, Sun, Type } from "lucide-react"

interface StageThemeToggleProps {
  isStageDark: boolean
  onToggleDark: () => void
  isLargeFont: boolean
  onToggleLargeFont: () => void
}

export function StageThemeToggle({
  isStageDark,
  onToggleDark,
  isLargeFont,
  onToggleLargeFont,
}: StageThemeToggleProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl border bg-muted/40 p-1 text-xs">
      {/* Dark / Stage Black Toggle */}
      <button
        type="button"
        onClick={onToggleDark}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
          isStageDark
            ? "bg-black text-amber-300 border border-amber-500/30 shadow-xs"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
        title="Toggle pure-black stage mode (prevents glare on dim stage)"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Stage OLED</span>
      </button>

      {/* Font scale toggle */}
      <button
        type="button"
        onClick={onToggleLargeFont}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
          isLargeFont
            ? "bg-primary/15 text-primary border border-primary/30"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
        title="Toggle large text for music stand distance"
      >
        <Type className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Large Text</span>
      </button>
    </div>
  )
}
