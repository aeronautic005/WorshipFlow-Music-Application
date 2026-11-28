"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getSetlistById, type FullSetlist } from "@/lib/setlists"
import {
  buildLiveSongs,
  startPerformanceSession,
  endPerformanceSession,
  type PerformanceSessionLog,
} from "@/lib/perform"
import { useLiveSync } from "@/hooks/use-live-sync"
import { LiveSongView } from "@/components/perform/live-song-view"
import { SectionAdvanceControls } from "@/components/perform/section-advance-controls"
import { SongNavigator } from "@/components/perform/song-navigator"
import { StageThemeToggle } from "@/components/perform/stage-theme-toggle"
import { LiveChordModal } from "@/components/perform/live-chord-modal"
import { ScreenWakeControls } from "@/components/perform/screen-wake-controls"
import {
  ArrowLeft,
  Loader2,
  Radio,
  Wifi,
  WifiOff,
  Crown,
  Eye,
  FileCode,
  Timer,
  CheckCircle2,
  Sparkles,
} from "lucide-react"

export default function LivePerformancePage() {
  const params = useParams()
  const setlistId = params.id as string

  const [setlist, setSetlist] = useState<FullSetlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [songIndex, setSongIndex] = useState(0)
  const [sectionIndex, setSectionIndex] = useState(0)
  const [isController, setIsController] = useState(false)
  const [lastSyncFrom, setLastSyncFrom] = useState<string | null>(null)
  const [isStageDark, setIsStageDark] = useState(true) // Defaults to pure dark for live stage
  const [isLargeFont, setIsLargeFont] = useState(false)
  const [showChordsModal, setShowChordsModal] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [completedSession, setCompletedSession] = useState<PerformanceSessionLog | null>(null)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function load() {
      const data = await getSetlistById(setlistId)
      setSetlist(data)
      setLoading(false)

      if (data) {
        const sess = startPerformanceSession({
          setlistId: data.id,
          serviceDate: data.service_date,
          songsCount: data.songs?.length || 0,
          leaderName: data.song_leader_name,
          drummerName: data.drummer_name,
        })
        setSessionId(sess.id)
      }
    }
    if (setlistId) load()
  }, [setlistId])

  // Session elapsed timer ticker
  useEffect(() => {
    if (completedSession) return
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [completedSession])

  const handleEndSession = () => {
    if (sessionId) {
      const ended = endPerformanceSession(sessionId)
      if (ended) {
        setCompletedSession(ended)
      }
    }
  }

  const songs = useMemo(() => (setlist ? buildLiveSongs(setlist) : []), [setlist])
  const currentSong = songs[songIndex]
  const sectionCount = currentSong?.structure.length || 0

  // Realtime live sync across band members
  const handleRemoteSync = useCallback(
    (state: { song_index: number; section_index: number; leader_name?: string }) => {
      // If we are following, automatically jump to the leader's position with bounds safety
      if (!isController) {
        if (
          state.song_index !== undefined &&
          state.song_index >= 0 &&
          state.song_index < songs.length &&
          state.song_index !== songIndex
        ) {
          setSongIndex(state.song_index)
        }
        if (state.section_index !== undefined && state.section_index >= 0) {
          setSectionIndex(state.section_index)
        }
        if (state.leader_name) {
          setLastSyncFrom(state.leader_name)
          if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
          syncTimerRef.current = setTimeout(() => setLastSyncFrom(null), 3000)
        }
      }
    },
    [isController, songIndex, songs.length]
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
      if (e.key === "c" || e.key === "C") {
        e.preventDefault()
        setShowChordsModal((prev) => !prev)
        return
      }
      if (e.key === "Escape") {
        setShowChordsModal(false)
        setCompletedSession(null)
        return
      }
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
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isStageDark
          ? "dark bg-[#070B14] text-slate-100"
          : "bg-[#F4F6FA] text-foreground"
      } ${isLargeFont ? "text-lg" : "text-base"}`}
    >
      {/* Top Stage Control Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card gap-3 flex-wrap shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/perform"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-secondary/60 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Exit</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DC2626] text-white text-[11px] font-bold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span>LIVE</span>
          </div>
        </div>

        {/* Controls & Sync Status */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dark Stage / Light Mode + Large Text Toggle */}
          <StageThemeToggle
            isStageDark={isStageDark}
            onToggleDark={() => setIsStageDark(!isStageDark)}
            isLargeFont={isLargeFont}
            onToggleLargeFont={() => setIsLargeFont(!isLargeFont)}
          />

          {/* Connection badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border ${
              isConnected
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : "bg-secondary text-muted-foreground border-border"
            }`}
            title={isConnected ? "Realtime sync connected" : "Running locally (no live Supabase channel)"}
          >
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span>Band Synced</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Local</span>
              </>
            )}
          </div>

          {/* Controller vs Follower Toggle */}
          <button
            type="button"
            onClick={() => setIsController(!isController)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
              isController
                ? "bg-amber-500/20 border-amber-500/40 text-amber-800 dark:text-amber-300"
                : "bg-secondary border-border text-foreground hover:bg-muted"
            }`}
            title={
              isController
                ? "You are broadcasting section changes to the band"
                : "Following the song leader's position (click to take control)"
            }
          >
            {isController ? (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Leading</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Following</span>
              </>
            )}
          </button>

          {/* Quick Chords Sheet Button */}
          <button
            type="button"
            onClick={() => setShowChordsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition shadow-xs cursor-pointer"
            title="Open chord sheet (press 'C')"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Chords</span>
          </button>

          {/* Live Service Duration Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-bold text-foreground">
            <Timer className="w-3.5 h-3.5 text-primary" />
            <span>
              {Math.floor(elapsedSeconds / 60)}:
              {elapsedSeconds % 60 < 10 ? "0" : ""}
              {elapsedSeconds % 60}
            </span>
          </div>

          {/* Finish Service Button */}
          <button
            type="button"
            onClick={handleEndSession}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-white transition cursor-pointer"
            title="Log service completion and view recap"
          >
            <span>Finish</span>
          </button>

          {/* Screen Wake Lock & Fullscreen */}
          <ScreenWakeControls />
        </div>
      </header>

      {/* Sync Flash Notice */}
      {lastSyncFrom && !isController && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-1 text-center text-xs font-semibold text-primary animate-in fade-in duration-150">
          Position updated by {lastSyncFrom}
        </div>
      )}

      <main
        className={`flex-1 w-full mx-auto px-4 py-6 space-y-6 transition-all ${
          isLargeFont ? "max-w-5xl" : "max-w-4xl"
        }`}
      >
        <LiveSongView
          song={currentSong}
          songIndex={songIndex}
          totalSongs={songs.length}
          activeSectionIndex={sectionIndex}
          onSectionClick={goToSection}
          isLargeFont={isLargeFont}
        />

        <SectionAdvanceControls
          sections={currentSong.structure}
          activeIndex={sectionIndex}
          onPrev={prevSection}
          onNext={nextSection}
          isLargeFont={isLargeFont}
        />

        <SongNavigator
          songs={songs}
          currentIndex={songIndex}
          onSelectSong={goToSong}
        />
      </main>

      {/* Live Chord Sheet Quick View Modal */}
      <LiveChordModal
        isOpen={showChordsModal}
        onClose={() => setShowChordsModal(false)}
        songId={currentSong.song_id}
        songTitle={currentSong.title}
        assignedKey={currentSong.assigned_key}
        originalKey={currentSong.original_key}
      />

      {/* Performance Session Completion Recap Modal */}
      {completedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 text-card-foreground shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Service Completed!</h2>
              <p className="text-xs text-muted-foreground">
                Great worship session. Performance duration and log have been recorded.
              </p>
            </div>

            <div className="bg-secondary/40 border border-border/50 rounded-xl p-4 divide-y divide-border/40 text-sm space-y-2.5">
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-muted-foreground">Setlist / Service Date</span>
                <span className="font-semibold">{completedSession.service_date}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5">
                <span className="text-xs text-muted-foreground">Song Leader</span>
                <span className="font-semibold">{completedSession.leader_name || "Unassigned"}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5">
                <span className="text-xs text-muted-foreground">Songs Performed</span>
                <span className="font-semibold">{completedSession.songs_played_count} songs</span>
              </div>
              <div className="flex justify-between items-center pt-2.5">
                <span className="text-xs text-muted-foreground">Total Duration</span>
                <span className="font-mono font-bold text-primary">
                  {Math.floor((completedSession.total_duration_seconds || 0) / 60)}m{" "}
                  {(completedSession.total_duration_seconds || 0) % 60}s
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCompletedSession(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition"
              >
                Back to Stage
              </button>
              <Link
                href="/perform"
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold text-center hover:opacity-90 transition flex items-center justify-center gap-1.5"
              >
                <span>Exit Mode</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
