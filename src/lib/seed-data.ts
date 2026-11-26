import { createClient } from "@/lib/supabase/client"
import type { SongCategory, SongSection } from "@/types/database"

export interface SeedSongEntry {
  title: string
  artist: string
  original_key: string
  bpm: number
  category: SongCategory
  language: string
  tags: string[]
  default_structure: SongSection[]
}

export interface SeedTeamMember {
  name: string
  role: "song_leader" | "backup_vocal" | "musician"
  instrument: string
  vocal_range?: string
  rotation_group?: string
}

export const SEED_TEAM_MEMBERS: SeedTeamMember[] = [
  { name: "France", role: "song_leader", instrument: "Vocals (Lead / Backup)", vocal_range: "Bb3 - D5", rotation_group: "Vocal Leads" },
  { name: "Maegan", role: "song_leader", instrument: "Vocals (Lead / Backup)", vocal_range: "C4 - E5", rotation_group: "Vocal Leads" },
  { name: "Deanne", role: "song_leader", instrument: "Vocals (Lead / Backup)", vocal_range: "A3 - C5", rotation_group: "Vocal Leads" },
  { name: "Argel", role: "song_leader", instrument: "Vocals (Lead / Backup)", vocal_range: "C3 - G4", rotation_group: "Vocal Leads" },
  { name: "Andrei", role: "song_leader", instrument: "Vocals (Lead / Backup)", vocal_range: "B2 - F#4", rotation_group: "Vocal Leads" },
  { name: "Kyle", role: "musician", instrument: "Drums", rotation_group: "Drummers (Alternating)" },
  { name: "Aeron", role: "musician", instrument: "Drums", rotation_group: "Drummers (Alternating)" },
  { name: "Keys 1", role: "musician", instrument: "Keyboard 1 (Piano)" },
  { name: "Keys 2", role: "musician", instrument: "Keyboard 2 (Pad / Synth)" },
  { name: "Guitars", role: "musician", instrument: "Electric & Acoustic Guitar" },
  { name: "Bass", role: "musician", instrument: "Bass Guitar" },
]

const STANDARD_JOYFUL_STRUCTURE: SongSection[] = [
  { id: "sj-1", name: "Intro", type: "intro", bars: 4, repeats: 1, notes: "Full band driving groove" },
  { id: "sj-2", name: "Verse 1", type: "verse", bars: 8, repeats: 1, notes: "Tight kick & bass pocket" },
  { id: "sj-3", name: "Chorus", type: "chorus", bars: 8, repeats: 2, notes: "Full energy praise" },
  { id: "sj-4", name: "Verse 2", type: "verse", bars: 8, repeats: 1, notes: "Guitar riff accent" },
  { id: "sj-5", name: "Chorus", type: "chorus", bars: 8, repeats: 2 },
  { id: "sj-6", name: "Bridge", type: "bridge", bars: 8, repeats: 2, notes: "Build drums into final chorus" },
  { id: "sj-7", name: "Outro", type: "outro", bars: 4, repeats: 1, notes: "Big crash ending" },
]

const STANDARD_WORSHIP_STRUCTURE: SongSection[] = [
  { id: "sw-1", name: "Intro", type: "intro", bars: 4, repeats: 1, notes: "Acoustic & warm pad swell" },
  { id: "sw-2", name: "Verse 1", type: "verse", bars: 8, repeats: 1, notes: "Soft vocal & piano" },
  { id: "sw-3", name: "Chorus", type: "chorus", bars: 8, repeats: 1, notes: "Bass & light drums enter" },
  { id: "sw-4", name: "Verse 2", type: "verse", bars: 8, repeats: 1, notes: "Add backup harmonies" },
  { id: "sw-5", name: "Chorus", type: "chorus", bars: 8, repeats: 2, notes: "Medium worship build" },
  { id: "sw-6", name: "Bridge", type: "bridge", bars: 8, repeats: 3, notes: "Crescendo to peak declaration" },
  { id: "sw-7", name: "Chorus", type: "chorus", bars: 8, repeats: 1, notes: "Drop to keys pad & vocals" },
  { id: "sw-8", name: "Outro", type: "outro", bars: 4, repeats: 1, notes: "Prayerful pad sustain" },
]

