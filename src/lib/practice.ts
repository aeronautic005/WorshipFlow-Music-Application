import { createClient } from "@/lib/supabase/client"
import type { PracticeStatusType } from "@/types/database"

export interface PracticeStatusRecord {
  id: string
  user_id: string
  user_name?: string
  instrument?: string
  setlist_id: string
  song_id: string
  song_title?: string
  status: PracticeStatusType
  confidence_rating?: number
  private_notes?: string | null
  last_practiced_at: string
}

export interface SongReadinessSummary {
  song_id: string
  song_title: string
  ready_count: number
  needs_work_count: number
  not_started_count: number
  total_members: number
  percent_ready: number
}

// Local mock storage key for offline / unauthenticated practice persistence
const PRACTICE_STORAGE_KEY = "worshipflow_practice_status_v1"

// Pre-seeded practice readiness from team members (France, Aeron, Andrei, Kyle)
export const DEFAULT_PRACTICE_STATUSES: PracticeStatusRecord[] = [
  {
    id: "ps-1",
    user_id: "france-id",
    user_name: "France",
    instrument: "Vocals",
    setlist_id: "sl-nov15",
    song_id: "s1",
    song_title: "Thank God I'm Free",
    status: "ready",
    confidence_rating: 5,
    private_notes: "Key of G memorized, vocal lead lines dialed in.",
    last_practiced_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "ps-2",
    user_id: "aeron-id",
    user_name: "Aeron",
    instrument: "Drums",
    setlist_id: "sl-nov15",
    song_id: "s1",
    song_title: "Thank God I'm Free",
    status: "ready",
    confidence_rating: 5,
    private_notes: "High energy tempo 128 bpm, clean kick pattern on intro.",
    last_practiced_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "ps-3",
    user_id: "aeron-id",
    user_name: "Aeron",
    instrument: "Drums",
    setlist_id: "sl-nov15",
    song_id: "s6",
    song_title: "Jesus Be The Center",
    status: "ready",
    confidence_rating: 4,
    private_notes: "Remember to drop out on the bridge, voices only.",
    last_practiced_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "ps-4",
    user_id: "andrei-id",
    user_name: "Andrei",
    instrument: "Vocals",
    setlist_id: "sl-nov15",
    song_id: "s6",
    song_title: "Jesus Be The Center",
    status: "needs_work",
    confidence_rating: 3,
    private_notes: "Practicing 3rd harmony on chorus 2.",
    last_practiced_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "ps-5",
    user_id: "aeron-id",
    user_name: "Aeron",
    instrument: "Drums",
    setlist_id: "sl-nov15",
    song_id: "s7",
    song_title: "Shout To The Lord",
    status: "needs_work",
    confidence_rating: 3,
    private_notes: "Smooth cymbal swells into Chorus.",
    last_practiced_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
]

export function getLocalPracticeStatuses(): PracticeStatusRecord[] {
  if (typeof window === "undefined") return DEFAULT_PRACTICE_STATUSES
  try {
    const raw = localStorage.getItem(PRACTICE_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(DEFAULT_PRACTICE_STATUSES))
      return DEFAULT_PRACTICE_STATUSES
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_PRACTICE_STATUSES
  }
}

export async function getUserPracticeStatus(
  userId: string,
  setlistId: string,
  songId: string
): Promise<PracticeStatusRecord | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from("practice_status")
      .select("*")
      .eq("user_id", userId)
      .eq("setlist_id", setlistId)
      .eq("song_id", songId)
      .maybeSingle()

    if (data) return data as PracticeStatusRecord
  } catch {
    // Fall back to local
  }

  const local = getLocalPracticeStatuses()
  return (
    local.find(
      (r) =>
        (r.user_id === userId || userId === "current-user") &&
        r.setlist_id === setlistId &&
        r.song_id === songId
    ) || null
  )
}

export async function updatePracticeStatus(params: {
  userId: string
  userName?: string
  instrument?: string
  setlistId: string
  songId: string
  songTitle?: string
  status: PracticeStatusType
  confidenceRating?: number
  privateNotes?: string
}): Promise<{ success: boolean; data?: PracticeStatusRecord; error?: string }> {
  const updatedRecord: PracticeStatusRecord = {
    id: `ps-${Date.now()}`,
    user_id: params.userId,
    user_name: params.userName || "Musician",
    instrument: params.instrument || "Instrument",
    setlist_id: params.setlistId,
    song_id: params.songId,
    song_title: params.songTitle || "Song",
    status: params.status,
    confidence_rating: params.confidenceRating ?? 3,
    private_notes: params.privateNotes,
    last_practiced_at: new Date().toISOString(),
  }

  // Update in local storage
  if (typeof window !== "undefined") {
    const all = getLocalPracticeStatuses()
    const idx = all.findIndex(
      (r) =>
        r.setlist_id === params.setlistId &&
        r.song_id === params.songId &&
        (r.user_id === params.userId || params.userId === "current-user")
    )
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...updatedRecord, id: all[idx].id }
    } else {
      all.push(updatedRecord)
    }
    localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(all))
  }

  // Persist to Supabase if available
  try {
    const supabase = createClient()
    await supabase.from("practice_status").upsert(
      {
        user_id: params.userId,
        setlist_id: params.setlistId,
        song_id: params.songId,
        status: params.status,
        confidence_rating: params.confidenceRating ?? 3,
        private_notes: params.privateNotes,
        last_practiced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,setlist_id,song_id" }
    )
  } catch {
    // Handled by local storage fallback
  }

  return { success: true, data: updatedRecord }
}

export async function getTeamReadinessForSetlist(
  setlistId: string
): Promise<{ statuses: PracticeStatusRecord[]; summaries: SongReadinessSummary[] }> {
  let allStatuses = getLocalPracticeStatuses().filter((s) => s.setlist_id === setlistId)

  try {
    const supabase = createClient()
    const { data } = await supabase
      .from("practice_status")
      .select(`
        *,
        profiles:user_id(name, instrument)
      `)
      .eq("setlist_id", setlistId)

    if (data && data.length > 0) {
      allStatuses = data.map((d: any) => ({
        ...d,
        user_name: d.profiles?.name || d.user_name || "Musician",
        instrument: d.profiles?.instrument || d.instrument,
      }))
    }
  } catch {
    // Fallback to local
  }

  // Group by song_id
  const songMap = new Map<string, PracticeStatusRecord[]>()
  allStatuses.forEach((st) => {
    const existing = songMap.get(st.song_id) || []
    existing.push(st)
    songMap.set(st.song_id, existing)
  })

  const summaries: SongReadinessSummary[] = []
  songMap.forEach((records, songId) => {
    const ready = records.filter((r) => r.status === "ready").length
    const needsWork = records.filter((r) => r.status === "needs_work").length
    const notStarted = records.filter((r) => r.status === "not_started").length
    const total = records.length
    summaries.push({
      song_id: songId,
      song_title: records[0]?.song_title || "Song",
      ready_count: ready,
      needs_work_count: needsWork,
      not_started_count: notStarted,
      total_members: total,
      percent_ready: total > 0 ? Math.round((ready / total) * 100) : 0,
    })
  })

  return { statuses: allStatuses, summaries }
}
