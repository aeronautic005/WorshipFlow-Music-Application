"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Plus,
  Search,
  ChevronRight,
  Copy,
  FileEdit,
  CalendarDays,
} from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { getSetlists, duplicateSetlist, type FullSetlist } from "@/lib/setlists"
import { SetlistStatusBadge } from "@/components/setlist/setlist-status-badge"

export default function SetlistsPage() {
  const router = useRouter()
  const [setlists, setSetlists] = useState<FullSetlist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past">("all")
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const [todayStr, setTodayStr] = useState("")

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0])
    async function load() {
      setLoading(true)
      const data = await getSetlists()
      setSetlists(data)
      setLoading(false)
    }
    load()
  }, [])

  const filteredSetlists = useMemo(() => {
    return setlists.filter((item) => {
      const query = searchQuery.toLowerCase().trim()
      if (query) {
        const matchesDate = item.service_date.toLowerCase().includes(query)
        const matchesLeader = (item.song_leader_name || "").toLowerCase().includes(query)
        const matchesBackup = (item.backup_singer_name || "").toLowerCase().includes(query)
        const matchesDrummer = (item.drummer_name || "").toLowerCase().includes(query)
        const matchesNotes = (item.notes || "").toLowerCase().includes(query)
        const matchesSong = (item.songs || []).some(
          (s) => s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query)
        )
        if (
          !matchesDate &&
          !matchesLeader &&
          !matchesBackup &&
          !matchesDrummer &&
          !matchesNotes &&
          !matchesSong
        ) {
          return false
        }
      }

      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false
      }

      if (timeFilter === "upcoming" && item.service_date < todayStr) {
        return false
      }
      if (timeFilter === "past" && item.service_date >= todayStr) {
        return false
      }

      return true
    })
  }, [setlists, searchQuery, statusFilter, timeFilter, todayStr])

  const handleDuplicate = async (e: React.MouseEvent, id: string, serviceDate: string) => {
    e.preventDefault()
    e.stopPropagation()
    const targetDate = prompt(
      "Enter new service date for duplicated setlist (YYYY-MM-DD):",
      new Date(new Date(serviceDate).getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
    )
    if (!targetDate) return

    setDuplicatingId(id)
    const res = await duplicateSetlist(id, targetDate)
    setDuplicatingId(null)
    if (res.success && res.data) {
      router.push(`/setlists/builder?id=${res.data.id}`)
    } else {
      alert("Failed to duplicate setlist: " + (res.error || "Unknown error"))
    }
  }

  const upcomingCount = useMemo(
    () => setlists.filter((s) => s.service_date >= todayStr).length,
    [setlists, todayStr]
  )
  const publishedCount = useMemo(
    () => setlists.filter((s) => s.status === "published").length,
    [setlists]
  )
  const draftsCount = setlists.length - publishedCount

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
              Setlist Archive &amp; Schedules
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Weekly worship lineups, vocal keys, assigned drum rotation, and past archives.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/setlists/calendar"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-semibold text-primary transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </Link>

            <Link
              href="/setlists/new"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Build Setlist</span>
            </Link>
          </div>
        </div>

        {/* 4 Clean White + Deep Navy KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Setlists
              </div>
              <div className="text-2xl font-bold font-mono text-primary">{setlists.length}</div>
            </div>
            <div className="px-4 py-2 bg-secondary/60 border-t border-border text-[11px] text-muted-foreground">
              All recorded Sundays
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Upcoming
              </div>
              <div className="text-2xl font-bold font-mono text-primary">{upcomingCount}</div>
            </div>
            <div className="px-4 py-2 bg-secondary/60 border-t border-border text-[11px] text-muted-foreground">
              Scheduled ahead
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Published
              </div>
              <div className="text-2xl font-bold font-mono text-primary">{publishedCount}</div>
            </div>
            <div className="px-4 py-2 bg-secondary/60 border-t border-border text-[11px] text-muted-foreground">
              Shared with team
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Drafts
              </div>
              <div className="text-2xl font-bold font-mono text-primary">{draftsCount}</div>
            </div>
            <div className="px-4 py-2 bg-secondary/60 border-t border-border text-[11px] text-muted-foreground">
              In preparation
            </div>
          </div>
        </div>

        {/* Clean Filter & Search Toolbar */}
        <div className="rounded-xl border border-border bg-card p-3 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by date, leader, backup, drummer, or song..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Time Filter */}
            <div className="flex items-center rounded-lg border border-border bg-secondary/60 p-0.5 text-xs">
              {(
                [
                  { id: "all", label: "All Time" },
                  { id: "upcoming", label: "Upcoming" },
                  { id: "past", label: "Past Archive" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTimeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    timeFilter === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center rounded-lg border border-border bg-secondary/60 p-0.5 text-xs">
              {(
                [
                  { id: "all", label: "All Status" },
                  { id: "published", label: "Published" },
                  { id: "draft", label: "Drafts" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Setlists Cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 rounded-xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : filteredSetlists.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-border bg-card p-8">
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-sm text-primary">No setlists found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all" || timeFilter !== "all"
                ? "Try clearing filters or search terms to see available worship setlists."
                : "No weekly setlists have been created yet. Get started by building one."}
            </p>
            <div className="mt-4">
              <Link
                href="/setlists/new"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Build First Setlist</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSetlists.map((setlist) => {
              const dateObj = new Date(setlist.service_date + "T00:00:00")
              const monthShort = dateObj
                .toLocaleDateString("en-US", { month: "short" })
                .toUpperCase()
              const dayNum = dateObj.toLocaleDateString("en-US", { day: "2-digit" })
              const formattedDate = dateObj.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })

              const songs = setlist.songs || []
              const joyfulCount = songs.filter((s) => s.category === "joyful").length
              const worshipCount = songs.filter((s) => s.category === "worship").length

              return (
                <div
                  key={setlist.id}
                  className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors"
                >
                  {/* Top Card Row */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      {/* Solid Deep Navy Date Block */}
                      <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex flex-col items-center justify-center shrink-0 leading-none">
                        <span className="text-[10px] font-semibold tracking-wider opacity-80">
                          {monthShort}
                        </span>
                        <span className="text-lg font-bold font-mono mt-0.5">{dayNum}</span>
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Link
                            href={`/setlists/${setlist.id}`}
                            className="text-base font-bold text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <span>{formattedDate}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </Link>
                          <SetlistStatusBadge
                            status={setlist.status}
                            publishedAt={setlist.published_at}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            Lead:{" "}
                            <strong className="text-foreground font-semibold">
                              {setlist.song_leader_name || "Unassigned"}
                            </strong>
                          </span>
                          <span>
                            Backup:{" "}
                            <strong className="text-foreground font-semibold">
                              {setlist.backup_singer_name || "None"}
                            </strong>
                          </span>
                          <span>
                            Drums:{" "}
                            <strong className="text-foreground font-semibold">
                              {setlist.drummer_name || "Unassigned"}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(e, setlist.id, setlist.service_date)}
                        disabled={duplicatingId === setlist.id}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-medium text-foreground transition-colors disabled:opacity-50 cursor-pointer"
                        title="Duplicate for another Sunday"
                      >
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{duplicatingId === setlist.id ? "Copying..." : "Duplicate"}</span>
                      </button>

                      <Link
                        href={`/setlists/builder?id=${setlist.id}`}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-medium text-foreground transition-colors"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Edit</span>
                      </Link>

                      <Link
                        href={`/setlists/${setlist.id}`}
                        className="inline-flex items-center justify-center h-8 px-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        View
                      </Link>
                    </div>
                  </div>

                  {/* Bottom Song Lineup Strip */}
                  <div className="px-5 py-3.5 bg-secondary/40 border-t border-border space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <span>
                        {songs.length} {songs.length === 1 ? "Song" : "Songs"} ({joyfulCount}{" "}
                        Joyful, {worshipCount} Worship)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {songs.map((song, idx) => (
                        <Link
                          key={song.id || idx}
                          href={`/songs/${song.song_id}`}
                          className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-lg border border-border bg-card hover:border-primary/40 text-xs transition-colors"
                        >
                          <span className="font-mono text-muted-foreground">{idx + 1}.</span>
                          <span className="font-semibold text-foreground">{song.title}</span>
                          <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground font-mono text-[11px] font-bold">
                            {song.assigned_key}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
