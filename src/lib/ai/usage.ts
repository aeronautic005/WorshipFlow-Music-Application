/**
 * WorshipFlow AI - Usage & Soft Rate Limit Service
 * Tracks daily Gemini API invocations to give the worship team visibility
 * into free-tier daily quotas and prevent accidental overuse.
 */

export const DAILY_AI_LIMIT = 50

export interface AiUsageStats {
  date: string
  callsToday: number
  dailyLimit: number
  remaining: number
  percentUsed: number
  isNearLimit: boolean
  isLimitReached: boolean
  byFeature: Record<string, number>
}

interface StoredUsage {
  date: string
  callsToday: number
  byFeature: Record<string, number>
}

const USAGE_STORAGE_KEY = "worshipflow_ai_usage_v1"

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]
}

function readStoredUsage(): StoredUsage {
  const today = getTodayDateString()
  if (typeof window === "undefined") {
    return { date: today, callsToday: 0, byFeature: {} }
  }

  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY)
    if (!raw) return { date: today, callsToday: 0, byFeature: {} }
    const parsed = JSON.parse(raw) as StoredUsage
    // Reset automatically on a new day
    if (parsed.date !== today) {
      return { date: today, callsToday: 0, byFeature: {} }
    }
    return parsed
  } catch {
    return { date: today, callsToday: 0, byFeature: {} }
  }
}

export function getAiUsageStats(): AiUsageStats {
  const stored = readStoredUsage()
  const remaining = Math.max(0, DAILY_AI_LIMIT - stored.callsToday)
  const percentUsed = Math.min(100, Math.round((stored.callsToday / DAILY_AI_LIMIT) * 100))

  return {
    date: stored.date,
    callsToday: stored.callsToday,
    dailyLimit: DAILY_AI_LIMIT,
    remaining,
    percentUsed,
    isNearLimit: remaining <= 10 && remaining > 0,
    isLimitReached: remaining === 0,
    byFeature: stored.byFeature || {},
  }
}

export function recordAiUsage(feature: string = "general"): AiUsageStats {
  const stored = readStoredUsage()
  stored.callsToday += 1
  stored.byFeature[feature] = (stored.byFeature[feature] || 0) + 1

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(stored))
      // Dispatch custom event so usage indicator components update live
      window.dispatchEvent(new CustomEvent("worshipflow:ai-usage-updated"))
    } catch (err) {
      console.error("Failed to record AI usage:", err)
    }
  }

  return getAiUsageStats()
}
