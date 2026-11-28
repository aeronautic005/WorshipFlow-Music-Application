"use client"

import type { SongSection } from "@/types/database"
import { ChevronLeft, ChevronRight, Repeat, Sparkles } from "lucide-react"

interface SectionAdvanceControlsProps {
  sections: SongSection[]
  activeIndex: number
  onPrev: () => void
  onNext: () => void
  isLargeFont?: boolean
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
  isLargeFont = false,
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
        className={`flex items-center justify-center rounded-3xl border border-border bg-card text-foreground hover:bg-secondary active:scale-95 transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed shadow-xs ${
          isLargeFont ? "w-16 sm:w-24" : "w-14 sm:w-20"
        }`}
      >
        <ChevronLeft className={isLargeFont ? "h-9 w-9 sm:h-10 sm:w-10" : "h-7 w-7 sm:h-8 sm:w-8"} />
      </button>

      {/* Main NOW / NEXT Hero Card — tapping advances to next section */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Advance to next section"
        className={`text-left rounded-3xl border-2 border-primary/35 bg-card hover:border-primary/60 transition active:scale-[0.99] cursor-pointer shadow-sm ${
          isLargeFont ? "p-6 sm:p-9 space-y-5" : "p-5 sm:p-7 space-y-4"
        }`}
      >
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2">
            <span className={`rounded-full bg-primary ${isLargeFont ? "h-2.5 w-2.5" : "h-2 w-2"}`} />
            <p
              className={`font-bold uppercase tracking-widest text-muted-foreground ${
                isLargeFont ? "text-sm" : "text-[11px]"
              }`}
            >
              Now Playing
            </p>
          </div>

          <div className="flex items-baseline gap-4 flex-wrap">
            <span
              className={`font-extrabold tracking-tight text-foreground leading-none ${
                isLargeFont ? "text-6xl sm:text-8xl" : "text-4xl sm:text-6xl"
              }`}
            >
              {current?.name || "End"}
            </span>
            {current?.repeats && current.repeats > 1 && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground font-extrabold ${
                  isLargeFont ? "px-4 py-1.5 text-2xl sm:text-3xl" : "px-3 py-1 text-base sm:text-xl"
                }`}
              >
                <Repeat className={isLargeFont ? "h-6 w-6" : "h-4 w-4 sm:h-5 sm:w-5"} />
                x{current.repeats}
              </span>
            )}
            {current?.bars && (
              <span
                className={`font-semibold text-muted-foreground ${
                  isLargeFont ? "text-lg sm:text-xl" : "text-sm"
                }`}
              >
                {current.bars} bars
              </span>
            )}
          </div>
        </div>

        {/* Band & Instrument Cue Banner (high-contrast in both Light & Dark modes) */}
        {current?.notes && (
          <div
            className={`rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 dark:bg-amber-500/15 dark:border-amber-400/35 dark:text-amber-100 font-semibold flex items-start gap-3 ${
              isLargeFont ? "p-4 sm:p-5 text-base sm:text-xl" : "p-3.5 text-xs sm:text-sm"
            }`}
          >
            <Sparkles
              className={`text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 ${
                isLargeFont ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4"
              }`}
            />
            <div className="leading-snug">
              <span
                className={`uppercase font-bold tracking-wider text-amber-700 dark:text-amber-300 block mb-0.5 ${
                  isLargeFont ? "text-xs" : "text-[10px]"
                }`}
              >
                Band &amp; Instrument Cue
              </span>
              <span>{current.notes}</span>
            </div>
          </div>
        )}

        {/* Next Section Preview Row */}
        <div
          className={`pt-3.5 border-t border-border flex items-center justify-between gap-2 flex-wrap ${
            isLargeFont ? "text-base sm:text-lg" : "text-sm"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`font-bold uppercase tracking-widest text-muted-foreground ${
                isLargeFont ? "text-xs sm:text-sm" : "text-[11px]"
              }`}
            >
              Next
            </span>
            {next ? (
              <span
                className={`rounded-full bg-secondary text-foreground font-bold ${
                  isLargeFont ? "px-4 py-1.5 text-base sm:text-xl" : "px-3 py-1 text-xs sm:text-sm"
                }`}
              >
                {next.name}
                {next.repeats && next.repeats > 1 ? ` x${next.repeats}` : ""}
              </span>
            ) : (
              <span className="font-semibold text-muted-foreground">End of song</span>
            )}
          </div>

          {next?.notes && (
            <span
              className={`text-muted-foreground italic truncate ${
                isLargeFont ? "text-sm sm:text-base max-w-[320px]" : "text-xs max-w-[240px]"
              }`}
            >
              Upcoming: {next.notes}
            </span>
          )}
        </div>

        <p className={`text-muted-foreground ${isLargeFont ? "text-xs sm:text-sm" : "text-[11px]"}`}>
          Tap card or press Space / Right Arrow to advance
        </p>
      </button>

      {/* Next Section Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={activeIndex >= sections.length - 1}
        aria-label="Next section"
        className={`flex items-center justify-center rounded-3xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed shadow-xs ${
          isLargeFont ? "w-16 sm:w-24" : "w-14 sm:w-20"
        }`}
      >
        <ChevronRight className={isLargeFont ? "h-9 w-9 sm:h-10 sm:w-10" : "h-7 w-7 sm:h-8 sm:w-8"} />
      </button>
    </div>
  )
}
