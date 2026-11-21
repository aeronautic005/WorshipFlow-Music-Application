"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getSetlistById, type FullSetlist } from "@/lib/setlists"
import { buildLiveSongs } from "@/lib/perform"
import { LiveSongView } from "@/components/perform/live-song-view"
import { SectionAdvanceControls } from "@/components/perform/section-advance-controls"
import { ArrowLeft, Loader2, Radio } from "lucide-react"

export default function LivePerformancePage() {
  const params = useParams()
  const setlistId = params.id as string

  const [setlist, setSetlist] = useState<FullSetlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [songIndex] = useState(0)
  const [sectionIndex, setSectionIndex] = useState(0)

  useEffect(() => {
    async function load() {
      const data = await getSetlistById(setlistId)
      setSetlist(data)
      setLoading(false)
    }
    if (setlistId) load()
  }, [setlistId])

  const songs = useMemo(() => (setlist ? buildLiveSongs(setlist) : []), [setlist])
  const currentSong = songs[songIndex]
  const sectionCount = currentSong?.structure.length || 0

  const goToSection = useCallback(
    (index: number) => {
      if (index < 0 || index >= sectionCount) return
      setSectionIndex(index)
    },
    [sectionCount]
  )

  const nextSection = useCallback(() => goToSection(sectionIndex + 1), [goToSection, sectionIndex])
  const prevSection = useCallback(() => goToSection(sectionIndex - 1), [goToSection, sectionIndex])

  // Keyboard / foot-pedal support (most Bluetooth page turners send arrow keys)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === " " || e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault()
        nextSection()
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault()
        prevSection()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [nextSection, prevSection])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!setlist || !currentSong) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-sm">
        <p className="font-semibold">Setlist not found or has no songs.</p>
        <Link href="/perform" className="text-primary hover:underline">
          Back to Performance Mode
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <Link
          href="/perform"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Exit
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-red-500">
          <Radio className="h-4 w-4 animate-pulse" />
          LIVE ·{" "}
          {new Date(setlist.service_date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
        <span className="text-xs text-muted-foreground">Lead: {setlist.song_leader_name}</span>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        <LiveSongView
          song={currentSong}
          songIndex={songIndex}
          totalSongs={songs.length}
          activeSectionIndex={sectionIndex}
          onSectionClick={goToSection}
        />

        <SectionAdvanceControls
          sections={currentSong.structure}
          activeIndex={sectionIndex}
          onPrev={prevSection}
          onNext={nextSection}
        />
      </main>
    </div>
  )
}
