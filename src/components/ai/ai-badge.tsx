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
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted border border-border text-foreground ${className}`}
    >
      <Sparkles className="w-3 h-3 text-muted-foreground" />
      <span>{label}</span>
      {modelName && (
        <span className="text-muted-foreground font-normal">
          ({modelName.replace("gemini-", "")})
        </span>
      )}
      {isMock && (
        <span className="text-[9px] px-1 rounded bg-background border border-border text-muted-foreground">
          demo
        </span>
      )}
    </span>
  )
}
