"use client"

import { useState } from "react"
import { calculateCapoPositions } from "@/lib/transpose/capo"
import { Sliders, X } from "lucide-react"

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
        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
          open
            ? "bg-primary text-primary-foreground border-primary"
            : "border-border bg-card text-primary hover:bg-secondary"
        }`}
      >
        <Sliders className="h-3.5 w-3.5" />
        <span>Guitar Capo</span>
      </button>

      {open && (
        <div className="mt-3 p-4 rounded-2xl border border-border bg-secondary/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-primary">
              Capo Positions for Key of {currentKey}
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-full text-muted-foreground hover:text-primary cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card text-xs"
              >
                <div>
                  <div className="font-semibold text-foreground">
                    {opt.capoFret === 0 ? "No Capo" : `Capo Fret ${opt.capoFret}`}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Play in <strong className="text-primary">{opt.openChordShape}</strong> shapes
                  </div>
                </div>

                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">
                  {opt.openChordShape}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
