import { generateGeminiContent } from "@/lib/ai/gemini"
import { WORSHIP_SYSTEM_INSTRUCTION, buildStructureExtractionPrompt } from "@/lib/ai/prompts"
import type { SongSection } from "@/types/database"
import type { SectionType } from "@/types/structure"

export interface ExtractStructureParams {
  songTitle: string
  artist?: string
  category: "joyful" | "worship"
  bpm?: number
}

export interface ExtractedStructureResult {
  sections: SongSection[]
  isMock: boolean
  model: string
  summary?: string
}

function normalizeSectionType(name: string): SectionType {
  const n = name.toLowerCase()
  if (n.includes("intro")) return "intro"
  if (n.includes("pre-chorus") || n.includes("prechorus") || n.includes("pre chorus")) return "pre_chorus"
  if (n.includes("chorus")) return "chorus"
  if (n.includes("bridge")) return "bridge"
  if (n.includes("tag")) return "tag"
  if (n.includes("vamp")) return "vamp"
  if (n.includes("interlude")) return "interlude"
  if (n.includes("solo")) return "solo"
  if (n.includes("outro") || n.includes("ending")) return "outro"
  if (n.includes("instrumental")) return "instrumental"
  return "verse"
}

/**
 * Extracts and arranges an intelligent worship song structure blueprint using Gemini
 */
export async function extractAiSongStructure(
  params: ExtractStructureParams
): Promise<ExtractedStructureResult> {
  const prompt = buildStructureExtractionPrompt(params)

  const response = await generateGeminiContent(prompt, {
    model: "gemini-2.5-flash",
    systemInstruction: WORSHIP_SYSTEM_INSTRUCTION,
    temperature: 0.2,
    responseMimeType: "application/json",
  })

  let rawText = response.text.trim()

  // Strip code block fences if present
  if (rawText.startsWith("```")) {
    rawText = rawText.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim()
  }

  let parsedSections: SongSection[] = []

  try {
    const json = JSON.parse(rawText)
    const list = Array.isArray(json) ? json : json.sections || []

    parsedSections = list.map((item: any, idx: number) => {
      const name = item.section_name || item.name || `Section ${idx + 1}`
      const type = normalizeSectionType(name)
      const bars = typeof item.bars_count === "number" ? item.bars_count : item.bars || 8
      const notes = item.notes || (item.intensity ? `Dynamics: ${item.intensity}` : undefined)

      return {
        id: `ai-sec-${Date.now()}-${idx}`,
        name,
        type,
        bars,
        repeats: item.repeats || 1,
        notes,
      }
    })
  } catch (err) {
    console.warn("Could not parse AI structure JSON, falling back to smart defaults:", err)
  }

  if (parsedSections.length === 0) {
    // Standard high-quality worship arrangement fallback
    if (params.category === "joyful") {
      parsedSections = [
        { id: `fb-1`, name: "Intro", type: "intro", bars: 4, repeats: 1, notes: "Full band driving groove" },
        { id: `fb-2`, name: "Verse 1", type: "verse", bars: 8, repeats: 1, notes: "Vocals & rhythm section" },
        { id: `fb-3`, name: "Verse 2", type: "verse", bars: 8, repeats: 1, notes: "Add electric lead lines" },
        { id: `fb-4`, name: "Chorus", type: "chorus", bars: 8, repeats: 2, notes: "Full energy, high praise" },
        { id: `fb-5`, name: "Bridge", type: "bridge", bars: 8, repeats: 2, notes: "Build dynamics with four-on-floor kick" },
        { id: `fb-6`, name: "Chorus", type: "chorus", bars: 8, repeats: 2, notes: "Peak celebration" },
        { id: `fb-7`, name: "Outro", type: "outro", bars: 4, repeats: 1, notes: "Big crash ending" },
      ]
    } else {
      parsedSections = [
        { id: `fb-1`, name: "Intro", type: "intro", bars: 4, repeats: 1, notes: "Acoustic guitar & pad sustain" },
        { id: `fb-2`, name: "Verse 1", type: "verse", bars: 8, repeats: 1, notes: "Leader vocal, soft dynamics" },
        { id: `fb-3`, name: "Verse 2", type: "verse", bars: 8, repeats: 1, notes: "Bass & light rim-click enter" },
        { id: `fb-4`, name: "Chorus", type: "chorus", bars: 8, repeats: 1, notes: "Band enters, harmonies" },
        { id: `fb-5`, name: "Verse 3", type: "verse", bars: 8, repeats: 1, notes: "Medium intensity" },
        { id: `fb-6`, name: "Chorus", type: "chorus", bars: 8, repeats: 2, notes: "Building worship dynamic" },
        { id: `fb-7`, name: "Bridge", type: "bridge", bars: 8, repeats: 3, notes: "Crescendo to peak declaration" },
        { id: `fb-8`, name: "Chorus", type: "chorus", bars: 8, repeats: 1, notes: "Drop to acoustic & pad, soft singing" },
        { id: `fb-9`, name: "Outro", type: "outro", bars: 4, repeats: 1, notes: "Spontaneous prayer & pad swell" },
      ]
    }
  }

  return {
    sections: parsedSections,
    isMock: response.isMock,
    model: response.model,
    summary: `${params.category === "joyful" ? "Energetic Joyful" : "Deep Worship"} arrangement with ${parsedSections.length} sections tailored for Sunday service flow.`,
  }
}
