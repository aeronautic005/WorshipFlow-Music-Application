import { createClient } from "@/lib/supabase/client"

export async function signInWithGoogle() {
  const supabase = createClient()
  const origin = window.location.origin

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signInWithPhoneOtp(phone: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  })

  if (error) {
    throw error
  }

  return data
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}
