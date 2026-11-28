"use client"

import type { SongSection } from "@/types/database"
import { StructureMap } from "@/components/structure/structure-map"
import { Sun, Feather, Clock } from "lucide-react"

export interface LiveSong {
  id: string
  song_id: string
  title: string
  artist: string
  assigned_key: string
  original_key: string
  bpm?: number | null
  category: "joyful" | "worship"
  structure: SongSection[]
}

interface LiveSongViewProps {
  song: LiveSong
  songIndex: number
  totalSongs: number
  activeSectionIndex?: number
  onSectionClick?: (index: number) => void
  isLargeFont?: boolean
}

export function LiveSongView({
  song,
  songIndex,
  totalSongs,
  activeSectionIndex,
  onSectionClick,
  isLargeFont = false,
}: LiveSongViewProps) {
  const isJoyful = song.category === "joyful"

  return (
    <div className="space-y-5">
      {/* Song Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p
            className={`font-bold uppercase tracking-wider text-muted-foreground ${
              isLargeFont ? "text-sm" : "text-xs"
            }`}
          >
            Song {songIndex + 1} of {totalSongs}
          </p>
          <h1
            className={`font-extrabold tracking-tight text-foreground truncate ${
              isLargeFont ? "text-4xl sm:text-6xl" : "text-3xl sm:text-4xl"
            }`}
          >
            {song.title}
          </h1>
          <p
            className={`font-medium text-muted-foreground ${
              isLargeFont ? "text-lg sm:text-xl" : "text-sm"
            }`}
          >
            {song.artist}
          </p>
        </div>

        {/* High-contrast Key & BPM Stat Tiles */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border border-border bg-card ${
              isLargeFont ? "px-4 py-3 min-w-[110px]" : "px-3.5 py-2 min-w-[92px]"
            }`}
          >
            <span
              className={`font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1 ${
                isLargeFont ? "text-xs" : "text-[10px]"
              }`}
            >
              {isJoyful ? <Sun className="h-3.5 w-3.5 text-primary" /> : <Feather className="h-3.5 w-3.5 text-primary" />}
              <span>{isJoyful ? "Joyful" : "Worship"}</span>
            </span>
            {song.bpm ? (
              <span
                className={`font-extrabold text-foreground inline-flex items-center gap-1 mt-0.5 ${
                  isLargeFont ? "text-lg" : "text-sm"
                }`}
              >
                <Clock className="h-4 w-4 text-muted-foreground" />
                {song.bpm} BPM
              </span>
            ) : (
              <span className="text-xs font-semibold text-muted-foreground mt-0.5">—</span>
            )}
          </div>

          <div
            className={`flex flex-col items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs ${
              isLargeFont ? "px-6 py-3 min-w-[96px]" : "px-5 py-2 min-w-[78px]"
            }`}
          >
            <span
              className={`font-semibold uppercase tracking-wider opacity-80 ${
                isLargeFont ? "text-xs" : "text-[10px]"
              }`}
            >
              Key
            </span>
            <span
              className={`font-extrabold leading-tight ${
                isLargeFont ? "text-4xl" : "text-2xl"
              }`}
            >
              {song.assigned_key}
            </span>
          </div>
        </div>
      </div>

      {/* Agreed Arrangement Blueprint Card */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
        <p
          className={`font-bold uppercase tracking-wider text-muted-foreground mb-3 ${
            isLargeFont ? "text-xs" : "text-[11px]"
          }`}
        >
          Agreed Arrangement
        </p>
        {song.structure.length > 0 ? (
          <StructureMap
            sections={song.structure}
            size={isLargeFont ? "xl" : "lg"}
            interactive={!!onSectionClick}
            activeIndex={activeSectionIndex}
            onSectionClick={(i) => onSectionClick?.(i)}
            bpm={song.bpm}
            showTimelineSummary
          />
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No arrangement blueprint set for this song. Follow the song leader.
          </p>
        )}
      </div>
    </div>
  )
}
