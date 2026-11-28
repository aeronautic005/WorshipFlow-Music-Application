"use client"

import { useEffect, useState } from "react"
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

  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

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
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 p-1">
      {/* Ready */}
      <button
        type="button"
        disabled={loading}
        onClick={() => handleSelectStatus("ready")}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold transition cursor-pointer ${
          isSmall ? "text-[10px]" : "text-xs"
        } ${
          status === "ready"
            ? "bg-emerald-600 text-white shadow-xs"
            : "text-muted-foreground hover:bg-card hover:text-foreground"
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
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold transition cursor-pointer ${
          isSmall ? "text-[10px]" : "text-xs"
        } ${
          status === "needs_work"
            ? "bg-amber-500 text-white shadow-xs"
            : "text-muted-foreground hover:bg-card hover:text-foreground"
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
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium transition cursor-pointer ${
          isSmall ? "text-[10px]" : "text-xs"
        } ${
          status === "not_started"
            ? "bg-card text-foreground shadow-2xs"
            : "text-muted-foreground hover:bg-card hover:text-foreground"
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
        className={`p-1.5 rounded-full transition cursor-pointer ${
          savedNotes
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-card hover:text-foreground"
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
