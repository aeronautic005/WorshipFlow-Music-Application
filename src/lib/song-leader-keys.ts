import { createClient } from "@/lib/supabase/client"
import type { SongLeaderKey } from "@/types/database"

// Default leader key memory initialized from the church worship team's history
const DEFAULT_LEADER_KEYS: Record<string, Record<string, string>> = {
  // Leader Name / ID -> Song Title / ID -> Preferred Key
  maegan: {
    "Holy Forever": "G",
    "Awit ng Pagsamba": "E",
    "The Joy": "D",
    "Praise": "G",
  },
  france: {
    "Thank God I'm Free": "G",
    "Jesus Be The Center": "D",
    "Shout To The Lord": "A",
  },
  deanne: {
    "Ako'y Nagtitiwala Sa'yo": "D",
    "Araw-Araw": "E",
    "Hesus Dakila Ka": "D",
    "Liyab": "G",
  },
  argel: {
    "Alay Sa'yo": "A",
    "May Galak": "D",
    "I Trust In God": "C",
  },
}

export async function getPreferredKeyForLeader(
  leaderId: string,
  songId: string,
  songTitle?: string
): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from("song_leader_keys")
      .select("preferred_key")
      .eq("song_leader_id", leaderId)
      .eq("song_id", songId)
      .maybeSingle()

    if (data?.preferred_key) {
      return data.preferred_key
    }
  } catch {
    // Fallback to local memory lookup
  }

  // Lookup in default leader keys
  if (songTitle) {
    for (const [leaderKey, songs] of Object.entries(DEFAULT_LEADER_KEYS)) {
      if (leaderId.toLowerCase().includes(leaderKey)) {
        if (songs[songTitle]) {
          return songs[songTitle]
        }
      }
    }
  }

  return null
}

export interface SongLeaderKeyHistoryItem {
  leader_id: string
  leader_name: string
  preferred_key: string
  last_used?: string
  times_led?: number
  notes?: string
}

export async function getSongKeyHistory(
  songId: string,
  songTitle?: string
): Promise<SongLeaderKeyHistoryItem[]> {
  const history: SongLeaderKeyHistoryItem[] = []

  // Check Supabase first
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from("song_leader_keys")
      .select(`
        preferred_key,
        last_used,
        profiles:song_leader_id(id, name)
      `)
      .eq("song_id", songId)

    if (data && data.length > 0) {
      data.forEach((item: any) => {
        history.push({
          leader_id: item.profiles?.id || "unknown",
          leader_name: item.profiles?.name || "Vocal Leader",
          preferred_key: item.preferred_key,
          last_used: item.last_used,
        })
      })
    }
  } catch {
    // Fall through to memory
  }

  // Populate from church defaults if empty or incomplete
  const leaderNameMap: Record<string, string> = {
    france: "France",
    maegan: "Maegan",
    deanne: "Deanne",
    argel: "Argel",
    andrei: "Andrei",
  }

  if (songTitle) {
    for (const [leaderKey, songs] of Object.entries(DEFAULT_LEADER_KEYS)) {
      if (songs[songTitle]) {
        const leaderName = leaderNameMap[leaderKey] || leaderKey
        const exists = history.some((h) => h.leader_name.toLowerCase() === leaderName.toLowerCase())
        if (!exists) {
          history.push({
            leader_id: `${leaderKey}-id`,
            leader_name: leaderName,
            preferred_key: songs[songTitle],
            last_used: "2026-11-01T00:00:00Z",
            times_led: 3,
            notes: `Standard Sunday key for ${leaderName}`,
          })
        }
      }
    }
  }

  return history
}

export async function recordSongLeaderKey(
  leaderId: string,
  songId: string,
  preferredKey: string
): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from("song_leader_keys").upsert(
      {
        song_leader_id: leaderId,
        song_id: songId,
        preferred_key: preferredKey,
        last_used: new Date().toISOString(),
      },
      { onConflict: "song_leader_id,song_id" }
    )
  } catch (err) {
    console.error("Failed to record song leader key:", err)
  }
}