export const SEED_SONGS: SeedSongEntry[] = [
  {
    title: "House of the Lord",
    artist: "Phil Wickham",
    original_key: "Bb",
    bpm: 118,
    category: "joyful",
    language: "English",
    tags: ["praise", "opener", "joy"],
    default_structure: STANDARD_JOYFUL_STRUCTURE,
  },
  {
    title: "Praise",
    artist: "Elevation Worship",
    original_key: "A",
    bpm: 127,
    category: "joyful",
    language: "English",
    tags: ["praise", "high-energy", "opener"],
    default_structure: STANDARD_JOYFUL_STRUCTURE,
  },
  {
    title: "This Is Amazing Grace",
    artist: "Phil Wickham",
    original_key: "Bb",
    bpm: 98,
    category: "joyful",
    language: "English",
    tags: ["grace", "upbeat"],
    default_structure: STANDARD_JOYFUL_STRUCTURE,
  },
  {
    title: "Alive",
    artist: "Hillsong Young & Free",
    original_key: "D",
    bpm: 130,
    category: "joyful",
    language: "English",
    tags: ["youth", "celebration"],
    default_structure: STANDARD_JOYFUL_STRUCTURE,
  },
  {
    title: "Joy of the Lord",
    artist: "Rend Collective",
    original_key: "G",
    bpm: 124,
    category: "joyful",
    language: "English",
    tags: ["joy", "celebration"],
    default_structure: STANDARD_JOYFUL_STRUCTURE,
  },
  {
    title: "Glorious Day",
    artist: "Passion",
    original_key: "D",
    bpm: 110,
    category: "joyful",
    language: "English",
    tags: ["salvation", "praise"],
    default_structure: STANDARD_JOYFUL_STRUCTURE,
  },
  {
    title: "Goodness of God",
    artist: "Bethel Music",
    original_key: "Ab",
    bpm: 63,
    category: "worship",
    language: "English",
    tags: ["faithfulness", "adoration"],
    default_structure: STANDARD_WORSHIP_STRUCTURE,
  },
  {
    title: "Holy Forever",
    artist: "Chris Tomlin",
    original_key: "Db",
    bpm: 72,
    category: "worship",
    language: "English",
    tags: ["holiness", "anthem"],
    default_structure: STANDARD_WORSHIP_STRUCTURE,
  },
  {
    title: "Way Maker",
    artist: "Sinach / Leeland",
    original_key: "E",
    bpm: 68,
    category: "worship",
    language: "English",
    tags: ["faith", "miracles", "declaration"],
    default_structure: STANDARD_WORSHIP_STRUCTURE,
  },
  {
    title: "Gratitude",
    artist: "Brandon Lake",
    original_key: "B",
    bpm: 78,
    category: "worship",
    language: "English",
    tags: ["thanksgiving", "acoustic"],
    default_structure: STANDARD_WORSHIP_STRUCTURE,
  },
  {
    title: "10,000 Reasons (Bless the Lord)",
    artist: "Matt Redman",
    original_key: "G",
    bpm: 73,
    category: "worship",
    language: "English",
    tags: ["classic", "praise"],
    default_structure: STANDARD_WORSHIP_STRUCTURE,
  },
  {
    title: "What A Beautiful Name",
    artist: "Hillsong Worship",
    original_key: "D",
    bpm: 68,
    category: "worship",
    language: "English",
    tags: ["jesus", "communion"],
    default_structure: STANDARD_WORSHIP_STRUCTURE,
  },
]

export async function seedSongsToDatabase(): Promise<{
  inserted: number
  error?: string
}> {
  try {
    const supabase = createClient()
    const { data: existing } = await supabase.from("songs").select("title")
    const existingTitles = new Set(
      (existing || []).map((s: any) => s.title.toLowerCase().trim())
    )

    const toInsert = SEED_SONGS.filter(
      (s) => !existingTitles.has(s.title.toLowerCase().trim())
    )

    if (toInsert.length === 0) {
      return { inserted: 0 }
    }

    const { error } = await supabase.from("songs").insert(toInsert)
    if (error) {
      return { inserted: 0, error: error.message }
    }

    return { inserted: toInsert.length }
  } catch (err: unknown) {
    return {
      inserted: 0,
      error: err instanceof Error ? err.message : "Failed to seed database",
    }
  }
}
