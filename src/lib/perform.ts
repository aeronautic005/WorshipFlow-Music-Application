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
