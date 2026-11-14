"use client"

import { useState } from "react"
import { calculateCapoPositions, type CapoOption } from "@/lib/transpose/capo"
import { Sliders, X, Sparkles } from "lucide-react"

interface CapoCalculatorProps {
  currentKey: string
}

export function CapoCalculator({ currentKey }: CapoCalculatorProps) {
  const [open, setOpen] = useState(false)
  const options = calculateCapoPositions(currentKey)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border/80 bg-background text-xs font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <Sliders className="h-3.5 w-3.5 text-indigo-400" />
        <span>Guitar Capo</span>
      </button>

      {open && (
        <div className="mt-3 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-foreground">
                Capo Recommendations for Key of {currentKey}
              </h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-card text-xs"
              >
                <div>
                  <div className="font-semibold text-foreground">
                    {opt.capoFret === 0 ? "No Capo" : `Fret ${opt.capoFret}`}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Play in <strong className="text-indigo-400">{opt.openChordShape}</strong> shapes
                  </div>
                </div>

                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-muted font-bold text-muted-foreground">
                  {opt.openChordShape} Shapes
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
