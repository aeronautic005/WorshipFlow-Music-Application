"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Music, Radio, User, Sparkles, Menu } from "lucide-react"
import { NotificationBell } from "./notification-bell"
import { ThemeToggle } from "./theme-toggle"

interface HeaderProps {
  onOpenSidebar?: () => void
}

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard"
  if (pathname.startsWith("/setlists/calendar")) return "Schedule Calendar"
  if (pathname.startsWith("/setlists/builder")) return "Setlist Builder"
  if (pathname.startsWith("/setlists")) return "Setlists"
  if (pathname.startsWith("/songs")) return "Song Library"
  if (pathname.startsWith("/practice/readiness")) return "Team Readiness"
  if (pathname.startsWith("/practice")) return "Practice Hub"
  if (pathname.startsWith("/perform")) return "Live Stage Mode"
  if (pathname.startsWith("/chat")) return "AI Worship Director"
  if (pathname.startsWith("/analytics/leaders")) return "Leader Key Analytics"
  if (pathname.startsWith("/analytics")) return "Song Analytics"
  if (pathname.startsWith("/admin/team")) return "Team Roster"
  if (pathname.startsWith("/settings")) return "Settings"
  if (pathname.startsWith("/profile")) return "Profile"
  return "WorshipFlow"
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu + Logo OR Desktop Page Title */}
        <div className="flex items-center gap-3">
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              aria-label="Open navigation menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          {/* Mobile/Tablet Logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 font-semibold tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-pink-500 text-white shadow-sm">
              <Music className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
              WorshipFlow
            </span>
          </Link>

          {/* Desktop Section Title */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-foreground">{pageTitle}</span>
          </div>
        </div>

        {/* Right: Quick Utilities */}
        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300 hover:bg-purple-500/20 transition-colors"
          >
            <Sparkles className="h-3 w-3 text-purple-400" />
            <span className="hidden sm:inline">AI Director</span>
          </Link>
          <Link
            href="/perform"
            className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <Radio className="h-3 w-3 animate-pulse text-red-400" />
            <span className="hidden sm:inline">Live Mode</span>
          </Link>
          <NotificationBell />
          <ThemeToggle />
          <Link
            href="/profile"
            aria-label="User Profile"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}
