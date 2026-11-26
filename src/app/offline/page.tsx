"use client"

import Link from "next/link"
import { WifiOff, RotateCw, Home, Music, Radio } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full rounded-2xl border border-border/80 bg-card p-6 text-center space-y-5 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <WifiOff className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight">You&apos;re Offline</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No internet connection detected. Don&apos;t worry — WorshipFlow caches your recent charts, practice notes, and stage structure maps locally.
          </p>
        </div>

        <div className="rounded-xl bg-muted/40 border border-border/50 p-3.5 text-left space-y-2 text-xs text-muted-foreground">
          <div className="font-semibold text-foreground">Available Offline:</div>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Previously viewed chord sheets &amp; capo transpositions</span>
            </li>
            <li className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Live Mode structure view (local tap-to-advance)</span>
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
