"use client"

import type { SongSection } from "@/types/database"
import { StructureMap } from "@/components/structure/structure-map"
import { Flame, Heart, Clock } from "lucide-react"

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
      {/* Song header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Song {songIndex + 1} of {totalSongs}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight truncate">{song.title}</h1>
          <p className="text-sm text-muted-foreground">{song.artist}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="px-4 py-2 rounded-xl bg-primary/15 border border-primary/30 text-primary font-mono font-extrabold text-2xl">
            {song.assigned_key}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                isJoyful ? "text-amber-500" : "text-blue-500"
              }`}
            >
              {isJoyful ? <Flame className="h-3.5 w-3.5" /> : <Heart className="h-3.5 w-3.5" />}
              {isJoyful ? "Joyful" : "Worship"}
            </span>
            {song.bpm && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {song.bpm} BPM
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Structure map */}
      <div className="rounded-2xl border bg-card/60 p-4">
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
