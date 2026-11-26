/**
 * WorshipFlow AI - Response Feedback Service
 * Tracks thumbs up / thumbs down quality ratings on AI-generated outputs
 * (Chat responses, chord charts, structure extractions, key recommendations, briefings).
 */

export type AiFeedbackRating = "up" | "down"

export type AiFeedbackFeature =
  | "chat"
  | "chords"
  | "structure"
  | "key_recommendation"
  | "briefing"

export interface AiFeedbackRecord {
  targetId: string
  feature: AiFeedbackFeature
  rating: AiFeedbackRating
  model?: string
  note?: string
  updatedAt: string
}

const FEEDBACK_STORAGE_KEY = "worshipflow_ai_feedback_v1"

export function getAllAiFeedback(): Record<string, AiFeedbackRecord> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getAiFeedbackForTarget(targetId: string): AiFeedbackRecord | null {
  const all = getAllAiFeedback()
  return all[targetId] || null
}

export function recordAiFeedback(params: {
  targetId: string
  feature: AiFeedbackFeature
  rating: AiFeedbackRating | null
  model?: string
  note?: string
}): AiFeedbackRecord | null {
  if (typeof window === "undefined") return null
  const all = getAllAiFeedback()

  if (params.rating === null) {
    delete all[params.targetId]
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(all))
    return null
  }

  const record: AiFeedbackRecord = {
    targetId: params.targetId,
    feature: params.feature,
    rating: params.rating,
    model: params.model,
    note: params.note,
    updatedAt: new Date().toISOString(),
  }

  all[params.targetId] = record
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(all))
  } catch (err) {
    console.error("Failed to save AI feedback:", err)
  }

  return record
}

export function getAiFeedbackSummary(): {
  total: number
  thumbsUp: number
  thumbsDown: number
  satisfactionRate: number
} {
  const records = Object.values(getAllAiFeedback())
  const total = records.length
  const thumbsUp = records.filter((r) => r.rating === "up").length
  const thumbsDown = records.filter((r) => r.rating === "down").length
  const satisfactionRate = total > 0 ? Math.round((thumbsUp / total) * 100) : 100

  return {
    total,
    thumbsUp,
    thumbsDown,
    satisfactionRate,
  }
}
