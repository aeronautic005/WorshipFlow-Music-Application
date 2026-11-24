"use client"

import { useState, useEffect } from "react"
import {
  generateRehearsalBriefing,
  type RehearsalBriefingResult,
} from "@/lib/ai/rehearsal-briefing"
import { AiBadge } from "@/components/ai/ai-badge"
import { AiGenerateButton } from "@/components/ai/ai-generate-button"
import {
  X,
  Printer,
  Copy,
  Check,
  Calendar,
  Clock,
  Sparkles,
  Music,
  CheckCircle2,
} from "lucide-react"

export interface RehearsalBriefingModalProps {
  isOpen: boolean
  onClose: () => void
  serviceDate: string
  songLeaderName: string
  drummerName?: string
  backupSingerName?: string
  songs: Array<{
    title: string
    key: string
    category: "joyful" | "worship" | string
    bpm?: number | null
  }>
  leaderNotes?: string
}

export function RehearsalBriefingModal({
  isOpen,
  onClose,
  serviceDate,
  songLeaderName,
  drummerName,
  backupSingerName,
  songs,
  leaderNotes,
}: RehearsalBriefingModalProps) {
  const [loading, setLoading] = useState(false)
  const [briefing, setBriefing] = useState<RehearsalBriefingResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await generateRehearsalBriefing({
        serviceDate,
        songLeaderName,
        drummerName,
        backupSingerName,
        songs,
        leaderNotes,
      })
      setBriefing(res)
    } catch (err) {
      console.error("Failed to generate rehearsal briefing:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && !briefing) {
      handleGenerate()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCopy = () => {
    if (!briefing) return
    navigator.clipboard.writeText(briefing.markdownContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/20">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Sunday Rehearsal Briefing (9:00 AM)</span>
              </h3>
              <AiBadge label="Briefing AI" modelName="gemini-2.5-flash" />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span>Service: {serviceDate}</span>
              <span>•</span>
              <span>Leader: {songLeaderName}</span>
              {drummerName && (
                <>
                  <span>•</span>
                  <span>Drums: {drummerName}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              title="Print Rehearsal Sheet"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              title="Copy to Clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">
                Analyzing song keys, transitions, and dynamics with Gemini...
              </p>
            </div>
          ) : briefing ? (
            <div className="space-y-4">
              {/* Highlights & Key Moments */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block">
                  Rehearsal Run-Through Checkpoints
                </span>
                <ul className="space-y-1.5 text-xs text-foreground/90 font-sans">
                  {briefing.keyMoments.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Plan Markdown Prose */}
              <div className="p-4 rounded-xl bg-background border border-border/70 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans space-y-2">
                {briefing.markdownContent}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3.5 border-t border-border/60 bg-muted/20">
          <span className="text-[11px] text-muted-foreground font-mono">
            {songs.length} Songs in Setlist
          </span>

          <div className="flex items-center gap-2">
            <AiGenerateButton
              isLoading={loading}
              loadingText="Regenerating..."
              onClick={handleGenerate}
              variant="outline"
              className="h-8 text-xs py-1 px-3"
            >
              Regenerate Briefing
            </AiGenerateButton>

            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
