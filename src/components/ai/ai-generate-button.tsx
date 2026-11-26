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
    "inline-flex items-center justify-center gap-2 rounded-lg text-xs font-semibold px-3.5 py-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"

  const variantStyles = {
    sparkle: "bg-primary text-primary-foreground hover:opacity-90",
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-muted border border-border",
    outline: "border border-border bg-card text-foreground hover:bg-muted",
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
