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
    <div className="flex items-center gap-1 rounded-full border border-border bg-secondary/70 p-1 text-xs">
      {/* Dark / Light Stage Theme Toggle */}
      <button
        type="button"
        onClick={onToggleDark}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
          isStageDark
            ? "bg-primary text-primary-foreground shadow-xs"
            : "bg-card text-foreground border border-border shadow-2xs"
        }`}
        title={isStageDark ? "Switch to Light Daylight Mode" : "Switch to Dark Stage Mode"}
      >
        {isStageDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{isStageDark ? "Dark Stage" : "Light Mode"}</span>
      </button>

      {/* Font scale toggle */}
      <button
        type="button"
        onClick={onToggleLargeFont}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
          isLargeFont
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Toggle large text for music stand distance"
      >
        <Type className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Large Text</span>
      </button>
    </div>
  )
}
