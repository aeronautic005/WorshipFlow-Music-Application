"use client"

import { ButtonHTMLAttributes } from "react"
import { Sparkles, Loader2 } from "lucide-react"

export interface AiGenerateButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  variant?: "primary" | "secondary" | "outline" | "sparkle"
  iconPosition?: "left" | "right"
}

export function AiGenerateButton({
  children = "Generate with AI",
  isLoading = false,
  loadingText = "Thinking...",
  variant = "sparkle",
  iconPosition = "left",
  disabled,
  className = "",
  ...props
}: AiGenerateButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold px-3.5 py-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]"

  const variantStyles = {
    sparkle:
      "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-950/30 border border-purple-400/30",
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
    outline:
      "border border-purple-500/40 text-purple-400 hover:bg-purple-500/10",
  }

  return (
    <button
      type="button"
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {iconPosition === "left" && <Sparkles className="w-3.5 h-3.5" />}
          <span>{children}</span>
          {iconPosition === "right" && <Sparkles className="w-3.5 h-3.5" />}
        </>
      )}
    </button>
  )
}
