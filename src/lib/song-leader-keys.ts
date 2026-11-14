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
