import type { SetlistStatus } from "@/types/database"
import { CheckCircle2, Clock, Archive } from "lucide-react"

interface SetlistStatusBadgeProps {
  status: SetlistStatus
  publishedAt?: string | null
}

export function SetlistStatusBadge({ status, publishedAt }: SetlistStatusBadgeProps) {
  if (status === "published") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Published</span>
      </div>
    )
  }

  if (status === "draft") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
        <Clock className="h-3.5 w-3.5" />
        <span>Draft</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border/40 text-muted-foreground text-xs font-semibold">
      <Archive className="h-3.5 w-3.5" />
      <span>Archived</span>
    </div>
  )
}
