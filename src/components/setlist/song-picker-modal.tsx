"use client"

import { useState, useEffect, useMemo } from "react"
import { getSongs } from "@/lib/songs"
import type { Song, SongCategory } from "@/types/database"
import { Search, Plus, X, Music, Flame, Heart, Check } from "lucide-react"

interface SongPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectSong: (song: Song) => void
  alreadySelectedIds: string[]
  suggestedCategory?: SongCategory
}

export function SongPickerModal({
  isOpen,
  onClose,
  onSelectSong,
  alreadySelectedIds,
  suggestedCategory,
}: SongPickerModalProps) {
  const [songs, setSongs] = useState<Song[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<SongCategory | "all">(
    suggestedCategory || "all"
  )

  useEffect(() => {
    async function load() {
      const data = await getSongs()
      setSongs(data)
    }
    if (isOpen) {
      load()
    }
  }, [isOpen])

  const filtered = useMemo(() => {
    return songs.filter((s) => {
      if (categoryFilter !== "all" && s.category !== categoryFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
      }
      return true
    })
  }, [songs, search, categoryFilter])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-indigo-400" />
            <h3 className="font-bold text-sm">Select Song from Library</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Category Tabs */}
        <div className="p-3 border-b border-border/40 space-y-2 bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search title or artist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border/80 bg-background text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                categoryFilter === "all"
                  ? "bg-foreground text-background"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("joyful")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                categoryFilter === "joyful"
                  ? "bg-orange-500 text-white"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flame className="h-3 w-3" />
              <span>Joyful</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("worship")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                categoryFilter === "worship"
                  ? "bg-blue-600 text-white"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className="h-3 w-3" />
              <span>Worship</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-3 space-y-1.5 flex-1 divide-y divide-border/20">
          {filtered.map((song) => {
            const isSelected = alreadySelectedIds.includes(song.id)

            return (
              <div
                key={song.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors pt-2"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs truncate">{song.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted/80 text-muted-foreground font-bold">
                      Key: {song.original_key}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{song.artist}</div>
                </div>

                <button
                  type="button"
                  disabled={isSelected}
                  onClick={() => {
                    onSelectSong(song)
                    onClose()
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                    isSelected
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Select</span>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
