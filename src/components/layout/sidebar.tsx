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
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
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
    <div className="flex flex-col h-full bg-[#0B1D3A] text-white border-r border-[#163261]">
      {/* Top Brand Header (narra hub style: white + lighter blue accent) */}
      <div className="px-5 h-16 border-b border-white/10 shrink-0 flex items-center justify-between gap-2">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3B82F6] text-white font-extrabold text-sm shadow-sm">
            <Music className="w-5 h-5" strokeWidth={2.4} />
          </div>
          <div className="text-xl font-extrabold tracking-tight leading-none">
            <span className="text-white">worship</span>
            <span className="text-[#60A5FA]">flow</span>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Categorized Navigation */}
      <nav aria-label="Main Sidebar Navigation" className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-2">
            <div className="px-3 text-xs font-bold uppercase tracking-wider text-blue-200/60">
              {group.title}
            </div>
            <div className="space-y-1.5">
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
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[15px] transition-colors",
                      active
                        ? "bg-white text-[#0B1D3A] font-bold shadow-sm"
                        : "bg-[#12294F] text-white hover:bg-[#193768] font-semibold"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        active
                          ? "bg-[#1D4ED8] text-white"
                          : "bg-[#2563EB]/25 text-[#60A5FA]"
                      )}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2.4} />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile Card (solid bright blue badge + bold text) */}
      <div className="p-3.5 border-t border-white/10 shrink-0">
        <Link
          href="/profile"
          onClick={onCloseMobile}
          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#12294F] hover:bg-[#193768] transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#3B82F6] text-white flex items-center justify-center text-sm font-extrabold shrink-0">
              WT
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate leading-tight">
                Worship Team
              </div>
              <div className="text-xs font-medium text-blue-200/80 truncate leading-tight mt-0.5">
                Sun 9:00 AM / 2:30 PM
              </div>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-blue-200/75 shrink-0" />
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-68 shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#071327]/65"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
