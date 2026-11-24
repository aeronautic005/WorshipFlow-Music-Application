import { NextResponse } from "next/server"
import { sendChatMessage, type ChatMessage } from "@/lib/ai/chat"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { history, prompt, systemInstruction } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing or invalid prompt" }, { status: 400 })
    }

    const reply = await sendChatMessage(
      (history || []) as ChatMessage[],
      prompt,
      systemInstruction
    )

    return NextResponse.json(reply)
  } catch (error) {
    console.error("API Chat error:", error)
    return NextResponse.json(
      { error: "Internal server error during chat generation" },
      { status: 500 }
    )
  }
}
