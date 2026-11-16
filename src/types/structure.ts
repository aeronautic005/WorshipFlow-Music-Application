import type { SongSection } from "./database"

export type SectionType =
  | "intro"
  | "verse"
  | "pre_chorus"
  | "chorus"
  | "bridge"
  | "instrumental"
  | "interlude"
  | "solo"
  | "tag"
  | "outro"
  | "vamp"

export type SectionDynamics =
  | "soft"
  | "building"
  | "strong"
  | "dropping"
  | "acapella"
  | "full_band"

export interface StructureSectionItem extends SongSection {
  dynamics?: SectionDynamics
  bars?: number
  repeats?: number
  notes?: string
  key_override?: string
}

export interface SectionTypeConfig {
  type: SectionType
  label: string
  shortLabel: string
  color: {
    bg: string
    text: string
    border: string
    badgeBg: string
    activeRing: string
  }
  defaultBars?: number
}

export const SECTION_CONFIGS: Record<SectionType, SectionTypeConfig> = {
  intro: {
    type: "intro",
    label: "Intro",
    shortLabel: "IN",
    color: {
      bg: "bg-slate-100 dark:bg-slate-900/60",
      text: "text-slate-800 dark:text-slate-200",
      border: "border-slate-300 dark:border-slate-700",
      badgeBg: "bg-slate-200 dark:bg-slate-800",
      activeRing: "ring-slate-400",
    },
    defaultBars: 4,
  },
  verse: {
    type: "verse",
    label: "Verse",
    shortLabel: "V",
    color: {
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-800 dark:text-blue-200",
      border: "border-blue-200 dark:border-blue-800",
      badgeBg: "bg-blue-100 dark:bg-blue-900/70",
      activeRing: "ring-blue-500",
    },
    defaultBars: 8,
  },
  pre_chorus: {
    type: "pre_chorus",
    label: "Pre-Chorus",
    shortLabel: "PC",
    color: {
      bg: "bg-purple-50 dark:bg-purple-950/40",
      text: "text-purple-800 dark:text-purple-200",
      border: "border-purple-200 dark:border-purple-800",
      badgeBg: "bg-purple-100 dark:bg-purple-900/70",
      activeRing: "ring-purple-500",
    },
    defaultBars: 4,
  },
  chorus: {
    type: "chorus",
    label: "Chorus",
    shortLabel: "CH",
    color: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-900 dark:text-amber-200",
      border: "border-amber-200 dark:border-amber-800",
      badgeBg: "bg-amber-100 dark:bg-amber-900/70",
      activeRing: "ring-amber-500",
    },
    defaultBars: 8,
  },
  bridge: {
    type: "bridge",
    label: "Bridge",
    shortLabel: "BR",
    color: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-900 dark:text-emerald-200",
      border: "border-emerald-200 dark:border-emerald-800",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/70",
      activeRing: "ring-emerald-500",
    },
    defaultBars: 8,
  },
  instrumental: {
    type: "instrumental",
    label: "Instrumental",
    shortLabel: "INST",
    color: {
      bg: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-900 dark:text-rose-200",
      border: "border-rose-200 dark:border-rose-800",
      badgeBg: "bg-rose-100 dark:bg-rose-900/70",
      activeRing: "ring-rose-500",
    },
    defaultBars: 4,
  },
  interlude: {
    type: "interlude",
    label: "Interlude",
    shortLabel: "INT",
    color: {
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      text: "text-indigo-900 dark:text-indigo-200",
      border: "border-indigo-200 dark:border-indigo-800",
      badgeBg: "bg-indigo-100 dark:bg-indigo-900/70",
      activeRing: "ring-indigo-500",
    },
    defaultBars: 4,
  },
  solo: {
    type: "solo",
    label: "Solo",
    shortLabel: "SOLO",
    color: {
      bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
      text: "text-fuchsia-900 dark:text-fuchsia-200",
      border: "border-fuchsia-200 dark:border-fuchsia-800",
      badgeBg: "bg-fuchsia-100 dark:bg-fuchsia-900/70",
      activeRing: "ring-fuchsia-500",
    },
    defaultBars: 8,
  },
  tag: {
    type: "tag",
    label: "Tag",
    shortLabel: "TAG",
    color: {
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
      text: "text-cyan-900 dark:text-cyan-200",
      border: "border-cyan-200 dark:border-cyan-800",
      badgeBg: "bg-cyan-100 dark:bg-cyan-900/70",
      activeRing: "ring-cyan-500",
    },
    defaultBars: 2,
  },
  outro: {
    type: "outro",
    label: "Outro",
    shortLabel: "OUT",
    color: {
      bg: "bg-zinc-100 dark:bg-zinc-900/60",
      text: "text-zinc-800 dark:text-zinc-200",
      border: "border-zinc-300 dark:border-zinc-700",
      badgeBg: "bg-zinc-200 dark:bg-zinc-800",
      activeRing: "ring-zinc-400",
    },
    defaultBars: 4,
  },
  vamp: {
    type: "vamp",
    label: "Vamp",
    shortLabel: "VAMP",
    color: {
      bg: "bg-orange-50 dark:bg-orange-950/40",
      text: "text-orange-900 dark:text-orange-200",
      border: "border-orange-200 dark:border-orange-800",
      badgeBg: "bg-orange-100 dark:bg-orange-900/70",
      activeRing: "ring-orange-500",
    },
    defaultBars: 4,
  },
}

