"use client"

import { useState, useEffect } from "react"
import { getChordChart, generateDefaultChordChart } from "@/lib/chords"
import { transposeChordChart } from "@/lib/transpose"
import { CapoCalculator } from "@/components/song/capo-calculator"
import { X, FileCode, Music2, Minus, Plus, Loader2 } from "lucide-react"

interface LiveChordModalProps {
  isOpen: boolean
  onClose: () => void
  songId: string
  songTitle: string
  assignedKey: string
  originalKey: string
}

export function LiveChordModal({
  isOpen,
  onClose,
  songId,
  songTitle,
  assignedKey,
  originalKey,
}: LiveChordModalProps) {
  const [currentKey, setCurrentKey] = useState(assignedKey)
  const [baseChart, setBaseChart] = useState<string>("")
  const [chartContent, setChartContent] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [showCapo, setShowCapo] = useState(false)

  useEffect(() => {
    setCurrentKey(assignedKey)
  }, [assignedKey])

  useEffect(() => {
    if (!isOpen || !songId) return
    async function load() {
      setLoading(true)
      const chart = await getChordChart(songId, assignedKey)
      const content = chart ? chart.chart_content : generateDefaultChordChart(songTitle, assignedKey)
      setBaseChart(content)
      setChartContent(content)
      setLoading(false)
    }
    load()
  }, [isOpen, songId, songTitle, assignedKey])

  if (!isOpen) return null

  const handleKeyChange = (newKey: string) => {
    setCurrentKey(newKey)
    const transposed = transposeChordChart(baseChart, assignedKey, newKey)
    setChartContent(transposed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold truncate max-w-[240px] sm:max-w-md">
                {songTitle}
              </h2>
              <p className="text-xs text-neutral-400">
                Assigned Key: <strong className="text-primary">{assignedKey}</strong>
                {originalKey !== assignedKey ? ` (Orig: ${originalKey})` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCapo(!showCapo)}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-800 text-xs font-semibold hover:bg-neutral-900 transition text-neutral-300"
            >
              {showCapo ? "Hide Capo" : "Guitar Capo"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
              aria-label="Close chord sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Capo Calculator Drawer */}
        {showCapo && (
          <div className="p-3 border-b border-neutral-800 bg-neutral-900/60 shrink-0">
            <CapoCalculator currentKey={currentKey} />
          </div>
        )}

        {/* Chord Sheet Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 select-text font-mono text-xs sm:text-sm leading-relaxed text-neutral-200">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
              <span>Loading chords...</span>
            </div>
          ) : (
            <pre className="whitespace-pre font-mono font-medium">{chartContent}</pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 shrink-0 bg-neutral-900/40">
          <span>Press &apos;C&apos; or Escape to close</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
