"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { createSong } from "@/lib/songs"
import type { SongCategory } from "@/types/database"
import {
  ArrowLeft,
  Music,
  Flame,
  Heart,
  Link as LinkIcon,
  Clock,
  Globe,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react"

const MUSICAL_KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E",
  "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Am", "Bm", "Cm", "Dm", "Em", "Fm", "Gm"
]

export default function NewSongPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [originalKey, setOriginalKey] = useState("G")
  const [category, setCategory] = useState<SongCategory>("worship")
  const [bpm, setBpm] = useState<string>("72")
  const [language, setLanguage] = useState("English")
  const [referenceUrl, setReferenceUrl] = useState("")
  const [lyrics, setLyrics] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !artist.trim()) {
      setError("Please fill in both song title and artist")
      return
    }

    setLoading(true)
    setError(null)

    const res = await createSong({
      title: title.trim(),
      artist: artist.trim(),
      original_key: originalKey,
      category,
      bpm: bpm ? parseInt(bpm, 10) : null,
      language,
      reference_url: referenceUrl.trim() || null,
      lyrics: lyrics.trim() || null,
    })

    if (res.success) {
      router.push("/songs")
      router.refresh()
    } else {
      setError(res.error || "Failed to save song to library")
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="space-y-1">
          <Link
            href="/songs"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Song Library</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Add New Song</h1>
              <p className="text-xs text-muted-foreground">
                Register a new praise or worship song in your church library.
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
          {/* Category Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Song Category</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory("joyful")}
                className={`flex items-center justify-center gap-2 h-11 px-4 rounded-xl border text-xs font-semibold transition-all ${
                  category === "joyful"
                    ? "bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-sm"
                    : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Flame className="h-4 w-4" />
                <span>Joyful (Fast Praise)</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory("worship")}
                className={`flex items-center justify-center gap-2 h-11 px-4 rounded-xl border text-xs font-semibold transition-all ${
                  category === "worship"
                    ? "bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-sm"
                    : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>Worship (Slow)</span>
              </button>
            </div>
          </div>

          {/* Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Song Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Holy Forever"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Artist / Band *</label>
              <input
                type="text"
                required
                placeholder="e.g. Chris Tomlin"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Key, BPM & Language */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Original Key</label>
              <select
                value={originalKey}
                onChange={(e) => setOriginalKey(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
              >
                {MUSICAL_KEYS.map((k) => (
                  <option key={k} value={k}>
                    Key of {k}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>BPM / Tempo</span>
              </label>
              <input
                type="number"
                placeholder="72"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <span>Language</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="English">English</option>
                <option value="Tagalog">Tagalog</option>
                <option value="Bilingual">Bilingual / Taglish</option>
              </select>
            </div>
          </div>

          {/* Reference Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Reference Track Link (YouTube or Spotify)</span>
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <p className="text-[11px] text-muted-foreground">
              This official link guarantees everyone on the team practices the exact same version.
            </p>
          </div>

          {/* Lyrics */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Song Lyrics (Optional)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Paste verses, chorus, bridge lyrics here..."
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="w-full p-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-sans"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Add Song to Library</span>}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
