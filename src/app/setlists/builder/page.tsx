"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { SongPickerModal } from "@/components/setlist/song-picker-modal"
import { createSetlist, getSetlistById } from "@/lib/setlists"
import { getPreferredKeyForLeader } from "@/lib/song-leader-keys"
import { detectRecentRepeats, type RepeatWarning } from "@/lib/analytics"
import type { Song, SongCategory } from "@/types/database"
import {
  ArrowLeft,
  Calendar,
  User,
  Mic2,
  Music2,
  FileText,
  Plus,
  Trash2,
  Sun,
  Feather,
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
  "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
]

const SONG_LEADERS = [
  { id: "france-id", name: "France" },
  { id: "maegan-id", name: "Maegan" },
  { id: "andrei-id", name: "Andrei" },
  { id: "roxh-id", name: "Roxh" },
  { id: "argel-id", name: "Argel" },
  { id: "deanne-id", name: "Deanne" },
]

const BACKUP_VOCALISTS = [
  { id: "", name: "None / Solo" },
  { id: "andrei-id", name: "Andrei" },
  { id: "roxh-id", name: "Roxh" },
  { id: "argel-id", name: "Argel" },
  { id: "deanne-id", name: "Deanne" },
  { id: "france-id", name: "France" },
  { id: "maegan-id", name: "Maegan" },
]

