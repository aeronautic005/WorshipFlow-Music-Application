"use client"

import { useState } from "react"
import type { FullSetlist } from "@/lib/setlists"
import { Share2, Check } from "lucide-react"

export interface ShareSetlistButtonProps {
  setlist: FullSetlist
  className?: string
}

export function ShareSetlistButton({ setlist, className = "" }: ShareSetlistButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopySummary = () => {
    const joyful = (setlist.songs || []).filter((s) => s.category === "joyful")
    const worship = (setlist.songs || []).filter((s) => s.category === "worship")

    const lines: string[] = [
      `SUNDAY WORSHIP LINEUP — ${setlist.service_date}`,
      `Song Leader: ${setlist.song_leader_name || "TBD"} | Backup: ${
        setlist.backup_singer_name || "None"
      } | Drums: ${setlist.drummer_name || "Rotation"}`,
      "",
    ]

    if (joyful.length > 0) {
      lines.push("JOYFUL (Fast Praise):")
      joyful.forEach((s, idx) => {
        lines.push(`${idx + 1}. ${s.title} (Key: ${s.assigned_key})`)
      })
      lines.push("")
    }

    if (worship.length > 0) {
      lines.push("WORSHIP (Slow):")
      worship.forEach((s, idx) => {
        lines.push(`${joyful.length + idx + 1}. ${s.title} (Key: ${s.assigned_key})`)
      })
      lines.push("")
    }

    if (setlist.notes) {
      lines.push(`Notes: ${setlist.notes}`)
      lines.push("")
    }

    lines.push("Sunday 9:00 AM Rehearsal | 2:30 PM Live Service")

    navigator.clipboard.writeText(lines.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <button
      type="button"
      onClick={handleCopySummary}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors shadow-xs cursor-pointer ${className}`}
      title="Copy Messenger/Viber-friendly setlist text"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-400">Copied Lineup!</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">Share Lineup</span>
        </>
      )}
    </button>
  )
}
