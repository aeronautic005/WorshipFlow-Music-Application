/**
 * WorshipFlow AI - Setlist Intelligence Engine
 * Evaluates Sunday setlists against the church's weekly worship standards:
 * 4-6 songs total, 2-3 Joyful/Fast songs, 2-3 Worship/Slow songs, smooth key flow, and BPM curves.
 */

export interface SetlistSongInput {
  id: string
  title: string
  category: "joyful" | "worship"
  assigned_key: string
  bpm?: number | null
  order_position: number
}

export interface SetlistIssue {
  id: string
  level: "warning" | "info" | "success"
  category: "count" | "balance" | "key_flow" | "tempo"
  title: string
  message: string
  actionType?: "add_joyful" | "add_worship" | "reorder_flow" | "fix_key"
}

export interface SetlistIntelligenceReport {
  healthScore: number // 0 to 100
  totalSongs: number
  joyfulCount: number
  worshipCount: number
  issues: SetlistIssue[]
  keyTransitions: Array<{
    fromSong: string
    toSong: string
    fromKey: string
    toKey: string
    isSmooth: boolean
    intervalDescription: string
  }>
  summary: string
}

// Semitone distances from C (0)
const NOTE_SEMITONES: Record<string, number> = {
  C: 0, "C#": 1, Db: 1,
  D: 2, "D#": 3, Eb: 3,
  E: 4,
  F: 5, "F#": 6, Gb: 6,
  G: 7, "G#": 8, Ab: 8,
  A: 9, "A#": 10, Bb: 10,
  B: 11,
}

function getSemitoneDistance(keyA: string, keyB: string): number {
  const cleanA = keyA.replace("m", "").trim()
  const cleanB = keyB.replace("m", "").trim()
  const semiA = NOTE_SEMITONES[cleanA]
  const semiB = NOTE_SEMITONES[cleanB]
  if (semiA === undefined || semiB === undefined) return 0
  const diff = Math.abs(semiB - semiA) % 12
  return Math.min(diff, 12 - diff)
}

function evaluateKeyInterval(keyA: string, keyB: string): { isSmooth: boolean; description: string } {
  const dist = getSemitoneDistance(keyA, keyB)
  if (dist === 0) {
    return { isSmooth: true, description: "Same Key (Seamless flow)" }
  }
  if (dist === 5 || dist === 7) {
    return { isSmooth: true, description: "Perfect 4th/5th (Strong tonal resolution)" }
  }
  if (dist === 2) {
    return { isSmooth: true, description: "Step up/down (Natural whole-step modulation)" }
  }
  if (dist === 3 || dist === 4) {
    return { isSmooth: true, description: "Third interval (Pleasant color modulation)" }
  }
  if (dist === 1) {
    return { isSmooth: false, description: "Half-step shift (Can clash without pad modulation)" }
  }
  if (dist === 6) {
    return { isSmooth: false, description: "Tritone interval (Jarring leap, requires break)" }
  }
  return { isSmooth: true, description: `Modulation (${dist} semitones)` }
}

/**
 * Analyzes setlist songs against weekly worship parameters and produces an intelligence report
 */
