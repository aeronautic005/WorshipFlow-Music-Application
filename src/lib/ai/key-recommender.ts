import { generateGeminiContent } from "@/lib/ai/gemini"
import { WORSHIP_SYSTEM_INSTRUCTION, buildKeyRecommendationPrompt } from "@/lib/ai/prompts"

export interface RecommendKeyParams {
  songTitle: string
  originalKey: string
  vocalLeadName: string
  songCategory: "joyful" | "worship"
  vocalRange?: string
  previousKeys?: string[]
}

export interface KeyRecommendationResult {
  recommendedKey: string
  originalKey: string
  reasoning: string
  alternativeKey?: string
  transpositionSteps?: number
  vocalPeakNote?: string
  comfortConfidence: "high" | "medium" | "cautious"
  isMock: boolean
  model: string
}

/**
 * Standard team leader vocal profile lookup for intelligent key suggestion fallbacks
 */
const TEAM_VOCAL_PROFILES: Record<string, { range: string; preferredKeys: string[]; gender: "female" | "male" }> = {
  france: { range: "Bb3 - D5", preferredKeys: ["G", "A", "Bb", "C"], gender: "female" },
  maegan: { range: "C4 - E5", preferredKeys: ["C", "D", "E", "F"], gender: "female" },
  deanne: { range: "A3 - C5", preferredKeys: ["F", "G", "Ab", "Bb"], gender: "female" },
  argel: { range: "C3 - G4", preferredKeys: ["D", "E", "F", "G"], gender: "male" },
  andrei: { range: "B2 - F#4", preferredKeys: ["C", "D", "E", "Bb"], gender: "male" },
}

/**
 * Recommends optimal vocal key for a song leader based on vocal sweet spot and dynamic range using Gemini
 */
export async function recommendAiKey(
  params: RecommendKeyParams
): Promise<KeyRecommendationResult> {
  const leadKey = params.vocalLeadName.toLowerCase().trim()
  const knownProfile = TEAM_VOCAL_PROFILES[leadKey]
  const effectiveRange = params.vocalRange || knownProfile?.range

  const prompt = buildKeyRecommendationPrompt({
    songTitle: params.songTitle,
    originalKey: params.originalKey,
    vocalLeadName: params.vocalLeadName,
    songCategory: params.songCategory,
    vocalRange: effectiveRange,
  })

  const response = await generateGeminiContent(prompt, {
    model: "gemini-2.5-flash-lite",
    systemInstruction: WORSHIP_SYSTEM_INSTRUCTION,
    temperature: 0.1,
    responseMimeType: "application/json",
  })

  let raw = response.text.trim()
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim()
  }

  try {
    const parsed = JSON.parse(raw)
    if (parsed.recommendedKey) {
      return {
        recommendedKey: parsed.recommendedKey,
        originalKey: params.originalKey,
        reasoning:
          parsed.reasoning ||
          `Optimal chest-voice resonance and dynamic range for ${params.vocalLeadName}.`,
        alternativeKey: parsed.alternativeKey,
        transpositionSteps: parsed.transpositionSteps,
        vocalPeakNote: parsed.vocalPeakNote,
        comfortConfidence: "high",
        isMock: response.isMock,
        model: response.model,
      }
    }
  } catch (err) {
    console.warn("Could not parse AI key recommendation JSON, using smart fallback:", err)
  }

  // Deterministic fallback matching worship leader sweet spots
  let suggested = params.originalKey
  let alt = params.originalKey

  if (knownProfile) {
    suggested = knownProfile.preferredKeys[0] || params.originalKey
    alt = knownProfile.preferredKeys[1] || params.originalKey
  } else if (params.songCategory === "joyful") {
    suggested = ["G", "D", "E"].includes(params.originalKey) ? params.originalKey : "G"
    alt = "D"
  } else {
    suggested = ["C", "D", "E", "Bb"].includes(params.originalKey) ? params.originalKey : "D"
    alt = "E"
  }

  return {
    recommendedKey: suggested,
    originalKey: params.originalKey,
    reasoning: `Based on ${params.vocalLeadName}'s comfort tessitura (${effectiveRange || "standard range"}), Key of ${suggested} places the chorus peak comfortably in full voice without vocal fatigue.`,
    alternativeKey: alt,
    comfortConfidence: "medium",
    isMock: response.isMock,
    model: response.model,
  }
}
