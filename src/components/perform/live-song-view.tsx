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
}

export function LiveSongView({
  song,
  songIndex,
  totalSongs,
  activeSectionIndex,
  onSectionClick,
}: LiveSongViewProps) {
  const isJoyful = song.category === "joyful"

  return (
    <div className="space-y-5">
      {/* Song Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Song {songIndex + 1} of {totalSongs}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground truncate">
            {song.title}
          </h1>
          <p className="text-sm font-medium text-muted-foreground">{song.artist}</p>
        </div>

        {/* High-contrast Key & BPM Stat Tiles */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl border border-border bg-card min-w-[92px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
              {isJoyful ? <Sun className="h-3 w-3 text-primary" /> : <Feather className="h-3 w-3 text-primary" />}
              <span>{isJoyful ? "Joyful" : "Worship"}</span>
            </span>
            {song.bpm ? (
              <span className="text-sm font-extrabold text-foreground inline-flex items-center gap-1 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {song.bpm} BPM
              </span>
            ) : (
              <span className="text-xs font-semibold text-muted-foreground mt-0.5">—</span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center px-5 py-2 rounded-2xl bg-primary text-primary-foreground min-w-[78px] shadow-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
              Key
            </span>
            <span className="text-2xl font-extrabold leading-tight">{song.assigned_key}</span>
          </div>
        </div>
      </div>

      {/* Agreed Arrangement Blueprint Card */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Agreed Arrangement
        </p>
        {song.structure.length > 0 ? (
          <StructureMap
            sections={song.structure}
            size="lg"
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
