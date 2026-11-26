/**
 * WorshipFlow - Team Invitation & Onboarding Helper
 * Generates shareable invite codes/links for new band & vocal members
 * and manages first-time setup state.
 */

export interface OnboardingProfile {
  name: string
  role: "song_leader" | "backup_vocal" | "musician"
  instrument: string
  vocalRange?: string
  inviteCode?: string
  completedAt: string
}

const ONBOARDING_STORAGE_KEY = "worshipflow_onboarding_v1"
const INVITE_CODES_STORAGE_KEY = "worshipflow_invite_codes_v1"

export const DEFAULT_CHURCH_INVITE_CODE = "WORSHIP-SUNDAY-2026"

export function generateInviteCode(prefix: string = "WF"): string {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `${prefix}-${randomPart}`
}

export function getSavedInviteCode(): string {
  if (typeof window === "undefined") return DEFAULT_CHURCH_INVITE_CODE
  try {
    return localStorage.getItem(INVITE_CODES_STORAGE_KEY) || DEFAULT_CHURCH_INVITE_CODE
  } catch {
    return DEFAULT_CHURCH_INVITE_CODE
  }
}

export function saveInviteCode(code: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(INVITE_CODES_STORAGE_KEY, code)
  } catch (err) {
    console.error("Failed to save invite code:", err)
  }
}

export function getOnboardingProfile(): OnboardingProfile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveOnboardingProfile(profile: OnboardingProfile): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(profile))
  } catch (err) {
    console.error("Failed to save onboarding profile:", err)
  }
}
