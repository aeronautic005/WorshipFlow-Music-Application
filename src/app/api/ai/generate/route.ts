import { NextResponse } from "next/server"
import { generateGeminiContent, type GeminiModel } from "@/lib/ai/gemini"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt, systemInstruction, model, temperature, maxOutputTokens, responseMimeType } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'prompt'" }, { status: 400 })
    }

    const result = await generateGeminiContent(prompt, {
      systemInstruction,
      model: model as GeminiModel,
      temperature,
      maxOutputTokens,
      responseMimeType,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("API AI Generate error:", error)
    return NextResponse.json(
      { error: "Internal server error during AI generation" },
      { status: 500 }
    )
  }
}
