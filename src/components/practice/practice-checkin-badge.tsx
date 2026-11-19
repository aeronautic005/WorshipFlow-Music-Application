"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle, Circle, Loader2, NotebookPen } from "lucide-react"
import type { PracticeStatusType } from "@/types/database"
import { updatePracticeStatus, type PracticeStatusRecord } from "@/lib/practice"
import { PrivateNotesModal } from "./private-notes-modal"

interface PracticeCheckinBadgeProps {
  setlistId: string
  songId: string
  songTitle?: string
  currentStatus?: PracticeStatusType
  userName?: string
  instrument?: string
  onStatusChange?: (newStatus: PracticeStatusType) => void
  size?: "sm" | "md"
}

export function PracticeCheckinBadge({
  setlistId,
  songId,
  songTitle,
  currentStatus = "not_started",
  userName = "Me",
  instrument = "Band",
  onStatusChange,
  size = "md",
}: PracticeCheckinBadgeProps) {
  const [status, setStatus] = useState<PracticeStatusType>(currentStatus)
  const [loading, setLoading] = useState(false)
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [savedNotes, setSavedNotes] = useState<string | null>(null)

  const handleSelectStatus = async (newStatus: PracticeStatusType) => {
    if (newStatus === status || loading) return
    setLoading(true)
    setStatus(newStatus)

    try {
      await updatePracticeStatus({
        userId: "current-user",
        userName,
        instrument,
        setlistId,
        songId,
        songTitle,
        status: newStatus,
      })
      onStatusChange?.(newStatus)
    } finally {
      setLoading(false)
    }
  }

  const isSmall = size === "sm"

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border bg-background/90 p-0.5 shadow-2xs">
      {/* Ready */}
      <button
        type="button"
        disabled={loading}
        onClick={() => handleSelectStatus("ready")}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold transition ${
          isSmall ? "text-[10px]" : "text-xs"
        } ${
          status === "ready"
            ? "bg-emerald-500 text-white shadow-xs"
            : "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
        }`}
        title="I know this song well for Sunday"
      >
        <CheckCircle2 className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
        <span>Ready</span>
      </button>

      {/* Needs Work */}
      <button
        type="button"
        disabled={loading}
        onClick={() => handleSelectStatus("needs_work")}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold transition ${
          isSmall ? "text-[10px]" : "text-xs"
        } ${
          status === "needs_work"
            ? "bg-amber-500 text-white shadow-xs"
            : "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
        }`}
        title="Need to practice bridge or transitions"
      >
        <AlertCircle className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
        <span>Needs Work</span>
      </button>

      {/* Not Started */}
      <button
        type="button"
        disabled={loading}
        onClick={() => handleSelectStatus("not_started")}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition ${
          isSmall ? "text-[10px]" : "text-xs"
        } ${
          status === "not_started"
            ? "bg-muted text-foreground"
            : "text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground"
        }`}
        title="Haven't practiced yet"
      >
        <Circle className={isSmall ? "w-2.5 h-2.5" : "w-3 h-3"} />
        <span className="hidden sm:inline">Not Started</span>
      </button>

      {/* Private Notes Trigger */}
      <button
        type="button"
        onClick={() => setNotesModalOpen(true)}
        className={`p-1 rounded-md transition ${
          savedNotes
            ? "text-primary hover:bg-primary/10"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
        title={savedNotes ? `Notes: ${savedNotes}` : "Add private practice notes"}
      >
        <NotebookPen className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
      </button>

      {loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-1" />}

      {/* Private Notes Modal */}
      <PrivateNotesModal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        setlistId={setlistId}
        songId={songId}
        songTitle={songTitle}
        initialNotes={savedNotes}
        currentStatus={status}
        onSaved={(record) => {
          setSavedNotes(record.private_notes || null)
          if (record.status) setStatus(record.status)
        }}
      />
    </div>
  )
}
