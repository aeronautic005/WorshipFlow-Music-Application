import { createClient } from "@/lib/supabase/client"
import type { UserProfile, UserRole, InstrumentType } from "@/types/database"

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error || !data) {
    // Return a fallback profile if Supabase is still connecting
    return {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "Musician",
      email: user.email || "",
      role: (user.user_metadata?.role as UserRole) || "member",
      instrument: (user.user_metadata?.instrument as InstrumentType) || "Vocals",
      vocal_range: null,
      avatar_url: user.user_metadata?.avatar_url || null,
    }
  }

  return data as UserProfile
}

export async function getAllTeamMembers(): Promise<UserProfile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("name", { ascending: true })

  if (error || !data) {
    return []
  }

  return data as UserProfile[]
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const { error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getTeamSongLeaders(): Promise<UserProfile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["song_leader", "admin"])
    .order("name", { ascending: true })

  if (error || !data) {
    return []
  }

  return data as UserProfile[]
}
