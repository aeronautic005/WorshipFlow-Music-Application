import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getSongs } from "@/lib/songs"
import type { SongCategory } from "@/types/database"

export interface SongHistoryEntry {
  id: string
  song_id: string
  song_title: string
  artist: string
  category: SongCategory
  original_key: string
  assigned_key: string
  leader_name: string
  played_date: string
}

export interface SongPlayStat {
  songId: string
  title: string
  artist: string
  category: SongCategory
  originalKey: string
  playCount: number
  lastPlayedDate: string | null
  daysSincePlayed: number | null
  leadersUsed: string[]
  keysUsed: string[]
}

export interface LeaderAnalyticsStat {
  leaderName: string
  vocalProfile: string
  totalServicesLed: number
  totalSongsLed: number
  joyfulCount: number
  worshipCount: number
  preferredKeys: Array<{ key: string; count: number }>
  topSongs: Array<{ title: string; count: number; key: string }>
  lastLedDate: string | null
}

function daysBetween(dateStr: string): number {
  const then = new Date(dateStr).getTime()
  const now = Date.now()
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)))
}

function getMockHistorySeed(): SongHistoryEntry[] {
  const daysAgo = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString().split("T")[0]
  }

  return [
    {
      id: "hist-1",
      song_id: "song-1",
      song_title: "Goodness of God",
      artist: "Bethel Music",
      category: "worship",
      original_key: "Ab",
      assigned_key: "G",
      leader_name: "France",
      played_date: daysAgo(7),
    },
    {
      id: "hist-2",
      song_id: "song-2",
      song_title: "House of the Lord",
      artist: "Phil Wickham",
      category: "joyful",
      original_key: "Bb",
      assigned_key: "G",
      leader_name: "France",
      played_date: daysAgo(7),
    },
    {
      id: "hist-3",
      song_id: "song-3",
      song_title: "Holy Forever",
      artist: "Chris Tomlin",
      category: "worship",
      original_key: "Db",
      assigned_key: "C",
      leader_name: "Maegan",
      played_date: daysAgo(14),
    },
    {
      id: "hist-4",
      song_id: "song-4",
      song_title: "This Is Amazing Grace",
      artist: "Phil Wickham",
      category: "joyful",
      original_key: "Bb",
      assigned_key: "A",
      leader_name: "Maegan",
      played_date: daysAgo(14),
    },
    {
      id: "hist-5",
      song_id: "song-5",
      song_title: "Way Maker",
      artist: "Sinach / Leeland",
      category: "worship",
      original_key: "E",
      assigned_key: "D",
      leader_name: "Andrei",
      played_date: daysAgo(21),
    },
    {
      id: "hist-6",
      song_id: "song-6",
      song_title: "Alive",
      artist: "Hillsong Young & Free",
      category: "joyful",
      original_key: "D",
      assigned_key: "D",
      leader_name: "Andrei",
      played_date: daysAgo(21),
    },
    {
      id: "hist-7",
      song_id: "song-7",
      song_title: "Gratitude",
      artist: "Brandon Lake",
      category: "worship",
      original_key: "B",
      assigned_key: "G",
      leader_name: "Argel",
      played_date: daysAgo(28),
    },
    {
      id: "hist-8",
      song_id: "song-8",
      song_title: "Praise",
      artist: "Elevation Worship",
      category: "joyful",
      original_key: "A",
      assigned_key: "G",
      leader_name: "Argel",
      played_date: daysAgo(28),
    },
    {
      id: "hist-9",
      song_id: "song-1",
      song_title: "Goodness of God",
      artist: "Bethel Music",
      category: "worship",
      original_key: "Ab",
      assigned_key: "F",
      leader_name: "Deanne",
      played_date: daysAgo(35),
    },
    {
      id: "hist-10",
      song_id: "song-9",
      song_title: "10,000 Reasons",
      artist: "Matt Redman",
      category: "worship",
      original_key: "G",
      assigned_key: "G",
      leader_name: "Deanne",
      played_date: daysAgo(70),
    },
    {
      id: "hist-11",
      song_id: "song-10",
      song_title: "What A Beautiful Name",
      artist: "Hillsong Worship",
      category: "worship",
      original_key: "D",
      assigned_key: "C",
      leader_name: "France",
      played_date: daysAgo(84),
    },
  ]
}

export async function getSongHistoryEntries(): Promise<SongHistoryEntry[]> {
  if (!isSupabaseConfigured()) {
    return getMockHistorySeed()
  }
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("song_history")
      .select(
        "id, song_id, assigned_key, leader_name, played_date, category, songs(title, artist, original_key)"
      )
      .order("played_date", { ascending: false })

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        song_id: row.song_id,
        song_title: row.songs?.title || "Untitled Song",
        artist: row.songs?.artist || "Unknown Artist",
        category: (row.category || "worship") as SongCategory,
        original_key: row.songs?.original_key || row.assigned_key,
        assigned_key: row.assigned_key,
        leader_name: row.leader_name || "Worship Leader",
        played_date: row.played_date,
      }))
    }
  } catch {
    // Fall back to mock history when offline/unconfigured
  }

  return getMockHistorySeed()
}

