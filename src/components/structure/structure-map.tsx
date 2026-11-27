"use client"

import { useMemo } from "react"
import type { SongSection } from "@/types/database"
import {
  SECTION_CONFIGS,
  DYNAMICS_CONFIG,
  type SectionType,
  type StructureSectionItem,
} from "@/types/structure"
import { ArrowRight, Info, Music2 } from "lucide-react"

interface StructureMapProps {
  sections: (SongSection | StructureSectionItem)[]
  activeIndex?: number
  onSectionClick?: (index: number, section: SongSection | StructureSectionItem) => void
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  showArrows?: boolean
  bpm?: number | null
  showTimelineSummary?: boolean
  className?: string
}

export function StructureMap({
  sections,
  activeIndex,
  onSectionClick,
  size = "md",
  interactive = false,
  showArrows = true,
  bpm,
  showTimelineSummary = false,
  className = "",
}: StructureMapProps) {
  const timelineInfo = useMemo(() => {
    if (!sections || sections.length === 0) return null
    const totalBars = sections.reduce(
      (acc, s) => acc + (s.bars || 8) * (s.repeats && s.repeats > 1 ? s.repeats : 1),
      0
    )
    if (!bpm || bpm <= 0) return { totalBars, durationText: null }

    const beats = totalBars * 4 // Assuming 4/4 standard worship time
    const seconds = Math.round((beats / bpm) * 60)
    const mins = Math.floor(seconds / 60)
    const remSecs = seconds % 60
    return {
      totalBars,
      durationText: `${mins}m ${remSecs < 10 ? "0" : ""}${remSecs}s`,
    }
  }, [sections, bpm])

  if (!sections || sections.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic py-2">
        No structure map configured for this song.
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showTimelineSummary && timelineInfo && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1">
          <span>{sections.length} Sections · {timelineInfo.totalBars} Total Bars</span>
          {timelineInfo.durationText && (
            <span className="font-mono font-medium">Est. Duration: ~{timelineInfo.durationText}</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {sections.map((section, idx) => {
        const config = SECTION_CONFIGS[section.type as SectionType] || SECTION_CONFIGS.verse
        const isActive = activeIndex === idx
        const repeats = section.repeats && section.repeats > 1 ? section.repeats : 1
        const dynamics = (section as any).dynamics as keyof typeof DYNAMICS_CONFIG | undefined
        const dynamicsInfo = dynamics ? DYNAMICS_CONFIG[dynamics] : null

        const sizeClasses = {
          sm: "px-2.5 py-1 text-[11px]",
          md: "px-3 py-1.5 text-xs",
          lg: "px-3.5 py-2 text-sm",
        }[size]

        return (
          <div key={section.id || idx} className="inline-flex items-center gap-1.5">
            <button
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onSectionClick?.(idx, section)}
              title={
                section.notes
                  ? `${section.name}: ${section.notes}`
                  : `${section.name} (${section.bars || 8} bars)`
              }
              className={`group relative inline-flex items-center gap-1.5 font-semibold rounded-md border transition-all select-none ${sizeClasses} ${
                config.color.bg
              } ${config.color.border} ${config.color.text} ${
                interactive ? "cursor-pointer hover:scale-105 active:scale-95 shadow-xs" : "cursor-default"
              } ${
                isActive
                  ? `ring-2 ring-offset-2 ${config.color.activeRing} ring-offset-background scale-105 shadow-md`
                  : ""
              }`}
            >
              {/* Active pulsing dot */}
              {isActive && (
                <span className="flex h-2 w-2 rounded-full bg-current animate-ping shrink-0" />
              )}

              {/* Section Name */}
              <span>{section.name || config.label}</span>

              {/* Repeats Badge (e.g. x2) */}
              {repeats > 1 && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${config.color.badgeBg}`}>
                  x{repeats}
                </span>
              )}

              {/* Bars Count */}
              {size !== "sm" && section.bars && (
                <span className="text-[10px] opacity-70 font-mono font-normal">
                  {section.bars}b
                </span>
              )}

              {/* Dynamics Icon Badge */}
              {dynamicsInfo && size !== "sm" && (
                <span
                  className="px-1 rounded text-[9px] font-mono bg-black/10 dark:bg-white/10 uppercase"
                  title={dynamicsInfo.label}
                >
                  {dynamicsInfo.icon}
                </span>
              )}

              {/* Notes Indicator */}
              {section.notes && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-current opacity-55 shrink-0"
                  title={section.notes}
                />
              )}
            </button>

            {/* Connecting Flow Arrow */}
            {showArrows && idx < sections.length - 1 && (
              <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            )}
          </div>
        )
      })}
      </div>
    </div>
  )
}
