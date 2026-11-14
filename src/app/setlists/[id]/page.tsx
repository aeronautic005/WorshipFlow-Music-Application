"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSetlistById, type FullSetlist } from "@/lib/setlists"
import { SetlistStatusBadge } from "@/components/setlist/setlist-status-badge"
import {
  ArrowLeft,
  Calendar,
  User,
  Users,
  Mic2,
  Flame,
  Heart,
  Music2,
  ExternalLink,
  Radio,
  CheckCircle2,
  Edit,
  Clock,
  Loader2,
  FileText,
} from "lucide-react"

export default function SetlistDetailPage() {
  const params = useParams()
  const setlistId = params.id as string

  const [setlist, setSetlist] = useState<FullSetlist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!setlistId) return
      try {
        const data = await getSetlistById(setlistId)
        setSetlist(data)
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
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      </AppShell>
    )
  }

  if (!setlist) {
    return (
      <AppShell>
        <div className="text-center py-16 space-y-3">
          <h2 className="text-lg font-bold">Setlist not found</h2>
          <Link href="/setlists" className="text-xs text-indigo-400 hover:underline">
            Back to Setlists
          </Link>
        </div>
      </AppShell>
    )
  }

  const joyfulSongs = (setlist.songs || []).filter((s) => s.category === "joyful")
  const worshipSongs = (setlist.songs || []).filter((s) => s.category === "worship")

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/setlists"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Setlists</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/perform"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
            >
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>Live Mode</span>
            </Link>
          </div>
        </div>

        {/* Setlist Summary Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SetlistStatusBadge status={setlist.status} publishedAt={setlist.published_at} />
                <span className="text-xs text-muted-foreground">Sunday Worship</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <Calendar className="h-6 w-6 text-indigo-400" />
                <span>{setlist.service_date}</span>
              </h1>
            </div>

            <Link
              href="/practice"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Check-in Practice</span>
            </Link>
          </div>

          {/* Roster Assignment Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-border/40 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40">
              <User className="h-4 w-4 text-blue-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">Song Leader</span>
                <span className="font-bold text-foreground">{setlist.song_leader_name || "France"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40">
              <Mic2 className="h-4 w-4 text-pink-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">Backup Vocalist</span>
                <span className="font-bold text-foreground">{setlist.backup_singer_name || "Solo / None"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40">
              <Users className="h-4 w-4 text-indigo-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">Drummer (Rotation)</span>
                <span className="font-bold text-foreground">{setlist.drummer_name || "Aeron"}</span>
              </div>
            </div>
          </div>

          {setlist.notes && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/30 border border-border/40 text-xs text-muted-foreground">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>{setlist.notes}</span>
            </div>
          )}
        </div>

        {/* Joyful Songs Section */}
        {joyfulSongs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-orange-400">
                Joyful Songs (Fast Praise)
              </h2>
            </div>

            <div className="space-y-2">
              {joyfulSongs.map((song, idx) => (
                <div
                  key={song.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/60 bg-card hover:border-orange-500/30 transition-all shadow-sm gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 font-mono font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/songs/${song.song_id}`}
                        className="font-bold text-sm hover:text-indigo-400 transition-colors truncate block"
                      >
                        {song.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">{song.artist}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                    <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 font-mono font-bold text-xs border border-orange-500/20">
                      Key: {song.assigned_key}
                    </span>

                    {song.reference_url && (
                      <a
                        href={song.reference_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-border/80 text-[11px] font-medium hover:bg-muted text-foreground transition-colors"
                      >
                        <Music2 className="h-3.5 w-3.5 text-red-400" />
                        <span>Reference</span>
                        <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                      </a>
                    )}

                    <Link
                      href={`/songs/${song.song_id}`}
                      className="px-2.5 py-1 rounded-lg border border-border/80 text-[11px] font-medium hover:bg-muted text-foreground transition-colors"
                    >
                      Chords
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Worship Songs Section */}
        {worshipSongs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                Worship Songs (Slow)
              </h2>
            </div>

            <div className="space-y-2">
              {worshipSongs.map((song, idx) => (
                <div
                  key={song.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/60 bg-card hover:border-blue-500/30 transition-all shadow-sm gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 font-mono font-bold text-xs shrink-0">
                      {joyfulSongs.length + idx + 1}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/songs/${song.song_id}`}
                        className="font-bold text-sm hover:text-indigo-400 transition-colors truncate block"
                      >
                        {song.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">{song.artist}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-mono font-bold text-xs border border-blue-500/20">
                      Key: {song.assigned_key}
                    </span>

                    {song.reference_url && (
                      <a
                        href={song.reference_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-border/80 text-[11px] font-medium hover:bg-muted text-foreground transition-colors"
                      >
                        <Music2 className="h-3.5 w-3.5 text-red-400" />
                        <span>Reference</span>
                        <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                      </a>
                    )}

                    <Link
                      href={`/songs/${song.song_id}`}
                      className="px-2.5 py-1 rounded-lg border border-border/80 text-[11px] font-medium hover:bg-muted text-foreground transition-colors"
                    >
                      Chords
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