export async function getSongPlayStats(): Promise<SongPlayStat[]> {
  const [songs, history] = await Promise.all([getSongs(), getSongHistoryEntries()])

  const statsMap = new Map<string, SongPlayStat>()

  for (const s of songs) {
    statsMap.set(s.title.toLowerCase(), {
      songId: s.id,
      title: s.title,
      artist: s.artist,
      category: s.category,
      originalKey: s.original_key,
      playCount: 0,
      lastPlayedDate: null,
      daysSincePlayed: null,
      leadersUsed: [],
      keysUsed: [],
    })
  }

  for (const entry of history) {
    const key = entry.song_title.toLowerCase()
    let stat = statsMap.get(key)

    if (!stat) {
      stat = {
        songId: entry.song_id,
        title: entry.song_title,
        artist: entry.artist,
        category: entry.category,
        originalKey: entry.original_key,
        playCount: 0,
        lastPlayedDate: null,
        daysSincePlayed: null,
        leadersUsed: [],
        keysUsed: [],
      }
      statsMap.set(key, stat)
    }

    stat.playCount += 1
    if (!stat.lastPlayedDate || entry.played_date > stat.lastPlayedDate) {
      stat.lastPlayedDate = entry.played_date
      stat.daysSincePlayed = daysBetween(entry.played_date)
    }
    if (entry.leader_name && !stat.leadersUsed.includes(entry.leader_name)) {
      stat.leadersUsed.push(entry.leader_name)
    }
    if (entry.assigned_key && !stat.keysUsed.includes(entry.assigned_key)) {
      stat.keysUsed.push(entry.assigned_key)
    }
  }

  return Array.from(statsMap.values()).sort((a, b) => b.playCount - a.playCount)
}

const LEADER_PROFILES: Record<string, string> = {
  France: "Alto / Mezzo-Soprano",
  Maegan: "Soprano / Mezzo",
  Deanne: "Alto / Soprano",
  Argel: "Tenor",
  Andrei: "Baritone / Tenor",
}

export async function getLeaderHistoryStats(): Promise<LeaderAnalyticsStat[]> {
  const history = await getSongHistoryEntries()
  const leaderNames = ["France", "Maegan", "Deanne", "Argel", "Andrei"]

  const result: LeaderAnalyticsStat[] = leaderNames.map((name) => {
    const entries = history.filter(
      (h) => h.leader_name.toLowerCase() === name.toLowerCase()
    )

    const uniqueDates = new Set(entries.map((e) => e.played_date))
    const keyCounts = new Map<string, number>()
    const songMap = new Map<string, { title: string; count: number; key: string }>()

    let joyfulCount = 0
    let worshipCount = 0
    let lastLedDate: string | null = null

    for (const e of entries) {
      if (e.category === "joyful") joyfulCount += 1
      else worshipCount += 1

      if (!lastLedDate || e.played_date > lastLedDate) {
        lastLedDate = e.played_date
      }

      keyCounts.set(e.assigned_key, (keyCounts.get(e.assigned_key) || 0) + 1)

      const existingSong = songMap.get(e.song_title)
      if (existingSong) {
        existingSong.count += 1
      } else {
        songMap.set(e.song_title, {
          title: e.song_title,
          count: 1,
          key: e.assigned_key,
        })
      }
    }

    const preferredKeys = Array.from(keyCounts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)

    const topSongs = Array.from(songMap.values()).sort((a, b) => b.count - a.count)

    return {
      leaderName: name,
      vocalProfile: LEADER_PROFILES[name] || "Vocal Lead",
      totalServicesLed: uniqueDates.size,
      totalSongsLed: entries.length,
      joyfulCount,
      worshipCount,
      preferredKeys,
      topSongs,
      lastLedDate,
    }
  })

  return result
}

export interface RepeatWarning {
  songTitle: string
  daysAgo: number
  lastPlayedDate: string
  lastLeaderName: string
  assignedKey: string
}

/**
 * Checks selected songs against recent Sunday history (default: within last 21 days)
 * to warn the worship leader before repeating songs too closely.
 */
export async function detectRecentRepeats(
  songTitles: string[],
  daysThreshold: number = 21
): Promise<RepeatWarning[]> {
  if (songTitles.length === 0) return []
  const history = await getSongHistoryEntries()
  const warnings: RepeatWarning[] = []
  const seen = new Set<string>()

  const normalizedTargets = new Set(songTitles.map((t) => t.toLowerCase().trim()))

  for (const entry of history) {
    const key = entry.song_title.toLowerCase().trim()
    if (!normalizedTargets.has(key) || seen.has(key)) continue

    const days = daysBetween(entry.played_date)
    if (days <= daysThreshold) {
      seen.add(key)
      warnings.push({
        songTitle: entry.song_title,
        daysAgo: days,
        lastPlayedDate: entry.played_date,
        lastLeaderName: entry.leader_name,
        assignedKey: entry.assigned_key,
      })
    }
  }

  return warnings
}

/**
 * Returns songs that haven't been sung in at least minDaysAgo days (or never played)
 * to help leaders keep the Sunday rotation fresh.
 */
export async function getFreshSongSuggestions(
  minDaysAgo: number = 45,
  limit: number = 5
): Promise<SongPlayStat[]> {
  const stats = await getSongPlayStats()
  return stats
    .filter((s) => s.daysSincePlayed === null || s.daysSincePlayed >= minDaysAgo)
    .sort((a, b) => (b.daysSincePlayed ?? 9999) - (a.daysSincePlayed ?? 9999))
    .slice(0, limit)
}
