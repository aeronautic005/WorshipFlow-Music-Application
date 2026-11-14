"use client"

import { useState } from "react"
import { Music2, ExternalLink, Edit2, Check, Video } from "lucide-react"

interface PinnedReferenceCardProps {
  url: string
  onUpdateUrl?: (newUrl: string) => void
  editable?: boolean
}

export function PinnedReferenceCard({
  url,
  onUpdateUrl,
  editable = false,
}: PinnedReferenceCardProps) {
  const [editing, setEditing] = useState(false)
  const [tempUrl, setTempUrl] = useState(url)

  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be")
  const isSpotify = url.includes("spotify.com")

  const handleSave = () => {
    if (onUpdateUrl) {
      onUpdateUrl(tempUrl.trim())
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-indigo-500/40">
        <input
          type="url"
          value={tempUrl}
          onChange={(e) => setTempUrl(e.target.value)}
          placeholder="Paste official YouTube/Spotify link..."
          className="flex-1 h-7 px-2 text-xs bg-transparent focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          className="p-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  if (!url) {
    return (
      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 text-xs text-muted-foreground">
        <span>No practice link pinned</span>
        {editable && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-indigo-400 hover:underline font-medium"
          >
            + Pin Reference
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs">
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <div className="p-1 rounded bg-red-500/10 text-red-400 shrink-0">
          {isYouTube ? <Video className="h-3.5 w-3.5" /> : <Music2 className="h-3.5 w-3.5" />}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">
            {isYouTube ? "YouTube Reference" : isSpotify ? "Spotify Track" : "Practice Audio"}
          </div>
          <div className="text-[10px] text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
            {url}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-border/80 text-[11px] font-medium hover:bg-muted text-foreground transition-colors"
        >
          <span>Open</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </a>

        {editable && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-1 rounded text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
