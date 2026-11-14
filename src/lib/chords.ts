import { createClient } from "@/lib/supabase/client"
import type { ChordChart } from "@/types/database"

export async function getChordChart(
  songId: string,
  key: string
): Promise<ChordChart | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("chord_charts")
      .select("*")
      .eq("song_id", songId)
      .eq("key", key)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return data as ChordChart
  } catch {
    return null
  }
}

export async function saveChordChart(
  songId: string,
  key: string,
  content: string,
  isAiGenerated: boolean = false
): Promise<{ success: boolean; data?: ChordChart; error?: string }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("chord_charts")
      .upsert(
        {
          song_id: songId,
          key,
          chart_content: content,
          is_ai_generated: isAiGenerated,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "song_id,key" }
      )
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as ChordChart }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save chord chart",
    }
  }
}

// Generate sample chord chart for songs when freshly loaded
export function generateDefaultChordChart(title: string, key: string): string {
  return `[Intro]
${key}    ${key}sus4    ${key}    ${key}sus4

[Verse 1]
${key}
A thousand generations falling down in awe
C#m                  B
To sing the song of ages to the Lamb
A
And all who've gone before us
C#m                 B
And all who will believe
A                B          ${key}
Will sing the song of ages to the Lamb

[Chorus]
     A            C#m
Your name is the highest
     B            ${key}
Your name is the greatest
     A           C#m          B
Your name stands above them all
     A             C#m
All thrones and dominions
     B             ${key}
All powers and positions
     A           B            ${key}
Your name stands above them all

[Bridge]
A                   C#m
Hear the praise of angels
      B
Cry, "Holy"
A                   C#m
Hear the church on earth
      B
Cry, "Holy"
A             C#m         B
You are lifted high, holy, holy
A           B         ${key}
Holy forever and amen`
}
