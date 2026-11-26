"use client"

import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

const THEME_STORAGE_KEY = "worshipflow_theme_v1"

export function applyThemePreference(theme: "dark" | "light") {
  if (typeof document === "undefined") return
  const root = document.documentElement
  if (theme === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as "dark" | "light" | null
    const initial = saved || "dark"
    setTheme(initial)
    applyThemePreference(initial)
  }, [])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem(THEME_STORAGE_KEY, next)
    applyThemePreference(next)
  }

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-full border border-border/60 bg-muted/40 ${className}`} />
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-500" />
      )}
    </button>
  )
}
