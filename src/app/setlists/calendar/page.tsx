"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Mic2,
  Music2,
  Sun,
  Feather,
  Plus,
  FileEdit,
  ArrowRight,
  Clock,
} from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
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
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        {/* Clean Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Link href="/setlists" className="hover:text-foreground transition-colors">
                Setlists
              </Link>
              <span>/</span>
              <span className="text-foreground">Calendar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Sunday Rotation Calendar
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Monthly schedule of assigned song leaders, alternating drum rotation, and Sunday lineups.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/setlists"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-full border border-border bg-card hover:bg-secondary transition text-foreground"
            >
              List View
            </Link>
            <Link
              href="/setlists/builder"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Build Setlist</span>
            </Link>
          </div>
        </div>

        {/* Month Navigation Pill Bar */}
        <div className="flex items-center justify-between px-4 py-3 rounded-3xl border border-border bg-card shadow-xs">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-border bg-card hover:bg-secondary transition text-foreground cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-foreground">
              {monthName}
            </h2>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground text-[11px] font-semibold">
              {monthSetlists.length} {monthSetlists.length === 1 ? "service" : "services"}
            </span>
          </div>

          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-border bg-card hover:bg-secondary transition text-foreground cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Month Services List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-3xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : monthSetlists.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-border bg-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary text-muted-foreground flex items-center justify-center mx-auto">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">
              No services scheduled for {monthName}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              Create a new setlist to schedule song leaders, drummers, and songs for a Sunday in this month.
            </p>
            <div className="pt-1">
              <Link
                href="/setlists/builder"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule a Sunday Service</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
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
                  className="rounded-3xl border border-border bg-card shadow-xs hover:border-primary/30 transition overflow-hidden"
                >
                  {/* Sunday Date Header Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-border/70 gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-bold shrink-0">
                        <span className="text-[10px] uppercase leading-none font-semibold opacity-80">
                          {dateObj.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-lg font-extrabold leading-none mt-1">{dayNum}</span>
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-foreground">
                            {weekday} Worship Service
                          </h3>
                          <SetlistStatusBadge status={setlist.status} />
                        </div>
                        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>Rehearsal 9:00 AM · Live Service 2:30 PM</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Link
                        href={`/setlists/builder?id=${setlist.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border border-border bg-card hover:bg-secondary transition text-foreground"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Edit</span>
                      </Link>
                      <Link
                        href={`/setlists/${setlist.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground hover:opacity-90 transition shadow-xs"
                      >
                        <span>View Setlist</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Team Roster Strip */}
                  <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-border/70 text-xs">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40 border border-border/80">
                      <div className="p-2 rounded-xl bg-card border border-border/80 text-foreground shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                          Song Leader
                        </p>
                        <p className="font-bold text-foreground truncate">
                          {setlist.song_leader_name || "Unassigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40 border border-border/80">
                      <div className="p-2 rounded-xl bg-card border border-border/80 text-foreground shrink-0">
                        <Mic2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                          Backup Vocalist
                        </p>
                        <p className="font-bold text-foreground truncate">
                          {setlist.backup_singer_name || "None assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40 border border-border/80">
                      <div className="p-2 rounded-xl bg-card border border-border/80 text-foreground shrink-0">
                        <Music2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                          Drummer (Rotation)
                        </p>
                        <p className="font-bold text-foreground truncate">
                          {setlist.drummer_name || "Unassigned"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Song Lineup */}
                  <div className="px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Song Lineup ({songs.length})
                      </span>
                      <span className="text-[11px]">
                        {joyfulCount} Joyful · {worshipCount} Worship
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {songs.map((song, idx) => {
                        const isJoyful = song.category === "joyful"
                        return (
                          <Link
                            key={song.id || idx}
                            href={`/songs/${song.song_id}`}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-secondary/35 border border-border/70 hover:bg-secondary/70 transition text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-muted-foreground font-bold w-4 shrink-0">
                                {idx + 1}.
                              </span>
                              {isJoyful ? (
                                <Sun className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              ) : (
                                <Feather className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              )}
                              <span className="font-semibold text-foreground truncate">
                                {song.title}
                              </span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-card border border-border text-[11px] font-bold text-foreground shrink-0 ml-2">
                              Key {song.assigned_key}
                            </span>
                          </Link>
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
    </AppShell>
  )
}
