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
  Sun,
  Feather,
  ArrowRight,
  Filter,
  X,
  Loader2,
  BarChart3,
} from "lucide-react"

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<SongCategory | "all">("all")
  const [selectedKey, setSelectedKey] = useState<string>("all")

  useEffect(() => {
    async function load() {
      try {
        const data = await getSongs()
        setSongs(data)
      } catch (err) {
        console.error("Failed to fetch songs:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      if (selectedCategory !== "all" && song.category !== selectedCategory) {
        return false
      }
      if (selectedKey !== "all" && song.original_key !== selectedKey) {
        return false
      }
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchTitle = song.title.toLowerCase().includes(q)
        const matchArtist = song.artist.toLowerCase().includes(q)
        if (!matchTitle && !matchArtist) return false
      }
      return true
    })
  }, [songs, search, selectedCategory, selectedKey])

  const availableKeys = useMemo(() => {
    const keys = new Set(songs.map((s) => s.original_key))
    return Array.from(keys).sort()
  }, [songs])

  const joyfulCount = useMemo(
    () => songs.filter((s) => s.category === "joyful").length,
    [songs]
  )
  const worshipCount = useMemo(
    () => songs.filter((s) => s.category === "worship").length,
    [songs]
  )

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-primary">Song Library</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-primary font-semibold border border-border">
                {songs.length} Songs
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Master catalog with original keys, BPM tempos, and practice materials.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/analytics/songs"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full border border-border bg-card hover:bg-secondary text-xs font-semibold text-primary transition-colors"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Analytics</span>
            </Link>

            <Link
              href="/songs/new"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Song</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-[0_2px_12px_rgba(15,37,74,0.04)] space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by song title or artist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-full border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills & Key Dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/70 text-muted-foreground hover:text-primary"
                }`}
              >
                All Categories ({songs.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory("joyful")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === "joyful"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/70 text-muted-foreground hover:text-primary"
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Joyful ({joyfulCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory("worship")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === "worship"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/70 text-muted-foreground hover:text-primary"
                }`}
              >
                <Feather className="h-3.5 w-3.5" />
                <span>Worship ({worshipCount})</span>
              </button>
            </div>

            {/* Key Filter Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="h-8 px-3 rounded-full border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
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
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-3xl border border-dashed border-border bg-card space-y-3">
            <div className="p-3 rounded-full bg-secondary text-primary w-fit mx-auto">
              <Music className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-primary">No songs found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No songs match your current search or category filter.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setSelectedCategory("all")
                setSelectedKey("all")
              }}
              className="text-xs text-primary hover:underline font-semibold cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSongs.map((song) => (
              <Link
                key={song.id}
                href={`/songs/${song.id}`}
                className="group flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border border-border/70 bg-card hover:border-primary/40 shadow-[0_2px_10px_rgba(15,37,74,0.03)] transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Clean Category Icon Circle: Sun (Joyful) vs Feather (Worship) */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 transition-colors ${
                      song.category === "joyful"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-primary border border-border/80"
                    }`}
                    title={song.category === "joyful" ? "Joyful (Fast Praise)" : "Worship (Slow)"}
                  >
                    {song.category === "joyful" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Feather className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {song.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase font-semibold tracking-wide">
                        {song.language}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
                  </div>
                </div>

                {/* Right: BPM, Original Key Pill, and Arrow */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {song.bpm && (
                    <span className="hidden sm:inline-block text-xs text-muted-foreground font-medium">
                      {song.bpm} BPM
                    </span>
                  )}

                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold min-w-[42px] text-center">
                    {song.original_key}
                  </span>

                  <div className="p-1 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
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
