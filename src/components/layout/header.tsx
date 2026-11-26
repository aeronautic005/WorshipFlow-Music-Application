"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User, Menu, Search, ChevronRight } from "lucide-react"
import { NotificationBell } from "./notification-bell"
import { ThemeToggle } from "./theme-toggle"

interface HeaderProps {
  onOpenSidebar?: () => void
}

function getBreadcrumb(pathname: string): { parent: string; current: string } {
  if (pathname === "/") return { parent: "Dashboard", current: "Overview" }
  if (pathname.startsWith("/setlists/calendar")) return { parent: "Planning", current: "Schedule Calendar" }
  if (pathname.startsWith("/setlists/builder")) return { parent: "Setlists", current: "Builder" }
  if (pathname.startsWith("/setlists/new")) return { parent: "Setlists", current: "New Setlist" }
  if (pathname.startsWith("/setlists")) return { parent: "Worship Planning", current: "Setlists" }
  if (pathname.startsWith("/songs")) return { parent: "Worship Planning", current: "Song Library" }
  if (pathname.startsWith("/practice/readiness")) return { parent: "Practice", current: "Team Readiness" }
  if (pathname.startsWith("/practice")) return { parent: "Practice", current: "Practice Hub" }
  if (pathname.startsWith("/perform")) return { parent: "Stage", current: "Live Stage Mode" }
  if (pathname.startsWith("/chat")) return { parent: "Planning & AI", current: "AI Director" }
  if (pathname.startsWith("/analytics/leaders")) return { parent: "Analytics", current: "Leader Keys" }
  if (pathname.startsWith("/analytics")) return { parent: "Analytics", current: "Song Frequency" }
  if (pathname.startsWith("/admin/team")) return { parent: "Team", current: "Roster" }
  if (pathname.startsWith("/settings")) return { parent: "System", current: "Settings" }
  if (pathname.startsWith("/profile")) return { parent: "System", current: "Profile" }
  return { parent: "WorshipFlow", current: "Overview" }
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const crumb = getBreadcrumb(pathname)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/songs`)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu + Bold Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              aria-label="Open navigation menu"
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted transition cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-2 text-sm truncate">
            <span className="text-muted-foreground font-medium hidden sm:inline">
              {crumb.parent}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:inline shrink-0" />
            <span className="font-bold text-primary truncate">{crumb.current}</span>
          </div>
        </div>

        {/* Right: Larger Search + Utility Icons */}
        <div className="flex items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs..."
              className="h-10 w-56 lg:w-72 pl-9 pr-10 rounded-lg border border-border bg-background text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-card">
              K
            </span>
          </form>

          <NotificationBell />
          <ThemeToggle className="h-10 w-10" />

          <Link
            href="/profile"
            aria-label="User Profile"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}
