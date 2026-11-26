"use client"

import { ReactNode } from "react"
import { AiBadge } from "@/components/ai/ai-badge"
import { AiFeedbackButtons } from "@/components/ai/ai-feedback-buttons"
import type { AiFeedbackFeature } from "@/lib/ai/feedback"
import { Check, X, RotateCw } from "lucide-react"

export interface AiResultCardProps {
  title: string
  subtitle?: string
  modelName?: string
  isMock?: boolean
  children: ReactNode
  onApply?: () => void
  applyLabel?: string
  onRegenerate?: () => void
  onDismiss?: () => void
  isRegenerating?: boolean
  feedbackFeature?: AiFeedbackFeature
  feedbackId?: string
  className?: string
}

export function AiResultCard({
  title,
  subtitle,
  modelName = "gemini-2.5-flash",
  isMock = false,
  children,
  onApply,
  applyLabel = "Apply to Song",
  onRegenerate,
  onDismiss,
  isRegenerating = false,
  feedbackFeature = "chords",
  feedbackId,
  className = "",
}: AiResultCardProps) {
  return (
    <div
      className={`relative rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-card to-card p-5 shadow-xl shadow-purple-950/10 space-y-4 animate-in fade-in duration-200 ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-foreground tracking-tight">{title}</h4>
            <AiBadge modelName={modelName} isMock={isMock} />
          </div>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition disabled:opacity-50"
              title="Regenerate with alternative suggestion"
            >
              <RotateCw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
              title="Dismiss AI suggestion"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="text-sm text-foreground/90 leading-relaxed font-sans">{children}</div>

      {/* Bottom Footer Action & Feedback */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/40">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>Rate result:</span>
          <AiFeedbackButtons
            targetId={feedbackId || `card-${title.toLowerCase().replace(/\s+/g, "-")}`}
            feature={feedbackFeature}
            model={modelName}
          />
        </div>

        {onApply && (
          <button
            type="button"
            onClick={onApply}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition ml-auto"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{applyLabel}</span>
          </button>
        )}
      </div>
    </div>
  )
}
