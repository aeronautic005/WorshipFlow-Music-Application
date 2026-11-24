import { generateGeminiContent } from "@/lib/ai/gemini"
import { WORSHIP_SYSTEM_INSTRUCTION, buildRehearsalBriefingPrompt } from "@/lib/ai/prompts"

export interface RehearsalBriefingParams {
  serviceDate: string
  songLeaderName: string
  drummerName?: string
  backupSingerName?: string
  songs: Array<{
    title: string
    key: string
    category: "joyful" | "worship" | string
    bpm?: number | null
  }>
  leaderNotes?: string
}

export interface RehearsalBriefingResult {
  markdownContent: string
  summary: string
  keyMoments: string[]
  isMock: boolean
  model: string
  generatedAt: string
}

/**
 * Generates an executive 9:00 AM Sunday morning rehearsal briefing using Gemini
 */
export async function generateRehearsalBriefing(
  params: RehearsalBriefingParams
): Promise<RehearsalBriefingResult> {
  const songsList = params.songs.map((s) => ({
    title: s.title,
    key: s.key,
    category: s.category,
    bpm: s.bpm || undefined,
  }))

  const prompt = buildRehearsalBriefingPrompt({
    serviceDate: params.serviceDate,
    songLeaderName: params.songLeaderName,
    drummerName: params.drummerName,
    songs: songsList,
    leaderNotes: params.leaderNotes,
  })

  const response = await generateGeminiContent(prompt, {
    model: "gemini-2.5-flash",
    systemInstruction: WORSHIP_SYSTEM_INSTRUCTION,
    temperature: 0.3,
  })

  let raw = response.text.trim()
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim()
  }

  // Extract key moments / bullet points from response for quick stage glance
  const lines = raw.split("\n")
  const extractedMoments = lines
    .filter((l) => l.trim().startsWith("-") || l.trim().startsWith("*") || /^\d+\./.test(l.trim()))
    .map((l) => l.replace(/^[-*•\d.]+\s*/, "").trim())
    .slice(0, 4)

  const defaultMoments = [
    `Song 1 to 2 transition: maintain high tempo without drum break`,
    `Song 2 to 3 transition: Keys pad swell, seamless worship modulation`,
    `Bridge dynamics: 4-on-the-floor kick build at final crescendo`,
  ]

  return {
    markdownContent: raw,
    summary: `Rehearsal plan for ${params.serviceDate} (${params.songs.length} songs led by ${params.songLeaderName})`,
    keyMoments: extractedMoments.length > 0 ? extractedMoments : defaultMoments,
    isMock: response.isMock,
    model: response.model,
    generatedAt: new Date().toISOString(),
  }
}
