import { createClient } from "@/lib/supabase/client"
import type { Setlist, SetlistSong, SetlistStatus, SongCategory } from "@/types/database"

export interface FullSetlist extends Setlist {
  song_leader_name?: string
  backup_singer_name?: string
  drummer_name?: string
  songs?: (SetlistSong & {
    title: string
    artist: string
    original_key: string
    bpm?: number | null
  })[]
}

// Sample setlists initialized directly from the user's church rotation sheet
export const DEFAULT_CHURCH_SETLISTS: FullSetlist[] = [
  {
    id: "sl-nov15",
    service_date: "2026-11-15",
    song_leader_id: "france-id",
    song_leader_name: "France",
    backup_singer_id: "andrei-id",
    backup_singer_name: "Andrei",
    drummer_id: "aeron-id",
    drummer_name: "Aeron",
    status: "published",
    published_at: "2026-11-10T08:00:00Z",
    notes: "Communion service this Sunday afternoon. Smooth transition between Thank God I'm Free and Jesus Be The Center.",
    songs: [
      {
        id: "ss-1",
        setlist_id: "sl-nov15",
        song_id: "s1",
        title: "Thank God I'm Free",
        artist: "The Nelons",
        original_key: "G",
        assigned_key: "G",
        order_position: 1,
        category: "joyful",
        bpm: 128,
        reference_url: "https://www.youtube.com",
      },
      {
        id: "ss-2",
        setlist_id: "sl-nov15",
        song_id: "s6",
        title: "Jesus Be The Center",
        artist: "Israel Houghton",
        original_key: "D",
        assigned_key: "D",
        order_position: 2,
        category: "worship",
        bpm: 68,
        reference_url: "https://www.youtube.com",
      },
      {
        id: "ss-3",
        setlist_id: "sl-nov15",
        song_id: "s7",
        title: "Shout To The Lord",
        artist: "Hillsong Worship",
        original_key: "A",
        assigned_key: "A",
        order_position: 3,
        category: "worship",
        bpm: 76,
        reference_url: "https://www.youtube.com",
      },
    ],
  },
  {
    id: "sl-nov22",
    service_date: "2026-11-22",
    song_leader_id: "maegan-id",
    song_leader_name: "Maegan",
    backup_singer_id: "deanne-id",
    backup_singer_name: "Deanne",
    drummer_id: "kyle-id",
    drummer_name: "Kyle",
    status: "published",
    published_at: "2026-11-12T08:00:00Z",
    notes: "Practice bridge build in Praise and Holy Forever.",
    songs: [
      {
        id: "ss-4",
        setlist_id: "sl-nov22",
        song_id: "s4",
        title: "Awit ng Pagsamba",
        artist: "Rommel Guevara",
        original_key: "E",
        assigned_key: "E",
        order_position: 1,
        category: "joyful",
        bpm: 120,
      },
      {
        id: "ss-5",
        setlist_id: "sl-nov22",
        song_id: "s10",
        title: "Heart of Worship",
        artist: "Matt Redman",
        original_key: "D",
        assigned_key: "D",
        order_position: 2,
        category: "worship",
        bpm: 70,
      },
      {
        id: "ss-6",
        setlist_id: "sl-nov22",
        song_id: "s5",
        title: "Holy Forever",
        artist: "Chris Tomlin",
        original_key: "Ab",
        assigned_key: "G",
        order_position: 3,
        category: "worship",
        bpm: 72,
      },
    ],
  },
]

export async function getSetlists(): Promise<FullSetlist[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("setlists")
      .select(`
        *,
        song_leader:profiles!setlists_song_leader_id_fkey(name),
        backup_singer:profiles!setlists_backup_singer_id_fkey(name),
        drummer:profiles!setlists_drummer_id_fkey(name),
        setlist_songs(
          *,
          song:songs(title, artist, original_key, bpm)
        )
      `)
      .order("service_date", { ascending: false })

    if (error || !data || data.length === 0) {
      return DEFAULT_CHURCH_SETLISTS
    }

    return data.map((item: any) => ({
      ...item,
      song_leader_name: item.song_leader?.name || "Leader",
      backup_singer_name: item.backup_singer?.name || null,
      drummer_name: item.drummer?.name || null,
      songs: (item.setlist_songs || []).map((ss: any) => ({
        ...ss,
        title: ss.song?.title || "Song",
        artist: ss.song?.artist || "",
        original_key: ss.song?.original_key || ss.assigned_key,
        bpm: ss.song?.bpm,
      })),
    }))
  } catch {
    return DEFAULT_CHURCH_SETLISTS
  }
}

export async function getSetlistById(id: string): Promise<FullSetlist | null> {
  const all = await getSetlists()
  return all.find((s) => s.id === id) || null
}

export async function createSetlist(
  setlistData: {
    service_date: string
    song_leader_id: string
    backup_singer_id?: string | null
    drummer_id?: string | null
    status: SetlistStatus
    notes?: string | null
    songs: {
      song_id: string
      order_position: number
      assigned_key: string
      reference_url?: string | null
      category: SongCategory
    }[]
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = createClient()
    const { data: setlist, error: setlistErr } = await supabase
      .from("setlists")
      .insert({
        service_date: setlistData.service_date,
        song_leader_id: setlistData.song_leader_id,
        backup_singer_id: setlistData.backup_singer_id,
        drummer_id: setlistData.drummer_id,
        status: setlistData.status,
        notes: setlistData.notes,
        published_at: setlistData.status === "published" ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (setlistErr) return { success: false, error: setlistErr.message }

    // Insert songs
    if (setlistData.songs && setlistData.songs.length > 0) {
      const songsToInsert = setlistData.songs.map((s) => ({
        setlist_id: setlist.id,
        song_id: s.song_id,
        order_position: s.order_position,
        assigned_key: s.assigned_key,
        reference_url: s.reference_url,
        category: s.category,
      }))

      const { error: songsErr } = await supabase.from("setlist_songs").insert(songsToInsert)
      if (songsErr) return { success: false, error: songsErr.message }
    }

    return { success: true, data: setlist }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create setlist",
    }
  }
}
