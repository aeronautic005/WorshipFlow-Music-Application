"use client"

import type { SongSection } from "@/types/database"
import { ChevronLeft, ChevronRight, Repeat, Sparkles } from "lucide-react"

interface SectionAdvanceControlsProps {
  sections: SongSection[]
  activeIndex: number
  onPrev: () => void
  onNext: () => void
}

/**
 * Large "NOW / NEXT" panel with tap targets so any musician can see
 * exactly where the band is and what is coming, even mid-song.
 */
export function SectionAdvanceControls({
  sections,
  activeIndex,
  onPrev,
  onNext,
}: SectionAdvanceControlsProps) {
  const current = sections[activeIndex]
  const next = sections[activeIndex + 1]

  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-stretch select-none">
      {/* Previous Section Button */}
      <button
        type="button"
        onClick={onPrev}
        disabled={activeIndex <= 0}
        aria-label="Previous section"
        className="flex items-center justify-center w-14 sm:w-20 rounded-3xl border border-border bg-card text-foreground hover:bg-secondary active:scale-95 transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed shadow-xs"
      >
        <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8" />
      </button>

      {/* Main NOW / NEXT Hero Card — tapping advances to next section */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Advance to next section"
        className="text-left rounded-3xl border-2 border-primary/35 bg-card hover:border-primary/60 p-5 sm:p-7 transition active:scale-[0.99] cursor-pointer shadow-sm space-y-4"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Now Playing
            </p>
          </div>

          <div className="flex items-baseline gap-3.5 flex-wrap">
            <span className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground">
              {current?.name || "End"}
            </span>
            {current?.repeats && current.repeats > 1 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-base sm:text-xl font-extrabold">
                <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
                x{current.repeats}
              </span>
            )}
            {current?.bars && (
              <span className="text-sm font-semibold text-muted-foreground">
                {current.bars} bars
              </span>
            )}
          </div>
        </div>

        {/* Band & Instrument Cue Banner (high-contrast in both Light & Dark modes) */}
        {current?.notes && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 dark:bg-amber-500/15 dark:border-amber-400/35 dark:text-amber-100 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-300 block mb-0.5">
                Band &amp; Instrument Cue
              </span>
              <span>{current.notes}</span>
            </div>
          </div>
        )}

        {/* Next Section Preview Row */}
        <div className="pt-3.5 border-t border-border flex items-center justify-between gap-2 text-sm flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Next
            </span>
            {next ? (
              <span className="px-3 py-1 rounded-full bg-secondary text-foreground font-bold text-xs sm:text-sm">
                {next.name}
                {next.repeats && next.repeats > 1 ? ` x${next.repeats}` : ""}
              </span>
            ) : (
              <span className="font-semibold text-muted-foreground">End of song</span>
            )}
          </div>

          {next?.notes && (
            <span className="text-xs text-muted-foreground italic truncate max-w-[240px]">
              Upcoming: {next.notes}
            </span>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Tap card or press Space / Right Arrow to advance
        </p>
      </button>

      {/* Next Section Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={activeIndex >= sections.length - 1}
        aria-label="Next section"
        className="flex items-center justify-center w-14 sm:w-20 rounded-3xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed shadow-xs"
      >
        <ChevronRight className="h-7 w-7 sm:h-8 sm:w-8" />
      </button>
    </div>
  )
}
