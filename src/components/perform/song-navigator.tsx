"use client"

import { useState } from "react"
import type { LiveSong } from "./live-song-view"
import { ChevronLeft, ChevronRight, ListMusic, X } from "lucide-react"

interface SongNavigatorProps {
  songs: LiveSong[]
  currentIndex: number
  onSelectSong: (index: number) => void
}

export function SongNavigator({ songs, currentIndex, onSelectSong }: SongNavigatorProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const prevSong = songs[currentIndex - 1]
  const nextSong = songs[currentIndex + 1]

  return (
    <>
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border bg-card/80 backdrop-blur-xs shadow-xs text-xs">
        {/* Prev Song */}
        <button
          type="button"
          disabled={!prevSong}
          onClick={() => onSelectSong(currentIndex - 1)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-background hover:bg-muted disabled:opacity-30 transition font-medium truncate max-w-[140px] sm:max-w-[200px]"
          title={prevSong ? `Go to previous song: ${prevSong.title}` : "First song in setlist"}
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span className="truncate hidden sm:inline">{prevSong ? prevSong.title : "Start"}</span>
          <span className="sm:hidden">Prev</span>
        </button>

        {/* Setlist Drawer Toggle */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold border border-primary/20 transition"
        >
          <ListMusic className="w-4 h-4" />
          <span>
            {currentIndex + 1} of {songs.length}
          </span>
        </button>

        {/* Next Song */}
        <button
          type="button"
          disabled={!nextSong}
          onClick={() => onSelectSong(currentIndex + 1)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-background hover:bg-muted disabled:opacity-30 transition font-medium truncate max-w-[140px] sm:max-w-[200px]"
          title={nextSong ? `Next song: ${nextSong.title} (Key ${nextSong.assigned_key})` : "Last song in setlist"}
        >
          <span className="truncate hidden sm:inline">
            {nextSong ? `${nextSong.title} (${nextSong.assigned_key})` : "End"}
          </span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* Setlist Drawer / Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card text-card-foreground p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm">Service Setlist Lineup</h3>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {songs.map((s, idx) => {
                const isCurrent = idx === currentIndex
                const isJoyful = s.category === "joyful"

                return (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => {
                      onSelectSong(idx)
                      setDrawerOpen(false)
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      isCurrent
                        ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                        : "bg-background/60 hover:bg-muted text-foreground border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs w-5 text-muted-foreground">{idx + 1}.</span>
                      <div className="min-w-0">
                        <p className="text-xs truncate font-semibold">{s.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{s.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          isJoyful
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {isJoyful ? "Joyful" : "Worship"}
                      </span>
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-muted">
                        Key {s.assigned_key}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
