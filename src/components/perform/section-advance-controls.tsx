"use client"

import type { SongSection } from "@/types/database"
import { SECTION_CONFIGS, type SectionType } from "@/types/structure"
import { ChevronLeft, ChevronRight, Repeat, Sparkles, Volume2 } from "lucide-react"

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
  const currentConf = current
    ? SECTION_CONFIGS[current.type as SectionType] || SECTION_CONFIGS.verse
    : null
  const nextConf = next ? SECTION_CONFIGS[next.type as SectionType] || SECTION_CONFIGS.verse : null

  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-stretch select-none">
      <button
        type="button"
        onClick={onPrev}
        disabled={activeIndex <= 0}
        aria-label="Previous section"
        className="flex items-center justify-center w-14 sm:w-20 rounded-2xl border bg-card hover:bg-muted active:scale-95 transition disabled:opacity-30"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      {/* Tapping the NOW card also advances */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Advance to next section"
        className={`text-left rounded-2xl border-2 p-4 sm:p-6 transition active:scale-[0.99] ${
          currentConf ? `${currentConf.color.bg} ${currentConf.color.border}` : "bg-card"
        }`}
      >
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Now</p>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className={`text-4xl sm:text-6xl font-black tracking-tight ${currentConf?.color.text || ""}`}
          >
            {current?.name || "End"}
          </span>
          {current?.repeats && current.repeats > 1 && (
            <span className="inline-flex items-center gap-1 text-xl sm:text-2xl font-extrabold">
              <Repeat className="h-5 w-5" />x{current.repeats}
            </span>
          )}
          {current?.bars && (
            <span className="text-sm font-mono text-muted-foreground">{current.bars} bars</span>
          )}
        </div>

        {/* Current section live performance notes & band cues */}
        {current?.notes && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-semibold flex items-start gap-2 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/80 block">
                Band & Instrument Cue:
              </span>
              <span>{current.notes}</span>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-between gap-2 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Next
            </span>
            {next ? (
              <span className={`font-bold ${nextConf?.color.text || ""}`}>
                {next.name}
                {next.repeats && next.repeats > 1 ? ` x${next.repeats}` : ""}
              </span>
            ) : (
              <span className="font-semibold text-muted-foreground">End of song</span>
            )}
          </div>

          {next?.notes && (
            <span className="text-[11px] text-muted-foreground italic truncate max-w-[220px]">
              Upcoming: {next.notes}
            </span>
          )}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Tap here or press Space / Right Arrow to advance
        </p>
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={activeIndex >= sections.length - 1}
        aria-label="Next section"
        className="flex items-center justify-center w-14 sm:w-20 rounded-2xl border bg-card hover:bg-muted active:scale-95 transition disabled:opacity-30"
      >
        <ChevronRight className="h-8 w-8" />
      </button>
    </div>
  )
}
