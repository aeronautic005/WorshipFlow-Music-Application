"use client"

import { useState, useEffect } from "react"
import { getAiUsageStats, type AiUsageStats } from "@/lib/ai/usage"
import { Zap, AlertCircle } from "lucide-react"

export interface AiUsageIndicatorProps {
  compact?: boolean
  className?: string
}

export function AiUsageIndicator({ compact = false, className = "" }: AiUsageIndicatorProps) {
  const [stats, setStats] = useState<AiUsageStats | null>(null)

  useEffect(() => {
    const refresh = () => setStats(getAiUsageStats())
    refresh()

    window.addEventListener("worshipflow:ai-usage-updated", refresh)
    return () => window.removeEventListener("worshipflow:ai-usage-updated", refresh)
  }, [])

  if (!stats) return null

  const statusColor = stats.isLimitReached
    ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
    : stats.isNearLimit
    ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
    : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"

  const barColor = stats.isLimitReached
    ? "bg-rose-500"
    : stats.isNearLimit
    ? "bg-amber-500"
    : "bg-emerald-500"

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-medium ${statusColor} ${className}`}
        title={`Daily AI Usage: ${stats.callsToday} used out of ${stats.dailyLimit} free-tier calls`}
      >
        {stats.isLimitReached ? (
          <AlertCircle className="w-3 h-3 shrink-0" />
        ) : (
          <Zap className="w-3 h-3 shrink-0" />
        )}
        <span>{stats.remaining}/{stats.dailyLimit} left</span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border bg-card/80 text-xs ${className}`}
      title={`Free-tier daily quota resets at midnight UTC (${stats.callsToday} used today)`}
    >
      <div className="flex items-center gap-1.5">
        <Zap
          className={`w-3.5 h-3.5 ${
            stats.isLimitReached
              ? "text-rose-400"
              : stats.isNearLimit
              ? "text-amber-400"
              : "text-purple-400"
          }`}
        />
        <span className="text-[11px] font-medium text-muted-foreground">Daily Quota:</span>
        <span className="font-mono font-bold text-foreground">
          {stats.remaining}/{stats.dailyLimit}
        </span>
      </div>

      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.max(4, 100 - stats.percentUsed)}%` }}
        />
      </div>
    </div>
  )
}
