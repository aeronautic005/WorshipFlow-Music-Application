"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CalendarDays, Music, CheckCircle2, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Setlists", href: "/setlists", icon: CalendarDays },
  { name: "Songs", href: "/songs", icon: Music },
  { name: "Practice", href: "/practice", icon: CheckCircle2 },
  { name: "Live", href: "/perform", icon: Radio },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-border bg-card pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-h-[44px] h-full py-1.5 text-[11px] transition-colors gap-1 select-none",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-primary font-medium"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
