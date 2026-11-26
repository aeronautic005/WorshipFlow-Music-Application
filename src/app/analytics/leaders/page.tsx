"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getLeaderHistoryStats, type LeaderAnalyticsStat } from "@/lib/analytics"
import { LeaderStatsCard } from "@/components/analytics/leader-stats-card"
import {
  BarChart3,
  Users,
  Music2,
  Mic2,
  Loader2,
  Sparkles,
} from "lucide-react"

export default function LeaderAnalyticsPage() {
  const [leaders, setLeaders] = useState<LeaderAnalyticsStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getLeaderHistoryStats()
        setLeaders(data)
      } catch (err) {
        console.error("Failed to load leader analytics:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const teamSummary = useMemo(() => {
    const totalServices = leaders.reduce((acc, l) => acc + l.totalServicesLed, 0)
    const keyCounts: Record<string, number> = {}
    for (const l of leaders) {
      for (const pk of l.preferredKeys) {
        keyCounts[pk.key] = (keyCounts[pk.key] || 0) + pk.count
      }
    }
    const topGlobalKey = Object.entries(keyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "G"

    return {
      leaderCount: leaders.length,
      totalServices,
      topGlobalKey,
    }
  }, [leaders])

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
              Vocal rotation insights, comfortable singing keys, and repertoire history per leader.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border/70 bg-card text-xs font-semibold">
            <Link
              href="/analytics/songs"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition flex items-center gap-1.5"
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Song Frequency</span>
            </Link>
            <Link
              href="/analytics/leaders"
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Leader Keys</span>
            </Link>
          </div>
        </div>

        {/* Team Rotation Summary Banner */}
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Mic2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {teamSummary.leaderCount} Rotating Vocal Song Leaders
              </h2>
              <p className="text-xs text-muted-foreground">
                France, Maegan, Deanne, Argel, and Andrei alternate weekly lead &amp; backup harmony duties.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-card border border-border/70 text-xs">
              <span className="text-muted-foreground mr-1.5">Top Team Key:</span>
              <span className="font-mono font-bold text-primary">{teamSummary.topGlobalKey}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-card border border-border/70 text-xs">
              <span className="text-muted-foreground mr-1.5">Services:</span>
              <span className="font-mono font-bold text-foreground">{teamSummary.totalServices}</span>
            </div>
          </div>
        </div>

        {/* Leader Cards Grid */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaders.map((leader) => (
              <LeaderStatsCard key={leader.leaderName} leader={leader} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
