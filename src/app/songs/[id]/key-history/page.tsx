"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSongById } from "@/lib/songs"
import {
  getSongKeyHistory,
  recordSongLeaderKey,
  type SongLeaderKeyHistoryItem,
} from "@/lib/song-leader-keys"
import { SmartKeySuggestion } from "@/components/ai/smart-key-suggestion"
import type { Song } from "@/types/database"
import {
  ArrowLeft,
  User,
  Music2,
  Calendar,
  Save,
  Check,
  Plus,
  Clock,
  Sparkles,
} from "lucide-react"

const MUSICAL_KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E",
  "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"
]

const CHURCH_VOCAL_LEADERS = [
  { id: "france-id", name: "France", range: "Alto / Mezzo" },
  { id: "maegan-id", name: "Maegan", range: "Soprano" },
  { id: "deanne-id", name: "Deanne", range: "Soprano" },
  { id: "argel-id", name: "Argel", range: "Tenor" },
  { id: "andrei-id", name: "Andrei", range: "Baritone / Tenor" },
]

export default function SongLeaderKeyHistoryPage() {
  const params = useParams()
  const songId = params.id as string

  const [song, setSong] = useState<Song | null>(null)
  const [history, setHistory] = useState<SongLeaderKeyHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [selectedLeader, setSelectedLeader] = useState(CHURCH_VOCAL_LEADERS[0].name)
  const [assignedKey, setAssignedKey] = useState("G")
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      if (!songId) return
      setLoading(true)
      const s = await getSongById(songId)
      if (s) {
        setSong(s)
        setAssignedKey(s.original_key || "G")
        const h = await getSongKeyHistory(s.id, s.title)
        setHistory(h)
      }
      setLoading(false)
    }
    load()
  }, [songId])

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!song) return
    setSaving(true)

    const leaderObj = CHURCH_VOCAL_LEADERS.find((l) => l.name === selectedLeader)
    const leaderId = leaderObj ? leaderObj.id : `${selectedLeader.toLowerCase()}-id`

    await recordSongLeaderKey(leaderId, song.id, assignedKey)

    // Update local history
    const existingIndex = history.findIndex(
      (h) => h.leader_name.toLowerCase() === selectedLeader.toLowerCase()
    )
    if (existingIndex >= 0) {
      const updated = [...history]
      updated[existingIndex] = {
        ...updated[existingIndex],
        preferred_key: assignedKey,
        last_used: new Date().toISOString(),
      }
      setHistory(updated)
    } else {
      setHistory([
        ...history,
        {
          leader_id: leaderId,
          leader_name: selectedLeader,
          preferred_key: assignedKey,
          last_used: new Date().toISOString(),
          times_led: 1,
        },
      ])
    }

    setSaving(false)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/songs/${songId}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {song?.title || "Song"}</span>
          </Link>
          <Link
            href={`/songs/${songId}`}
            className="text-xs text-primary hover:underline font-medium"
          >
            View Chords & Details
          </Link>
        </div>

        {/* Hero Card */}
        <div className="p-6 rounded-2xl border bg-card/60 shadow-sm space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Music2 className="w-5 h-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">Song Leader Key Memory</h1>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Remembers who sings <strong className="text-foreground">{song?.title}</strong> in
                which key to prevent key mismatches during Sunday service.
              </p>
            </div>
            {song && (
              <div className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-sm shrink-0">
                Original Key: {song.original_key}
              </div>
            )}
          </div>
        </div>

        {/* Vocalist Keys Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span>Assigned Keys per Song Leader</span>
          </h2>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl border bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 rounded-xl border border-dashed bg-muted/10 p-6 space-y-2">
              <User className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-xs font-semibold">No leader keys registered yet for this song</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Use the quick form below to set the preferred singing key for each leader.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {history.map((item) => {
                const isOrig = item.preferred_key === song?.original_key

                return (
                  <div
                    key={item.leader_name}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-xs hover:border-primary/40 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {item.leader_name}
                        </span>
                        {isOrig && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-semibold">
                            Original Key
                          </span>
                        )}
                      </div>
                      {item.last_used && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Last: {new Date(item.last_used).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-mono font-bold text-primary">
                          {item.preferred_key}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {isOrig ? "No shift" : `Shifted from ${song?.original_key}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Register or Update Key Form */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm">Register / Update Leader Singing Key</h3>
          </div>

          <form onSubmit={handleSaveKey} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Worship Vocal Leader:
                </label>
                <select
                  value={selectedLeader}
                  onChange={(e) => setSelectedLeader(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  {CHURCH_VOCAL_LEADERS.map((leader) => (
                    <option key={leader.name} value={leader.name}>
                      {leader.name} ({leader.range})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Singing Key:
                </label>
                <select
                  value={assignedKey}
                  onChange={(e) => setAssignedKey(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold"
                >
                  {MUSICAL_KEYS.map((key) => (
                    <option key={key} value={key}>
                      Key: {key} {key === song?.original_key ? "(Original)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Smart Key Recommendation Assistant */}
            {song && (
              <SmartKeySuggestion
                songTitle={song.title}
                originalKey={song.original_key}
                vocalLeadName={selectedLeader}
                songCategory={song.category}
                currentKey={assignedKey}
                onApplyKey={(key) => setAssignedKey(key)}
                className="pt-2"
              />
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                This key will auto-fill whenever this leader is assigned to a setlist with this song.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50 shrink-0"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? "Saving..." : "Save Leader Key"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
