"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Music,
  CheckCircle2,
  ClipboardCheck,
  Sparkles,
  BarChart3,
  Mic2,
  Users,
  Radio,
  Settings,
  User,
  X,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  accent?: "red" | "purple"
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Live Stage Mode", href: "/perform", icon: Radio, badge: "Live", accent: "red" },
    ],
  },
  {
    title: "Worship Planning",
    items: [
      { label: "Setlists", href: "/setlists", icon: CalendarDays },
      { label: "Schedule Calendar", href: "/setlists/calendar", icon: Calendar },
      { label: "Song Library", href: "/songs", icon: Music },
    ],
  },
  {
    title: "Practice & AI",
    items: [
      { label: "Practice Hub", href: "/practice", icon: CheckCircle2 },
      { label: "Team Readiness", href: "/practice/readiness", icon: ClipboardCheck },
      { label: "AI Director", href: "/chat", icon: Sparkles, badge: "AI", accent: "purple" },
    ],
  },
  {
    title: "Insights & Team",
    items: [
      { label: "Song Analytics", href: "/analytics/songs", icon: BarChart3 },
      { label: "Leader Keys", href: "/analytics/leaders", icon: Mic2 },
      { label: "Team Roster", href: "/admin/team", icon: Users },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Profile", href: "/profile", icon: User },
    ],
  },
]

export interface SidebarProps {
  isOpenMobile?: boolean
  onCloseMobile?: () => void
}

export function Sidebar({ isOpenMobile = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()

  const isRouteActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href === "/setlists") {
      return pathname === "/setlists" || (pathname.startsWith("/setlists/") && !pathname.startsWith("/setlists/calendar"))
    }
    if (href === "/practice") {
      return pathname === "/practice"
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card/60 backdrop-blur-xl border-r border-border/60">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border/50 shrink-0">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-pink-500 text-white shadow-sm">
            <Music className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-none bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
              WorshipFlow
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Music Team Hub
            </span>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Categorized Navigation */}
      <nav aria-label="Main Sidebar Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isRouteActive(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all",
                      active
                        ? item.accent === "red"
                          ? "bg-red-500/15 text-red-400 font-semibold border border-red-500/25 shadow-xs"
                          : item.accent === "purple"
                          ? "bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/25 shadow-xs"
                          : "bg-primary/15 text-primary font-semibold border border-primary/25 shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
                          active
                            ? "text-current"
                            : item.accent === "red"
                            ? "text-red-400/80"
                            : item.accent === "purple"
                            ? "text-purple-400/80"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide shrink-0",
                          item.accent === "red"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-purple-500/20 text-purple-300"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sunday Schedule Footer Pill */}
      <div className="p-3 border-t border-border/50 shrink-0">
        <div className="rounded-xl bg-muted/40 border border-border/50 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sunday Schedule</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            9:00 AM Rehearsal • 2:30 PM Live
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[82vw] h-full bg-background shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
