"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getFreshSongSuggestions, type SongPlayStat } from "@/lib/analytics"
import { Sparkles, Flame, Heart, ArrowRight, Clock } from "lucide-react"

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
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">Due for Sunday Rotation</h3>
        </div>
        <Link
          href="/analytics/songs"
          className="text-xs text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
        >
          <span>Full Analytics</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        Great songs from your library that haven&apos;t been led in 45+ days:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {suggestions.map((song) => (
          <Link
            key={song.songId + song.title}
            href={`/songs/${song.songId}`}
            className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border/70 bg-card/80 hover:border-emerald-500/40 transition"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {song.category === "joyful" ? (
                  <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                ) : (
                  <Heart className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
                <span className="text-xs font-bold truncate">{song.title}</span>
              </div>
              <span className="text-[11px] text-muted-foreground block truncate">
                {song.artist} • Key {song.originalKey}
              </span>
            </div>

            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
              <Clock className="w-2.5 h-2.5" />
              {song.daysSincePlayed === null ? "Fresh" : `${song.daysSincePlayed}d ago`}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
