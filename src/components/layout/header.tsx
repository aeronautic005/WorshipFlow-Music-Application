"use client"

import Link from "next/link"
import { Music, Radio, User } from "lucide-react"
import { NotificationBell } from "./notification-bell"

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
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

        <div className="flex items-center gap-2">
          <Link
            href="/perform"
            className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <Radio className="h-3 w-3 animate-pulse text-red-400" />
            <span>Live Mode</span>
          </Link>
          <NotificationBell />
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
