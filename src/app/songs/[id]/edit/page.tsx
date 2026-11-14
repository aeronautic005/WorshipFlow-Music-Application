"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSongById, updateSong, deleteSong } from "@/lib/songs"
import type { Song, SongCategory } from "@/types/database"
import {
  ArrowLeft,
  Flame,
  Heart,
  Clock,
  Globe,
  Link as LinkIcon,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
  Save,
} from "lucide-react"

const MUSICAL_KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E",
  "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Am", "Bm", "Cm", "Dm", "Em", "Fm", "Gm"
]

export default function EditSongPage() {
  const params = useParams()
  const router = useRouter()
  const songId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form states
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [originalKey, setOriginalKey] = useState("G")
  const [category, setCategory] = useState<SongCategory>("worship")
  const [bpm, setBpm] = useState<string>("")
  const [language, setLanguage] = useState("English")
  const [referenceUrl, setReferenceUrl] = useState("")
  const [lyrics, setLyrics] = useState("")

  useEffect(() => {
    async function loadSong() {
      if (!songId) return
      try {
        const data = await getSongById(songId)
        if (data) {
          setTitle(data.title || "")
          setArtist(data.artist || "")
          setOriginalKey(data.original_key || "G")
          setCategory(data.category || "worship")
          setBpm(data.bpm ? String(data.bpm) : "")
          setLanguage(data.language || "English")
          setReferenceUrl(data.reference_url || "")
          setLyrics(data.lyrics || "")
        }
      } catch (err) {
        console.error("Failed to load song:", err)
      } finally {
        setLoading(false)
      }
    }
    loadSong()
  }, [songId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !artist.trim()) {
      setError("Please fill in both song title and artist")
      return
    }

    setSaving(true)
    setError(null)

    const res = await updateSong(songId, {
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
      router.push(`/songs/${songId}`)
      router.refresh()
    } else {
      setError(res.error || "Failed to update song")
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const res = await deleteSong(songId)
    if (res.success) {
      router.push("/songs")
      router.refresh()
    } else {
      setError(res.error || "Failed to delete song")
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/songs/${songId}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel & Back</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Song</span>
          </button>
        </div>

        {/* Delete Confirmation Modal / Card */}
        {showDeleteConfirm && (
          <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 space-y-3">
            <div className="text-sm font-bold text-destructive">
              Are you sure you want to remove &quot;{title}&quot;?
            </div>
            <p className="text-xs text-muted-foreground">
              This action will remove the song from your church library and cannot be undone.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-lg bg-destructive text-white text-xs font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete Song"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-1.5 rounded-lg border border-border/80 text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
          <h1 className="text-lg font-bold border-b border-border/40 pb-3">Edit Song Details</h1>

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
              <span>Reference Track Link</span>
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/..."
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Lyrics */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Lyrics</span>
            </label>
            <textarea
              rows={6}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="w-full p-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-sans"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
