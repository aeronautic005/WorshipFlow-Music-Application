"use client"

import { useState, useEffect } from "react"
import { MessageSquarePlus, Send, CheckCircle2 } from "lucide-react"

interface TeamFeedbackEntry {
  id: string
  category: "song_request" | "feature" | "bug"
  message: string
  createdAt: string
}

const TEAM_FEEDBACK_KEY = "worshipflow_team_feedback_v1"

export function TeamFeedbackCard() {
  const [category, setCategory] = useState<"song_request" | "feature" | "bug">("song_request")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [entries, setEntries] = useState<TeamFeedbackEntry[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TEAM_FEEDBACK_KEY)
      if (raw) setEntries(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newEntry: TeamFeedbackEntry = {
      id: `fb-${Date.now()}`,
      category,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    }

    const updated = [newEntry, ...entries].slice(0, 10)
    setEntries(updated)
    try {
      localStorage.setItem(TEAM_FEEDBACK_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }

    setMessage("")
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2500)
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-bold">Team Requests &amp; Feedback</h2>
        </div>
        {submitted && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Logged!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          {(
            [
              { id: "song_request", label: "Song Request" },
              { id: "feature", label: "Feature Idea" },
              { id: "bug", label: "Report Issue" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCategory(opt.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                category === opt.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Suggest a song for next month or share rehearsal app feedback..."
            className="flex-1 h-9 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </form>

      {entries.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Recent Notes ({entries.length})
          </span>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {entries.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-background/60 border border-border/50 text-xs"
              >
                <span className="truncate">{item.message}</span>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                  {item.category.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
