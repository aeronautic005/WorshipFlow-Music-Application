"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSetlistById, type FullSetlist } from "@/lib/setlists"
import { SetlistStatusBadge } from "@/components/setlist/setlist-status-badge"
import { StructureMap } from "@/components/structure/structure-map"
import { PracticeCheckinBadge } from "@/components/practice/practice-checkin-badge"
import { getTeamReadinessForSetlist, type PracticeStatusRecord } from "@/lib/practice"
import { RehearsalBriefingModal } from "@/components/ai/rehearsal-briefing-modal"
import { ShareSetlistButton } from "@/components/setlist/share-setlist-button"
import {
  ArrowLeft,
  Calendar,
  User,
  Users,
  Mic2,
  Music2,
  ExternalLink,
  Radio,
  CheckCircle2,
  Loader2,
  FileText,
  Sparkles,
} from "lucide-react"

export default function SetlistDetailPage() {
  const params = useParams()
  const setlistId = params.id as string

  const [setlist, setSetlist] = useState<FullSetlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [teamStatuses, setTeamStatuses] = useState<PracticeStatusRecord[]>([])
  const [showBriefingModal, setShowBriefingModal] = useState(false)

  useEffect(() => {
    async function load() {
      if (!setlistId) return
      try {
        const data = await getSetlistById(setlistId)
        setSetlist(data)
        const rd = await getTeamReadinessForSetlist(setlistId)
        setTeamStatuses(rd.statuses)
      } catch (err) {
        console.error("Failed to load setlist:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [setlistId])

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  if (!setlist) {
    return (
      <AppShell>
        <div className="text-center py-16 space-y-3">
          <h2 className="text-lg font-bold text-primary">Setlist not found</h2>
          <Link href="/setlists" className="text-xs font-semibold text-primary hover:underline">
            Back to Setlists
          </Link>
        </div>
      </AppShell>
    )
  }

  const joyfulSongs = (setlist.songs || []).filter((s) => s.category === "joyful")
  const worshipSongs = (setlist.songs || []).filter((s) => s.category === "worship")
  const readyPct =
    teamStatuses.length > 0
      ? Math.round(
          (teamStatuses.filter((s) => s.status === "ready").length / teamStatuses.length) * 100
        )
      : 0

  const renderSongCard = (
    song: NonNullable<FullSetlist["songs"]>[number],
    displayNumber: number
  ) => {
    const structure = song.custom_structure || song.default_structure
    const isCustom = !!song.custom_structure

    return (
      <div
        key={song.id}
        className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors space-y-3.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary border border-border text-primary font-mono font-bold text-xs shrink-0">
              {displayNumber}
            </span>
            <div className="min-w-0">
              <Link
                href={`/songs/${song.song_id}`}
                className="font-bold text-sm text-foreground hover:text-primary hover:underline transition-colors truncate block"
              >
                {song.title}
              </Link>
              <span className="text-xs text-muted-foreground">{song.artist}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            <PracticeCheckinBadge
              setlistId={setlist.id}
              songId={song.song_id}
              songTitle={song.title}
              size="sm"
            />

            <span className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-mono font-bold text-xs">
              Key: {song.assigned_key}
            </span>

            {song.reference_url && (
              <a
                href={song.reference_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border text-xs font-medium hover:bg-secondary text-foreground transition-colors"
              >
                <Music2 className="h-3.5 w-3.5 text-primary" />
                <span>Reference</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            )}

            <Link
              href={`/songs/${song.song_id}`}
              className="px-2.5 py-1 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-secondary text-primary transition-colors"
            >
              Chords
            </Link>
          </div>
        </div>

        {/* Section Blueprint Bar */}
        {structure && structure.length > 0 && (
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span>Arrangement Blueprint</span>
                {isCustom && (
                  <span className="px-2 py-0.5 rounded-md bg-secondary text-primary border border-border text-[10px] font-semibold normal-case tracking-normal">
                    Sunday Custom Flow
                  </span>
                )}
              </span>
            </div>
            <StructureMap sections={structure} size="sm" />
          </div>
        )}
      </div>
    )
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Top Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/setlists"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Setlists</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <ShareSetlistButton setlist={setlist} />

            <button
              type="button"
              onClick={() => setShowBriefingModal(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-primary text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>9AM Briefing</span>
            </button>

            <Link
              href={`/perform/${setlist.id}`}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span>Live Mode</span>
            </Link>
          </div>
        </div>

        {/* Setlist Summary Card */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <SetlistStatusBadge status={setlist.status} publishedAt={setlist.published_at} />
                <span className="text-xs font-medium text-muted-foreground">Sunday Worship</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary flex items-center gap-2.5">
                <Calendar className="h-6 w-6 text-primary shrink-0" />
                <span>{setlist.service_date}</span>
              </h1>
            </div>

            <Link
              href="/practice"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors self-start sm:self-auto"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Check-in Practice</span>
            </Link>
          </div>

          {/* Roster Assignment Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary/60 border border-border">
              <User className="h-4 w-4 text-primary shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold tracking-wider">
                  Song Leader
                </span>
                <span className="font-bold text-foreground">
                  {setlist.song_leader_name || "France"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary/60 border border-border">
              <Mic2 className="h-4 w-4 text-primary shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold tracking-wider">
                  Backup Vocalist
                </span>
                <span className="font-bold text-foreground">
                  {setlist.backup_singer_name || "Solo / None"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary/60 border border-border">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold tracking-wider">
                  Drummer (Rotation)
                </span>
                <span className="font-bold text-foreground">
                  {setlist.drummer_name || "Aeron"}
                </span>
              </div>
            </div>
          </div>

          {setlist.notes && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-secondary/40 border border-border text-xs text-muted-foreground">
              <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{setlist.notes}</span>
            </div>
          )}

          {/* Team Practice Readiness Strip */}
          <div className="pt-4 border-t border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-foreground">Team Practice Readiness:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {teamStatuses.length > 0 ? `${readyPct}% Ready` : "Check-ins Open"}
                </span>
              </div>
              <Link
                href="/practice/readiness"
                className="text-xs text-primary hover:underline font-semibold"
              >
                Readiness Dashboard →
              </Link>
            </div>

            {teamStatuses.length > 0 && (
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  style={{ width: `${readyPct}%` }}
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                />
              </div>
            )}
          </div>
        </div>

        {/* Joyful Songs Section */}
        {joyfulSongs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                Joyful Songs (Fast Praise)
              </h2>
              <span className="text-xs font-medium text-muted-foreground">
                {joyfulSongs.length} {joyfulSongs.length === 1 ? "song" : "songs"}
              </span>
            </div>

            <div className="space-y-3">
              {joyfulSongs.map((song, idx) => renderSongCard(song, idx + 1))}
            </div>
          </div>
        )}

        {/* Worship Songs Section */}
        {worshipSongs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                Worship Songs (Slow)
              </h2>
              <span className="text-xs font-medium text-muted-foreground">
                {worshipSongs.length} {worshipSongs.length === 1 ? "song" : "songs"}
              </span>
            </div>

            <div className="space-y-3">
              {worshipSongs.map((song, idx) =>
                renderSongCard(song, joyfulSongs.length + idx + 1)
              )}
            </div>
          </div>
        )}

        {/* Sunday 9AM Rehearsal Briefing Modal */}
        <RehearsalBriefingModal
          isOpen={showBriefingModal}
          onClose={() => setShowBriefingModal(false)}
          serviceDate={setlist.service_date}
          songLeaderName={setlist.song_leader_name || "Leader"}
          drummerName={setlist.drummer_name || undefined}
          backupSingerName={setlist.backup_singer_name || undefined}
          songs={(setlist.songs || []).map((s) => ({
            title: s.title,
            key: s.assigned_key,
            category: s.category,
            bpm: s.bpm,
          }))}
          leaderNotes={setlist.notes || undefined}
        />
      </div>
    </AppShell>
  )
}
