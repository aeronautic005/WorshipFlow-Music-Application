"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSongById } from "@/lib/songs"
import { getChordChart, saveChordChart, generateDefaultChordChart } from "@/lib/chords"
import type { Song } from "@/types/database"
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Music,
  Plus,
} from "lucide-react"

const MUSICAL_KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E",
  "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"
]

const QUICK_TAGS = [
  "[Intro]",
  "[Verse 1]",
  "[Verse 2]",
  "[Pre-Chorus]",
  "[Chorus]",
  "[Bridge]",
  "[Instrumental]",
  "[Outro]",
]

export default function ChordEditorPage() {
  const params = useParams()
  const router = useRouter()
  const songId = params.id as string

  const [song, setSong] = useState<Song | null>(null)
  const [selectedKey, setSelectedKey] = useState("G")
  const [chartContent, setChartContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function init() {
      if (!songId) return
      try {
        const songData = await getSongById(songId)
        if (songData) {
          setSong(songData)
          setSelectedKey(songData.original_key || "G")

          const chart = await getChordChart(songId, songData.original_key || "G")
          if (chart) {
            setChartContent(chart.chart_content)
          } else {
            setChartContent(generateDefaultChordChart(songData.title, songData.original_key || "G"))
          }
        }
      } catch (err) {
        console.error("Failed to load chord editor:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [songId])

  const handleKeyChange = async (newKey: string) => {
    setSelectedKey(newKey)
    if (!song) return
    const chart = await getChordChart(songId, newKey)
    if (chart) {
      setChartContent(chart.chart_content)
    } else {
      setChartContent(generateDefaultChordChart(song.title, newKey))
    }
  }

  const handleInsertTag = (tag: string) => {
    setChartContent((prev) => (prev ? `${prev}\n\n${tag}\n` : `${tag}\n`))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chartContent.trim()) {
      setStatus({ type: "error", text: "Chord chart content cannot be empty" })
      return
    }

    setSaving(true)
    setStatus(null)

    const res = await saveChordChart(songId, selectedKey, chartContent.trim(), false)
    if (res.success) {
      setStatus({ type: "success", text: `Chord chart for Key of ${selectedKey} saved successfully!` })
      setTimeout(() => {
        router.push(`/songs/${songId}`)
        router.refresh()
      }, 700)
    } else {
      setStatus({ type: "error", text: res.error || "Failed to save chord chart" })
      setSaving(false)
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/songs/${songId}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel & Back</span>
          </Link>
          <div className="text-xs text-muted-foreground font-medium">
            Editing Chords for: <strong className="text-foreground">{song?.title}</strong>
          </div>
        </div>

        {/* Feedback Alert */}
        {status && (
          <div
            className={`flex items-center gap-2 p-3.5 rounded-xl border text-xs ${
              status.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{status.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
            <div>
              <h1 className="text-base font-bold flex items-center gap-2">
                <Music className="h-4 w-4 text-indigo-400" />
                <span>Chord Chart Editor</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Format chords directly over lyrics. Use standard brackets for song sections.
              </p>
            </div>

            {/* Key Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground font-medium">Key:</span>
              <select
                value={selectedKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border/80 bg-background text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {MUSICAL_KEYS.map((k) => (
                  <option key={k} value={k}>
                    Key of {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Insert Section Tags */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">Quick Insert Section:</span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-[11px] font-mono border border-border/40 transition-colors"
                >
                  <Plus className="h-2.5 w-2.5 text-muted-foreground" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5 pt-1">
            <textarea
              rows={18}
              value={chartContent}
              onChange={(e) => setChartContent(e.target.value)}
              className="w-full p-4 rounded-xl border border-border/80 bg-background font-mono text-xs sm:text-sm leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y whitespace-pre"
              placeholder="[Intro]&#10;G    Gsus4    G    Gsus4&#10;&#10;[Verse 1]&#10;G&#10;A thousand generations..."
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
                  <span>Save Chord Chart (Key of {selectedKey})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
