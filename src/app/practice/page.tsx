"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSetlists, type FullSetlist } from "@/lib/setlists"
import {
  getUserPracticeStatus,
  getLocalPracticeStatuses,
  type PracticeStatusRecord,
} from "@/lib/practice"
import { StructureMap } from "@/components/structure/structure-map"
import { PracticeCheckinBadge } from "@/components/practice/practice-checkin-badge"
import {
  CalendarDays,
  Clock,
  ExternalLink,
  Flame,
  Heart,
  Music2,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  Headphones,
  Sliders,
  NotebookPen,
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

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Home Practice Companion</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Practice Hub
              </h1>
              <p className="text-xs text-muted-foreground max-w-lg">
                One unified place to practice this Sunday&apos;s songs with the pinned official reference tracks, agreed song arrangements, and readiness check-ins.
              </p>
            </div>

            {/* Instrument Switcher & Team Dashboard Link */}
            <div className="flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-2 bg-background/80 border p-1 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-muted-foreground px-2">
                  My Role:
                </span>
                <select
                  aria-label="Select your instrument"
                  value={userInstrument}
                  onChange={(e) => setUserInstrument(e.target.value)}
                  className="text-xs font-bold bg-transparent text-primary focus:outline-none cursor-pointer"
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
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border bg-card text-xs font-semibold hover:bg-muted transition text-foreground"
              >
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>View Full Team Readiness</span>
              </Link>
            </div>
          </div>

          {/* Practice Routine & Readiness Meter */}
          <div className="p-4 rounded-xl bg-card/60 border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">
                  Sunday Morning Rehearsal: 9:00 AM • Live Service: 2:30 PM
                </span>
              </div>
              <div className="font-bold text-primary">
                {readyCount} of {songs.length} Songs Ready ({completionPercent}%)
              </div>
            </div>

            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                style={{ width: `${completionPercent}%` }}
                className="h-full bg-primary rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Songs List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-xl border bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : !setlist ? (
          <div className="p-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl space-y-2">
            <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="font-semibold text-sm">No Setlist Scheduled</p>
            <p>Wait for the song leader to publish this week&apos;s lineup.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Joyful Section */}
            {joyfulSongs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500">
                    Joyful Songs (Fast Praise)
                  </h2>
                </div>

                <div className="space-y-3">
                  {joyfulSongs.map((song, idx) => {
                    const structure = song.custom_structure || song.default_structure
                    const isCustom = !!song.custom_structure

                    return (
                      <div
                        key={song.id}
                        className="p-5 rounded-2xl border bg-card shadow-xs space-y-4 hover:border-amber-500/40 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-mono font-bold text-sm shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <h3 className="font-bold text-base truncate">{song.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {song.artist} {song.bpm ? `• ${song.bpm} BPM` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 font-mono font-bold text-xs border border-amber-500/20">
                              Key: {song.assigned_key}
                            </span>

                            {song.reference_url && (
                              <a
                                href={song.reference_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600/20 border border-red-600/20 text-xs font-semibold transition"
                              >
                                <Headphones className="w-3.5 h-3.5" />
                                <span>Practice Video</span>
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            )}

                            <Link
                              href={`/songs/${song.song_id}`}
                              className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-muted transition text-foreground"
                            >
                              Chords & Key
                            </Link>
                          </div>
                        </div>

                        {/* Arrangement Blueprint */}
                        {structure && structure.length > 0 && (
                          <div className="pt-2 border-t space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <span>Arrangement Blueprint</span>
                                {isCustom && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold">
                                    Sunday Flow
                                  </span>
                                )}
                              </span>
                            </div>
                            <StructureMap sections={structure} size="sm" bpm={song.bpm} />
                          </div>
                        )}

                        {/* Check-in controls footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-muted-foreground font-medium">
                            My Readiness:
                          </span>
                          <PracticeCheckinBadge
                            setlistId={setlist.id}
                            songId={song.song_id}
                            songTitle={song.title}
                            instrument={userInstrument}
                            size="md"
                            onStatusChange={() => setStatuses(getLocalPracticeStatuses())}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Worship Section */}
            {worshipSongs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-blue-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-500">
                    Worship Songs (Slow Flow)
                  </h2>
                </div>

                <div className="space-y-3">
                  {worshipSongs.map((song, idx) => {
                    const structure = song.custom_structure || song.default_structure
                    const isCustom = !!song.custom_structure

                    return (
                      <div
                        key={song.id}
                        className="p-5 rounded-2xl border bg-card shadow-xs space-y-4 hover:border-blue-500/40 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 font-mono font-bold text-sm shrink-0">
                              {joyfulSongs.length + idx + 1}
                            </span>
                            <div className="min-w-0">
                              <h3 className="font-bold text-base truncate">{song.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {song.artist} {song.bpm ? `• ${song.bpm} BPM` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 font-mono font-bold text-xs border border-blue-500/20">
                              Key: {song.assigned_key}
                            </span>

                            {song.reference_url && (
                              <a
                                href={song.reference_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600/20 border border-red-600/20 text-xs font-semibold transition"
                              >
                                <Headphones className="w-3.5 h-3.5" />
                                <span>Practice Video</span>
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            )}

                            <Link
                              href={`/songs/${song.song_id}`}
                              className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-muted transition text-foreground"
                            >
                              Chords & Key
                            </Link>
                          </div>
                        </div>

                        {/* Arrangement Blueprint */}
                        {structure && structure.length > 0 && (
                          <div className="pt-2 border-t space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <span>Arrangement Blueprint</span>
                                {isCustom && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-bold">
                                    Sunday Flow
                                  </span>
                                )}
                              </span>
                            </div>
                            <StructureMap sections={structure} size="sm" bpm={song.bpm} />
                          </div>
                        )}

                        {/* Check-in controls footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-muted-foreground font-medium">
                            My Readiness:
                          </span>
                          <PracticeCheckinBadge
                            setlistId={setlist.id}
                            songId={song.song_id}
                            songTitle={song.title}
                            instrument={userInstrument}
                            size="md"
                            onStatusChange={() => setStatuses(getLocalPracticeStatuses())}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
