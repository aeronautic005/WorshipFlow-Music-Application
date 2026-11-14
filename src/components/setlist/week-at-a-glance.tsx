"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CalendarDays,
  Clock,
  ExternalLink,
  Flame,
  Heart,
  Music,
  Radio,
  Sparkles,
  User,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { getSetlists, type FullSetlist } from "@/lib/setlists"
import { SetlistStatusBadge } from "./setlist-status-badge"

export function WeekAtAGlanceCard() {
  const [currentSetlist, setCurrentSetlist] = useState<FullSetlist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const list = await getSetlists()
      const today = new Date().toISOString().split("T")[0]
      // Pick the earliest upcoming setlist, or fallback to the most recent published one
      const upcoming = list
        .filter((s) => s.service_date >= today && s.status === "published")
        .sort((a, b) => a.service_date.localeCompare(b.service_date))[0]

      const fallback = upcoming || list[0] || null
      setCurrentSetlist(fallback)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-5 space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-10 bg-muted/60 rounded" />
        <div className="space-y-2">
          <div className="h-12 bg-muted/40 rounded" />
          <div className="h-12 bg-muted/40 rounded" />
          <div className="h-12 bg-muted/40 rounded" />
        </div>
      </div>
    )
  }

  if (!currentSetlist) {
    return (
      <div className="rounded-xl border border-dashed bg-card/50 p-6 text-center space-y-3">
        <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto" />
        <h3 className="font-semibold text-base">No Setlist Scheduled</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No worship setlist has been created for the upcoming Sunday service yet.
        </p>
        <Link
          href="/setlists/builder"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition shadow-sm"
        >
          Create Sunday Setlist
        </Link>
      </div>
    )
  }

  const dateObj = new Date(currentSetlist.service_date + "T00:00:00")
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  const songs = currentSetlist.songs || []
  const joyfulCount = songs.filter((s) => s.category === "joyful").length
  const worshipCount = songs.filter((s) => s.category === "worship").length

  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base sm:text-lg">{formattedDate} Service</h2>
              <SetlistStatusBadge status={currentSetlist.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {songs.length} songs total ({joyfulCount} Joyful · {worshipCount} Worship)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/perform"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition shadow-sm"
          >
            <Radio className="w-3.5 h-3.5" />
            Live Service
          </Link>
          <Link
            href={`/setlists/${currentSetlist.id}`}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium px-2 py-1.5"
          >
            <span>Full Details</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Roster Badge */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/40">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <User className="h-3.5 w-3.5 text-primary" />
          <span>
            Lead Vocals: <strong>{currentSetlist.song_leader_name || "Unassigned"}</strong>
          </span>
        </div>
        {currentSetlist.backup_singer_name && (
          <>
            <span className="text-border hidden sm:inline">•</span>
            <div>
              Backup: <strong>{currentSetlist.backup_singer_name}</strong>
            </div>
          </>
        )}
        {currentSetlist.drummer_name && (
          <>
            <span className="text-border hidden sm:inline">•</span>
            <div>
              Drums:{" "}
              <strong className="text-primary font-semibold">
                {currentSetlist.drummer_name}
              </strong>
            </div>
          </>
        )}
      </div>

      {/* Song Lineup List */}
      <div className="space-y-2">
        {songs.map((song, index) => {
          const isJoyful = song.category === "joyful"
          return (
            <div
              key={song.id || index}
              className="flex items-center justify-between p-2.5 rounded-lg bg-background/70 border border-border/40 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`p-1.5 rounded ${
                    isJoyful
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {isJoyful ? <Flame className="h-3.5 w-3.5" /> : <Heart className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground font-mono">{index + 1}.</span>
                    <span>{song.title}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {song.artist} {song.bpm ? `• ${song.bpm} BPM` : ""}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {song.reference_url && (
                  <a
                    href={song.reference_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-muted-foreground hover:text-red-500 transition"
                    title="Open pinned practice reference video"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                    isJoyful
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                  }`}
                >
                  Key: {song.assigned_key}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick check-in footer */}
      <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Home practice check-in open</span>
        </div>
        <Link href="/practice" className="text-primary hover:underline font-medium">
          Check in readiness →
        </Link>
      </div>
    </div>
  )
}
