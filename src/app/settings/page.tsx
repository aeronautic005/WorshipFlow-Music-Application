"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { applyThemePreference } from "@/components/layout/theme-toggle"
import {
  Settings,
  Sun,
  Moon,
  Bell,
  Radio,
  CheckCircle2,
  ArrowLeft,
  Save,
  Smartphone,
} from "lucide-react"

interface AppSettingsState {
  theme: "dark" | "light"
  practiceReminders: boolean
  setlistPublishedAlerts: boolean
  saturdayCheckAlerts: boolean
  keepScreenAwakeDefault: boolean
  showStageNotesByDefault: boolean
  chordFontSize: "standard" | "large"
}

const DEFAULT_SETTINGS: AppSettingsState = {
  theme: "dark",
  practiceReminders: true,
  setlistPublishedAlerts: true,
  saturdayCheckAlerts: true,
  keepScreenAwakeDefault: true,
  showStageNotesByDefault: true,
  chordFontSize: "standard",
}

const SETTINGS_STORAGE_KEY = "worshipflow_settings_v1"
const THEME_STORAGE_KEY = "worshipflow_theme_v1"

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettingsState>(DEFAULT_SETTINGS)
  const [savedToast, setSavedToast] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as "dark" | "light" | null
      if (raw) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(raw),
          ...(savedTheme ? { theme: savedTheme } : {}),
        })
      } else if (savedTheme) {
        setSettings({ ...DEFAULT_SETTINGS, theme: savedTheme })
      }
    } catch {
      // keep defaults
    }
  }, [])

  const updateSetting = <K extends keyof AppSettingsState>(
    key: K,
    value: AppSettingsState[K]
  ) => {
    const next = { ...settings, [key]: value }
    setSettings(next)

    if (key === "theme") {
      localStorage.setItem(THEME_STORAGE_KEY, value as string)
      applyThemePreference(value as "dark" | "light")
    }

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next))
      setSavedToast(true)
      setTimeout(() => setSavedToast(false), 1800)
    } catch (err) {
      console.error("Failed to save settings:", err)
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              <span>App Settings</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize appearance, weekly practice reminders, and live stage preferences.
            </p>
          </div>

          {savedToast && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-in fade-in duration-150">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved</span>
            </div>
          )}
        </div>

        {/* Appearance Section */}
        <section className="rounded-2xl border border-border/70 bg-card/80 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Sun className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold">Theme &amp; Appearance</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateSetting("theme", "dark")}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
                settings.theme === "dark"
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/70 bg-background/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <div className="text-xs font-bold">Dark Stage Theme</div>
                <div className="text-[11px] opacity-75">Low-light sanctuary friendly</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateSetting("theme", "light")}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
                settings.theme === "light"
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/70 bg-background/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-bold">Light Theme</div>
                <div className="text-[11px] opacity-75">Bright daylight readability</div>
              </div>
            </button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="rounded-2xl border border-border/70 bg-card/80 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Bell className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold">Practice &amp; Setlist Notifications</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-background/50 cursor-pointer">
              <div>
                <div className="text-xs font-semibold">Mid-week Practice Reminders</div>
                <div className="text-[11px] text-muted-foreground">
                  Friendly nudges on Wednesday &amp; Friday before Sunday 9:00 AM rehearsal
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.practiceReminders}
                onChange={(e) => updateSetting("practiceReminders", e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-background/50 cursor-pointer">
              <div>
                <div className="text-xs font-semibold">New Setlist Published Alerts</div>
                <div className="text-[11px] text-muted-foreground">
                  Notify when the weekly Song Leader publishes Sunday&apos;s lineup
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.setlistPublishedAlerts}
                onChange={(e) => updateSetting("setlistPublishedAlerts", e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-background/50 cursor-pointer">
              <div>
                <div className="text-xs font-semibold">Saturday Night Readiness Check</div>
                <div className="text-[11px] text-muted-foreground">
                  Final reminder to mark practice status before Sunday morning
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.saturdayCheckAlerts}
                onChange={(e) => updateSetting("saturdayCheckAlerts", e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
            </label>
          </div>
        </section>

        {/* Live Performance Mode Defaults */}
        <section className="rounded-2xl border border-border/70 bg-card/80 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Radio className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold">Live Performance &amp; Display</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-background/50 cursor-pointer">
              <div>
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Keep Screen Awake in Live Mode</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Prevent phone/tablet screen dimming during the 2:30 PM service
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.keepScreenAwakeDefault}
                onChange={(e) => updateSetting("keepScreenAwakeDefault", e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-background/50 cursor-pointer">
              <div>
                <div className="text-xs font-semibold">Show Arrangement Cues Automatically</div>
                <div className="text-[11px] text-muted-foreground">
                  Display section dynamic notes (&quot;Drums build&quot;, &quot;Pad only&quot;) under active section
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showStageNotesByDefault}
                onChange={(e) => updateSetting("showStageNotesByDefault", e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
            </label>

            <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-background/50">
              <div>
                <div className="text-xs font-semibold">Chord Chart Font Size</div>
                <div className="text-[11px] text-muted-foreground">
                  Adjust readability for music stands or tablets
                </div>
              </div>
              <select
                value={settings.chordFontSize}
                onChange={(e) =>
                  updateSetting("chordFontSize", e.target.value as "standard" | "large")
                }
                className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-semibold"
              >
                <option value="standard">Standard</option>
                <option value="large">Large (Stage Stand)</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
