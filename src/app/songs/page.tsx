"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSongs } from "@/lib/songs"
import type { Song, SongCategory } from "@/types/database"
import {
  Music,
  Plus,
  Search,
  Flame,
  Heart,
  Clock,
  ArrowRight,
  Filter,
  X,
  Loader2,
} from "lucide-react"

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<SongCategory | "all">("all")
  const [selectedKey, setSelectedKey] = useState<string>("all")

  useEffect(() => {
    async function fetchSongs() {
      try {
        const data = await getSongs()
        setSongs(data)
      } catch (err) {
        console.error("Failed to load songs:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSongs()
  }, [])

  // Filtered and sorted songs
  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      // Category filter
      if (selectedCategory !== "all" && song.category !== selectedCategory) {
        return false
      }

      // Key filter
      if (selectedKey !== "all" && song.original_key !== selectedKey) {
        return false
      }

      // Search filter (title or artist)
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchesTitle = song.title.toLowerCase().includes(query)
        const matchesArtist = song.artist.toLowerCase().includes(query)
        if (!matchesTitle && !matchesArtist) return false
      }

      return true
    })
  }, [songs, search, selectedCategory, selectedKey])

  // Extract unique keys present in the library
  const availableKeys = useMemo(() => {
    const keys = new Set(songs.map((s) => s.original_key))
    return Array.from(keys).sort()
  }, [songs])

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Song Library</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                {songs.length} Songs
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Master catalog with original keys, BPM tempos, and practice materials.
            </p>
          </div>

          <Link
            href="/songs/new"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Song</span>
          </Link>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by song title or artist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-9 rounded-xl border border-border/80 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-foreground text-background font-semibold"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                All Categories ({songs.length})
              </button>

              <button
                onClick={() => setSelectedCategory("joyful")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === "joyful"
                    ? "bg-orange-500 text-white font-semibold shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Joyful ({songs.filter((s) => s.category === "joyful").length})</span>
              </button>

              <button
                onClick={() => setSelectedCategory("worship")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === "worship"
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className="h-3.5 w-3.5" />
                <span>Worship ({songs.filter((s) => s.category === "worship").length})</span>
              </button>
            </div>

            {/* Key Filter Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-border/80 bg-card text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Keys</option>
                {availableKeys.map((k) => (
                  <option key={k} value={k}>
                    Key of {k}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Songs List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-2xl border border-dashed border-border/80 bg-card/50 space-y-3">
            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground w-fit mx-auto">
              <Music className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">No songs found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No songs match your current search or category filter.
              </p>
            </div>
            <button
              onClick={() => {
                setSearch("")
                setSelectedCategory("all")
                setSelectedKey("all")
              }}
              className="text-xs text-indigo-400 hover:underline font-medium"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {filteredSongs.map((song) => (
              <Link
                key={song.id}
                href={`/songs/${song.id}`}
                className="group flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card hover:border-indigo-500/40 hover:bg-accent/40 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                      song.category === "joyful"
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {song.category === "joyful" ? (
                      <Flame className="h-5 w-5" />
                    ) : (
                      <Heart className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate group-hover:text-indigo-400 transition-colors">
                        {song.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground uppercase font-medium">
                        {song.language}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right hidden xs:block">
                    <div className="text-xs font-mono font-bold bg-muted/80 px-2 py-0.5 rounded border border-border/40 inline-block">
                      Key: {song.original_key}
                    </div>
                    {song.bpm && (
                      <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{song.bpm} BPM</span>
                      </div>
                    )}
                  </div>

                  <div className="p-1 rounded-lg text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
