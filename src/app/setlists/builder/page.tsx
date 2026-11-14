"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { SongPickerModal } from "@/components/setlist/song-picker-modal"
import { createSetlist } from "@/lib/setlists"
import { getPreferredKeyForLeader } from "@/lib/song-leader-keys"
import type { Song, SongCategory } from "@/types/database"
import {
  ArrowLeft,
  Calendar,
  User,
  Plus,
  Trash2,
  Flame,
  Heart,
  Save,
  Send,
  Loader2,
  Link as LinkIcon,
  AlertCircle,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react"

const MUSICAL_KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E",
  "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"
]

interface SelectedSetlistSong {
  song_id: string
  title: string
  artist: string
  category: SongCategory
  original_key: string
  assigned_key: string
  reference_url: string
  is_auto_filled?: boolean
}

function BuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const serviceDate = searchParams.get("date") || ""
  const songLeaderId = searchParams.get("leader") || "france"
  const backupSingerId = searchParams.get("backup") || ""
  const drummerId = searchParams.get("drummer") || "aeron"
  const notes = searchParams.get("notes") || ""

  const [selectedSongs, setSelectedSongs] = useState<SelectedSetlistSong[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalCategory, setModalCategory] = useState<SongCategory>("joyful")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const joyfulSongs = selectedSongs.filter((s) => s.category === "joyful")
  const worshipSongs = selectedSongs.filter((s) => s.category === "worship")

  const handleOpenPicker = (cat: SongCategory) => {
    setModalCategory(cat)
    setModalOpen(true)
  }

  const handleSelectSong = async (song: Song) => {
    // Check key memory for this song leader
    const rememberedKey = await getPreferredKeyForLeader(
      songLeaderId,
      song.id,
      song.title
    )

    const newEntry: SelectedSetlistSong = {
      song_id: song.id,
      title: song.title,
      artist: song.artist,
      category: modalCategory,
      original_key: song.original_key,
      assigned_key: rememberedKey || song.original_key,
      reference_url: song.reference_url || "",
      is_auto_filled: Boolean(rememberedKey),
    }
    setSelectedSongs((prev) => [...prev, newEntry])
  }

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    setSelectedSongs((prev) => {
      const copy = [...prev]
      const temp = copy[index]
      copy[index] = copy[index - 1]
      copy[index - 1] = temp
      return copy
    })
  }

  const handleMoveDown = (index: number) => {
    if (index === selectedSongs.length - 1) return
    setSelectedSongs((prev) => {
      const copy = [...prev]
      const temp = copy[index]
      copy[index] = copy[index + 1]
      copy[index + 1] = temp
      return copy
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIdx(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedIdx === null || draggedIdx === targetIndex) return
    setSelectedSongs((prev) => {
      const copy = [...prev]
      const [item] = copy.splice(draggedIdx, 1)
      copy.splice(targetIndex, 0, item)
      return copy
    })
    setDraggedIdx(null)
  }

  const handleRemoveSong = (index: number) => {
    setSelectedSongs((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleKeyChange = (songId: string, newKey: string) => {
    setSelectedSongs((prev) =>
      prev.map((s) => (s.song_id === songId ? { ...s, assigned_key: newKey } : s))
    )
  }

  const handleReferenceChange = (songId: string, url: string) => {
    setSelectedSongs((prev) =>
      prev.map((s) => (s.song_id === songId ? { ...s, reference_url: url } : s))
    )
  }

  const handleSave = async (status: "draft" | "published") => {
    if (selectedSongs.length === 0) {
      setError("Please add at least one song to your setlist.")
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      service_date: serviceDate,
      song_leader_id: songLeaderId,
      backup_singer_id: backupSingerId || null,
      drummer_id: drummerId || null,
      status,
      notes,
      songs: selectedSongs.map((s, idx) => ({
        song_id: s.song_id,
        order_position: idx + 1,
        assigned_key: s.assigned_key,
        reference_url: s.reference_url || null,
        category: s.category,
      })),
    }

    const res = await createSetlist(payload)
    if (res.success) {
      router.push("/setlists")
      router.refresh()
    } else {
      setError(res.error || "Failed to save setlist")
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/setlists/new"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Setup</span>
        </Link>
        <div className="text-xs text-muted-foreground font-mono">
          Service: <strong>{serviceDate}</strong>
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-400" />
          <h1 className="text-lg font-bold">Select Songs & Assign Keys</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Standard church lineup: <strong>2–3 Joyful (Fast)</strong> songs followed by{" "}
          <strong>2–3 Worship (Slow)</strong> songs.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Joyful Songs Bucket */}
      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-orange-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <h2 className="text-sm font-bold text-orange-400">
              Joyful Songs (Fast Praise) — {joyfulSongs.length} selected
            </h2>
          </div>
          <button
            type="button"
            onClick={() => handleOpenPicker("joyful")}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Joyful Song</span>
          </button>
        </div>

        {joyfulSongs.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-3 text-center">
            No joyful songs added yet. Click &quot;Add Joyful Song&quot; above.
          </p>
        ) : (
          <div className="space-y-2">
            {selectedSongs
              .map((song, globalIdx) => ({ song, globalIdx }))
              .filter(({ song }) => song.category === "joyful")
              .map(({ song, globalIdx }) => (
                <div
                  key={globalIdx}
                  draggable
                  onDragStart={() => handleDragStart(globalIdx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(globalIdx)}
                  className={`p-3 rounded-xl border border-border/80 bg-card shadow-sm space-y-2 transition-all ${
                    draggedIdx === globalIdx ? "opacity-40 border-indigo-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="cursor-grab text-muted-foreground hover:text-foreground">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-xs text-muted-foreground w-4">
                        {globalIdx + 1}.
                      </span>
                      <span className="font-bold text-sm truncate">{song.title}</span>
                      <span className="text-xs text-muted-foreground truncate">{song.artist}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(globalIdx)}
                        disabled={globalIdx === 0}
                        className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-20"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(globalIdx)}
                        disabled={globalIdx === selectedSongs.length - 1}
                        className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-20"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSong(globalIdx)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground shrink-0 font-medium">
                        Sing in Key:
                      </span>
                      <select
                        value={song.assigned_key}
                        onChange={(e) => handleKeyChange(song.song_id, e.target.value)}
                        className="h-8 px-2 rounded-lg border border-border/80 bg-background text-xs font-mono font-bold"
                      >
                        {MUSICAL_KEYS.map((k) => (
                          <option key={k} value={k}>
                            {k} {k === song.original_key ? "(Orig)" : ""}
                          </option>
                        ))}
                      </select>
                      {song.is_auto_filled && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                          Auto-filled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                      <input
                        type="url"
                        placeholder="Pinned YouTube reference link..."
                        value={song.reference_url}
                        onChange={(e) => handleReferenceChange(song.song_id, e.target.value)}
                        className="w-full h-8 px-2 rounded-lg border border-border/80 bg-background text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Worship Songs Bucket */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-blue-400">
              Worship Songs (Slow) — {worshipSongs.length} selected
            </h2>
          </div>
          <button
            type="button"
            onClick={() => handleOpenPicker("worship")}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Worship Song</span>
          </button>
        </div>

        {worshipSongs.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-3 text-center">
            No worship songs added yet. Click &quot;Add Worship Song&quot; above.
          </p>
        ) : (
          <div className="space-y-2">
            {selectedSongs
              .map((song, globalIdx) => ({ song, globalIdx }))
              .filter(({ song }) => song.category === "worship")
              .map(({ song, globalIdx }) => (
                <div
                  key={globalIdx}
                  draggable
                  onDragStart={() => handleDragStart(globalIdx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(globalIdx)}
                  className={`p-3 rounded-xl border border-border/80 bg-card shadow-sm space-y-2 transition-all ${
                    draggedIdx === globalIdx ? "opacity-40 border-indigo-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="cursor-grab text-muted-foreground hover:text-foreground">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-xs text-muted-foreground w-4">
                        {globalIdx + 1}.
                      </span>
                      <span className="font-bold text-sm truncate">{song.title}</span>
                      <span className="text-xs text-muted-foreground truncate">{song.artist}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(globalIdx)}
                        disabled={globalIdx === 0}
                        className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-20"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(globalIdx)}
                        disabled={globalIdx === selectedSongs.length - 1}
                        className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-20"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSong(globalIdx)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground shrink-0 font-medium">
                        Sing in Key:
                      </span>
                      <select
                        value={song.assigned_key}
                        onChange={(e) => handleKeyChange(song.song_id, e.target.value)}
                        className="h-8 px-2 rounded-lg border border-border/80 bg-background text-xs font-mono font-bold"
                      >
                        {MUSICAL_KEYS.map((k) => (
                          <option key={k} value={k}>
                            {k} {k === song.original_key ? "(Orig)" : ""}
                          </option>
                        ))}
                      </select>
                      {song.is_auto_filled && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                          Auto-filled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                      <input
                        type="url"
                        placeholder="Pinned YouTube reference link..."
                        value={song.reference_url}
                        onChange={(e) => handleReferenceChange(song.song_id, e.target.value)}
                        className="w-full h-8 px-2 rounded-lg border border-border/80 bg-background text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave("draft")}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/80 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Save as Draft</span>
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave("published")}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Publish Setlist to Team</span>
            </>
          )}
        </button>
      </div>

      {/* Modal */}
      <SongPickerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectSong={handleSelectSong}
        alreadySelectedIds={selectedSongs.map((s) => s.song_id)}
        suggestedCategory={modalCategory}
      />
    </div>
  )
}

export default function SetlistBuilderPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        }
      >
        <BuilderContent />
      </Suspense>
    </AppShell>
  )
}
