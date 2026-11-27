"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { getSongs } from "@/lib/songs"
import { getSetlists, type FullSetlist } from "@/lib/setlists"
import { getTeamReadinessForSetlist } from "@/lib/practice"
import { getSongPlayStats, type SongPlayStat } from "@/lib/analytics"
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  Music,
  Mic2,
  Plus,
  Search,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  User,
  Users,
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
    if (!q) return base.slice(0, 6)
    return base
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.originalKey.toLowerCase().includes(q)
      )
      .slice(0, 6)
  }, [data.songStats, tableSearch])

  const upcomingSongs = data.nextSetlist?.songs || []

  const shortNextDate = data.nextSetlist
    ? new Date(data.nextSetlist.service_date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "TBD"

  return (
    <div className="space-y-6">
      {/* Top Row: Quick Stats (Jobgio vertical pill card concept) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Left Intro + Pill Actions */}
        <div className="xl:w-64 shrink-0 space-y-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Quick Stats</h1>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Your worship team overview for the upcoming Sunday service.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            <Link
              href="/setlists/new"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Setlist</span>
            </Link>

            <Link
              href="/perform"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span>Live Mode</span>
            </Link>
          </div>
        </div>

        {/* Right: 5 Tall Rounded Vertical Pill Stat Cards */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {/* Pill 1: Next Service */}
          <Link
            href={data.nextSetlist ? `/setlists/${data.nextSetlist.id}` : "/setlists"}
            className="rounded-[28px] border border-border/70 bg-card p-5 flex flex-col items-center justify-center text-center gap-2.5 shadow-[0_2px_12px_rgba(15,37,74,0.04)] hover:border-primary/35 transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-secondary text-primary flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-primary leading-tight">
                {loading ? "..." : shortNextDate}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Next Service</div>
            </div>
          </Link>

          {/* Pill 2 (Featured): Team Readiness — Solid Deep Navy Icon Circle + Bottom Arrow */}
          <Link
            href="/practice/readiness"
            className="relative rounded-[28px] border border-border/70 bg-card p-5 pb-6 flex flex-col items-center justify-center text-center gap-2.5 shadow-[0_4px_16px_rgba(15,37,74,0.07)] hover:border-primary/40 transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-primary leading-tight">
                {loading ? "..." : `${data.readinessPct}%`}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Team Readiness</div>
            </div>
            <span className="absolute -bottom-3 w-7 h-7 rounded-full bg-card border border-border shadow-xs flex items-center justify-center text-primary">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Pill 3: Total Songs */}
          <Link
            href="/songs"
            className="rounded-[28px] border border-border/70 bg-card p-5 flex flex-col items-center justify-center text-center gap-2.5 shadow-[0_2px_12px_rgba(15,37,74,0.04)] hover:border-primary/35 transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-secondary text-primary flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-primary leading-tight">
                {loading ? "..." : data.totalSongs}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Total Songs</div>
            </div>
          </Link>

          {/* Pill 4: Active Setlists */}
          <Link
            href="/setlists"
            className="rounded-[28px] border border-border/70 bg-card p-5 flex flex-col items-center justify-center text-center gap-2.5 shadow-[0_2px_12px_rgba(15,37,74,0.04)] hover:border-primary/35 transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-secondary text-primary flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-primary leading-tight">
                {loading ? "..." : data.totalSetlists}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Setlists</div>
            </div>
          </Link>

          {/* Pill 5: Song Leaders */}
          <Link
            href="/analytics/leaders"
            className="rounded-[28px] border border-border/70 bg-card p-5 flex flex-col items-center justify-center text-center gap-2.5 shadow-[0_2px_12px_rgba(15,37,74,0.04)] hover:border-primary/35 transition-all col-span-2 sm:col-span-1"
          >
            <div className="w-11 h-11 rounded-full bg-secondary text-primary flex items-center justify-center">
              <Mic2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-primary leading-tight">
                {VOCAL_LEADS.length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Song Leaders</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Middle 2-Column Soft Rounded Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch pt-1">
        {/* Left (2/3): Upcoming Sunday Lineup */}
        <div className="lg:col-span-2 rounded-3xl border border-border/70 bg-card p-6 shadow-[0_2px_12px_rgba(15,37,74,0.04)] flex flex-col space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-primary">Upcoming Sunday Lineup</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {data.nextSetlist
                  ? `${data.nextSetlist.service_date} • ${upcomingSongs.length} scheduled songs`
                  : "No Sunday setlist scheduled yet"}
              </p>
            </div>

            {data.nextSetlist && (
              <Link
                href={`/setlists/${data.nextSetlist.id}`}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-border bg-card hover:bg-secondary text-xs font-semibold text-primary transition-colors"
              >
                <span>Open Setlist</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {data.nextSetlist ? (
            <div className="space-y-2.5 flex-1">
              {upcomingSongs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground rounded-2xl bg-secondary/40">
                  No songs added to this setlist yet.
                </div>
              ) : (
                upcomingSongs.map((song, idx) => (
                  <Link
                    key={song.id || idx}
                    href={`/songs/${song.song_id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-secondary/45 hover:bg-secondary/80 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-8 h-8 rounded-full bg-card border border-border/80 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {song.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {song.artist}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-card border border-border/70 text-[11px] font-medium text-muted-foreground capitalize">
                        {song.category}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold min-w-[40px] text-center">
                        {song.assigned_key}
                      </span>
                    </div>
                  </Link>
                ))
              )}

              {data.nextSetlist.notes && (
                <div className="px-4 py-3 rounded-2xl border border-border/70 bg-background text-xs text-muted-foreground mt-3">
                  <strong className="text-primary font-semibold">Notes:</strong>{" "}
                  {data.nextSetlist.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs text-muted-foreground">No Sunday setlist scheduled yet.</p>
              <Link
                href="/setlists/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
              >
                Create Setlist
              </Link>
            </div>
          )}
        </div>

        {/* Right (1/3): Sunday Duty & Schedule (Jobgio Pending Approvals style) */}
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-[0_2px_12px_rgba(15,37,74,0.04)] flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-primary">Sunday Duty</h2>
              <Link
                href="/admin/team"
                className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                Roster
              </Link>
            </div>

            {/* Clean Duty Rows */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">
                      {data.nextSetlist?.song_leader_name || "France"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Sun 9:00 AM &amp; 2:30 PM</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary text-[11px] font-semibold text-primary shrink-0">
                  Lead
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
                    <Mic2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">
                      {data.nextSetlist?.backup_singer_name || "Andrei"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Vocal Harmony</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground shrink-0">
                  Backup
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">
                      {data.nextSetlist?.drummer_name || "Aeron"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Alternating Rotation</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground shrink-0">
                  Drums
                </span>
              </div>
            </div>
          </div>

          {/* Readiness & AI Action */}
          <div className="space-y-3 pt-4 border-t border-border/70">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-medium">Practice Readiness</span>
                <span className="font-bold text-primary">{data.readinessPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(8, data.readinessPct)}%` }}
                />
              </div>
            </div>

            <Link
              href="/chat"
              className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-full bg-secondary hover:bg-accent transition-colors text-xs text-primary font-semibold"
            >
              <span className="flex items-center gap-2 truncate">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">AI Rehearsal Insight</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Soft Rounded Card (Jobgio Manage Jobs style) */}
      <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-[0_2px_12px_rgba(15,37,74,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-primary">Manage Songs &amp; Rotation</h2>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search songs..."
                className="h-9 w-44 sm:w-56 pl-9 pr-3.5 rounded-full border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <Link
              href="/songs/new"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Song</span>
            </Link>
          </div>
        </div>

        {/* Column Header Row */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 pt-1 text-[11px] font-medium text-muted-foreground">
          <div className="col-span-4">Song Title</div>
          <div className="col-span-3">Artist</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1">Key</div>
          <div className="col-span-2 text-right">Last Sung</div>
        </div>

        {/* Floating Soft Rounded Rows */}
        <div className="space-y-2">
          {filteredTableSongs.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground rounded-2xl bg-secondary/40">
              No matching songs found.
            </div>
          ) : (
            filteredTableSongs.map((song) => (
              <Link
                key={song.songId + song.title}
                href={`/songs/${song.songId}`}
                className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-3 px-4 py-3 rounded-2xl bg-secondary/40 hover:bg-secondary/75 transition-colors text-xs"
              >
                <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-card border border-border/70 flex items-center justify-center text-primary shrink-0">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-foreground truncate">{song.title}</span>
                </div>

                <div className="md:col-span-3 text-muted-foreground truncate pl-11 md:pl-0">
                  {song.artist}
                </div>

                <div className="md:col-span-2 pl-11 md:pl-0">
                  <span className="inline-block px-3 py-1 rounded-full bg-card border border-border/70 text-[11px] font-medium text-primary capitalize">
                    {song.category}
                  </span>
                </div>

                <div className="md:col-span-1 pl-11 md:pl-0">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-mono font-bold text-[11px]">
                    {song.originalKey}
                  </span>
                </div>

                <div className="md:col-span-2 md:text-right text-muted-foreground pl-11 md:pl-0">
                  {song.lastPlayedDate || "Fresh"}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
