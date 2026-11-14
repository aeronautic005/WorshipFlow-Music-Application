"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Users,
  Music2,
  ChevronRight,
  Filter,
  Copy,
  Sparkles,
  CheckCircle2,
  FileEdit,
  ArrowUpDown,
} from "lucide-react"
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

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getSetlists()
      setSetlists(data)
      setLoading(false)
    }
    load()
  }, [])

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], [])

  const filteredSetlists = useMemo(() => {
    return setlists.filter((item) => {
      // Search
      const query = searchQuery.toLowerCase().trim()
      if (query) {
        const matchesDate = item.service_date.toLowerCase().includes(query)
        const matchesLeader = (item.song_leader_name || "").toLowerCase().includes(query)
        const matchesBackup = (item.backup_singer_name || "").toLowerCase().includes(query)
        const matchesDrummer = (item.drummer_name || "").toLowerCase().includes(query)
        const matchesNotes = (item.notes || "").toLowerCase().includes(query)
        const matchesSong = (item.songs || []).some(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.artist.toLowerCase().includes(query) ||
            s.assigned_key.toLowerCase().includes(query)
        )
        if (!matchesDate && !matchesLeader && !matchesBackup && !matchesDrummer && !matchesNotes && !matchesSong) {
          return false
        }
      }

      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false
      }

      // Time filter
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
      new Date(new Date(serviceDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
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

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Setlist Archive & Schedules</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Weekly worship lineups, vocal keys, assigned drum rotation, and past archives
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/setlists/builder"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Build Setlist
          </Link>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-card text-card-foreground">
          <p className="text-xs font-medium text-muted-foreground">Total Setlists</p>
          <p className="text-2xl font-bold mt-1">{setlists.length}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-card-foreground">
          <p className="text-xs font-medium text-muted-foreground">Upcoming</p>
          <p className="text-2xl font-bold mt-1 text-primary">{upcomingCount}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-card-foreground">
          <p className="text-xs font-medium text-muted-foreground">Published</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{publishedCount}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-card-foreground">
          <p className="text-xs font-medium text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
            {setlists.length - publishedCount}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by date, leader, backup, drummer, or song..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Time Filter */}
          <div className="flex items-center rounded-lg border bg-muted/40 p-1 text-xs">
            <button
              onClick={() => setTimeFilter("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                timeFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter("upcoming")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                timeFilter === "upcoming" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTimeFilter("past")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                timeFilter === "past" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Past Archive
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center rounded-lg border bg-muted/40 p-1 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                statusFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                statusFilter === "published" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                statusFilter === "draft" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Drafts
            </button>
          </div>
        </div>
      </div>

      {/* Setlists List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : filteredSetlists.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed bg-muted/10 p-8">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-base">No setlists found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all" || timeFilter !== "all"
              ? "Try clearing filters or search terms to see available worship setlists."
              : "No weekly setlists have been created yet. Get started by building one."}
          </p>
          <div className="mt-4">
            <Link
              href="/setlists/builder"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Build First Setlist
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSetlists.map((setlist) => {
            const dateObj = new Date(setlist.service_date + "T00:00:00")
            const formattedDate = dateObj.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })
            const isUpcoming = setlist.service_date >= todayStr
            const songs = setlist.songs || []
            const joyfulCount = songs.filter((s) => s.category === "joyful").length
            const worshipCount = songs.filter((s) => s.category === "worship").length

            return (
              <div
                key={setlist.id}
                className={`group rounded-xl border p-4 sm:p-5 transition hover:shadow-md bg-card ${
                  isUpcoming ? "border-primary/30" : "border-border"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/setlists/${setlist.id}`}
                        className="font-bold text-lg hover:text-primary transition flex items-center gap-1.5"
                      >
                        {formattedDate}
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition" />
                      </Link>
                      <SetlistStatusBadge status={setlist.status} />
                      {isUpcoming && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          Upcoming Service
                        </span>
                      )}
                    </div>

                    {/* Team roster summary */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-foreground">Lead:</span>
                        <span>{setlist.song_leader_name || "Unassigned"}</span>
                      </div>
                      {setlist.backup_singer_name && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">Backup:</span>
                          <span>{setlist.backup_singer_name}</span>
                        </div>
                      )}
                      {setlist.drummer_name && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">Drums:</span>
                          <span className="text-primary font-medium">{setlist.drummer_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={(e) => handleDuplicate(e, setlist.id, setlist.service_date)}
                      disabled={duplicatingId === setlist.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-background hover:bg-muted transition text-muted-foreground hover:text-foreground"
                      title="Duplicate setlist into a new date"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Duplicate</span>
                    </button>
                    <Link
                      href={`/setlists/builder?id=${setlist.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-background hover:bg-muted transition text-muted-foreground hover:text-foreground"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    <Link
                      href={`/setlists/${setlist.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>

                {/* Song list chips */}
                <div className="mt-3.5 pt-3 border-t">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {songs.length} Songs ({joyfulCount} Joyful, {worshipCount} Worship)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {songs.map((song, idx) => (
                      <span
                        key={song.id || idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border bg-muted/40"
                      >
                        <span className="text-muted-foreground font-mono">{idx + 1}.</span>
                        <span className="font-medium">{song.title}</span>
                        <span
                          className={`px-1 rounded text-[10px] font-bold ${
                            song.category === "joyful"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                          }`}
                        >
                          {song.assigned_key}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