const DRUMMERS = [
  { id: "aeron-id", name: "Aeron" },
  { id: "kyle-id", name: "Kyle" },
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

function getNextSunday(): string {
  const now = new Date()
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7
  const nextSunday = new Date(now.getTime() + daysUntilSunday * 86400000)
  return nextSunday.toISOString().split("T")[0]
}

function BuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editSetlistId = searchParams.get("id")

  const [serviceDate, setServiceDate] = useState(searchParams.get("date") || "")
  const [songLeaderId, setSongLeaderId] = useState(searchParams.get("leader") || "france-id")
  const [backupSingers, setBackupSingers] = useState<[string, string, string]>(() => {
    const initial = searchParams.get("backup") || ""
    const parts = initial ? initial.split(",").map((s) => s.trim()) : []
    return [parts[0] || "", parts[1] || "", parts[2] || ""]
  })
  const [drummerId, setDrummerId] = useState(searchParams.get("drummer") || "aeron-id")
  const [notes, setNotes] = useState(searchParams.get("notes") || "")

  const [selectedSongs, setSelectedSongs] = useState<SelectedSetlistSong[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalCategory, setModalCategory] = useState<SongCategory>("joyful")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [repeatWarnings, setRepeatWarnings] = useState<RepeatWarning[]>([])
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  // Default to upcoming Sunday or load existing setlist when editing (?id=...)
  useEffect(() => {
    async function init() {
      if (editSetlistId) {
        const existing = await getSetlistById(editSetlistId)
        if (existing) {
          setServiceDate(existing.service_date)
          setSongLeaderId(existing.song_leader_id || "france-id")
          const rawBackups = existing.backup_singer_name || existing.backup_singer_id || ""
          const parsedBackups = rawBackups
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((val) => {
              const found = BACKUP_VOCALISTS.find(
                (v) => v.id === val || v.name.toLowerCase() === val.toLowerCase()
              )
              return found ? found.id : ""
            })
          setBackupSingers([parsedBackups[0] || "", parsedBackups[1] || "", parsedBackups[2] || ""])
          setDrummerId(existing.drummer_id || "aeron-id")
          setNotes(existing.notes || "")
          setSelectedSongs(
            (existing.songs || []).map((s) => ({
              song_id: s.song_id,
              title: s.title,
              artist: s.artist,
              category: s.category,
              original_key: s.original_key,
              assigned_key: s.assigned_key,
              reference_url: s.reference_url || "",
            }))
          )
          return
        }
      }
      if (!serviceDate) {
        setServiceDate(getNextSunday())
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editSetlistId])

  useEffect(() => {
    let active = true
    async function checkRepeats() {
      const titles = selectedSongs.map((s) => s.title)
      const warnings = await detectRecentRepeats(titles, 21)
      if (active) setRepeatWarnings(warnings)
    }
    checkRepeats()
    return () => {
      active = false
    }
  }, [selectedSongs])

  const handleOpenPicker = (cat: SongCategory) => {
    setModalCategory(cat)
    setModalOpen(true)
  }

  const handleSelectSong = async (song: Song) => {
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

  const handleDragStart = (index: number) => setDraggedIdx(index)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

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
    if (!serviceDate) {
      setError("Please select a Sunday service date.")
      return
    }
    if (selectedSongs.length === 0) {
      setError("Please add at least one song to your setlist.")
      return
    }

    setSaving(true)
    setError(null)

    const selectedBackupIds = backupSingers.filter(Boolean)
    const selectedBackupNames = selectedBackupIds
      .map((id) => BACKUP_VOCALISTS.find((v) => v.id === id)?.name || id)
      .join(", ")

    const payload = {
      service_date: serviceDate,
      song_leader_id: songLeaderId,
      backup_singer_id: selectedBackupIds[0] || null,
      backup_singer_name: selectedBackupNames || null,
      drummer_id: drummerId || null,
      status,
      notes: notes.trim() || null,
      songs: selectedSongs.map((s, idx) => ({
        song_id: s.song_id,
        title: s.title,
        artist: s.artist,
        original_key: s.original_key,
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

  const renderSongBucket = (
    category: SongCategory,
    title: string,
    buttonLabel: string,
    emptyText: string,
    IconComponent: typeof Sun
  ) => {
    const items = selectedSongs
      .map((song, globalIdx) => ({ song, globalIdx }))
      .filter(({ song }) => song.category === category)

    return (
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-secondary text-foreground">
              <IconComponent className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{title}</h2>
              <p className="text-[11px] text-muted-foreground">
                {items.length} {items.length === 1 ? "song" : "songs"} selected
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenPicker(category)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{buttonLabel}</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="py-8 px-4 rounded-2xl border border-dashed border-border/80 bg-secondary/20 text-center">
            <p className="text-xs text-muted-foreground">{emptyText}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(({ song, globalIdx }) => (
              <div
                key={`${song.song_id}-${globalIdx}`}
                draggable
                onDragStart={() => handleDragStart(globalIdx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(globalIdx)}
                className={`p-4 rounded-2xl border border-border bg-secondary/25 space-y-3 transition ${
                  draggedIdx === globalIdx ? "opacity-40 border-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border text-[11px] font-bold text-foreground shrink-0">
                      {globalIdx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{song.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <div className="inline-flex items-center h-8 rounded-full border border-border bg-card overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(globalIdx)}
                        disabled={globalIdx === 0}
                        aria-label="Move up"
                        className="h-full px-2 hover:bg-secondary text-foreground disabled:opacity-25 transition cursor-pointer"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(globalIdx)}
                        disabled={globalIdx === selectedSongs.length - 1}
                        aria-label="Move down"
                        className="h-full px-2 hover:bg-secondary text-foreground disabled:opacity-25 transition border-l border-border cursor-pointer"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSong(globalIdx)}
                      aria-label="Remove song"
                      className="h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-border/70">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0 font-medium">
                      Assigned Key
                    </span>
                    <select
                      aria-label="Assigned key"
                      value={song.assigned_key}
                      onChange={(e) => handleKeyChange(song.song_id, e.target.value)}
                      className="h-8 px-3 rounded-full border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      {MUSICAL_KEYS.map((k) => (
                        <option key={k} value={k}>
                          {k} {k === song.original_key ? "(Orig)" : ""}
                        </option>
                      ))}
                    </select>
                    {song.is_auto_filled && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border font-semibold">
                        Saved Key
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-card border border-border rounded-full px-3 h-8">
                    <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    <input
                      type="url"
                      placeholder="YouTube reference link..."
                      value={song.reference_url}
                      onChange={(e) => handleReferenceChange(song.song_id, e.target.value)}
                      className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3 px-1">
        <Link
          href="/setlists"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Setlists</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1 px-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {editSetlistId ? "Edit Sunday Setlist" : "Build Sunday Setlist"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Assign the Sunday service date, worship team rotation, and song lineup in one place.
        </p>
      </div>

      {/* Unified Service & Team Rotation Setup Card */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-border/70">
          <h2 className="text-sm font-bold text-foreground">Service &amp; Team Rotation</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose the Sunday date, song leader, backup vocalist, and assigned drummer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Service Date */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Service Date</span>
            </label>
            <input
              type="date"
              aria-label="Service date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-2xl border border-border bg-secondary/35 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            />
          </div>

          {/* Song Leader */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>Song Leader</span>
            </label>
            <select
              aria-label="Song leader"
              value={songLeaderId}
              onChange={(e) => setSongLeaderId(e.target.value)}
              className="w-full h-10 px-3.5 rounded-2xl border border-border bg-secondary/35 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {SONG_LEADERS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drummer Rotation */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Music2 className="h-3.5 w-3.5" />
              <span>Drummer</span>
            </label>
            <select
              aria-label="Drummer"
              value={drummerId}
              onChange={(e) => setDrummerId(e.target.value)}
              className="w-full h-10 px-3.5 rounded-2xl border border-border bg-secondary/35 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {DRUMMERS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Backup Vocals (3 Weekly Slots) */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Mic2 className="h-3.5 w-3.5" />
            <span>Backup Vocals (Up to 3)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((slotIdx) => (
              <div key={slotIdx} className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/35 px-3 h-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                  BV {slotIdx + 1}
                </span>
                <select
                  aria-label={`Backup vocalist ${slotIdx + 1}`}
                  value={backupSingers[slotIdx]}
                  onChange={(e) => {
                    const updated: [string, string, string] = [...backupSingers]
                    updated[slotIdx] = e.target.value
                    setBackupSingers(updated)
                  }}
                  className="w-full bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                >
                  {BACKUP_VOCALISTS.map((v) => (
                    <option key={v.id || "none"} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Service Notes */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>Service Notes (Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Communion Sunday, smooth pad transition between Song 2 and Song 3..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-10 px-3.5 rounded-2xl border border-border bg-secondary/35 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Repeat Detector Warning Banner */}
      {repeatWarnings.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-foreground text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-muted-foreground" />
            <span>Recent Repeat Alert ({repeatWarnings.length})</span>
          </div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {repeatWarnings.map((w) => (
              <li key={w.songTitle}>
                <strong className="text-foreground">&quot;{w.songTitle}&quot;</strong> was played{" "}
                <strong className="text-foreground">{w.daysAgo} days ago</strong> ({w.lastPlayedDate}) by{" "}
                <strong className="text-foreground">{w.lastLeaderName}</strong> in Key of {w.assignedKey}.
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Joyful Songs Bucket */}
      {renderSongBucket(
        "joyful",
        "Joyful Songs (Fast Praise)",
        "Add Joyful Song",
        'No joyful songs added yet. Click "Add Joyful Song" above.',
        Sun
      )}

      {/* Worship Songs Bucket */}
      {renderSongBucket(
        "worship",
        "Worship Songs (Slow)",
        "Add Worship Song",
        'No worship songs added yet. Click "Add Worship Song" above.',
        Feather
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave("draft")}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-border bg-card text-xs font-semibold text-foreground hover:bg-secondary transition cursor-pointer disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Save as Draft</span>
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave("published")}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-xs cursor-pointer disabled:opacity-50"
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

      {/* Song Picker Modal */}
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
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        }
      >
        <BuilderContent />
      </Suspense>
    </AppShell>
  )
}
