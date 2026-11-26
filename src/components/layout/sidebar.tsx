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
  ChevronsUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Main Menu",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Setlists", href: "/setlists", icon: CalendarDays },
      { label: "Song Library", href: "/songs", icon: Music },
      { label: "Live Stage Mode", href: "/perform", icon: Radio },
      { label: "Practice Hub", href: "/practice", icon: CheckCircle2 },
    ],
  },
  {
    title: "Planning & AI",
    items: [
      { label: "Schedule Calendar", href: "/setlists/calendar", icon: Calendar },
      { label: "Team Readiness", href: "/practice/readiness", icon: ClipboardCheck },
      { label: "AI Director", href: "/chat", icon: Sparkles },
    ],
  },
  {
    title: "Analytics & Team",
    items: [
      { label: "Song Analytics", href: "/analytics/songs", icon: BarChart3 },
      { label: "Leader Keys", href: "/analytics/leaders", icon: Mic2 },
      { label: "Team Roster", href: "/admin/team", icon: Users },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "System Settings", href: "/settings", icon: Settings },
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
      return (
        pathname === "/setlists" ||
        (pathname.startsWith("/setlists/") && !pathname.startsWith("/setlists/calendar"))
      )
    }
    if (href === "/practice") {
      return pathname === "/practice"
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Top Workspace Card */}
      <div className="p-3 border-b border-border/70 shrink-0 flex items-center justify-between gap-2">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex-1 flex items-center justify-between gap-2.5 p-2 rounded-xl bg-card border border-border hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
              WF
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-muted-foreground leading-tight">Ministry</div>
              <div className="text-xs font-semibold text-foreground truncate leading-tight">
                WorshipFlow Team
              </div>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
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
            <div className="px-2.5 text-[11px] font-medium text-muted-foreground">
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
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors",
                      active
                        ? "bg-card text-foreground font-semibold border border-border shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent font-medium"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        active ? "text-foreground" : "text-muted-foreground"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile Card */}
      <div className="p-3 border-t border-border/70 shrink-0">
        <Link
          href="/profile"
          onClick={onCloseMobile}
          className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-card border border-border hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
              WT
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate leading-tight">
                Worship Team
              </div>
              <div className="text-[10px] text-muted-foreground truncate leading-tight">
                Sun 9:00 AM / 2:30 PM
              </div>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-64 max-w-[82vw] h-full bg-background shadow-xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
