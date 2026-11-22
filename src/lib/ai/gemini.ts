/**
 * WorshipFlow AI - Google Gemini Client
 *
 * Provides a robust client for Google Gemini models (gemini-2.5-flash, gemini-2.5-flash-lite, gemini-2.5-pro)
 * with automatic fallback mock generation when GEMINI_API_KEY is not configured.
 */

export type GeminiModel = "gemini-2.5-flash" | "gemini-2.5-flash-lite" | "gemini-2.5-pro"

export interface GeminiGenerateOptions {
  model?: GeminiModel
  systemInstruction?: string
  temperature?: number
  maxOutputTokens?: number
  responseMimeType?: "text/plain" | "application/json"
}

export interface GeminiResponse {
  text: string
  model: GeminiModel
  isMock: boolean
  usage?: {
    promptTokens: number
    candidatesTokens: number
    totalTokens: number
  }
}

/**
 * Returns the configured Gemini API key if present in server or client env
 */
export function getGeminiApiKey(): string | null {
  if (typeof process !== "undefined" && process.env) {
    return (
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      null
    )
  }
  return null
}

/**
 * Core call to Google Gemini GenerateContent API (v1beta REST)
 */
export async function generateGeminiContent(
  prompt: string,
  options: GeminiGenerateOptions = {}
): Promise<GeminiResponse> {
  const model: GeminiModel = options.model || "gemini-2.5-flash"
  const apiKey = getGeminiApiKey()

  if (!apiKey) {
    // Graceful fallback mock response when API key is not configured
    return getMockFallbackResponse(prompt, model)
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const requestBody: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
      ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
    },
  }

  if (options.systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    }
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.warn(`[Gemini API Error ${res.status}]: ${errText}. Falling back to mock.`)
      return getMockFallbackResponse(prompt, model)
    }

    const data = await res.json()
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return {
      text: candidateText,
      model,
      isMock: false,
      usage: {
        promptTokens: data?.usageMetadata?.promptTokenCount || 0,
        candidatesTokens: data?.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data?.usageMetadata?.totalTokenCount || 0,
      },
    }
  } catch (error) {
    console.warn("[Gemini API Network Exception] Falling back to mock:", error)
    return getMockFallbackResponse(prompt, model)
  }
}

/**
 * High quality contextual mock generator for local development without an active API key
 */
function getMockFallbackResponse(prompt: string, model: GeminiModel): GeminiResponse {
  const pLower = prompt.toLowerCase()

  let generatedText = ""

  if (pLower.includes("chord") || pLower.includes("bracket")) {
    generatedText = `[G]       [D]
The Lord is gracious and [Em]merciful
[C]Slow to anger and [G]rich in love
[D]He is good to [C]all

[Chorus]
[G]Great is the Lord and [D]worthy of praise
[Em]The greatness of God is [C]unsearchable
[G]Let every tongue re[D]joice in Your [G]name`
  } else if (pLower.includes("key") || pLower.includes("vocal range")) {
    generatedText = JSON.stringify(
      {
        recommendedKey: "E",
        comfortRange: "B2 - E4",
        energyMatch: "High worship dynamic with warm vocal chest register",
        alternativeKey: "D",
        reasoning: "Selected key accommodates vocal sweet spot without straining on the bridge crescendo.",
      },
      null,
      2
    )
  } else if (pLower.includes("briefing") || pLower.includes("rehearsal")) {
    generatedText = `### Sunday 9:00 AM Rehearsal Briefing
- **Key Flow**: Song 1 (G Joyful) → Song 2 (C Joyful) → Song 3 (D Worship) → Song 4 (E Worship)
- **Transitions**: Smooth pad swell from Song 2 to Song 3 without drum break.
- **Vocal Cues**: Andrei leads initial verse, backup harmonies enter at Chorus 2.`
  } else {
    generatedText = `Generated worship team assistance for prompt: "${prompt.slice(0, 80)}..."`
  }

  return {
    text: generatedText,
    model,
    isMock: true,
  }
}
