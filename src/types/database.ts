export type UserRole = "admin" | "song_leader" | "member"

export type SongCategory = "joyful" | "worship"

export type PracticeStatusType = "ready" | "needs_work" | "not_started"

export type SetlistStatus = "draft" | "published" | "archived"

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string | null
  role: UserRole
  instrument: string
  vocal_range?: string | null
  created_at?: string
  updated_at?: string
}

export interface SongSection {
  id: string
  name: string // "Intro", "Verse 1", "Chorus", "Bridge", etc.
  type: "intro" | "verse" | "pre_chorus" | "chorus" | "bridge" | "instrumental" | "outro" | "tag"
  bars?: number
  repeats?: number
  notes?: string // "drums drop here", "guitar solo 4 bars"
}

export interface Song {
  id: string
  title: string
  artist: string
  original_key: string
  bpm?: number | null
  category: SongCategory
  language: string
  lyrics?: string | null
  default_structure?: SongSection[] | null
  reference_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface ChordChart {
  id: string
  song_id: string
  key: string
  chart_content: string
  is_ai_generated: boolean
  last_edited_by?: string | null
  created_at?: string
  updated_at?: string
}

export interface Setlist {
  id: string
  service_date: string
  song_leader_id: string
  backup_singer_id?: string | null
  drummer_id?: string | null
  status: SetlistStatus
  published_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface SetlistSong {
  id: string
  setlist_id: string
  song_id: string
  order_position: number
  assigned_key: string
  reference_url?: string | null
  custom_structure?: SongSection[] | null
  section_notes?: Record<string, string> | null
  category: SongCategory
  created_at?: string
}

export interface SongLeaderKey {
  id: string
  song_leader_id: string
  song_id: string
  preferred_key: string
  last_used: string
}

export interface PracticeStatus {
  id: string
  user_id: string
  setlist_song_id: string
  status: PracticeStatusType
  private_notes?: string | null
  updated_at: string
}
