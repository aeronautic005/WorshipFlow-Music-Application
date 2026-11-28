"use client"

import { useState } from "react"
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Save,
  RotateCcw,
  Music,
  Sliders,
  Check,
  MessageSquare,
  Lock,
  Unlock,
} from "lucide-react"
import { SectionNotesModal } from "./section-notes-modal"
import { StructureLockBadge } from "./structure-lock-badge"
import { extractAiSongStructure, type ExtractedStructureResult } from "@/lib/ai/structure-extractor"
import { AiGenerateButton } from "@/components/ai/ai-generate-button"
import { AiResultCard } from "@/components/ai/ai-result-card"
import { AiBadge } from "@/components/ai/ai-badge"
import type { SongSection } from "@/types/database"
import {
  SECTION_CONFIGS,
  STRUCTURE_PRESETS,
  DYNAMICS_CONFIG,
  createDefaultSection,
  type SectionType,
  type SectionDynamics,
  type StructureSectionItem,
} from "@/types/structure"

interface StructureEditorProps {
  initialSections?: SongSection[] | null
  songTitle?: string
  artist?: string
  songCategory?: "joyful" | "worship"
  bpm?: number | null
  onSave: (sections: SongSection[]) => Promise<void> | void
  isSetlistOverride?: boolean
  locked?: boolean
}

