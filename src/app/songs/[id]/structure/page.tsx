"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSongById, updateSongStructure } from "@/lib/songs"
import { StructureEditor } from "@/components/structure/structure-editor"
import { StructureLegend } from "@/components/structure/structure-legend"
import type { Song, SongSection } from "@/types/database"
import { ArrowLeft, Loader2, Music2 } from "lucide-react"

export default function SongStructurePage() {
  const params = useParams()
  const router = useRouter()
  const songId = params.id as string

  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!songId) return
      const s = await getSongById(songId)
      setSong(s)
      setLoading(false)
    }
    load()
  }, [songId])

  const handleSave = async (sections: SongSection[]) => {
    if (!song) return
    const res = await updateSongStructure(song.id, sections)
    if (res.success) {
      setSong({ ...song, default_structure: sections })
    } else {
      alert("Failed to save song structure: " + (res.error || "Unknown error"))
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  if (!song) {
    return (
      <AppShell>
        <div className="text-center py-16 space-y-3">
          <h2 className="text-lg font-bold">Song not found</h2>
          <Link href="/songs" className="text-xs text-primary hover:underline">
            Back to Song Library
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/songs/${song.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {song.title}</span>
          </Link>

          <Link
            href={`/songs/${song.id}`}
            className="text-xs text-primary hover:underline font-semibold"
          >
            View Details &amp; Chords
          </Link>
        </div>

        {/* Clean Song Context Header */}
        <div className="space-y-1 px-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {song.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {song.artist} · Original Key: <strong className="text-foreground">{song.original_key}</strong>
            {song.bpm ? ` · ${song.bpm} BPM` : ""}
          </p>
        </div>

        {/* Structure Editor Component */}
        <StructureEditor
          initialSections={song.default_structure}
          songTitle={song.title}
          artist={song.artist}
          songCategory={song.category}
          bpm={song.bpm}
          onSave={handleSave}
        />

        {/* Visual Legend & Guide */}
        <StructureLegend />
      </div>
    </AppShell>
  )
}
