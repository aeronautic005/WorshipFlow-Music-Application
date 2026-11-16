"use client"

import { useState } from "react"
import { MessageSquare, X, Check, Sparkles, Music2 } from "lucide-react"
import type { SongSection } from "@/types/database"
import { SECTION_CONFIGS, type SectionType } from "@/types/structure"

interface SectionNotesModalProps {
  section: SongSection
  isOpen: boolean
  onClose: () => void
  onSaveNotes: (notes: string) => void
}

const COMMON_NOTE_SNIPPETS = [
  { label: "Drums Drop", text: "Drums drop out completely" },
  { label: "Tom Build", text: "Drums build with tom swells" },
  { label: "Keys Pad Only", text: "Keyboard 1 soft pad only" },
  { label: "Acapella Voices", text: "Acapella with hand claps" },
  { label: "Full Power Band", text: "Everyone full groove and energy" },
  { label: "Guitar Solo", text: "Electric guitar lead melody" },
  { label: "Cut on 1", text: "Big hit and hold on beat 1" },
  { label: "Vocal Harmony", text: "Backup vocals add 3rd above harmony" },
]

export function SectionNotesModal({
  section,
  isOpen,
  onClose,
  onSaveNotes,
}: SectionNotesModalProps) {
  const [noteText, setNoteText] = useState(section.notes || "")

  if (!isOpen) return null

  const config = SECTION_CONFIGS[section.type as SectionType] || SECTION_CONFIGS.verse

  const handleApplySnippet = (snippet: string) => {
    if (noteText.trim()) {
      setNoteText(`${noteText}. ${snippet}`)
    } else {
      setNoteText(snippet)
    }
  }

  const handleSave = () => {
    onSaveNotes(noteText.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border bg-card text-card-foreground shadow-2xl overflow-hidden space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${config.color.badgeBg} ${config.color.text}`}
            >
              {section.name}
            </span>
            <h3 className="font-bold text-sm">Instrument & Arrangement Cue</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Notes for worship musicians (Drums, Keys, Vocals, Guitars):
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="e.g. Drums drop out on first 4 bars, keyboard pad only, backup adds harmony..."
            rows={3}
            className="w-full text-xs p-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>

        {/* Quick Snippets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Arrangement Cues:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_NOTE_SNIPPETS.map((snippet) => (
              <button
                key={snippet.label}
                type="button"
                onClick={() => handleApplySnippet(snippet.text)}
                className="text-[10px] px-2 py-1 rounded-md border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition font-medium"
              >
                + {snippet.label}
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
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            Save Cues
          </button>
        </div>
      </div>
    </div>
  )
}
