import type { FullSetlist } from "@/lib/setlists"
import type { SongSection } from "@/types/database"
import { STRUCTURE_PRESETS } from "@/types/structure"
import type { LiveSong } from "@/components/perform/live-song-view"

/**
 * Convert a setlist into an ordered list of songs ready for live performance.
 * Falls back to a category-appropriate preset if a song has no blueprint yet,
 * so the team always has a structure to follow on stage.
 */
export function buildLiveSongs(setlist: FullSetlist): LiveSong[] {
  return [...(setlist.songs || [])]
    .sort((a, b) => a.order_position - b.order_position)
    .map((s) => {
      let structure: SongSection[] = s.custom_structure || s.default_structure || []
      if (structure.length === 0) {
        const preset =
          STRUCTURE_PRESETS.find((p) => p.category === s.category) || STRUCTURE_PRESETS[0]
        structure = preset.sections.map((sec, i) => ({ ...sec, id: `${s.id}-preset-${i}` }))
      }
      return {
        id: s.id,
        song_id: s.song_id,
        title: s.title,
        artist: s.artist,
        assigned_key: s.assigned_key,
        original_key: s.original_key,
        bpm: s.bpm,
        category: s.category,
        structure,
      }
    })
}

export interface PerformanceSessionLog {
  id: string
  setlist_id: string
  service_date: string
  started_at: string
  ended_at?: string
  total_duration_seconds?: number
  songs_played_count: number
  leader_name?: string
  drummer_name?: string
}

const SESSION_STORAGE_KEY = "worshipflow_performance_sessions_v1"

export function getPerformanceSessionLogs(): PerformanceSessionLog[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function startPerformanceSession(params: {
  setlistId: string
  serviceDate: string
  songsCount: number
  leaderName?: string
  drummerName?: string
}): PerformanceSessionLog {
  const all = getPerformanceSessionLogs()
  const newSession: PerformanceSessionLog = {
    id: `sess-${Date.now()}`,
    setlist_id: params.setlistId,
    service_date: params.serviceDate,
    started_at: new Date().toISOString(),
    songs_played_count: params.songsCount,
    leader_name: params.leaderName,
    drummer_name: params.drummerName,
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify([newSession, ...all]))
  }

  return newSession
}

export function endPerformanceSession(
  sessionId: string
): PerformanceSessionLog | null {
  const all = getPerformanceSessionLogs()
  const idx = all.findIndex((s) => s.id === sessionId)
  if (idx < 0) return null

  const session = all[idx]
  const endedAt = new Date().toISOString()
  const startMs = new Date(session.started_at).getTime()
  const endMs = new Date(endedAt).getTime()
  const totalSeconds = Math.max(0, Math.round((endMs - startMs) / 1000))

  const updated: PerformanceSessionLog = {
    ...session,
    ended_at: endedAt,
    total_duration_seconds: totalSeconds,
  }

  all[idx] = updated
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(all))
  }

  return updated
}
