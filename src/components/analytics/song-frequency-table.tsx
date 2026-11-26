"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { SongPlayStat } from "@/lib/analytics"
import {
  Search,
  Flame,
  Heart,
  Calendar,
  Users,
  ArrowUpDown,
  Music,
} from "lucide-react"

export interface SongFrequencyTableProps {
  stats: SongPlayStat[]
}

export function SongFrequencyTable({ stats }: SongFrequencyTableProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | "joyful" | "worship">("all")
  const [sortBy, setSortBy] = useState<"most_played" | "most_recent" | "least_recent">("most_played")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return stats
      .filter((s) => {
        if (categoryFilter !== "all" && s.category !== categoryFilter) return false
        if (q && !s.title.toLowerCase().includes(q) && !s.artist.toLowerCase().includes(q)) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "most_played") return b.playCount - a.playCount
        if (sortBy === "most_recent") {
          const da = a.daysSincePlayed ?? 9999
          const db = b.daysSincePlayed ?? 9999
          return da - db
        }
        // least_recent
        const da = a.daysSincePlayed ?? 9999
        const db = b.daysSincePlayed ?? 9999
        return db - da
      })
  }, [stats, search, categoryFilter, sortBy])

  const getRecencyBadge = (days: number | null) => {
    if (days === null) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
          Never Played
        </span>
      )
    }
    if (days <= 14) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
          Recent • {days}d ago
        </span>
      )
    }
    if (days >= 45) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
          Fresh • {days}d ago
        </span>
      )
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground text-[10px] font-medium">
        {days}d ago
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter songs by title or artist..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/70 bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border/70 bg-card p-0.5 text-xs">
            {(["all", "joyful", "worship"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 pl-8 pr-3 rounded-xl border border-border/70 bg-card text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="most_played">Most Played</option>
              <option value="most_recent">Recently Sung</option>
              <option value="least_recent">Due for Rotation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Song Rows */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed bg-card/40 text-xs text-muted-foreground">
          No songs match the selected filters.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <Link
              key={item.songId + item.title}
              href={`/songs/${item.songId}`}
              className="block rounded-2xl border border-border/70 bg-card/80 hover:border-primary/40 p-4 transition shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.category === "joyful" ? (
                      <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    ) : (
                      <Heart className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    )}
                    <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Orig: {item.originalKey}
                    </span>
                    {getRecencyBadge(item.daysSincePlayed)}
                  </div>

                  <p className="text-xs text-muted-foreground">{item.artist}</p>
                </div>

                {/* Right stats */}
                <div className="flex items-center gap-4 shrink-0 text-xs">
                  {item.leadersUsed.length > 0 && (
                    <div className="hidden md:flex items-center gap-1.5 text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-primary/70" />
                      <span>{item.leadersUsed.join(", ")}</span>
                    </div>
                  )}

                  {item.keysUsed.length > 0 && (
                    <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                      <Music className="w-3 h-3" />
                      <span>{item.keysUsed.join(", ")}</span>
                    </div>
                  )}

                  <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-xs min-w-[76px] text-center">
                    {item.playCount}× played
                  </div>
                </div>
              </div>

              {item.lastPlayedDate && (
                <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Last sung: {item.lastPlayedDate}</span>
                  </span>
                  {item.leadersUsed.length > 0 && (
                    <span className="md:hidden">Led by: {item.leadersUsed.join(", ")}</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
