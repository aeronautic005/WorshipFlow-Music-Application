"use client"

import { useEffect, useState } from "react"
import { NotebookPen, X, Check, Star, Lock } from "lucide-react"
import { updatePracticeStatus, type PracticeStatusRecord } from "@/lib/practice"
import type { PracticeStatusType } from "@/types/database"

interface PrivateNotesModalProps {
  isOpen: boolean
  onClose: () => void
  setlistId: string
  songId: string
  songTitle?: string
  userId?: string
  userName?: string
  instrument?: string
  initialNotes?: string | null
  initialConfidence?: number
  currentStatus?: PracticeStatusType
  onSaved?: (record: PracticeStatusRecord) => void
}

const QUICK_PRACTICE_CUES = [
  "Review bridge transition",
  "Check tempo & dynamics",
  "Memorize chord progression",
  "Watch leader cue on chorus",
]

export function PrivateNotesModal({
  isOpen,
  onClose,
  setlistId,
  songId,
  songTitle,
  userId = "aeron-id",
  userName = "Aeron",
  instrument = "Drums",
  initialNotes = "",
  initialConfidence = 3,
  currentStatus = "not_started",
  onSaved,
}: PrivateNotesModalProps) {
  const [notes, setNotes] = useState(initialNotes || "")
  const [confidence, setConfidence] = useState(initialConfidence)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setNotes(initialNotes || "")
  }, [initialNotes])

  useEffect(() => {
    setConfidence(initialConfidence)
  }, [initialConfidence])

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
        userId,
        userName,
        instrument,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card text-foreground shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-2xl bg-secondary text-foreground shrink-0">
              <NotebookPen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-foreground">Personal Practice Notes</h3>
              <p className="text-xs text-muted-foreground truncate">
                {songTitle || "Song Practice"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Privacy Hint */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-secondary/50 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>Private to you — never visible to other teammates.</span>
          </div>

          {/* Readiness Confidence */}
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-border/80 bg-secondary/25">
            <div>
              <p className="text-xs font-semibold text-foreground">Confidence</p>
              <p className="text-[11px] text-muted-foreground">{confidence} of 5 stars</p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setConfidence(star)}
                  className={`p-1 rounded-full transition cursor-pointer ${
                    star <= confidence
                      ? "text-primary hover:opacity-80"
                      : "text-muted-foreground/30 hover:text-muted-foreground/60"
                  }`}
                  title={`Rate confidence ${star} of 5`}
                >
                  <Star className="w-4.5 h-4.5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Notes Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              Instrument &amp; Vocal Reminders
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write cues for yourself (e.g., snare rim-clicks on verse 1, drop out on bridge...)"
              rows={4}
              className="w-full text-xs p-3.5 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none leading-relaxed"
            />
          </div>

          {/* Quick Add Cues */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Quick Add
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PRACTICE_CUES.map((snippet) => (
                <button
                  key={snippet}
                  type="button"
                  onClick={() => handleApplySnippet(snippet)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-border bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground transition font-medium cursor-pointer"
                >
                  + {snippet}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/70 bg-secondary/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save Notes"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
