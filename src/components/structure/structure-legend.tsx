"use client"

import { useState } from "react"
import { SECTION_CONFIGS, DYNAMICS_CONFIG, type SectionType } from "@/types/structure"
import { HelpCircle, ChevronDown, ChevronUp, Music2, Sliders } from "lucide-react"

export function StructureLegend() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden text-xs transition shadow-2xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold hover:bg-secondary/40 transition text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Structure Blueprint Guide &amp; Legend</span>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t space-y-4 bg-background/50 animate-in fade-in duration-150">
          {/* Section Colors */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Music2 className="w-3 h-3 text-primary" />
              <span>Section Color Codes</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(SECTION_CONFIGS) as SectionType[]).slice(0, 8).map((type) => {
                const conf = SECTION_CONFIGS[type]
                return (
                  <div
                    key={type}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs font-medium ${conf.color.bg} ${conf.color.border} ${conf.color.text}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                    <span>{conf.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Dynamics Symbols */}
          <div className="space-y-2 border-t pt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-primary" />
              <span>Band Dynamics Cues</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.entries(DYNAMICS_CONFIG).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border text-xs"
                >
                  <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-background text-[10px] border uppercase">
                    {val.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground text-[11px]">{val.label}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{val.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
