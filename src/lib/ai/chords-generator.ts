import { generateGeminiContent, type GeminiResponse } from "@/lib/ai/gemini"
import { WORSHIP_SYSTEM_INSTRUCTION, buildChordGenerationPrompt } from "@/lib/ai/prompts"

export interface GenerateChordChartParams {
  songTitle: string
  artist?: string
  key: string
  lyrics?: string
}

export interface GeneratedChordChartResult {
  chartContent: string
  key: string
  isMock: boolean
  model: string
}

/**
 * Generates an arranged worship chord chart in bracket notation format using Gemini
 */
export async function generateAiChordChart(
  params: GenerateChordChartParams
): Promise<GeneratedChordChartResult> {
  const prompt = buildChordGenerationPrompt(params)

  const response: GeminiResponse = await generateGeminiContent(prompt, {
    model: "gemini-2.5-flash",
    systemInstruction: WORSHIP_SYSTEM_INSTRUCTION,
    temperature: 0.2,
  })

  let cleanText = response.text.trim()

  // Clean up any markdown code fencing if the model wrapped the output in ``` or ```txt
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim()
  }

  return {
    chartContent: cleanText,
    key: params.key,
    isMock: response.isMock,
    model: response.model,
  }
}
