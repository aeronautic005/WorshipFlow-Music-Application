"use client"

import { useEffect, useState } from "react"
import { Sun, SunDim, Maximize2, Minimize2 } from "lucide-react"

export function ScreenWakeControls() {
  const [isWakeLocked, setIsWakeLocked] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [wakeLockSupported, setWakeLockSupported] = useState(false)

  useEffect(() => {
    let wakeLockSentinel: any = null

    async function requestLock() {
      if (typeof window !== "undefined" && "wakeLock" in navigator) {
        setWakeLockSupported(true)
        try {
          wakeLockSentinel = await (navigator as any).wakeLock.request("screen")
          setIsWakeLocked(true)

          wakeLockSentinel.addEventListener("release", () => {
            setIsWakeLocked(false)
          })
        } catch {
          setIsWakeLocked(false)
        }
      }
    }

    // Auto-request wake lock on mount for performance mode
    requestLock()

    // Re-acquire wake lock if page becomes visible again
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        await requestLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (wakeLockSentinel) {
        try {
          wakeLockSentinel.release()
        } catch {}
      }
    }
  }, [])

  const toggleWakeLock = async () => {
    if (typeof window === "undefined" || !("wakeLock" in navigator)) return

    if (isWakeLocked) {
      setIsWakeLocked(false)
    } else {
      try {
        await (navigator as any).wakeLock.request("screen")
        setIsWakeLocked(true)
      } catch {
        setIsWakeLocked(false)
      }
    }
  }

  const toggleFullscreen = async () => {
    if (typeof document === "undefined") return

    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } catch {}
    } else {
      try {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } catch {}
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Wake Lock Button */}
      <button
        type="button"
        onClick={toggleWakeLock}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
          isWakeLocked
            ? "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-500/15 dark:border-amber-500/40 dark:text-amber-300"
            : "bg-card border-border text-foreground hover:bg-secondary dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        }`}
        title={
          isWakeLocked
            ? "Screen Wake Lock active: screen won't sleep during worship"
            : "Screen Wake Lock inactive: click to prevent screen sleep"
        }
      >
        {isWakeLocked ? <Sun className="w-3.5 h-3.5" /> : <SunDim className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{isWakeLocked ? "Awake" : "Sleep"}</span>
      </button>

      {/* Fullscreen Button */}
      <button
        type="button"
        onClick={toggleFullscreen}
        className="p-1.5 rounded-full border bg-card border-border text-foreground hover:bg-secondary dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
        aria-label="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
