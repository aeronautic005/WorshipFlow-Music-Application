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
      <div className="flex items-center justify-between gap-3 p-3 rounded-3xl border border-border bg-card shadow-xs text-xs">
        {/* Prev Song */}
        <button
          type="button"
          disabled={!prevSong}
          onClick={() => onSelectSong(currentIndex - 1)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-border bg-secondary/70 hover:bg-secondary text-foreground disabled:opacity-35 transition font-semibold truncate max-w-[150px] sm:max-w-[220px] cursor-pointer disabled:cursor-not-allowed"
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
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 font-bold transition cursor-pointer shadow-xs"
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
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-border bg-secondary/70 hover:bg-secondary text-foreground disabled:opacity-35 transition font-semibold truncate max-w-[150px] sm:max-w-[220px] cursor-pointer disabled:cursor-not-allowed"
          title={
            nextSong
              ? `Next song: ${nextSong.title} (Key ${nextSong.assigned_key})`
              : "Last song in setlist"
          }
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-border bg-card text-card-foreground p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Service Setlist Lineup</h3>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
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
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      isCurrent
                        ? "bg-primary/15 border-primary text-foreground font-bold"
                        : "bg-secondary/50 hover:bg-secondary text-foreground border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-bold w-5 text-muted-foreground">
                        {idx + 1}.
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs truncate font-bold">{s.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{s.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground font-semibold">
                        {isJoyful ? "Joyful" : "Worship"}
                      </span>
                      <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                        {s.assigned_key}
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
