"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSetlists, type FullSetlist } from "@/lib/setlists"
import {
  getTeamReadinessForSetlist,
  type PracticeStatusRecord,
  type SongReadinessSummary,
} from "@/lib/practice"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Circle,
  Users,
  Flame,
  Heart,
  Music2,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react"

export default function TeamReadinessDashboardPage() {
  const [setlists, setSetlists] = useState<FullSetlist[]>([])
  const [selectedSetlistId, setSelectedSetlistId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [readinessData, setReadinessData] = useState<{
    statuses: PracticeStatusRecord[]
    summaries: SongReadinessSummary[]
  }>({ statuses: [], summaries: [] })

  useEffect(() => {
    async function loadInitial() {
      setLoading(true)
      const list = await getSetlists()
      setSetlists(list)
      const current = list[0]
      if (current) {
        setSelectedSetlistId(current.id)
        const rd = await getTeamReadinessForSetlist(current.id)
        setReadinessData(rd)
      }
      setLoading(false)
    }
    loadInitial()
  }, [])

  const handleSelectSetlist = async (id: string) => {
    setSelectedSetlistId(id)
    setLoading(true)
    const rd = await getTeamReadinessForSetlist(id)
    setReadinessData(rd)
    setLoading(false)
  }

  const currentSetlist = useMemo(
    () => setlists.find((s) => s.id === selectedSetlistId) || setlists[0] || null,
    [setlists, selectedSetlistId]
  )

  const overallStats = useMemo(() => {
    const statuses = readinessData.statuses
    if (statuses.length === 0) return { ready: 0, needsWork: 0, notStarted: 0, percent: 0 }
    const ready = statuses.filter((s) => s.status === "ready").length
    const needsWork = statuses.filter((s) => s.status === "needs_work").length
    const notStarted = statuses.filter((s) => s.status === "not_started").length
    const percent = Math.round((ready / statuses.length) * 100)
    return { ready, needsWork, notStarted, percent }
  }, [readinessData.statuses])

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/practice"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Practice Hub</span>
          </Link>

          <Link
            href="/setlists"
            className="text-xs text-primary hover:underline font-medium"
          >
            View Weekly Setlists
          </Link>
        </div>

        {/* Header Banner */}
        <div className="p-6 rounded-2xl border bg-card/60 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20 mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Sunday Rehearsal Readiness</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Team Practice Status</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitor team home practice check-ins and target rehearsal focus areas before Sunday morning.
              </p>
            </div>

            {/* Setlist Selector */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">
                Service Date:
              </label>
              <select
                aria-label="Select service date"
                value={selectedSetlistId}
                onChange={(e) => handleSelectSetlist(e.target.value)}
                className="w-full sm:w-auto text-xs px-3 py-2 rounded-lg border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {setlists.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.service_date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    ({s.song_leader_name || "Leader"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Overall Progress Meter */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-foreground">
                  Overall Lineup Readiness: {overallStats.percent}% Ready
                </span>
              </div>
              <span className="text-muted-foreground">
                {overallStats.ready} Ready · {overallStats.needsWork} Needs Work · {overallStats.notStarted} Not Started
              </span>
            </div>

            {/* Multi-segment progress bar */}
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
              <div
                style={{ width: `${overallStats.percent}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`${overallStats.ready} songs ready`}
              />
              <div
                style={{
                  width: `${
                    readinessData.statuses.length > 0
                      ? (overallStats.needsWork / readinessData.statuses.length) * 100
                      : 0
                  }%`,
                }}
                className="bg-amber-500 transition-all duration-500"
                title={`${overallStats.needsWork} songs need work`}
              />
            </div>
          </div>
        </div>

        {/* Songs Readiness Cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Music2 className="w-4 h-4 text-primary" />
            <span>Readiness by Song in Setlist</span>
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-xl border bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : !currentSetlist?.songs || currentSetlist.songs.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No songs in this setlist.
            </div>
          ) : (
            <div className="space-y-3">
              {currentSetlist.songs.map((song, idx) => {
                const songStatuses = readinessData.statuses.filter((s) => s.song_id === song.song_id)
                const isJoyful = song.category === "joyful"

                return (
                  <div
                    key={song.id || idx}
                    className="p-4 rounded-xl border bg-card shadow-xs space-y-3 hover:border-primary/40 transition"
                  >
                    {/* Song Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono font-bold text-muted-foreground w-5 text-center">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm truncate">{song.title}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                isJoyful
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                              }`}
                            >
                              Key {song.assigned_key}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{song.artist}</p>
                        </div>
                      </div>

                      {/* Quick Reference Link */}
                      {song.reference_url && (
                        <a
                          href={song.reference_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-primary hover:underline font-medium self-start sm:self-auto"
                        >
                          Official Practice Reference →
                        </a>
                      )}
                    </div>

                    {/* Member Check-ins Grid */}
                    <div className="pt-2 border-t space-y-2">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        Musician Check-ins:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {songStatuses.length === 0 ? (
                          <div className="text-xs text-muted-foreground italic py-1">
                            Awaiting member check-ins for this song
                          </div>
                        ) : (
                          songStatuses.map((st) => {
                            const isReady = st.status === "ready"
                            const isNeedsWork = st.status === "needs_work"

                            return (
                              <div
                                key={st.id}
                                className={`flex items-start justify-between p-2.5 rounded-lg border text-xs ${
                                  isReady
                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                    : isNeedsWork
                                    ? "bg-amber-500/5 border-amber-500/20"
                                    : "bg-muted/30 border-border"
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-foreground">
                                      {st.user_name}
                                    </span>
                                    <span className="text-[10px] px-1 py-0.2 rounded bg-muted text-muted-foreground">
                                      {st.instrument}
                                    </span>
                                  </div>
                                  {st.private_notes && (
                                    <p className="text-[10px] text-muted-foreground line-clamp-2 italic">
                                      &quot;{st.private_notes}&quot;
                                    </p>
                                  )}
                                </div>

                                <div className="shrink-0 ml-2">
                                  {isReady && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Ready
                                    </span>
                                  )}
                                  {isNeedsWork && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      Needs Work
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
