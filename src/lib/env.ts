/**
 * Environment Readiness Helper for Production Deployment
 */

export interface EnvironmentReadiness {
  hasSupabaseUrl: boolean
  hasSupabaseAnonKey: boolean
  hasGeminiApiKey: boolean
  isProductionReady: boolean
}

export function checkEnvironmentReadiness(): EnvironmentReadiness {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  const geminiKey =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""

  const hasSupabaseUrl =
    Boolean(supabaseUrl) && !supabaseUrl.includes("your-project-ref")
  const hasSupabaseAnonKey =
    Boolean(supabaseKey) && !supabaseKey.includes("your-anon-key")
  const hasGeminiApiKey =
    Boolean(geminiKey) && !geminiKey.includes("your-gemini-api-key")

  return {
    hasSupabaseUrl,
    hasSupabaseAnonKey,
    hasGeminiApiKey,
    isProductionReady: hasSupabaseUrl && hasSupabaseAnonKey,
  }
}
