"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Music2,
  Flame,
  Heart,
  Plus,
  Clock,
  Radio,
  FileEdit,
  ArrowRight,
} from "lucide-react"
import { getSetlists, type FullSetlist } from "@/lib/setlists"
import { SetlistStatusBadge } from "@/components/setlist/setlist-status-badge"

export default function SetlistsCalendarPage() {
  const [setlists, setSetlists] = useState<FullSetlist[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2026, 10, 1)) // Nov 2026

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getSetlists()
      setSetlists(data)
      setLoading(false)
    }
    load()
  }, [])

  const monthName = selectedMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const prevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))
  }

  // Filter setlists belonging to the selected month/year
  const monthSetlists = useMemo(() => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()

    return setlists
      .filter((s) => {
        const d = new Date(s.service_date + "T00:00:00")
        return d.getFullYear() === year && d.getMonth() === month
      })
      .sort((a, b) => a.service_date.localeCompare(b.service_date))
  }, [setlists, selectedMonth])

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/setlists" className="hover:underline">
              Setlists
            </Link>
            <span>/</span>
            <span>Calendar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sunday Rotation Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Multi-week view of assigned song leaders, alternating drum rotation, and song lineups
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/setlists"
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border bg-background hover:bg-muted transition text-muted-foreground hover:text-foreground"
          >
            List View
          </Link>
          <Link
            href="/setlists/builder"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Build Setlist
          </Link>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">{monthName}</h2>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Month Services List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl border bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : monthSetlists.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed bg-muted/10 p-8 space-y-3">
          <CalendarIcon className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="font-semibold text-base">No services scheduled for {monthName}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You can create a new setlist for any Sunday in this month.
          </p>
          <Link
            href="/setlists/builder"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Schedule a Sunday Service
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {monthSetlists.map((setlist) => {
            const dateObj = new Date(setlist.service_date + "T00:00:00")
            const dayNum = dateObj.getDate()
            const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" })
            const songs = setlist.songs || []
            const joyfulCount = songs.filter((s) => s.category === "joyful").length
            const worshipCount = songs.filter((s) => s.category === "worship").length

            return (
              <div
                key={setlist.id}
                className="rounded-xl border bg-card shadow-sm hover:border-primary/40 transition overflow-hidden"
              >
                {/* Sunday Date Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 border-b gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold shrink-0">
                      <span className="text-xs uppercase leading-none font-semibold">
                        {dateObj.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-lg leading-none mt-0.5">{dayNum}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-lg">
                          {weekday} Worship Service
                        </h3>
                        <SetlistStatusBadge status={setlist.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Rehearsal: 9:00 AM • Live Service: 2:30 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Link
                      href={`/setlists/${setlist.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
                    >
                      <span>View Setlist</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/setlists/builder?id=${setlist.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-background hover:bg-muted transition text-muted-foreground hover:text-foreground"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                  </div>
                </div>

                {/* Team Roster Grid */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background border">
                    <User className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Song Leader
                      </p>
                      <p className="font-semibold text-foreground">
                        {setlist.song_leader_name || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background border">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Backup Vocalist
                      </p>
                      <p className="font-semibold text-foreground">
                        {setlist.backup_singer_name || "None assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background border">
                    <Music2 className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Drummer (Rotation)
                      </p>
                      <p className="font-semibold text-primary">
                        {setlist.drummer_name || "Kyle / Aeron"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Song Lineup */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-medium">
                      Song Lineup ({songs.length} songs: {joyfulCount} Joyful, {worshipCount} Worship)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {songs.map((song, idx) => {
                      const isJoyful = song.category === "joyful"
                      return (
                        <div
                          key={song.id || idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-muted-foreground font-mono w-4">{idx + 1}.</span>
                            <span className="font-medium truncate">{song.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isJoyful
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                              }`}
                            >
                              Key {song.assigned_key}
                            </span>
                          </div>
                        </div>
                      )
                    })}
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
