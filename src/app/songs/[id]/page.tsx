"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSongById } from "@/lib/songs"
import { getChordChart, generateDefaultChordChart } from "@/lib/chords"
import { transposeChordChart } from "@/lib/transpose"
import { CapoCalculator } from "@/components/song/capo-calculator"
import { StructureMap } from "@/components/structure/structure-map"
import { AiBadge } from "@/components/ai/ai-badge"
import type { Song } from "@/types/database"
import {
  ArrowLeft,
  Sun,
  Feather,
  Clock,
  ExternalLink,
  Edit3,
  FileText,
  Music2,
  Loader2,
  FileCode,
  Music,
} from "lucide-react"

const MUSICAL_KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E",
  "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
]

export default function SongDetailPage() {
  const params = useParams()
  const songId = params.id as string

  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"chords" | "lyrics">("chords")
  const [selectedKey, setSelectedKey] = useState<string>("G")
  const [baseChart, setBaseChart] = useState<string>("")
  const [chordContent, setChordContent] = useState<string>("")
  const [isAiChart, setIsAiChart] = useState<boolean>(false)

  useEffect(() => {
    async function loadSong() {
      if (!songId) return
      try {
        const data = await getSongById(songId)
        if (data) {
          setSong(data)
          const origKey = data.original_key || "G"
          setSelectedKey(origKey)

          const chart = await getChordChart(songId, origKey)
          const content = chart
            ? chart.chart_content
            : generateDefaultChordChart(data.title, origKey)

          setBaseChart(content)
          setChordContent(content)
          setIsAiChart(chart?.is_ai_generated || false)
        }
      } catch (err) {
        console.error("Failed to load song details:", err)
      } finally {
        setLoading(false)
      }
    }
    loadSong()
  }, [songId])

  const handleKeyChange = async (newKey: string) => {
    setSelectedKey(newKey)
    if (!song) return

    const customChart = await getChordChart(songId, newKey)
    if (customChart) {
      setChordContent(customChart.chart_content)
      setIsAiChart(customChart.is_ai_generated || false)
    } else {
      const transposed = transposeChordChart(baseChart, song.original_key, newKey)
      setChordContent(transposed)
      setIsAiChart(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  if (!song) {
    return (
      <AppShell>
        <div className="text-center py-16 space-y-3">
          <h2 className="text-lg font-bold text-primary">Song not found</h2>
          <Link href="/songs" className="text-xs font-semibold text-primary hover:underline">
            Back to Song Library
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/songs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Library</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/songs/${song.id}/key-history`}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border border-border bg-card text-xs font-semibold text-primary hover:bg-secondary transition-colors"
            >
              <Music className="h-3.5 w-3.5" />
              <span>Leader Keys</span>
            </Link>
            <Link
              href={`/songs/${song.id}/structure`}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border border-border bg-card text-xs font-semibold text-primary hover:bg-secondary transition-colors"
            >
              <Music2 className="h-3.5 w-3.5" />
              <span>Structure Blueprint</span>
            </Link>
            <Link
              href={`/songs/${song.id}/edit`}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Song</span>
            </Link>
          </div>
        </div>

        {/* Hero Card */}
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-[0_2px_12px_rgba(15,37,74,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-secondary text-primary border border-border">
                  {song.category === "joyful" ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : (
                    <Feather className="h-3.5 w-3.5" />
                  )}
                  <span>{song.category === "joyful" ? "Joyful Praise" : "Worship"}</span>
                </span>

                <span className="text-[11px] px-2.5 py-1 rounded-full bg-background text-muted-foreground border border-border font-medium">
                  {song.language}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
                {song.title}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">{song.artist}</p>
            </div>

            {/* Key & BPM Highlight Stat Tiles */}
            <div className="flex items-center gap-2.5 shrink-0">
              {song.bpm && (
                <div className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-secondary border border-primary/20 min-w-[96px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 text-primary" />
                    <span>Tempo</span>
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-primary leading-tight mt-0.5">
                    {song.bpm} <span className="text-xs font-bold">BPM</span>
                  </span>
                </div>
              )}

              <div className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-primary text-primary-foreground min-w-[96px] shadow-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/75">
                  Orig. Key
                </span>
                <span className="text-base sm:text-lg font-extrabold leading-tight mt-0.5">
                  {song.original_key}
                </span>
              </div>
            </div>
          </div>

          {/* Reference Audio/Video Link */}
          {song.reference_url && (
            <div className="pt-3 border-t border-border/70">
              <a
                href={song.reference_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/70 hover:bg-secondary text-xs font-semibold text-primary border border-border transition-colors"
              >
                <Music2 className="h-3.5 w-3.5 text-primary" />
                <span>Listen to Official Practice Reference</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            </div>
          )}
        </div>

        {/* Pill Tab Toggle: Chords vs. Structure & Lyrics */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-card shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("chords")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "chords"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Music className="h-3.5 w-3.5" />
            <span>Chord Chart</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lyrics")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "lyrics"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Structure &amp; Lyrics</span>
          </button>
        </div>

        {/* Chords Tab */}
        {activeTab === "chords" && (
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-[0_2px_12px_rgba(15,37,74,0.04)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <FileCode className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-primary">Chord Progression</h2>
                {isAiChart && <AiBadge label="AI Draft" modelName="gemini-2.5-flash" />}
              </div>

              {/* Key Selector, Edit & Capo */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium">Key:</span>
                <select
                  value={selectedKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  className="h-8 px-3 rounded-full border border-border bg-background text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {MUSICAL_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k} {k === song.original_key ? "(Original)" : ""}
                    </option>
                  ))}
                </select>

                <Link
                  href={`/songs/${song.id}/chords/edit`}
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-border bg-card text-xs font-semibold text-primary hover:bg-secondary transition-colors"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit Chords</span>
                </Link>

                <CapoCalculator currentKey={selectedKey} />
              </div>
            </div>

            {/* Chord Chart Sheet Display */}
            <div className="p-5 rounded-2xl bg-secondary/40 border border-border overflow-x-auto">
              <pre className="text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre">
                {chordContent}
              </pre>
            </div>
          </div>
        )}

        {/* Structure & Lyrics Tab */}
        {activeTab === "lyrics" && (
          <div className="space-y-5">
            {/* Song Structure Blueprint Preview */}
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-[0_2px_12px_rgba(15,37,74,0.04)] space-y-3">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <h2 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Music2 className="h-4 w-4 text-primary" />
                  <span>Standard Arrangement Blueprint</span>
                </h2>
                <Link
                  href={`/songs/${song.id}/structure`}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Edit Blueprint
                </Link>
              </div>

              <div className="pt-1">
                {song.default_structure && song.default_structure.length > 0 ? (
                  <StructureMap
                    sections={song.default_structure}
                    size="md"
                    bpm={song.bpm}
                    showTimelineSummary={true}
                  />
                ) : (
                  <div className="text-xs text-muted-foreground py-2 flex items-center justify-between">
                    <span>No blueprint set yet for this song.</span>
                    <Link
                      href={`/songs/${song.id}/structure`}
                      className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                    >
                      Create Blueprint
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Lyrics Card */}
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-[0_2px_12px_rgba(15,37,74,0.04)] space-y-3">
              <h2 className="text-sm font-bold text-primary border-b border-border/70 pb-3">
                Lyrics Reference
              </h2>
              {song.lyrics ? (
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                  {song.lyrics}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic py-4">
                  No lyrics added yet. Click &quot;Edit Song&quot; to add full lyrics.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
