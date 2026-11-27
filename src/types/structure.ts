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
      bg: "bg-[#F1F5F9] dark:bg-slate-800",
      text: "text-[#475569] dark:text-slate-300",
      border: "border-[#CBD5E1] dark:border-slate-700",
      badgeBg: "bg-[#E2E8F0] text-[#334155]",
      activeRing: "ring-[#0F254A]",
    },
    defaultBars: 4,
  },
  verse: {
    type: "verse",
    label: "Verse",
    shortLabel: "V",
    color: {
      bg: "bg-white dark:bg-slate-900",
      text: "text-[#0F254A] dark:text-slate-100",
      border: "border-[#CBD5E1] dark:border-slate-700",
      badgeBg: "bg-[#F1F5F9] text-[#0F254A]",
      activeRing: "ring-[#0F254A]",
    },
    defaultBars: 8,
  },
  pre_chorus: {
    type: "pre_chorus",
    label: "Pre-Chorus",
    shortLabel: "PC",
    color: {
      bg: "bg-[#EFF6FF] dark:bg-blue-950/50",
      text: "text-[#1E40AF] dark:text-blue-200",
      border: "border-[#BFDBFE] dark:border-blue-800",
      badgeBg: "bg-[#DBEAFE] text-[#1E3A8A]",
      activeRing: "ring-[#1E40AF]",
    },
    defaultBars: 4,
  },
  chorus: {
    type: "chorus",
    label: "Chorus",
    shortLabel: "CH",
    color: {
      bg: "bg-[#0F254A] dark:bg-blue-600",
      text: "text-white",
      border: "border-[#0F254A] dark:border-blue-500",
      badgeBg: "bg-white/20 text-white",
      activeRing: "ring-[#0F254A]",
    },
    defaultBars: 8,
  },
  bridge: {
    type: "bridge",
    label: "Bridge",
    shortLabel: "BR",
    color: {
      bg: "bg-[#DBEAFE] dark:bg-blue-900/60",
      text: "text-[#1E3A8A] dark:text-blue-100",
      border: "border-[#93C5FD] dark:border-blue-700",
      badgeBg: "bg-[#BFDBFE] text-[#1E3A8A]",
      activeRing: "ring-[#1D4ED8]",
    },
    defaultBars: 8,
  },
  instrumental: {
    type: "instrumental",
    label: "Instrumental",
    shortLabel: "INST",
    color: {
      bg: "bg-[#F8FAFC] dark:bg-slate-900",
      text: "text-[#475569] dark:text-slate-300",
      border: "border-[#CBD5E1] dark:border-slate-700",
      badgeBg: "bg-[#E2E8F0] text-[#334155]",
      activeRing: "ring-[#475569]",
    },
    defaultBars: 4,
  },
  interlude: {
    type: "interlude",
    label: "Interlude",
    shortLabel: "INT",
    color: {
      bg: "bg-[#F8FAFC] dark:bg-slate-900",
      text: "text-[#475569] dark:text-slate-300",
      border: "border-[#CBD5E1] dark:border-slate-700",
      badgeBg: "bg-[#E2E8F0] text-[#334155]",
      activeRing: "ring-[#475569]",
    },
    defaultBars: 4,
  },
  solo: {
    type: "solo",
    label: "Solo",
    shortLabel: "SOLO",
    color: {
      bg: "bg-[#F0F9FF] dark:bg-sky-950/50",
      text: "text-[#0369A1] dark:text-sky-200",
      border: "border-[#BAE6FD] dark:border-sky-800",
      badgeBg: "bg-[#E0F2FE] text-[#0369A1]",
      activeRing: "ring-[#0284C7]",
    },
    defaultBars: 8,
  },
  tag: {
    type: "tag",
    label: "Tag",
    shortLabel: "TAG",
    color: {
      bg: "bg-[#F0F9FF] dark:bg-sky-950/50",
      text: "text-[#0369A1] dark:text-sky-200",
      border: "border-[#BAE6FD] dark:border-sky-800",
      badgeBg: "bg-[#E0F2FE] text-[#0369A1]",
      activeRing: "ring-[#0284C7]",
    },
    defaultBars: 2,
  },
  outro: {
    type: "outro",
    label: "Outro",
    shortLabel: "OUT",
    color: {
      bg: "bg-[#F1F5F9] dark:bg-slate-800",
      text: "text-[#475569] dark:text-slate-300",
      border: "border-[#CBD5E1] dark:border-slate-700",
      badgeBg: "bg-[#E2E8F0] text-[#334155]",
      activeRing: "ring-[#475569]",
    },
    defaultBars: 4,
  },
  vamp: {
    type: "vamp",
    label: "Vamp",
    shortLabel: "VAMP",
    color: {
      bg: "bg-[#EFF6FF] dark:bg-blue-950/50",
      text: "text-[#1E40AF] dark:text-blue-200",
      border: "border-[#BFDBFE] dark:border-blue-800",
      badgeBg: "bg-[#DBEAFE] text-[#1E3A8A]",
      activeRing: "ring-[#1E40AF]",
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
