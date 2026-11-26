"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getSongs } from "@/lib/songs"
import { getSetlists, type FullSetlist } from "@/lib/setlists"
import { getTeamReadinessForSetlist } from "@/lib/practice"
import { WeekAtAGlanceCard } from "@/components/setlist/week-at-a-glance"
import { FreshSongsWidget } from "@/components/analytics/fresh-songs-widget"
import {
  CalendarDays,
  Music,
  CheckCircle2,
  Radio,
  Sparkles,
  Plus,
  Users,
  Clock,
  ArrowRight,
  Flame,
  Heart,
  Mic2,
} from "lucide-react"

interface DashboardMetrics {
  totalSongs: number
  joyfulSongs: number
  worshipSongs: number
  totalSetlists: number
  publishedSetlists: number
  nextSetlist: FullSetlist | null
  readinessPct: number
}

const VOCAL_LEADS = ["France", "Maegan", "Deanne", "Argel", "Andrei"]
const DRUMMERS = ["Kyle", "Aeron"]

export function DashboardOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSongs: 0,
    joyfulSongs: 0,
    worshipSongs: 0,
    totalSetlists: 0,
    publishedSetlists: 0,
    nextSetlist: null,
    readinessPct: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [songs, setlists] = await Promise.all([getSongs(), getSetlists()])
        const today = new Date().toISOString().split("T")[0]

        const upcoming =
          setlists
            .filter((s) => s.service_date >= today && s.status === "published")
            .sort((a, b) => a.service_date.localeCompare(b.service_date))[0] ||
          setlists[0] ||
          null

        let readinessPct = 0
        if (upcoming) {
          const rd = await getTeamReadinessForSetlist(upcoming.id)
          if (rd.statuses.length > 0) {
            const ready = rd.statuses.filter((s) => s.status === "ready").length
            readinessPct = Math.round((ready / rd.statuses.length) * 100)
          }
        }

        setMetrics({
          totalSongs: songs.length,
          joyfulSongs: songs.filter((s) => s.category === "joyful").length,
          worshipSongs: songs.filter((s) => s.category === "worship").length,
          totalSetlists: setlists.length,
          publishedSetlists: setlists.filter((s) => s.status === "published").length,
          nextSetlist: upcoming,
          readinessPct,
        })
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err)
      } finally {
        setLoading(false)
      }
    }
    loadMetrics()
  }, [])

  return (
    <div className="space-y-6">
      {/* Top Dashboard Command Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/35 via-card to-card p-5 sm:p-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-3 w-3" />
            <span>WorshipFlow Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready for Sunday Worship
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Manage weekly setlists, track band readiness, and stay in sync for Sunday 9:00 AM rehearsal &amp; 2:30 PM live service.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link
            href="/setlists/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Setlist</span>
          </Link>
          <Link
            href="/perform"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Live Mode</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Next Service */}
        <Link
          href={metrics.nextSetlist ? `/setlists/${metrics.nextSetlist.id}` : "/setlists"}
          className="group rounded-2xl border border-border/70 bg-card/85 hover:border-blue-500/40 p-4 space-y-2 transition shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">Next Service</span>
            <CalendarDays className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-extrabold font-mono tracking-tight">
            {loading ? "—" : metrics.nextSetlist?.service_date || "Unscheduled"}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            Lead: <strong className="text-foreground">{metrics.nextSetlist?.song_leader_name || "TBD"}</strong> • Drums:{" "}
            <strong className="text-foreground">{metrics.nextSetlist?.drummer_name || "TBD"}</strong>
          </div>
        </Link>

        {/* Card 2: Team Readiness */}
        <Link
          href="/practice/readiness"
          className="group rounded-2xl border border-border/70 bg-card/85 hover:border-emerald-500/40 p-4 space-y-2 transition shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">Team Readiness</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-extrabold font-mono text-emerald-400">
            {loading ? "—" : `${metrics.readinessPct}%`}
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${metrics.readinessPct}%` }}
            />
          </div>
        </Link>

        {/* Card 3: Song Library */}
        <Link
          href="/songs"
          className="group rounded-2xl border border-border/70 bg-card/85 hover:border-indigo-500/40 p-4 space-y-2 transition shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">Song Library</span>
            <Music className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-extrabold font-mono">
            {loading ? "—" : metrics.totalSongs}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5 text-orange-400">
              <Flame className="w-3 h-3" /> {metrics.joyfulSongs}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-0.5 text-blue-400">
              <Heart className="w-3 h-3" /> {metrics.worshipSongs}
            </span>
          </div>
        </Link>

        {/* Card 4: Setlists */}
        <Link
          href="/setlists"
          className="group rounded-2xl border border-border/70 bg-card/85 hover:border-purple-500/40 p-4 space-y-2 transition shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">Active Setlists</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-extrabold font-mono">
            {loading ? "—" : metrics.totalSetlists}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {metrics.publishedSetlists} published for Sunday
          </div>
        </Link>
      </div>

      {/* Main 2-Column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left / Main Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <WeekAtAGlanceCard />
          <FreshSongsWidget />
        </div>

        {/* Right / Side Column (1/3) */}
        <div className="space-y-5">
          {/* Weekly Worship Routine Card */}
          <div className="rounded-2xl border border-border/70 bg-card/85 p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold">Weekly Routine</h2>
            </div>

            <ol className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <div className="font-semibold text-foreground">Mon – Sat: Home Practice</div>
                  <div className="text-[11px] text-muted-foreground">
                    Review chords, keys, and mark songs ready
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <div className="font-semibold text-foreground">Sunday 9:00 AM: Rehearsal</div>
                  <div className="text-[11px] text-muted-foreground">
                    Full-band run-through &amp; transition cues
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-500/15 text-red-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <div className="font-semibold text-foreground">Sunday 2:30 PM: Live Service</div>
                  <div className="text-[11px] text-muted-foreground">
                    Real-time stage sync in Live Mode
                  </div>
                </div>
              </li>
            </ol>
          </div>

          {/* Rotation Roster Snapshot */}
          <div className="rounded-2xl border border-border/70 bg-card/85 p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold">Team Rotation</h2>
              </div>
              <Link
                href="/admin/team"
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1">
                  <Mic2 className="w-3 h-3 text-pink-400" />
                  Vocal Song Leaders (5)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {VOCAL_LEADS.map((name) => (
                    <span
                      key={name}
                      className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border/50 text-[11px] font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Drummers (Alternating)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DRUMMERS.map((name) => (
                    <span
                      key={name}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Director Promo Card */}
          <Link
            href="/chat"
            className="block rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-card to-card p-5 space-y-2.5 hover:border-purple-400/50 transition shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Ask AI Director</span>
              </span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate chord charts, check vocal key sweet spots, or prep your Sunday 9:00 AM rehearsal briefing.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
