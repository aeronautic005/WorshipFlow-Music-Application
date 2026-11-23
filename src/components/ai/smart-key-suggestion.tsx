"use client"

import { useState } from "react"
import { recommendAiKey, type KeyRecommendationResult } from "@/lib/ai/key-recommender"
import { AiGenerateButton } from "@/components/ai/ai-generate-button"
import { AiResultCard } from "@/components/ai/ai-result-card"
import { Music, Check, Sparkles, Volume2 } from "lucide-react"

export interface SmartKeySuggestionProps {
  songTitle: string
  originalKey: string
  vocalLeadName: string
  songCategory?: "joyful" | "worship"
  currentKey?: string
  onApplyKey: (key: string) => void
  className?: string
}

export function SmartKeySuggestion({
  songTitle,
  originalKey,
  vocalLeadName,
  songCategory = "worship",
  currentKey,
  onApplyKey,
  className = "",
}: SmartKeySuggestionProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<KeyRecommendationResult | null>(null)

  const handleGetSuggestion = async () => {
    setLoading(true)
    try {
      const res = await recommendAiKey({
        songTitle,
        originalKey,
        vocalLeadName,
        songCategory,
      })
      setResult(res)
    } catch (err) {
      console.error("Failed to get smart key suggestion:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Vocal Range Matching</span>
        </div>

        <AiGenerateButton
          isLoading={loading}
          loadingText="Analyzing Range..."
          onClick={handleGetSuggestion}
          variant="outline"
          className="text-xs py-1.5 px-3 h-8"
        >
          Recommend Key for {vocalLeadName}
        </AiGenerateButton>
      </div>

      {result && (
        <AiResultCard
          title={`Smart Key Suggestion for ${vocalLeadName}`}
          subtitle={`Song: ${songTitle} • Original Key: ${originalKey}`}
          modelName={result.model}
          isMock={result.isMock}
          applyLabel={`Apply Key of ${result.recommendedKey}`}
          onApply={() => onApplyKey(result.recommendedKey)}
          onRegenerate={handleGetSuggestion}
          onDismiss={() => setResult(null)}
          isRegenerating={loading}
        >
          <div className="space-y-3">
            {/* Recommendation badge & key cards */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono font-bold text-sm">
                <span>Recommended: Key of {result.recommendedKey}</span>
              </div>

              {result.alternativeKey && result.alternativeKey !== result.recommendedKey && (
                <button
                  type="button"
                  onClick={() => onApplyKey(result.alternativeKey!)}
                  className="px-2.5 py-1 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted font-mono transition"
                  title="Click to apply alternative key"
                >
                  Alt: Key of {result.alternativeKey}
                </button>
              )}

              {result.vocalPeakNote && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                  <Volume2 className="w-3 h-3 text-primary" />
                  Peak: {result.vocalPeakNote}
                </span>
              )}
            </div>

            {/* Reasoning text */}
            <p className="text-xs text-foreground/90 leading-relaxed font-sans bg-background/60 p-3 rounded-xl border border-border/50">
              {result.reasoning}
            </p>
          </div>
        </AiResultCard>
      )}
    </div>
  )
}