export function StructureEditor({
  initialSections,
  songTitle,
  artist,
  songCategory = "worship",
  bpm,
  onSave,
  isSetlistOverride = false,
  locked = false,
}: StructureEditorProps) {
  const [isLocked, setIsLocked] = useState(locked)
  const [sections, setSections] = useState<StructureSectionItem[]>(() => {
    if (initialSections && initialSections.length > 0) {
      return initialSections.map((s) => ({
        ...s,
        bars: s.bars || 8,
        repeats: s.repeats || 1,
        dynamics: (s as any).dynamics || "full_band",
      }))
    }
    // Default fallback to standard CCM structure
    return STRUCTURE_PRESETS[0].sections.map((s, idx) => ({
      ...s,
      id: `sec-${idx}-${Date.now()}`,
    }))
  })

  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [activeNoteSectionIndex, setActiveNoteSectionIndex] = useState<number | null>(null)
  const [aiExtracting, setAiExtracting] = useState(false)
  const [aiResult, setAiResult] = useState<ExtractedStructureResult | null>(null)

  const handleAiExtract = async () => {
    setAiExtracting(true)
    try {
      const result = await extractAiSongStructure({
        songTitle: songTitle || "Worship Song",
        artist,
        category: songCategory,
        bpm: bpm || undefined,
      })
      setAiResult(result)
    } catch (err) {
      console.error("AI structure extraction error:", err)
    } finally {
      setAiExtracting(false)
    }
  }

  const handleAcceptAiStructure = () => {
    if (!aiResult) return
    const mapped: StructureSectionItem[] = aiResult.sections.map((s) => ({
      ...s,
      bars: s.bars || 8,
      repeats: s.repeats || 1,
      dynamics: "full_band",
    }))
    setSections(mapped)
    setAiResult(null)
  }

  // Move section up
  const moveUp = (index: number) => {
    if (index === 0) return
    const updated = [...sections]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    setSections(updated)
  }

  // Move section down
  const moveDown = (index: number) => {
    if (index === sections.length - 1) return
    const updated = [...sections]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    setSections(updated)
  }

  // Add section
  const handleAddSection = (type: SectionType) => {
    const existingCount = sections.filter((s) => s.type === type).length
    const newSection = createDefaultSection(type, existingCount + 1)
    setSections([...sections, newSection])
  }

  // Remove section
  const handleRemove = (index: number) => {
    const updated = sections.filter((_, i) => i !== index)
    setSections(updated)
  }

  // Update section property
  const handleUpdate = (index: number, updates: Partial<StructureSectionItem>) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], ...updates }
    setSections(updated)
  }

  // Load preset
  const handleLoadPreset = (presetId: string) => {
    const preset = STRUCTURE_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    const newSections = preset.sections.map((s, idx) => ({
      ...s,
      id: `sec-preset-${idx}-${Date.now()}`,
    }))
    setSections(newSections)
  }

  // Save handler
  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(sections)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleLock = () => {
    if (isLocked) {
      const ok = window.confirm(
        "Unlocking will allow changes to the published arrangement. Ensure your musicians (drums, keys, vocals) are aware of any modifications. Proceed?"
      )
      if (!ok) return
      setIsLocked(false)
    } else {
      setIsLocked(true)
    }
  }

  return (
    <div className="space-y-5">
      {/* Structure Lock Alert Banner */}
      {isSetlistOverride && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
          <StructureLockBadge
            isLocked={isLocked}
            onToggle={handleToggleLock}
            showDetails={true}
          />
        </div>
      )}

      {/* AI Structure Suggestion Preview & Accept Card */}
      {aiResult && (
        <AiResultCard
          title="AI Song Structure Suggestion"
          subtitle={aiResult.summary || `Extracted ${aiResult.sections.length} sections using Gemini`}
          modelName={aiResult.model}
          isMock={aiResult.isMock}
          applyLabel="Accept & Apply Blueprint"
          onApply={handleAcceptAiStructure}
          onRegenerate={handleAiExtract}
          onDismiss={() => setAiResult(null)}
          isRegenerating={aiExtracting}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-secondary/40 border border-border">
              {aiResult.sections.map((sec, idx) => (
                <span
                  key={sec.id || idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black text-white"
                >
                  <span>{sec.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    {sec.bars || 8}b{sec.repeats && sec.repeats > 1 ? ` ×${sec.repeats}` : ""}
                  </span>
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Review the suggested arrangement above, then click &quot;Accept &amp; Apply Blueprint&quot; to load it into the editor.
            </p>
          </div>
        </AiResultCard>
      )}

      {/* Main Unified Blueprint Editor Card */}
      <div className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-5 border-b border-border/80">
          <div>
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span>{isSetlistOverride ? "Custom Service Arrangement" : "Arrangement Blueprint"}</span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[11px] font-semibold">
                {sections.length} {sections.length === 1 ? "section" : "sections"}
              </span>
              {isLocked && <Lock className="w-3.5 h-3.5 text-amber-500" />}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reorder sections, adjust repeats &amp; bars, or add band cues.
            </p>
          </div>

          {/* Actions Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isLocked && (
              <>
                <AiGenerateButton
                  isLoading={aiExtracting}
                  loadingText="Detecting..."
                  onClick={handleAiExtract}
                  className="h-9 px-3.5 rounded-full text-xs"
                >
                  Auto-Detect
                </AiGenerateButton>

                <select
                  aria-label="Load preset blueprint"
                  className="h-9 text-xs font-semibold px-3.5 rounded-full border border-border bg-card text-foreground hover:bg-secondary transition focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleLoadPreset(e.target.value)
                      e.target.value = ""
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Load Preset...
                  </option>
                  {STRUCTURE_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isLocked}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : isLocked ? "Locked" : "Save Blueprint"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Clean White Sections List */}
        {sections.length === 0 ? (
          <div className="text-center py-12 px-4 text-xs text-muted-foreground">
            No sections added yet. Pick a section below to start building the blueprint.
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {sections.map((section, idx) => {
              const config = SECTION_CONFIGS[section.type] || SECTION_CONFIGS.verse

              return (
                <div
                  key={section.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-5 py-3.5 hover:bg-secondary/25 transition-colors"
                >
                  {/* Left: Index + Type + Custom Label */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-muted-foreground text-[11px] font-bold shrink-0">
                      {idx + 1}
                    </span>

                    <select
                      aria-label="Section type"
                      value={section.type}
                      disabled={isLocked}
                      onChange={(e) => {
                        const newType = e.target.value as SectionType
                        const typeConfig = SECTION_CONFIGS[newType]
                        handleUpdate(idx, {
                          type: newType,
                          name: section.name.startsWith(config.label) ? typeConfig.label : section.name,
                        })
                      }}
                      className="h-8 w-[124px] text-xs font-semibold px-2.5 rounded-full border border-border bg-secondary/60 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shrink-0"
                    >
                      {Object.values(SECTION_CONFIGS).map((c) => (
                        <option key={c.type} value={c.type}>
                          {c.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      aria-label="Section name"
                      disabled={isLocked}
                      value={section.name}
                      onChange={(e) => handleUpdate(idx, { name: e.target.value })}
                      className="h-8 text-xs font-semibold px-3 rounded-full border border-border bg-background text-foreground flex-1 min-w-[100px] focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Verse 1"
                    />
                  </div>

                  {/* Right: Repeats, Bars, Dynamics, Note, Order & Delete */}
                  <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap shrink-0">
                    {/* Repeats Stepper */}
                    <div className="inline-flex items-center justify-between h-8 w-[104px] px-2.5 rounded-full border border-border bg-background text-xs shrink-0">
                      <span className="text-[10px] font-medium text-muted-foreground">Rep</span>
                      <div className="inline-flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={() =>
                            handleUpdate(idx, { repeats: Math.max(1, (section.repeats || 1) - 1) })
                          }
                          className="w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-secondary text-foreground font-bold cursor-pointer disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="font-bold text-foreground w-5 text-center">
                          {section.repeats || 1}x
                        </span>
                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={() =>
                            handleUpdate(idx, { repeats: Math.min(6, (section.repeats || 1) + 1) })
                          }
                          className="w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-secondary text-foreground font-bold cursor-pointer disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Bars Input */}
                    <div className="inline-flex items-center justify-between h-8 w-[84px] px-2.5 rounded-full border border-border bg-background text-xs shrink-0">
                      <span className="text-[10px] font-medium text-muted-foreground">Bars</span>
                      <input
                        type="number"
                        aria-label="Number of bars"
                        disabled={isLocked}
                        min={1}
                        max={64}
                        value={section.bars || 8}
                        onChange={(e) =>
                          handleUpdate(idx, { bars: parseInt(e.target.value) || 4 })
                        }
                        className="w-9 text-center font-bold text-xs text-foreground bg-transparent focus:outline-none"
                      />
                    </div>

                    {/* Dynamics Select */}
                    <select
                      aria-label="Dynamics cue"
                      disabled={isLocked}
                      value={section.dynamics || "full_band"}
                      onChange={(e) =>
                        handleUpdate(idx, { dynamics: e.target.value as SectionDynamics })
                      }
                      className="h-8 w-[134px] text-xs font-medium px-2.5 rounded-full border border-border bg-background text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shrink-0"
                    >
                      {Object.entries(DYNAMICS_CONFIG).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </select>

                    {/* Note Button */}
                    <button
                      type="button"
                      onClick={() => setActiveNoteSectionIndex(idx)}
                      className={`relative inline-flex items-center justify-center gap-1 h-8 w-[82px] rounded-full border border-border bg-background text-xs font-semibold hover:bg-secondary transition cursor-pointer shrink-0 ${
                        section.notes ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={section.notes ? `Saved cue: ${section.notes}` : "Add instrument cue notes"}
                    >
                      <MessageSquare className="w-3 h-3 shrink-0" />
                      <span>+ Note</span>
                      {section.notes && (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                          aria-label="Has saved note"
                        />
                      )}
                    </button>

                    {/* Move Up / Down & Delete */}
                    {!isLocked && (
                      <div className="inline-flex items-center gap-1 pl-1">
                        <div className="inline-flex items-center h-8 rounded-full border border-border bg-background overflow-hidden">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveUp(idx)}
                            className="h-full px-2 hover:bg-secondary disabled:opacity-25 transition cursor-pointer"
                            title="Move up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === sections.length - 1}
                            onClick={() => moveDown(idx)}
                            className="h-full px-2 hover:bg-secondary disabled:opacity-25 transition border-l border-border cursor-pointer"
                            title="Move down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(idx)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Remove section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Add Section Footer */}
        {!isLocked && (
          <div className="p-5 border-t border-border/80 bg-secondary/25 space-y-2.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Add Section
            </p>
            <div className="flex flex-wrap gap-2">
              {(["intro", "verse", "pre_chorus", "chorus", "bridge", "instrumental", "tag", "outro"] as SectionType[]).map(
                (type) => {
                  const conf = SECTION_CONFIGS[type]
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleAddSection(type)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-border bg-card text-foreground hover:bg-secondary text-xs font-semibold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{conf.label}</span>
                    </button>
                  )
                }
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section Notes Modal */}
      {activeNoteSectionIndex !== null && sections[activeNoteSectionIndex] && (
        <SectionNotesModal
          section={sections[activeNoteSectionIndex]}
          isOpen={true}
          onClose={() => setActiveNoteSectionIndex(null)}
          onSaveNotes={(notes) => {
            handleUpdate(activeNoteSectionIndex, { notes })
          }}
        />
      )}
    </div>
  )
}
