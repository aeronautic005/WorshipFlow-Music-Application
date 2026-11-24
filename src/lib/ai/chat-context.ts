import { WORSHIP_SYSTEM_INSTRUCTION } from "@/lib/ai/prompts"
import type { Song } from "@/types/database"
import type { FullSetlist } from "@/lib/setlists"

export const TEAM_ROSTER_INFO = `CHURCH WORSHIP TEAM CONTEXT:
1. Schedule:
   - Weekday/Saturday: Private home practice & chord chart review.
   - Sunday 9:00 AM: Full-band rehearsal run-through (tuning, key flow, transitions, vocal harmonies).
   - Sunday 2:30 PM: Live Sunday Service performance.

2. Song Structure Rules:
   - 4 to 6 songs total per service.
   - 2 to 3 Joyful/Fast songs (110–135 BPM) to open praise with high energy.
   - 2 to 3 Worship/Slow songs (65–78 BPM) for intimate adoration and prayer.

3. Roster & Roles:
   - 5 Rotating Vocal Song Leaders:
     * France: Alto / Mezzo-Soprano (Comfort keys: G, A, Bb, C)
     * Maegan: Soprano / Mezzo (Comfort keys: C, D, E, F)
     * Deanne: Soprano / Alto (Comfort keys: F, G, Ab, Bb)
     * Argel: Tenor (Comfort keys: D, E, F, G)
     * Andrei: Baritone / Tenor (Comfort keys: C, D, E, Bb)
     (Note: When a song leader is not leading the week, they serve as backup vocalist or congregation support)
   - 2 Rotating Drummers: Kyle and Aeron (alternate weekly duty)
   - Rhythm & Instruments:
     * Keyboard 1: Acoustic Piano / Main chords
     * Keyboard 2: Ambient Worship Pad / Swell / Strings
     * Acoustic & Electric Guitars: Rhythm strumming, dynamic lead riffs
     * Bass Guitar: Root foundation and dynamic pocket`

/**
 * Builds dynamic context injecting the church's roster, song library, and active setlist into Gemini chat
 */
export function buildWorshipTeamContext(params?: {
  songs?: Song[]
  activeSetlist?: FullSetlist | null
}): string {
  const parts: string[] = [WORSHIP_SYSTEM_INSTRUCTION, TEAM_ROSTER_INFO]

  if (params?.activeSetlist) {
    const s = params.activeSetlist
    const setlistSummary = `ACTIVE UPCOMING SETLIST:
- Service Date: ${s.service_date}
- Song Leader on Duty: ${s.song_leader_name || "Assigned"}
- Backup Singer: ${s.backup_singer_name || "Solo / None"}
- Drummer on Duty: ${s.drummer_name || "Rotation"}
- Songs Selected:
${(s.songs || [])
  .map(
    (song, idx) =>
      `  ${idx + 1}. "${song.title}" in Key of ${song.assigned_key} [${song.category.toUpperCase()}]`
  )
  .join("\n")}`

    parts.push(setlistSummary)
  }

  if (params?.songs && params.songs.length > 0) {
    const songList = params.songs
      .slice(0, 30)
      .map((song) => `"${song.title}" (${song.artist}) - Key of ${song.original_key} [${song.category}]`)
      .join(", ")

    parts.push(`CHURCH REPERTOIRE CATALOG:\n${songList}`)
  }

  return parts.join("\n\n")
}
