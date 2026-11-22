import { Sparkles } from "lucide-react"

export interface AiBadgeProps {
  label?: string
  modelName?: string
  isMock?: boolean
  className?: string
}

export function AiBadge({
  label = "AI Assistant",
  modelName,
  isMock,
  className = "",
}: AiBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-gradient-to-r from-violet-500/15 via-purple-500/15 to-indigo-500/15 border border-purple-500/30 text-purple-400 shadow-sm ${className}`}
    >
      <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
      <span>{label}</span>
      {modelName && (
        <span className="text-muted-foreground/75 font-normal lowercase tracking-normal">
          ({modelName.replace("gemini-", "")})
        </span>
      )}
      {isMock && (
        <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-normal normal-case">
          demo
        </span>
      )}
    </span>
  )
}
