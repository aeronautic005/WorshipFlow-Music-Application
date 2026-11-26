"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import {
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
  sendChatMessage,
  type ChatMessage,
  INITIAL_ASSISTANT_MESSAGE,
} from "@/lib/ai/chat"
import { buildWorshipTeamContext } from "@/lib/ai/chat-context"
import { getSongs } from "@/lib/songs"
import { getSetlists, type FullSetlist } from "@/lib/setlists"
import { AiBadge } from "@/components/ai/ai-badge"
import { AiFeedbackButtons } from "@/components/ai/ai-feedback-buttons"
import { AiUsageIndicator } from "@/components/ai/ai-usage-indicator"
import type { Song } from "@/types/database"
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  Copy,
  Check,
  User,
  Bot,
  ArrowRight,
  Music,
} from "lucide-react"

const STARTER_PROMPTS = [
  "Suggest a 5-song setlist for Andrei in Key of D",
  "How to transition between Joyful (Key G) and Worship (Key D)?",
  "Sunday 9:00 AM rehearsal checklist for drums & keys",
  "What are the vocal sweet spots for France, Maegan, and Argel?",
]

export default function WorshipAiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [songs, setSongs] = useState<Song[]>([])
  const [activeSetlist, setActiveSetlist] = useState<FullSetlist | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(getChatHistory())

    async function loadContext() {
      try {
        const songData = await getSongs()
        setSongs(songData)
        const setlists = await getSetlists()
        if (setlists && setlists.length > 0) {
          setActiveSetlist(setlists[0])
        }
      } catch (err) {
        console.error("Failed to load context for AI chat:", err)
      }
    }
    loadContext()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, sending])

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim()
    if (!prompt || sending) return

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: prompt,
      createdAt: new Date().toISOString(),
    }

    const updated = [...messages, userMsg]
    setMessages(updated)
    saveChatHistory(updated)
    setInput("")
    setSending(true)

    try {
      const systemContext = buildWorshipTeamContext({
        songs,
        activeSetlist,
      })

      const reply = await sendChatMessage(updated, prompt, systemContext)
      const withReply = [...updated, reply]
      setMessages(withReply)
      saveChatHistory(withReply)
    } catch (err) {
      console.error("Chat message error:", err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    if (window.confirm("Clear conversation history?")) {
      clearChatHistory()
      setMessages([INITIAL_ASSISTANT_MESSAGE])
    }
  }

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-7.5rem)] space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/70 bg-card/75 shadow-xs backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground">Worship Director AI</h1>
                <AiBadge label="Gemini 2.5" modelName="gemini-2.5-flash" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Informed by your team roster, rotation schedules, and song library
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AiUsageIndicator compact />

            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-xl border border-border/60 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {messages.map((msg) => {
            const isUser = msg.role === "user"

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in duration-150`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                      : "bg-card border border-border/80 text-foreground font-sans rounded-tl-xs shadow-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Message footer & feedback / copy controls */}
                  <div
                    className={`flex items-center justify-between gap-2 mt-2 pt-1.5 border-t ${
                      isUser ? "border-primary-foreground/20 text-primary-foreground/75" : "border-border/40 text-muted-foreground"
                    }`}
                  >
                    <span className="text-[10px] font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!isUser && (
                        <AiFeedbackButtons
                          targetId={msg.id}
                          feature="chat"
                          model={msg.model}
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="opacity-70 group-hover:opacity-100 hover:text-foreground transition p-0.5"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            )
          })}

          {sending && (
            <div className="flex gap-3 justify-start animate-in fade-in duration-150">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 rounded-tl-xs shadow-xs flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Thinking with team context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompt Chips */}
        {messages.length <= 2 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Suggested Topics
            </span>
            <div className="flex flex-wrap gap-1.5">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs text-foreground/90 transition text-left"
                >
                  <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Bar */}
        <div className="rounded-2xl border border-border/80 bg-card p-2 shadow-lg space-y-2">
          <div className="flex items-end gap-2">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything (e.g. 'What keys should France and Andrei use for Sunday?')..."
              className="flex-1 bg-transparent p-2 text-xs text-foreground focus:outline-none resize-none leading-relaxed placeholder:text-muted-foreground"
            />

            <button
              type="button"
              disabled={!input.trim() || sending}
              onClick={() => handleSend()}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white shadow-xs transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
              title="Send message"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