export const DYNAMICS_CONFIG: Record<
  SectionDynamics,
  { label: string; icon: string; description: string }
> = {
  soft: { label: "Soft / Pad Only", icon: "p", description: "Minimal sound, keys pad only" },
  building: { label: "Building", icon: "cresc", description: "Drums tom swell, dynamics rising" },
  strong: { label: "Full Power", icon: "f", description: "Full drums beat, lead electric guitar" },
  dropping: { label: "Drop Down", icon: "dim", description: "Instruments drop out suddenly" },
  acapella: { label: "Acapella / Claps", icon: "vox", description: "Voices only, congregation singing" },
  full_band: { label: "Full Band", icon: "all", description: "Everyone in full groove" },
}

export function createDefaultSection(type: SectionType, index?: number): StructureSectionItem {
  const config = SECTION_CONFIGS[type]
  const id = `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`

  let name = config.label
  if (type === "verse" && index !== undefined) {
    name = `Verse ${index}`
  } else if (type === "chorus" && index !== undefined && index > 1) {
    name = `Chorus ${index}`
  } else if (type === "bridge" && index !== undefined && index > 1) {
    name = `Bridge ${index}`
  }

  return {
    id,
    type,
    name,
    bars: config.defaultBars || 4,
    repeats: 1,
    dynamics: "full_band",
  }
}

export interface StructurePreset {
  id: string
  name: string
  description: string
  category: "worship" | "joyful" | "universal"
  sections: Omit<StructureSectionItem, "id">[]
}

export const STRUCTURE_PRESETS: StructurePreset[] = [
  {
    id: "standard-ccm",
    name: "Standard CCM Worship",
    description: "Intro → V1 → PC → Chorus → V2 → PC → Chorus → Bridge x2 → Chorus → Outro",
    category: "worship",
    sections: [
      { type: "intro", name: "Intro", bars: 4, repeats: 1, dynamics: "soft" },
      { type: "verse", name: "Verse 1", bars: 8, repeats: 1, dynamics: "soft" },
      { type: "pre_chorus", name: "Pre-Chorus", bars: 4, repeats: 1, dynamics: "building" },
      { type: "chorus", name: "Chorus", bars: 8, repeats: 1, dynamics: "full_band" },
      { type: "verse", name: "Verse 2", bars: 8, repeats: 1, dynamics: "soft" },
      { type: "pre_chorus", name: "Pre-Chorus", bars: 4, repeats: 1, dynamics: "building" },
      { type: "chorus", name: "Chorus", bars: 8, repeats: 1, dynamics: "full_band" },
      { type: "bridge", name: "Bridge", bars: 8, repeats: 2, dynamics: "building", notes: "Build into big Chorus" },
      { type: "chorus", name: "Chorus", bars: 8, repeats: 1, dynamics: "strong" },
      { type: "outro", name: "Outro", bars: 4, repeats: 1, dynamics: "dropping" },
    ],
  },
  {
    id: "fast-joyful",
    name: "Fast & Joyful Groove",
    description: "Intro (Drums in) → Verse 1 → Verse 2 → Chorus x2 → Verse 3 → Chorus x2 → Instrumental → Outro",
    category: "joyful",
    sections: [
      { type: "intro", name: "Intro", bars: 4, repeats: 1, dynamics: "strong", notes: "Drums start high tempo" },
      { type: "verse", name: "Verse 1", bars: 8, repeats: 1, dynamics: "full_band" },
      { type: "verse", name: "Verse 2", bars: 8, repeats: 1, dynamics: "full_band" },
      { type: "chorus", name: "Chorus", bars: 8, repeats: 2, dynamics: "strong" },
      { type: "verse", name: "Verse 3", bars: 8, repeats: 1, dynamics: "full_band" },
      { type: "chorus", name: "Chorus", bars: 8, repeats: 2, dynamics: "strong" },
      { type: "instrumental", name: "Instrumental", bars: 4, repeats: 1, dynamics: "strong", notes: "Lead electric riff" },
      { type: "outro", name: "Outro", bars: 4, repeats: 1, dynamics: "full_band", notes: "Big clean finish on 1" },
    ],
  },
  {
    id: "intimate-worship",
    name: "Intimate / Acoustic Flow",
    description: "Intro (Keys pad) → Verse 1 → Chorus → Verse 2 → Chorus → Bridge (Acapella) → Chorus → Tag",
    category: "worship",
    sections: [
      { type: "intro", name: "Intro", bars: 4, repeats: 1, dynamics: "soft", notes: "Keyboard 1 pad + acoustic" },
      { type: "verse", name: "Verse 1", bars: 8, repeats: 1, dynamics: "soft" },
      { type: "chorus", name: "Chorus", bars: 8, repeats: 1, dynamics: "soft" },
      { type: "verse", name: "Verse 2", bars: 8, repeats: 1, dynamics: "soft" },
      { type: "chorus", name: "Chorus", bars: 8, repeats: 1, dynamics: "full_band" },
      { type: "bridge", name: "Bridge", bars: 8, repeats: 2, dynamics: "acapella", notes: "Drums drop out completely" },
      { type: "chorus", name: "Chorus", bars: 8, repeats: 1, dynamics: "strong" },
      { type: "tag", name: "Tag", bars: 4, repeats: 2, dynamics: "dropping", notes: "Repeat final lyric line" },
    ],
  },
]
