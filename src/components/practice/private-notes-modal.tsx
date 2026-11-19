"use client"

import { useState } from "react"
import { NotebookPen, X, Check, Star, Sparkles, Lock } from "lucide-react"
import { updatePracticeStatus, type PracticeStatusRecord } from "@/lib/practice"
import type { PracticeStatusType } from "@/types/database"

interface PrivateNotesModalProps {
  isOpen: boolean
  onClose: () => void
  setlistId: string
  songId: string
  songTitle?: string
  initialNotes?: string | null
  initialConfidence?: number
  currentStatus?: PracticeStatusType
  onSaved?: (record: PracticeStatusRecord) => void
}

const QUICK_PRACTICE_CUES = [
  "Review bridge transition & tempo",
  "Memorize chord progression without sheet",
  "Check vocal harmony 3rd above",
  "Practice kick & snare groove at 128 bpm",
  "Keyboard 2: string pad layer on chorus",
  "Capo 2: play in D shapes for key of E",
]

export function PrivateNotesModal({
  isOpen,
  onClose,
  setlistId,
  songId,
  songTitle,
  initialNotes = "",
  initialConfidence = 3,
  currentStatus = "not_started",
  onSaved,
}: PrivateNotesModalProps) {
  const [notes, setNotes] = useState(initialNotes || "")
  const [confidence, setConfidence] = useState(initialConfidence)
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleApplySnippet = (snippet: string) => {
    if (notes.trim()) {
      setNotes(`${notes}\n• ${snippet}`)
    } else {
      setNotes(`• ${snippet}`)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updatePracticeStatus({
        userId: "current-user",
        setlistId,
        songId,
        songTitle,
        status: currentStatus,
        confidenceRating: confidence,
        privateNotes: notes.trim(),
      })
      if (res.success && res.data) {
        onSaved?.(res.data)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border bg-card text-card-foreground shadow-2xl overflow-hidden space-y-4 p-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <NotebookPen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Personal Practice Notes</h3>
              <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                {songTitle || "Song Practice"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 text-[11px] text-muted-foreground">
          <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>These notes are private to you and only visible on your practice hub.</span>
        </div>

        {/* Confidence Rating */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Readiness Confidence:</span>
            <span className="text-primary font-mono text-xs">{confidence} of 5 Stars</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setConfidence(star)}
                className={`p-1.5 rounded-md transition ${
                  star <= confidence
                    ? "text-amber-500 hover:text-amber-600 scale-105"
                    : "text-muted-foreground/30 hover:text-muted-foreground"
                }`}
                title={`Rate confidence ${star} stars`}
              >
                <Star className="w-5 h-5 fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* Notes Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            My Instrument / Vocal Reminders:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Watch leader's hand signal on chorus 2, snare rim-clicks on verse 1, practice key modulation..."
            rows={4}
            className="w-full text-xs p-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none leading-relaxed"
          />
        </div>

        {/* Quick Snippets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Reminders:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PRACTICE_CUES.map((snippet) => (
              <button
                key={snippet}
                type="button"
                onClick={() => handleApplySnippet(snippet)}
                className="text-[10px] px-2 py-1 rounded-md border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition font-medium"
              >
                + {snippet}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save Notes"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
