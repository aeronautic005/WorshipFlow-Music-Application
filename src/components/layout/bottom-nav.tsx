"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CalendarDays, Music, CheckCircle2, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Setlist",
    href: "/setlists",
    icon: CalendarDays,
  },
  {
    name: "Songs",
    href: "/songs",
    icon: Music,
  },
  {
    name: "Practice",
    href: "/practice",
    icon: CheckCircle2,
  },
  {
    name: "Live",
    href: "/perform",
    icon: Radio,
    highlight: true,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-border/60 bg-background/95 backdrop-blur-lg pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-h-[44px] h-full py-1.5 text-[11px] font-medium transition-all active:scale-95 gap-1 select-none",
                isActive
                  ? item.highlight
                    ? "text-red-400 font-semibold"
                    : "text-indigo-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-transform",
                  isActive && (item.highlight ? "bg-red-500/10 scale-110" : "bg-indigo-500/10 scale-110")
                )}
              >
                <Icon className={cn("h-4 w-4", item.highlight && isActive && "animate-pulse")} />
              </div>
              <span className="leading-none">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
