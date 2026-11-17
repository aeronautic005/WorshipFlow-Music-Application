"use client"

import { Lock, Unlock, AlertTriangle } from "lucide-react"

interface StructureLockBadgeProps {
  isLocked: boolean
  onToggle?: () => void
  disabled?: boolean
  showDetails?: boolean
}

export function StructureLockBadge({
  isLocked,
  onToggle,
  disabled = false,
  showDetails = true,
}: StructureLockBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition ${
        isLocked
          ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
      }`}
    >
      <div className="flex items-center gap-1.5 font-semibold">
        {isLocked ? (
          <>
            <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Structure Locked</span>
          </>
        ) : (
          <>
            <Unlock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Editing Enabled</span>
          </>
        )}
      </div>

      {showDetails && (
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          {isLocked
            ? "Published for Sunday. Changes locked to prevent rehearsal confusion."
            : "Draft mode: freely modify flow and sections."}
        </span>
      )}

      {onToggle && (
        <button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          className="ml-auto text-[11px] font-bold underline hover:opacity-80 transition disabled:opacity-40"
        >
          {isLocked ? "Unlock" : "Lock"}
        </button>
      )}
    </div>
  )
}
