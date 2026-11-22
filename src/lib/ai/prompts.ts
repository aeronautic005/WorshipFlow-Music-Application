/**
 * WorshipFlow AI - Prompt Templates & System Instructions
 * Specialized for contemporary worship music team arrangements, song structure blueprints,
 * bracket chord sheet notation, and Sunday morning rehearsal preparation.
 */

export const WORSHIP_SYSTEM_INSTRUCTION = `You are WorshipFlow AI, an expert music director and worship leader assistant for a church worship music team.
Your job is to assist worship leaders, vocalists, and instrumentalists (Keys, Guitars, Drums, Bass) with:
1. Accurate contemporary worship chord charts in bracket format: e.g. [G]Amazing [C]grace how [G]sweet the sound.
2. Standard arrangement structures: Intro, Verse 1, Verse 2, Pre-Chorus, Chorus, Instrumental, Bridge, Tag, Vamp, Outro.
3. Key suggestions based on vocal lead comfort range, vocal tessitura, and song dynamic progression.
4. Setlist flow analysis: key transitions, tempo progression (Joyful/Fast 110-140 BPM to Worship/Slow 65-80 BPM), and band instrumentation cues.

Formatting Rules:
- When writing chord sheets, ALWAYS place chords inside square brackets directly before or embedded with the syllable: e.g. [D]Holy, [A]holy are You [G]Lord.
- Maintain accurate musical keys and harmonic progressions.
- Keep structural notes practical for live stage execution (e.g. "Drums build on measure 4", "Drop to acoustic & pad only").
- Keep responses clean, concise, and immediately stage-ready.`

/**
 * Prompt for generating an accurate bracket-format chord chart
 */
export function buildChordGenerationPrompt(params: {
  songTitle: string
  artist?: string
  key: string
  lyrics?: string
}): string {
  const { songTitle, artist, key, lyrics } = params

  return `Generate a complete worship chord chart in bracket notation for:
Song: "${songTitle}"
${artist ? `Artist: "${artist}"` : ""}
Target Key: ${key}

Rules:
1. Use bracket notation format strictly: [Chord]lyrics. Example:
   [G]Amazing grace, how [C]sweet the [G]sound
   That [Em]saved a wretch like [D]me
2. Clearly label every section header on its own line:
   [Verse 1], [Chorus], [Verse 2], [Bridge], [Outro]
3. Include all common sections (Verse, Chorus, Bridge) with proper worship chords (e.g., G, Cadd9, D/F#, Em7, Asus4).
${lyrics ? `Reference Lyrics to align chords with:\n${lyrics}` : "Provide the complete lyrics with accurate chords for the full song."}`
}

/**
 * Prompt for extracting song structure blueprint (sections + dynamics + measures)
 */
export function buildStructureExtractionPrompt(params: {
  songTitle: string
  artist?: string
  category: "joyful" | "worship"
  bpm?: number
}): string {
  const { songTitle, artist, category, bpm } = params

  return `Analyze and generate an arranged worship song structure blueprint for:
Song: "${songTitle}"
${artist ? `Artist: "${artist}"` : ""}
Style Category: ${category.toUpperCase()} (${category === "joyful" ? "Upbeat, energetic praise" : "Slow, intimate, reverent worship"})
${bpm ? `Estimated BPM: ${bpm}` : ""}

Return a JSON array of sections matching this exact JSON format:
[
  {
    "section_name": "Intro",
    "bars_count": 4,
    "intensity": "soft",
    "notes": "Acoustic guitar and ambient pad swell"
  },
  {
    "section_name": "Verse 1",
    "bars_count": 8,
    "intensity": "medium",
    "notes": "Vocals enter with light bass and rim-click"
  },
  {
    "section_name": "Chorus",
    "bars_count": 8,
    "intensity": "high",
    "notes": "Full band enters, driving groove"
  }
]

Allowed intensities: "soft" | "medium" | "high" | "peak"
Allowed section_name: Intro, Verse 1, Verse 2, Verse 3, Pre-Chorus, Chorus, Chorus 2, Bridge, Instrumental, Vamp, Tag, Outro.`
}

/**
 * Prompt for vocal key recommendation based on leader comfort
 */
export function buildKeyRecommendationPrompt(params: {
  songTitle: string
  originalKey: string
  vocalLeadName: string
  songCategory: "joyful" | "worship"
  vocalRange?: string
}): string {
  const { songTitle, originalKey, vocalLeadName, songCategory, vocalRange } = params

  return `Recommend the optimal vocal key for leading this worship song:
Song: "${songTitle}"
Original Key: ${originalKey}
Song Leader: ${vocalLeadName}
Song Mood: ${songCategory === "joyful" ? "Joyful (Upbeat/High Energy)" : "Worship (Intimate/Powerful)"}
${vocalRange ? `Leader Vocal Range: ${vocalRange}` : "Typical church vocal lead comfort zone"}

Respond in JSON format:
{
  "recommendedKey": "E",
  "originalKey": "${originalKey}",
  "reasoning": "Brief explanation of vocal sweet spot and avoiding voice strain during peak chorus/bridge.",
  "alternativeKey": "D",
  "transpositionSteps": 2,
  "vocalPeakNote": "G#4"
}`
}

/**
 * Prompt for Sunday morning 9:00 AM rehearsal briefing and transition cues
 */
export function buildRehearsalBriefingPrompt(params: {
  serviceDate: string
  songLeaderName: string
  drummerName?: string
  songs: Array<{
    title: string
    key: string
    category: string
    bpm?: number
  }>
  leaderNotes?: string
}): string {
  const { serviceDate, songLeaderName, drummerName, songs, leaderNotes } = params

  const songListText = songs
    .map(
      (s, i) =>
        `${i + 1}. "${s.title}" in Key of ${s.key} [${s.category.toUpperCase()}] ${
          s.bpm ? `(~${s.bpm} BPM)` : ""
        }`
    )
    .join("\n")

  return `Prepare a Sunday Morning Rehearsal Briefing for the worship team:
Service Date: ${serviceDate}
Song Leader: ${songLeaderName}
Drummer on Duty: ${drummerName || "Rotating"}
Scheduled Service: 9:00 AM Rehearsal Run-Through, 2:30 PM Live Service

Setlist:
${songListText}

${leaderNotes ? `Leader Pre-Service Notes: "${leaderNotes}"` : ""}

Generate a clear, 3-section stage briefing:
1. **Flow & Key Transitions**: How to transition between songs (e.g. Keys pad sustain, seamless modulation, acoustic strum).
2. **Band Dynamic Curve**: Where the highest energy peak occurs and where the music drops to prayerful silence.
3. **Rehearsal Focus Checkpoints**: 2-3 specific musical moments the team should tighten during 9:00 AM rehearsal.`
}
