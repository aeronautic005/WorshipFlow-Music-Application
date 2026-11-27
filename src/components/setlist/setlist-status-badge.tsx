import type { SetlistStatus } from "@/types/database"
import { CheckCircle2, Clock, Archive } from "lucide-react"

interface SetlistStatusBadgeProps {
  status: SetlistStatus
  publishedAt?: string | null
}

export function SetlistStatusBadge({ status }: SetlistStatusBadgeProps) {
  if (status === "published") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Published</span>
      </div>
    )
  }

  if (status === "draft") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground text-xs font-semibold">
        <Clock className="h-3.5 w-3.5" />
        <span>Draft</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-muted border border-border text-muted-foreground text-xs font-semibold">
      <Archive className="h-3.5 w-3.5" />
      <span>Archived</span>
    </div>
  )
}
