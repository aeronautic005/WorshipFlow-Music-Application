"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { getSongs } from "@/lib/songs"
import { getSetlists, type FullSetlist } from "@/lib/setlists"
import { getTeamReadinessForSetlist } from "@/lib/practice"
import { getSongPlayStats, type SongPlayStat } from "@/lib/analytics"
import {
  Calendar,
  Plus,
  Radio,
  Search,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Info,
} from "lucide-react"

interface DashboardState {
  totalSongs: number
  joyfulSongs: number
  worshipSongs: number
  totalSetlists: number
  publishedSetlists: number
  nextSetlist: FullSetlist | null
  readinessPct: number
  checkedInCount: number
  totalChecksCount: number
  songStats: SongPlayStat[]
}

const VOCAL_LEADS = ["France", "Maegan", "Deanne", "Argel", "Andrei"]
const DRUMMERS = ["Kyle", "Aeron"]

function MiniSparkline({ heights }: { heights: number[] }) {
  return (
    <div className="flex items-end gap-1 h-9 shrink-0" aria-hidden="true">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full ${
            i === heights.length - 2 ? "bg-foreground" : "bg-border"
          }`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardState>({
    totalSongs: 0,
    joyfulSongs: 0,
    worshipSongs: 0,
    totalSetlists: 0,
    publishedSetlists: 0,
    nextSetlist: null,
    readinessPct: 0,
    checkedInCount: 0,
    totalChecksCount: 0,
    songStats: [],
  })
  const [loading, setLoading] = useState(true)
  const [tableSearch, setTableSearch] = useState("")

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [songs, setlists, songStats] = await Promise.all([
          getSongs(),
          getSetlists(),
          getSongPlayStats(),
        ])
        const today = new Date().toISOString().split("T")[0]

        const upcoming =
          setlists
            .filter((s) => s.service_date >= today && s.status === "published")
            .sort((a, b) => a.service_date.localeCompare(b.service_date))[0] ||
          setlists[0] ||
          null

        let readinessPct = 0
        let checkedInCount = 0
        let totalChecksCount = 0

        if (upcoming) {
          const rd = await getTeamReadinessForSetlist(upcoming.id)
          totalChecksCount = rd.statuses.length
          if (totalChecksCount > 0) {
            checkedInCount = rd.statuses.filter((s) => s.status === "ready").length
            readinessPct = Math.round((checkedInCount / totalChecksCount) * 100)
          }
        }

        setData({
          totalSongs: songs.length,
          joyfulSongs: songs.filter((s) => s.category === "joyful").length,
          worshipSongs: songs.filter((s) => s.category === "worship").length,
          totalSetlists: setlists.length,
          publishedSetlists: setlists.filter((s) => s.status === "published").length,
          nextSetlist: upcoming,
          readinessPct,
          checkedInCount,
          totalChecksCount,
          songStats,
        })
      } catch (err) {
        console.error("Failed to load dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const filteredTableSongs = useMemo(() => {
    const q = tableSearch.trim().toLowerCase()
    const base = data.songStats
    if (!q) return base.slice(0, 8)
    return base
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.originalKey.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [data.songStats, tableSearch])

  const upcomingSongs = data.nextSetlist?.songs || []

  return (
    <div className="space-y-5">
      {/* Top Greeting & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Welcome back, Worship Team
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-xs text-muted-foreground font-medium">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{data.nextSetlist?.service_date || "Sunday Service"}</span>
          </div>

          <Link
            href="/perform"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Mode</span>
          </Link>

          <Link
            href="/setlists/new"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Setlist</span>
          </Link>
        </div>
      </div>

      {/* 4 Minimal Monochrome KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Next Service */}
        <Link
          href={data.nextSetlist ? `/setlists/${data.nextSetlist.id}` : "/setlists"}
          className="rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/30 transition-colors"
        >
          <div className="p-4 flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Next Service
              </div>
              <div className="text-lg font-bold font-mono text-foreground truncate">
                {loading ? "..." : data.nextSetlist?.service_date || "Unscheduled"}
              </div>
            </div>
            <MiniSparkline heights={[35, 60, 45, 85, 50]} />
          </div>
          <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="truncate">
              Lead: {data.nextSetlist?.song_leader_name || "TBD"}
            </span>
            <span className="shrink-0 font-medium text-foreground">
              Drums: {data.nextSetlist?.drummer_name || "TBD"}
            </span>
          </div>
        </Link>

        {/* KPI 2: Team Readiness */}
        <Link
          href="/practice/readiness"
          className="rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/30 transition-colors"
        >
          <div className="p-4 flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Team Readiness
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {loading ? "..." : `${data.readinessPct}%`}
              </div>
            </div>
            <MiniSparkline heights={[40, 55, 70, 95, 65]} />
          </div>
          <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Practice check-ins</span>
            <span className="font-medium text-foreground">
              {data.checkedInCount}/{data.totalChecksCount} ready
            </span>
          </div>
        </Link>

        {/* KPI 3: Song Library */}
        <Link
          href="/songs"
          className="rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/30 transition-colors"
        >
          <div className="p-4 flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Song Library
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {loading ? "..." : data.totalSongs}{" "}
                <span className="text-xs font-sans font-normal text-muted-foreground">Songs</span>
              </div>
            </div>
            <MiniSparkline heights={[50, 75, 40, 90, 60]} />
          </div>
          <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{data.joyfulSongs} Joyful</span>
            <span className="font-medium text-foreground">{data.worshipSongs} Worship</span>
          </div>
        </Link>

        {/* KPI 4: Active Setlists */}
        <Link
          href="/setlists"
          className="rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/30 transition-colors"
        >
          <div className="p-4 flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Active Setlists
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {loading ? "..." : data.totalSetlists}
              </div>
            </div>
            <MiniSparkline heights={[30, 50, 80, 95, 45]} />
          </div>
          <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Schedule status</span>
            <span className="font-medium text-foreground">
              {data.publishedSetlists} published
            </span>
          </div>
        </Link>
      </div>

      {/* Middle 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Left (2/3): Upcoming Sunday Lineup */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card flex flex-col">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Upcoming Sunday Lineup
              </h2>
              <Info className="w-3.5 h-3.5 text-muted-foreground/70" />
            </div>

            {data.nextSetlist && (
              <Link
                href={`/setlists/${data.nextSetlist.id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
              >
                <span>Open Setlist</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="p-5 flex-1 space-y-4">
            {data.nextSetlist ? (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Scheduled Service</div>
                    <div className="text-lg font-bold text-foreground">
                      {data.nextSetlist.service_date} — {upcomingSongs.length} Songs
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Leader: {data.nextSetlist.song_leader_name || "TBD"}</span>
                    <span>•</span>
                    <span>Backup: {data.nextSetlist.backup_singer_name || "None"}</span>
                    <span>•</span>
                    <span>Drums: {data.nextSetlist.drummer_name || "TBD"}</span>
                  </div>
                </div>

                {/* Simple Monochrome Song List */}
                <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                  {upcomingSongs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No songs added to this setlist yet.
                    </div>
                  ) : (
                    upcomingSongs.map((song, idx) => (
                      <Link
                        key={song.id || idx}
                        href={`/songs/${song.song_id}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 bg-card hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-5 text-xs font-mono text-muted-foreground">
                            {idx + 1}.
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-foreground truncate">
                              {song.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {song.artist}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="px-2 py-0.5 rounded-md border border-border bg-muted/50 text-[11px] font-medium text-muted-foreground capitalize">
                            {song.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-md border border-border bg-card text-xs font-mono font-semibold text-foreground min-w-[38px] text-center">
                            {song.assigned_key}
                          </span>
                          {song.bpm && (
                            <span className="hidden sm:inline text-[11px] font-mono text-muted-foreground w-14 text-right">
                              {song.bpm} BPM
                            </span>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                {data.nextSetlist.notes && (
                  <div className="px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
                    <strong className="text-foreground font-medium">Notes:</strong>{" "}
                    {data.nextSetlist.notes}
                  </div>
                )}
              </>
            ) : (
              <div className="py-10 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  No Sunday setlist scheduled yet.
                </p>
                <Link
                  href="/setlists/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                >
                  Create Setlist
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right (1/3): Breakdown & AI Insight */}
        <div className="rounded-xl border border-border bg-card flex flex-col">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Team &amp; Rehearsal
            </h2>
            <Link
              href="/admin/team"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Roster
            </Link>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
            {/* Schedule Summary */}
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Weekly Schedule</div>
                <div className="text-base font-bold text-foreground mt-0.5">
                  Sun 9:00 AM &amp; 2:30 PM
                </div>
              </div>

              {/* Clean Neutral AI Insight Bar (matching reference) */}
              <Link
                href="/chat"
                className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted transition-colors text-xs text-foreground"
              >
                <span className="flex items-center gap-2 font-medium truncate">
                  <Sparkles className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">Get AI insight for Sunday rehearsal</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </Link>
            </div>

            {/* Clean Roster Breakdown */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-muted-foreground">
                  Vocal Song Leaders (5)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {VOCAL_LEADS.map((name) => (
                    <span
                      key={name}
                      className="px-2.5 py-1 rounded-md border border-border bg-background text-xs font-medium text-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-muted-foreground">
                  Drummers (Alternating)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DRUMMERS.map((name) => (
                    <span
                      key={name}
                      className="px-2.5 py-1 rounded-md border border-border bg-background text-xs font-medium text-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Steps */}
            <div className="pt-3 border-t border-border space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Mon – Sat</span>
                <span className="font-medium text-foreground">Home Practice</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday 9:00 AM</span>
                <span className="font-medium text-foreground">Full Rehearsal</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday 2:30 PM</span>
                <span className="font-medium text-foreground">Live Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Table: Repertoire & Rotation */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Song Library &amp; Rotation
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search songs..."
                className="h-8 w-44 sm:w-56 pl-8 pr-3 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <Link
              href="/songs/new"
              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Song</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-5">Song Title</th>
                <th className="py-2.5 px-4">Artist</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Key</th>
                <th className="py-2.5 px-4">Plays</th>
                <th className="py-2.5 px-4">Last Sung</th>
                <th className="py-2.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredTableSongs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No matching songs found.
                  </td>
                </tr>
              ) : (
                filteredTableSongs.map((song) => (
                  <tr
                    key={song.songId + song.title}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-5 font-semibold text-foreground">{song.title}</td>
                    <td className="py-3 px-4 text-muted-foreground">{song.artist}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md border border-border bg-muted/50 text-[11px] font-medium text-foreground capitalize">
                        {song.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-foreground">
                      {song.originalKey}
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {song.playCount}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {song.lastPlayedDate || "Not yet played"}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link
                        href={`/songs/${song.songId}`}
                        className="text-xs font-medium text-foreground hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
