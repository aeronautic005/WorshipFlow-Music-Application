"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSongPlayStats, type SongPlayStat } from "@/lib/analytics"
import { SongFrequencyTable } from "@/components/analytics/song-frequency-table"
import {
  BarChart3,
  Users,
  Music2,
  Flame,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react"

export default function SongAnalyticsPage() {
  const [stats, setStats] = useState<SongPlayStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getSongPlayStats()
        setStats(data)
      } catch (err) {
        console.error("Failed to load song analytics:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const summary = useMemo(() => {
    const totalPlays = stats.reduce((acc, s) => acc + s.playCount, 0)
    const topSong = stats[0] || null
    const freshSongs = stats.filter(
      (s) => s.daysSincePlayed === null || s.daysSincePlayed >= 45
    ).length
    return {
      totalTracked: stats.length,
      totalPlays,
      topSong,
      freshSongs,
    }
  }, [stats])

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header & Sub-nav */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <span>Worship Analytics</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track song rotation frequency, recency, and avoid repeating songs too closely.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border/70 bg-card text-xs font-semibold">
            <Link
              href="/analytics/songs"
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground flex items-center gap-1.5"
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Song Frequency</span>
            </Link>
            <Link
              href="/analytics/leaders"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Leader Keys</span>
            </Link>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl border border-border/70 bg-card/80 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Music2 className="w-3 h-3 text-indigo-400" />
              <span>Songs Tracked</span>
            </span>
            <p className="text-xl font-bold font-mono">{summary.totalTracked}</p>
          </div>

          <div className="p-4 rounded-2xl border border-border/70 bg-card/80 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Total Plays</span>
            </span>
            <p className="text-xl font-bold font-mono">{summary.totalPlays}</p>
          </div>

          <div className="p-4 rounded-2xl border border-border/70 bg-card/80 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Most Played</span>
            </span>
            <p className="text-sm font-bold truncate">
              {summary.topSong ? summary.topSong.title : "—"}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border/70 bg-card/80 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Due for Rotation</span>
            </span>
            <p className="text-xl font-bold font-mono text-emerald-400">{summary.freshSongs}</p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <SongFrequencyTable stats={stats} />
        )}
      </div>
    </AppShell>
  )
}
