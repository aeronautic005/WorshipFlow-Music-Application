"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getSetlistById, type FullSetlist } from "@/lib/setlists"
import { buildLiveSongs } from "@/lib/perform"
import { useLiveSync } from "@/hooks/use-live-sync"
import { LiveSongView } from "@/components/perform/live-song-view"
import { SectionAdvanceControls } from "@/components/perform/section-advance-controls"
import { SongNavigator } from "@/components/perform/song-navigator"
import { ArrowLeft, Loader2, Radio, Wifi, WifiOff, Crown, Eye } from "lucide-react"

export default function LivePerformancePage() {
  const params = useParams()
  const setlistId = params.id as string

  const [setlist, setSetlist] = useState<FullSetlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [songIndex, setSongIndex] = useState(0)
  const [sectionIndex, setSectionIndex] = useState(0)
  const [isController, setIsController] = useState(false)
  const [lastSyncFrom, setLastSyncFrom] = useState<string | null>(null)

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

  // Realtime live sync across band members
  const handleRemoteSync = useCallback(
    (state: { song_index: number; section_index: number; leader_name?: string }) => {
      // If we are following, automatically jump to the leader's position
      if (!isController) {
        if (state.song_index !== undefined && state.song_index !== songIndex) {
          setSongIndex(state.song_index)
        }
        if (state.section_index !== undefined) {
          setSectionIndex(state.section_index)
        }
        if (state.leader_name) {
          setLastSyncFrom(state.leader_name)
          setTimeout(() => setLastSyncFrom(null), 3000)
        }
      }
    },
    [isController, songIndex]
  )

  const { connectionStatus, isConnected, sendPosition } = useLiveSync({
    setlistId,
    enabled: !!setlistId,
    isController,
    onRemoteSync: handleRemoteSync,
  })

  const goToSection = useCallback(
    (index: number) => {
      if (index < 0 || index >= sectionCount) return
      setSectionIndex(index)
      if (isController) {
        sendPosition(songIndex, index, setlist?.song_leader_name)
      }
    },
    [sectionCount, isController, sendPosition, songIndex, setlist?.song_leader_name]
  )

  const nextSection = useCallback(() => goToSection(sectionIndex + 1), [goToSection, sectionIndex])
  const prevSection = useCallback(() => goToSection(sectionIndex - 1), [goToSection, sectionIndex])

  const goToSong = useCallback(
    (index: number) => {
      if (index < 0 || index >= songs.length) return
      setSongIndex(index)
      setSectionIndex(0)
      if (isController) {
        sendPosition(index, 0, setlist?.song_leader_name)
      }
    },
    [songs.length, isController, sendPosition, setlist?.song_leader_name]
  )

  // Keyboard / foot-pedal support (Bluetooth page turners)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.shiftKey && e.key === "ArrowRight") {
        e.preventDefault()
        goToSong(songIndex + 1)
      } else if (e.shiftKey && e.key === "ArrowLeft") {
        e.preventDefault()
        goToSong(songIndex - 1)
      } else if (e.key === "]" || e.key === "n") {
        e.preventDefault()
        goToSong(songIndex + 1)
      } else if (e.key === "[" || e.key === "p") {
        e.preventDefault()
        goToSong(songIndex - 1)
      } else if (e.key === " " || e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault()
        nextSection()
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault()
        prevSection()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [nextSection, prevSection, goToSong, songIndex])

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
      <header className="flex items-center justify-between px-4 py-2.5 border-b gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/perform"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Exit
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>

        {/* Sync Status & Role Switcher */}
        <div className="flex items-center gap-2">
          {/* Connection badge */}
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
              isConnected
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
            title={isConnected ? "Realtime sync connected" : "Connecting to band sync..."}
          >
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-500" />
                <span>Band Synced</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-muted-foreground" />
                <span>Local</span>
              </>
            )}
          </div>

          {/* Controller vs Follower Toggle */}
          <button
            type="button"
            onClick={() => setIsController(!isController)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              isController
                ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
            }`}
            title={
              isController
                ? "You are controlling position for the band"
                : "Following song leader's position"
            }
          >
            {isController ? (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Leading</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Following</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Sync Flash Notice */}
      {lastSyncFrom && !isController && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-1 text-center text-xs font-semibold text-primary animate-in fade-in duration-150">
          Position updated by {lastSyncFrom}
        </div>
      )}

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

        <SongNavigator
          songs={songs}
          currentIndex={songIndex}
          onSelectSong={goToSong}
        />
      </main>
    </div>
  )
}
