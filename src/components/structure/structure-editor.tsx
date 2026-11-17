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
  onSave: (sections: SongSection[]) => Promise<void> | void
  isSetlistOverride?: boolean
  locked?: boolean
}

export function StructureEditor({
  initialSections,
  songTitle,
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
    <div className="space-y-6">
      {/* Structure Lock Alert Banner */}
      {isSetlistOverride && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/40">
          <StructureLockBadge
            isLocked={isLocked}
            onToggle={handleToggleLock}
            showDetails={true}
          />
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-card/60">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            <span>{isSetlistOverride ? "Custom Service Arrangement" : "Default Structure Blueprint"}</span>
            {isLocked && <Lock className="w-4 h-4 text-amber-500" />}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isSetlistOverride
              ? `Arrange exact flow for ${songTitle || "this song"} during live service.`
              : `Standard arrangement blueprint for ${songTitle || "this song"}.`}
          </p>
        </div>

        {/* Preset Selector & Save */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isLocked && (
            <select
              aria-label="Load preset blueprint"
              className="text-xs px-2.5 py-1.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              onChange={(e) => {
                if (e.target.value) handleLoadPreset(e.target.value)
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Load preset blueprint...
              </option>
              {STRUCTURE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleSave}
            disabled={saving || isLocked}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : isLocked ? "Locked" : "Save Structure"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-2.5">
        {sections.length === 0 ? (
          <div className="text-center py-10 rounded-xl border border-dashed text-xs text-muted-foreground">
            No sections added yet. Click one of the buttons below to begin the blueprint.
          </div>
        ) : (
          sections.map((section, idx) => {
            const config = SECTION_CONFIGS[section.type] || SECTION_CONFIGS.verse

            return (
              <div
                key={section.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition shadow-sm ${config.color.bg} ${config.color.border}`}
              >
                {/* Left: Position & Type badge & Label */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-xs font-mono font-bold text-muted-foreground w-5 text-center">
                    {idx + 1}
                  </span>

                  {/* Section Type Selector */}
                  <select
                    aria-label="Section type"
                    value={section.type}
                    onChange={(e) => {
                      const newType = e.target.value as SectionType
                      const typeConfig = SECTION_CONFIGS[newType]
                      handleUpdate(idx, {
                        type: newType,
                        name: section.name.startsWith(config.label) ? typeConfig.label : section.name,
                      })
                    }}
                    className={`text-xs font-bold px-2 py-1 rounded-md border font-sans cursor-pointer focus:outline-none ${config.color.badgeBg} ${config.color.text}`}
                  >
                    {Object.values(SECTION_CONFIGS).map((c) => (
                      <option key={c.type} value={c.type}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  {/* Custom Label Input */}
                  <input
                    type="text"
                    aria-label="Section name"
                    value={section.name}
                    onChange={(e) => handleUpdate(idx, { name: e.target.value })}
                    className="text-xs font-medium px-2 py-1 rounded border bg-background/80 flex-1 max-w-[160px] focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Verse 1"
                  />
                </div>

                {/* Center / Right: Bars, Repeat, Dynamics */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {/* Repeats counter */}
                  <div className="flex items-center gap-1 bg-background/70 border px-2 py-0.5 rounded-md">
                    <span className="text-[10px] text-muted-foreground">Rep:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate(idx, { repeats: Math.max(1, (section.repeats || 1) - 1) })
                      }
                      className="px-1 text-xs hover:text-primary font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-xs">{section.repeats || 1}x</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate(idx, { repeats: Math.min(6, (section.repeats || 1) + 1) })
                      }
                      className="px-1 text-xs hover:text-primary font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Bars input */}
                  <div className="flex items-center gap-1 bg-background/70 border px-2 py-0.5 rounded-md">
                    <span className="text-[10px] text-muted-foreground">Bars:</span>
                    <input
                      type="number"
                      aria-label="Number of bars"
                      min={1}
                      max={64}
                      value={section.bars || 8}
                      onChange={(e) =>
                        handleUpdate(idx, { bars: parseInt(e.target.value) || 4 })
                      }
                      className="w-10 text-center font-mono text-xs bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Dynamics select */}
                  <select
                    aria-label="Dynamics cue"
                    value={section.dynamics || "full_band"}
                    onChange={(e) =>
                      handleUpdate(idx, { dynamics: e.target.value as SectionDynamics })
                    }
                    className="text-[11px] px-2 py-1 rounded border bg-background/80 text-foreground cursor-pointer focus:outline-none"
                  >
                    {Object.entries(DYNAMICS_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>

                  {/* Instrument / Arrangement Note Button */}
                  <button
                    type="button"
                    onClick={() => setActiveNoteSectionIndex(idx)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium transition ${
                      section.notes
                        ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700"
                        : "bg-background/80 text-muted-foreground hover:text-foreground"
                    }`}
                    title={section.notes || "Add instrument notes (drums, keys, vocals)"}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{section.notes ? "Note" : "+ Note"}</span>
                  </button>

                  {/* Move Up / Down Buttons (hidden if locked) */}
                  {!isLocked && (
                    <div className="flex items-center border rounded-md bg-background/80 overflow-hidden">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveUp(idx)}
                        className="p-1 hover:bg-muted disabled:opacity-25 transition"
                        title="Move section earlier"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sections.length - 1}
                        onClick={() => moveDown(idx)}
                        className="p-1 hover:bg-muted disabled:opacity-25 transition border-l"
                        title="Move section later"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Delete button (hidden if locked) */}
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition"
                      title="Remove section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Quick Add Bar (only shown when not locked) */}
      {!isLocked && (
        <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Add Section to Blueprint:
          </p>
          <div className="flex flex-wrap gap-2">
            {(["verse", "chorus", "bridge", "intro", "pre_chorus", "tag", "instrumental", "outro"] as SectionType[]).map(
              (type) => {
                const conf = SECTION_CONFIGS[type]
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleAddSection(type)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition hover:scale-105 shadow-xs ${conf.color.bg} ${conf.color.border} ${conf.color.text}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{conf.label}</span>
                  </button>
                )
              }
            )}
          </div>
        </div>
      )}

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
