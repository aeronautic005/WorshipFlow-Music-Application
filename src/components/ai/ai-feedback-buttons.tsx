"use client"

import { useState, useEffect } from "react"
import {
  getAiFeedbackForTarget,
  recordAiFeedback,
  type AiFeedbackFeature,
  type AiFeedbackRating,
} from "@/lib/ai/feedback"
import { ThumbsUp, ThumbsDown } from "lucide-react"

export interface AiFeedbackButtonsProps {
  targetId: string
  feature: AiFeedbackFeature
  model?: string
  size?: "sm" | "md"
  className?: string
}

export function AiFeedbackButtons({
  targetId,
  feature,
  model,
  size = "sm",
  className = "",
}: AiFeedbackButtonsProps) {
  const [rating, setRating] = useState<AiFeedbackRating | null>(null)
  const [justRated, setJustRated] = useState(false)

  useEffect(() => {
    const existing = getAiFeedbackForTarget(targetId)
    if (existing) {
      setRating(existing.rating)
    }
  }, [targetId])

  const handleVote = (nextVote: AiFeedbackRating) => {
    const finalVote = rating === nextVote ? null : nextVote
    setRating(finalVote)
    recordAiFeedback({
      targetId,
      feature,
      rating: finalVote,
      model,
    })

    if (finalVote !== null) {
      setJustRated(true)
      setTimeout(() => setJustRated(false), 1800)
    }
  }

  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"
  const btnPad = size === "sm" ? "p-1" : "p-1.5"

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => handleVote("up")}
        aria-label="Helpful AI response"
        title="Helpful response"
        className={`${btnPad} rounded-md transition cursor-pointer ${
          rating === "up"
            ? "bg-emerald-500/20 text-emerald-400"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
        }`}
      >
        <ThumbsUp className={iconSize} />
      </button>

      <button
        type="button"
        onClick={() => handleVote("down")}
        aria-label="Unhelpful AI response"
        title="Needs improvement"
        className={`${btnPad} rounded-md transition cursor-pointer ${
          rating === "down"
            ? "bg-rose-500/20 text-rose-400"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
        }`}
      >
        <ThumbsDown className={iconSize} />
      </button>

      {justRated && (
        <span className="text-[10px] text-muted-foreground ml-1 animate-in fade-in duration-150">
          Thanks!
        </span>
      )}
    </div>
  )
}