export function analyzeSetlistIntelligence(songs: SetlistSongInput[]): SetlistIntelligenceReport {
  const sorted = [...songs].sort((a, b) => a.order_position - b.order_position)
  const total = sorted.length
  const joyful = sorted.filter((s) => s.category === "joyful")
  const worship = sorted.filter((s) => s.category === "worship")

  const issues: SetlistIssue[] = []
  let score = 100

  // 1. Total Song Count Rule (Target: 4 to 6 songs)
  if (total === 0) {
    issues.push({
      id: "count-empty",
      level: "warning",
      category: "count",
      title: "No songs in setlist",
      message: "Add 4 to 6 songs (typically 2-3 joyful and 2-3 worship) for Sunday service.",
    })
    score -= 40
  } else if (total < 4) {
    issues.push({
      id: "count-short",
      level: "warning",
      category: "count",
      title: `Setlist has only ${total} ${total === 1 ? "song" : "songs"}`,
      message: "Target is 4 to 6 songs for a complete Sunday worship service.",
      actionType: joyful.length < 2 ? "add_joyful" : "add_worship",
    })
    score -= 15 * (4 - total)
  } else if (total > 6) {
    issues.push({
      id: "count-long",
      level: "info",
      category: "count",
      title: `Setlist has ${total} songs`,
      message: "Target is 4-6 songs to ensure the service finishes within the scheduled preaching window.",
    })
    score -= 5 * (total - 6)
  } else {
    issues.push({
      id: "count-ideal",
      level: "success",
      category: "count",
      title: "Ideal song count",
      message: `${total} songs fits the church service duration perfectly.`,
    })
  }

  // 2. Category Balance Rule (Target: 2-3 joyful + 2-3 worship)
  if (joyful.length < 2 && total > 0) {
    issues.push({
      id: "balance-low-joyful",
      level: "warning",
      category: "balance",
      title: `Only ${joyful.length} Joyful song selected`,
      message: "Sunday services require 2 to 3 upbeat joyful songs to open praise with high energy.",
      actionType: "add_joyful",
    })
    score -= 15
  }

  if (worship.length < 2 && total > 0) {
    issues.push({
      id: "balance-low-worship",
      level: "warning",
      category: "balance",
      title: `Only ${worship.length} Worship song selected`,
      message: "Sunday services require 2 to 3 intimate worship songs for prayer and congregation adoration.",
      actionType: "add_worship",
    })
    score -= 15
  }

  if (joyful.length >= 2 && worship.length >= 2) {
    issues.push({
      id: "balance-great",
      level: "success",
      category: "balance",
      title: "Category balance achieved",
      message: `${joyful.length} Joyful / Praise + ${worship.length} Worship creates the ideal praise-to-adoration arc.`,
    })
  }

  // 3. Category Sequencing (Joyful should precede Worship)
  let foundWorship = false
  let joyfulAfterWorship = false
  for (const s of sorted) {
    if (s.category === "worship") {
      foundWorship = true
    } else if (s.category === "joyful" && foundWorship) {
      joyfulAfterWorship = true
    }
  }

  if (joyfulAfterWorship) {
    issues.push({
      id: "tempo-sequence-clash",
      level: "warning",
      category: "tempo",
      title: "Fast song placed after slow worship",
      message: "Joyful songs should be played first to build congregation praise before moving into slow worship.",
      actionType: "reorder_flow",
    })
    score -= 15
  }

  // 4. Key Flow Analysis
  const keyTransitions: SetlistIntelligenceReport["keyTransitions"] = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i]
    const next = sorted[i + 1]
    const evalResult = evaluateKeyInterval(cur.assigned_key, next.assigned_key)
    keyTransitions.push({
      fromSong: cur.title,
      toSong: next.title,
      fromKey: cur.assigned_key,
      toKey: next.assigned_key,
      isSmooth: evalResult.isSmooth,
      intervalDescription: evalResult.description,
    })

    if (!evalResult.isSmooth) {
      issues.push({
        id: `key-clash-${i}`,
        level: "warning",
        category: "key_flow",
        title: `Awkward Key Transition (${cur.assigned_key} → ${next.assigned_key})`,
        message: `Transitioning from "${cur.title}" (${cur.assigned_key}) to "${next.title}" (${next.assigned_key}) is ${evalResult.description.toLowerCase()}. Keys pad swell or brief instrumental transition advised.`,
        actionType: "fix_key",
      })
      score -= 10
    }
  }

  const finalScore = Math.max(0, Math.min(100, score))

  return {
    healthScore: finalScore,
    totalSongs: total,
    joyfulCount: joyful.length,
    worshipCount: worship.length,
    issues,
    keyTransitions,
    summary:
      finalScore >= 85
        ? "Excellent setlist balance and flow! Stage-ready for Sunday service."
        : finalScore >= 65
        ? "Good setlist with minor adjustments suggested for key flow or song balance."
        : "Setlist requires adjustments to meet Sunday worship team guidelines.",
  }
}
