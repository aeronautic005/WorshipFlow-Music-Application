import { generateGeminiContent, type GeminiModel } from "@/lib/ai/gemini"
import { WORSHIP_SYSTEM_INSTRUCTION } from "@/lib/ai/prompts"

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: string
  model?: string
  isMock?: boolean
}

const CHAT_STORAGE_KEY = "worshipflow_ai_chat_v1"

export const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: "msg-welcome",
  role: "assistant",
  content: `Hello! I'm your **WorshipFlow AI Director**. I can help your team with:
- **Setlist Planning**: Crafting a balanced praise-to-adoration arc (2-3 joyful + 2-3 worship).
- **Vocal Keys**: Finding sweet spots for France, Maegan, Deanne, Argel, and Andrei.
- **Instrument Cues**: Keys pad sustains, guitar riffs, and drum builds for Kyle and Aeron.
- **9:00 AM Rehearsal**: Transitions, key shifts, and stage reminders.

What are you working on today?`,
  createdAt: new Date().toISOString(),
  model: "gemini-2.5-flash",
}

export function getChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [INITIAL_ASSISTANT_MESSAGE]
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return [INITIAL_ASSISTANT_MESSAGE]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_ASSISTANT_MESSAGE]
  } catch {
    return [INITIAL_ASSISTANT_MESSAGE]
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  } catch (err) {
    console.error("Failed to save chat history:", err)
  }
}

export function clearChatHistory(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY)
  } catch (err) {
    console.error("Failed to clear chat history:", err)
  }
}

export async function sendChatMessage(
  history: ChatMessage[],
  userPrompt: string,
  contextSystemInstruction?: string
): Promise<ChatMessage> {
  const systemInstruction = contextSystemInstruction || WORSHIP_SYSTEM_INSTRUCTION

  // Format past turns for context
  const recentHistory = history
    .slice(-8)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => `${m.role === "user" ? "User" : "Worship Director"}: ${m.content}`)
    .join("\n\n")

  const fullPrompt = `${recentHistory ? `Conversation History:\n${recentHistory}\n\n` : ""}User: ${userPrompt}\n\nWorship Director:`

  const response = await generateGeminiContent(fullPrompt, {
    model: "gemini-2.5-flash",
    systemInstruction,
    temperature: 0.4,
  })

  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: response.text,
    createdAt: new Date().toISOString(),
    model: response.model,
    isMock: response.isMock,
  }
}
