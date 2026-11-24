"use client"

import { useState } from "react"
import {
  type SetlistIntelligenceReport,
  type SetlistIssue,
} from "@/lib/ai/setlist-intelligence"
import { AiBadge } from "@/components/ai/ai-badge"
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Flame,
  Heart,
  Music2,
  ArrowRight,
} from "lucide-react"

export interface SetlistHealthWidgetProps {
  report: SetlistIntelligenceReport
  onActionClick?: (actionType: SetlistIssue["actionType"]) => void
  className?: string
}

export function SetlistHealthWidget({
  report,
  onActionClick,
  className = "",
}: SetlistHealthWidgetProps) {
  const [expanded, setExpanded] = useState(false)

  const { healthScore, totalSongs, joyfulCount, worshipCount, issues, keyTransitions, summary } =
    report

  const scoreColor =
    healthScore >= 85
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : healthScore >= 65
      ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
      : "text-rose-400 border-rose-500/30 bg-rose-500/10"

  const warningCount = issues.filter((i) => i.level === "warning").length

  return (
    <div
      className={`rounded-2xl border border-border/70 bg-card/75 p-4 shadow-sm backdrop-blur-xs space-y-3 transition-all ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center font-mono font-bold leading-none ${scoreColor}`}
          >
            <span className="text-base">{healthScore}</span>
            <span className="text-[9px] uppercase font-sans tracking-tight opacity-80">Score</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">Setlist Flow Intelligence</h4>
              <AiBadge label="Flow AI" modelName="gemini-2.5-flash" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{summary}</p>
          </div>
        </div>

        {/* Counts & Expand toggle */}
        <div className="flex items-center gap-2">
          {/* Joyful / Worship counters */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-border/60 text-xs font-semibold">
            <span className="flex items-center gap-1 text-orange-400">
              <Flame className="w-3.5 h-3.5" />
              <span>{joyfulCount} Joyful</span>
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="flex items-center gap-1 text-blue-400">
              <Heart className="w-3.5 h-3.5" />
              <span>{worshipCount} Worship</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <span>{expanded ? "Hide Details" : `Details (${issues.length})`}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Warnings & Suggestions list (Collapsible) */}
      {expanded && (
        <div className="space-y-3 pt-2 border-t border-border/50 animate-in fade-in duration-150">
          {/* Key Transitions Flow Row */}
          {keyTransitions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Key Transitions Curve
              </span>
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-background border border-border/60">
                {keyTransitions.map((kt, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-xs font-mono">
                    <span className="font-bold text-foreground">{kt.fromKey}</span>
                    <ArrowRight
                      className={`w-3 h-3 ${
                        kt.isSmooth ? "text-emerald-400" : "text-amber-400"
                      }`}
                    />
                    <span className="font-bold text-foreground">{kt.toKey}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                        kt.isSmooth
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/15 text-amber-300 font-semibold"
                      }`}
                      title={kt.intervalDescription}
                    >
                      {kt.isSmooth ? "Smooth" : "Prep Leap"}
                    </span>
                    {idx < keyTransitions.length - 1 && (
                      <span className="text-muted-foreground/40 mx-1">|</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issues and checklist */}
          <div className="space-y-2">
            {issues.map((issue) => {
              const Icon =
                issue.level === "warning"
                  ? AlertTriangle
                  : issue.level === "info"
                  ? Info
                  : CheckCircle2

              const levelStyle =
                issue.level === "warning"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : issue.level === "info"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"

              return (
                <div
                  key={issue.id}
                  className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-xs ${levelStyle}`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <strong className="font-semibold block">{issue.title}</strong>
                      <p className="text-foreground/80 leading-relaxed font-sans">{issue.message}</p>
                    </div>
                  </div>

                  {issue.actionType && onActionClick && (
                    <button
                      type="button"
                      onClick={() => onActionClick(issue.actionType)}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-background/80 hover:bg-background border border-border text-[11px] font-semibold text-foreground transition"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
