import { createClient } from "@/lib/supabase/client"
import type { Song, SongCategory } from "@/types/database"

// Pre-seeded songs from the church worship team's active rotation
export const DEFAULT_CHURCH_SONGS: Song[] = [
  {
    id: "s1",
    title: "Thank God I'm Free",
    artist: "The Nelons",
    original_key: "G",
    bpm: 128,
    category: "joyful",
    language: "English",
    reference_url: "https://www.youtube.com",
    lyrics: "Through blood and grace, my soul is redeemed...",
    created_at: new Date().toISOString(),
  },
  {
    id: "s2",
    title: "Ako'y Nagtitiwala Sa'yo",
    artist: "Faithmusic Manila",
    original_key: "D",
    bpm: 115,
    category: "joyful",
    language: "Tagalog",
    reference_url: "https://www.youtube.com",
    lyrics: "Ako'y nagtitiwala sa'yo, Panginoon aking Diyos...",
    created_at: new Date().toISOString(),
  },
  {
    id: "s3",
    title: "Araw-Araw",
    artist: "Victory Worship",
    original_key: "E",
    bpm: 125,
    category: "joyful",
    language: "Tagalog",
    reference_url: "https://www.youtube.com",
    lyrics: "Araw-araw magpupuri, araw-araw aawit...",
    created_at: new Date().toISOString(),
  },
  {
    id: "s4",
    title: "Awit ng Pagsamba",
    artist: "Rommel Guevara",
    original_key: "E",
    bpm: 120,
    category: "joyful",
    language: "Tagalog",
    reference_url: "https://www.youtube.com",
    lyrics: "Purihin ang Panginoon, magpasalamat sa Kanya...",
    created_at: new Date().toISOString(),
  },
  {
    id: "s5",
    title: "Holy Forever",
    artist: "Chris Tomlin / CeCe Winans",
    original_key: "Ab",
    bpm: 72,
    category: "worship",
    language: "English",
    reference_url: "https://www.youtube.com",
    lyrics: "A thousand generations falling in that wonder...",
    created_at: new Date().toISOString(),
  },
  {
    id: "s6",
    title: "Jesus Be The Center",
    artist: "Israel Houghton",
    original_key: "D",
    bpm: 68,
    category: "worship",
    language: "English",
    reference_url: "https://www.youtube.com",
    lyrics: "Jesus be the center, be my source, be my light...",
    created_at: new Date().toISOString(),
  },
  {
    id: "s7",
    title: "Shout To The Lord",
    artist: "Hillsong Worship",
    original_key: "A",
    bpm: 76,
    category: "worship",
    language: "English",
    reference_url: "https://www.youtube.com",
    lyrics: "My Jesus, my Savior, Lord there is none like You...",
    created_at: new Date().toISOString(),
  },
  {
    id: "s8",
    title: "I Trust In God",
    artist: "Elevation Worship",
    original_key: "C",
    bpm: 74,
    category: "worship",
    language: "English",
    reference_url: "https://www.youtube.com",
    lyrics: "Blessed assurance, Jesus is mine...",
    created_at: new Date().toISOString(),
  },
  {
    id: "s9",
    title: "Hesus Dakila Ka",
    artist: "Musikatha",
    original_key: "D",
    bpm: 118,
    category: "joyful",
    language: "Tagalog",
    reference_url: "https://www.youtube.com",
    lyrics: "Hesus dakila Ka sa lahat ng panahon...",
    created_at: new Date().toISOString(),
  },
  {
    id: "s10",
    title: "Heart of Worship",
    artist: "Matt Redman",
    original_key: "D",
    bpm: 70,
    category: "worship",
    language: "English",
    reference_url: "https://www.youtube.com",
    lyrics: "When the music fades, all is stripped away...",
    created_at: new Date().toISOString(),
  },
]

export async function getSongs(filter?: {
  category?: SongCategory
  search?: string
  key?: string
}): Promise<Song[]> {
  try {
    const supabase = createClient()
    let query = supabase.from("songs").select("*").order("title", { ascending: true })

    if (filter?.category) {
      query = query.eq("category", filter.category)
    }

    if (filter?.key) {
      query = query.eq("original_key", filter.key)
    }

    if (filter?.search && filter.search.trim()) {
      query = query.ilike("title", `%${filter.search.trim()}%`)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      // Return pre-seeded list filtered locally if DB is connecting
      return filterDefaultSongs(filter)
    }

    return data as Song[]
  } catch {
    return filterDefaultSongs(filter)
  }
}

function filterDefaultSongs(filter?: {
  category?: SongCategory
  search?: string
  key?: string
}): Song[] {
  let result = [...DEFAULT_CHURCH_SONGS]

  if (filter?.category) {
    result = result.filter((s) => s.category === filter.category)
  }

  if (filter?.key) {
    result = result.filter((s) => s.original_key === filter.key)
  }

  if (filter?.search && filter.search.trim()) {
    const searchLower = filter.search.trim().toLowerCase()
    result = result.filter(
      (s) =>
        s.title.toLowerCase().includes(searchLower) ||
        s.artist.toLowerCase().includes(searchLower)
    )
  }

  return result
}

export async function getSongById(id: string): Promise<Song | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("songs").select("*").eq("id", id).single()

    if (error || !data) {
      const fallback = DEFAULT_CHURCH_SONGS.find((s) => s.id === id)
      return fallback || null
    }

    return data as Song
  } catch {
    return DEFAULT_CHURCH_SONGS.find((s) => s.id === id) || null
  }
}

export async function createSong(
  songData: Omit<Song, "id" | "created_at" | "updated_at">
): Promise<{ success: boolean; data?: Song; error?: string }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("songs")
      .insert([songData])
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Song }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create song",
    }
  }
}

export async function updateSong(
  id: string,
  updates: Partial<Song>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("songs")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update song",
    }
  }
}

export async function deleteSong(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("songs").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete song",
    }
  }
}
