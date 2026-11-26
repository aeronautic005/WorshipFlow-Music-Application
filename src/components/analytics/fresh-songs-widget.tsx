"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getFreshSongSuggestions, type SongPlayStat } from "@/lib/analytics"
import { ArrowRight, Clock } from "lucide-react"

export function FreshSongsWidget() {
  const [suggestions, setSuggestions] = useState<SongPlayStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await getFreshSongSuggestions(45, 4)
        setSuggestions(res)
      } catch (err) {
        console.error("Failed to load fresh song suggestions:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || suggestions.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Due for Sunday Rotation
        </h3>
        <Link
          href="/analytics/songs"
          className="text-xs text-foreground hover:underline font-medium inline-flex items-center gap-1"
        >
          <span>Full Analytics</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        Songs from your library that haven&apos;t been led in 45+ days:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {suggestions.map((song) => (
          <Link
            key={song.songId + song.title}
            href={`/songs/${song.songId}`}
            className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
          >
            <div className="min-w-0">
              <span className="text-xs font-semibold text-foreground block truncate">
                {song.title}
              </span>
              <span className="text-[11px] text-muted-foreground block truncate">
                {song.artist} • Key {song.originalKey}
              </span>
            </div>

            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border bg-card text-muted-foreground text-[10px] font-medium">
              <Clock className="w-2.5 h-2.5" />
              {song.daysSincePlayed === null ? "Fresh" : `${song.daysSincePlayed}d ago`}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
