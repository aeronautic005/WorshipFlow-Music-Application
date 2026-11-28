"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSetlists, type FullSetlist } from "@/lib/setlists"
import {
  PRACTICE_TEAM_ROSTER,
  getLocalPracticeStatuses,
  type PracticeStatusRecord,
} from "@/lib/practice"
import type { PracticeStatusType } from "@/types/database"
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
  Eye,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react"

// Active logged-in member (defaults to Aeron — Drums until Auth login is enabled)
const CURRENT_USER_ID = "aeron-id"

export default function IndividualPracticeHubPage() {
  const [setlist, setSetlist] = useState<FullSetlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewingMemberId, setViewingMemberId] = useState<string>(CURRENT_USER_ID)
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

  const currentUser =
    PRACTICE_TEAM_ROSTER.find((m) => m.id === CURRENT_USER_ID) || PRACTICE_TEAM_ROSTER[0]
  const viewedMember =
    PRACTICE_TEAM_ROSTER.find((m) => m.id === viewingMemberId) || currentUser
  const isViewingSelf = viewedMember.id === currentUser.id

  const songs = setlist?.songs || []
  const joyfulSongs = songs.filter((s) => s.category === "joyful")
  const worshipSongs = songs.filter((s) => s.category === "worship")

  const getMemberSongStatus = (memberId: string, songId: string): PracticeStatusType => {
    if (!setlist) return "not_started"
    const match = statuses.find(
      (st) =>
        st.setlist_id === setlist.id &&
        st.song_id === songId &&
        st.user_id === memberId
    )
    return match?.status || "not_started"
  }

  // Calculate readiness stats for whichever member is currently being viewed
  const readyCount = useMemo(() => {
    if (!setlist) return 0
    return songs.filter((song) => {
      const match = statuses.find(
        (st) =>
          st.setlist_id === setlist.id &&
          st.song_id === song.song_id &&
          st.user_id === viewedMember.id
      )
      return match?.status === "ready"
    }).length
  }, [setlist, songs, statuses, viewedMember.id])

  const completionPercent = songs.length > 0 ? Math.round((readyCount / songs.length) * 100) : 0

  const renderReadOnlyStatusPill = (status: PracticeStatusType) => {
    if (status === "ready") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Ready</span>
        </span>
      )
    }
    if (status === "needs_work") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-2xs">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Needs Work</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold shadow-2xs">
        <XCircle className="w-3.5 h-3.5" />
        <span>Not Started</span>
      </span>
    )
  }

  const renderSongCard = (
    song: NonNullable<FullSetlist["songs"]>[number],
    displayNumber: number
  ) => {
    const memberStatus = getMemberSongStatus(viewedMember.id, song.song_id)

    // Compact Read-Only View when viewing a teammate's progress
    if (!isViewingSelf) {
      return (
        <div
          key={song.id}
          className="px-5 py-4 rounded-3xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground font-bold text-sm shrink-0">
              {displayNumber}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-foreground truncate">{song.title}</h3>
              <p className="text-xs text-muted-foreground">
                {song.artist} · Key {song.assigned_key}
                {song.bpm ? ` · ${song.bpm} BPM` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {renderReadOnlyStatusPill(memberStatus)}
          </div>
        </div>
      )
    }

    // Full Interactive Practice Card for own role
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
            currentStatus={memberStatus}
            userId={currentUser.id}
            userName={currentUser.name}
            instrument={currentUser.role}
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
                {isViewingSelf ? "Home Practice Companion" : "Teammate Progress View"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {isViewingSelf ? "Practice Hub" : `${viewedMember.name}'s Progress`}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
                {isViewingSelf
                  ? "Practice this Sunday's songs with pinned reference tracks, agreed arrangements, and personal readiness check-ins."
                  : `Read-only overview of ${viewedMember.name}'s (${viewedMember.role}) readiness for this Sunday's lineup.`}
              </p>
            </div>

            {/* Member Role Switcher & Team Dashboard Link */}
            <div className="flex flex-col gap-2 shrink-0 sm:min-w-[260px]">
              <div className="flex items-center justify-between gap-2 bg-secondary/50 border border-border px-3.5 py-2 rounded-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                  {isViewingSelf ? "My Role" : "Viewing"}
                </span>
                <select
                  aria-label="Select team member role"
                  value={viewingMemberId}
                  onChange={(e) => setViewingMemberId(e.target.value)}
                  className="text-xs font-bold bg-transparent text-foreground focus:outline-none cursor-pointer truncate"
                >
                  {PRACTICE_TEAM_ROSTER.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.label}
                      {member.id === currentUser.id ? " (Me)" : ""}
                    </option>
                  ))}
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

          {/* Read-Only Teammate Banner */}
          {!isViewingSelf && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-secondary/60 border border-border text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <Eye className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Viewing <strong>{viewedMember.name}</strong> ({viewedMember.role}) in{" "}
                  <strong>Read-Only</strong> mode. Private notes and check-in edits are hidden.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingMemberId(currentUser.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shrink-0 cursor-pointer self-start sm:self-center"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to My Hub</span>
              </button>
            </div>
          )}

          {/* Practice Routine & Readiness Meter */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">
                  {isViewingSelf
                    ? "Sunday Morning Rehearsal: 9:00 AM · Live Service: 2:30 PM"
                    : `${viewedMember.name} (${viewedMember.role}) · Overall Readiness`}
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

        {/* Practice Reminder Settings — only shown for own hub */}
        {isViewingSelf && <PracticeReminderCard serviceDate={setlist?.service_date} />}

        {/* Songs List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-3xl border border-border bg-card animate-pulse" />
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
                  {worshipSongs.map((song, idx) =>
                    renderSongCard(song, joyfulSongs.length + idx + 1)
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
