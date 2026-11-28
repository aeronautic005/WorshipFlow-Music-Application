"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSetlists, type FullSetlist } from "@/lib/setlists"
import {
  getLocalPracticeStatuses,
  type PracticeStatusRecord,
} from "@/lib/practice"
import { StructureMap } from "@/components/structure/structure-map"
import { PracticeCheckinBadge } from "@/components/practice/practice-checkin-badge"
import { PracticeReminderCard } from "@/components/practice/practice-reminder-card"
import {
  CalendarDays,
  Clock,
  ExternalLink,
  Sun,
  Feather,
  Users,
  Headphones,
} from "lucide-react"

export default function IndividualPracticeHubPage() {
  const [setlist, setSetlist] = useState<FullSetlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [userInstrument, setUserInstrument] = useState<string>("Drums")
  const [statuses, setStatuses] = useState<PracticeStatusRecord[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const list = await getSetlists()
      const upcoming = list.find((s) => s.status === "published") || list[0] || null
      setSetlist(upcoming)
      setStatuses(getLocalPracticeStatuses())
      setLoading(false)
    }
    load()
  }, [])

  const songs = setlist?.songs || []
  const joyfulSongs = songs.filter((s) => s.category === "joyful")
  const worshipSongs = songs.filter((s) => s.category === "worship")

  const getSongStatus = (songId: string) => {
    if (!setlist) return "not_started" as const
    const match = statuses.find(
      (st) => st.setlist_id === setlist.id && st.song_id === songId
    )
    return match?.status || ("not_started" as const)
  }

  // Calculate user readiness stats
  const readyCount = useMemo(() => {
    if (!setlist) return 0
    return songs.filter((song) => {
      const match = statuses.find(
        (st) => st.setlist_id === setlist.id && st.song_id === song.song_id
      )
      return match?.status === "ready"
    }).length
  }, [setlist, songs, statuses])

  const completionPercent = songs.length > 0 ? Math.round((readyCount / songs.length) * 100) : 0

  const renderSongCard = (song: NonNullable<FullSetlist["songs"]>[number], displayNumber: number) => {
    const structure = song.custom_structure || song.default_structure
    const isCustom = !!song.custom_structure

    return (
      <div
        key={song.id}
        className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4 hover:border-primary/30 transition"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground font-bold text-sm shrink-0">
              {displayNumber}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-foreground truncate">{song.title}</h3>
              <p className="text-xs text-muted-foreground">
                {song.artist} {song.bpm ? `· ${song.bpm} BPM` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-full bg-secondary text-foreground font-bold text-xs border border-border">
              Key: {song.assigned_key}
            </span>

            {song.reference_url && (
              <a
                href={song.reference_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-card text-foreground hover:bg-secondary text-xs font-semibold transition"
              >
                <Headphones className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Practice Video</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            )}

            <Link
              href={`/songs/${song.song_id}`}
              className="px-3.5 py-1.5 rounded-full border border-border bg-card text-xs font-semibold hover:bg-secondary transition text-foreground"
            >
              Chords &amp; Key
            </Link>
          </div>
        </div>

        {/* Arrangement Blueprint */}
        {structure && structure.length > 0 && (
          <div className="pt-3.5 border-t border-border/70 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Arrangement Blueprint
              </span>
              {isCustom && (
                <span className="px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border text-[10px] font-semibold">
                  Sunday Flow
                </span>
              )}
            </div>
            <StructureMap sections={structure} size="sm" bpm={song.bpm} />
          </div>
        )}

        {/* Check-in controls footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3.5 border-t border-border/70">
          <span className="text-xs text-muted-foreground font-semibold">
            My Readiness
          </span>
          <PracticeCheckinBadge
            setlistId={setlist!.id}
            songId={song.song_id}
            songTitle={song.title}
            currentStatus={getSongStatus(song.song_id)}
            instrument={userInstrument}
            size="md"
            onStatusChange={() => setStatuses(getLocalPracticeStatuses())}
          />
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        {/* Hero Card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-muted-foreground text-[11px] font-semibold border border-border">
                Home Practice Companion
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Practice Hub
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
                Practice this Sunday&apos;s songs with pinned reference tracks, agreed arrangements, and personal readiness check-ins.
              </p>
            </div>

            {/* Instrument Switcher & Team Dashboard Link */}
            <div className="flex flex-col gap-2 shrink-0 sm:min-w-[230px]">
              <div className="flex items-center justify-between gap-2 bg-secondary/50 border border-border px-3.5 py-2 rounded-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  My Role
                </span>
                <select
                  aria-label="Select your instrument"
                  value={userInstrument}
                  onChange={(e) => setUserInstrument(e.target.value)}
                  className="text-xs font-bold bg-transparent text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="Drums">Drums (Aeron / Kyle)</option>
                  <option value="Vocals">Lead Vocals</option>
                  <option value="Backup Vocals">Backup Vocals</option>
                  <option value="Keyboard 1">Keyboard 1</option>
                  <option value="Keyboard 2">Keyboard 2</option>
                  <option value="Acoustic Guitar">Acoustic Guitar</option>
                  <option value="Electric Guitar">Electric Guitar</option>
                  <option value="Bass Guitar">Bass Guitar</option>
                </select>
              </div>

              <Link
                href="/practice/readiness"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card text-xs font-semibold hover:bg-secondary transition text-foreground"
              >
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span>View Full Team Readiness</span>
              </Link>
            </div>
          </div>

          {/* Practice Routine & Readiness Meter */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">
                  Sunday Morning Rehearsal: 9:00 AM · Live Service: 2:30 PM
                </span>
              </div>
              <div className="font-bold text-foreground">
                {readyCount} of {songs.length} Songs Ready ({completionPercent}%)
              </div>
            </div>

            <div className="h-2 w-full rounded-full bg-border/80 overflow-hidden">
              <div
                style={{ width: `${completionPercent}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  completionPercent === 100 ? "bg-emerald-600" : "bg-primary"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Practice Reminder Settings */}
        <PracticeReminderCard serviceDate={setlist?.service_date} />

        {/* Songs List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-3xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : !setlist ? (
          <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-3xl bg-card space-y-2">
            <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="font-semibold text-sm text-foreground">No Setlist Scheduled</p>
            <p>Wait for the song leader to publish this week&apos;s lineup.</p>
          </div>
        ) : (
          <div className="space-y-7">
            {/* Joyful Section */}
            {joyfulSongs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Sun className="w-4 h-4 text-foreground" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Joyful Songs (Fast Praise)
                  </h2>
                </div>

                <div className="space-y-3.5">
                  {joyfulSongs.map((song, idx) => renderSongCard(song, idx + 1))}
                </div>
              </div>
            )}

            {/* Worship Section */}
            {worshipSongs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Feather className="w-4 h-4 text-foreground" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Worship Songs (Slow Flow)
                  </h2>
                </div>

                <div className="space-y-3.5">
                  {worshipSongs.map((song, idx) => renderSongCard(song, joyfulSongs.length + idx + 1))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
