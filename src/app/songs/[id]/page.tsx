"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSongById } from "@/lib/songs"
import type { Song } from "@/types/database"
import {
  ArrowLeft,
  Flame,
  Heart,
  Clock,
  ExternalLink,
  Edit3,
  FileText,
  Music2,
  Loader2,
  Share2,
} from "lucide-react"

export default function SongDetailPage() {
  const params = useParams()
  const router = useRouter()
  const songId = params.id as string

  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSong() {
      if (!songId) return
      try {
        const data = await getSongById(songId)
        setSong(data)
      } catch (err) {
        console.error("Failed to load song details:", err)
      } finally {
        setLoading(false)
      }
    }
    loadSong()
  }, [songId])

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      </AppShell>
    )
  }

  if (!song) {
    return (
      <AppShell>
        <div className="text-center py-16 space-y-3">
          <h2 className="text-lg font-bold">Song not found</h2>
          <p className="text-xs text-muted-foreground">The song you requested could not be found.</p>
          <Link href="/songs" className="inline-block text-xs text-indigo-400 hover:underline">
            Back to Song Library
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/songs"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Song Library</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/songs/${song.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 text-xs font-medium hover:bg-accent/50 transition-colors shadow-sm"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Song</span>
            </Link>
          </div>
        </div>

        {/* Hero Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    song.category === "joyful"
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}
                >
                  {song.category === "joyful" ? (
                    <Flame className="h-3 w-3" />
                  ) : (
                    <Heart className="h-3 w-3" />
                  )}
                  <span>{song.category === "joyful" ? "Joyful Praise" : "Worship"}</span>
                </span>

                <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground border border-border/40 font-medium">
                  {song.language}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{song.title}</h1>
              <p className="text-sm text-muted-foreground font-medium">{song.artist}</p>
            </div>

            {/* Key & BPM Highlights */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
              <div className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-bold text-sm">
                Key of {song.original_key}
              </div>
              {song.bpm && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{song.bpm} BPM</span>
                </div>
              )}
            </div>
          </div>

          {/* Reference Audio/Video Link */}
          {song.reference_url && (
            <div className="pt-2 border-t border-border/40">
              <a
                href={song.reference_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground border border-border/60 transition-colors"
              >
                <Music2 className="h-4 w-4 text-red-400" />
                <span>Listen to Official Practice Reference</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground ml-1" />
              </a>
            </div>
          )}
        </div>

        {/* Default Song Structure Blueprint Preview */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Music2 className="h-4 w-4 text-indigo-400" />
              <span>Standard Arrangement Blueprint</span>
            </h2>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Default Flow
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {["Intro", "Verse 1", "Pre-Chorus", "Chorus", "Verse 2", "Chorus", "Bridge x4", "Chorus x2", "Outro"].map(
              (section, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 rounded-lg bg-background border border-border/80 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span className="text-muted-foreground text-[10px] font-mono">{index + 1}</span>
                  <span>{section}</span>
                </div>
              )
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            This structure is referenced during home practice and rehearsal to ensure no bridge or chorus is skipped.
          </p>
        </div>

        {/* Lyrics Section */}
        {song.lyrics ? (
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <FileText className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold">Lyrics</h2>
            </div>
            <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/90 font-sans font-normal pt-1">
              {song.lyrics}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-6 text-center space-y-2">
            <FileText className="h-5 w-5 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">No lyrics have been added yet for this song.</p>
            <Link
              href={`/songs/${song.id}/edit`}
              className="text-xs text-indigo-400 hover:underline font-medium inline-block"
            >
              Add lyrics now
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
