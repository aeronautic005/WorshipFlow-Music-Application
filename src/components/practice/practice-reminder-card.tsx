"use client"

import { useState, useEffect } from "react"
import { Bell, Clock, Check, Volume2, Sparkles, Send } from "lucide-react"
import {
  requestNotificationPermission,
  notifySundayRehearsalReminder,
  notifyPracticeReadinessCheckIn,
} from "@/lib/notifications"

const SETTINGS_KEY = "worshipflow_reminder_preferences_v1"

export function PracticeReminderCard({ serviceDate = "2026-11-22" }: { serviceDate?: string }) {
  const [saturdayAlert, setSaturdayAlert] = useState(true)
  const [sundayAlert, setSundayAlert] = useState(true)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [testSent, setTestSent] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        setPermission(Notification.permission)
      }
      try {
        const raw = localStorage.getItem(SETTINGS_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          setSaturdayAlert(parsed.saturday ?? true)
          setSundayAlert(parsed.sunday ?? true)
        }
      } catch {}
    }
  }, [])

  const saveSettings = (sat: boolean, sun: boolean) => {
    setSaturdayAlert(sat)
    setSundayAlert(sun)
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ saturday: sat, sunday: sun }))
    }
  }

  const handleEnablePush = async () => {
    const res = await requestNotificationPermission()
    setPermission(res)
  }

  const handleSendTest = async () => {
    setTestSent(true)
    await notifySundayRehearsalReminder({
      serviceDate,
      rehearsalTime: "9:00 AM",
      serviceTime: "2:30 PM",
    })
    setTimeout(() => setTestSent(false), 3000)
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-secondary text-foreground">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Practice &amp; Rehearsal Reminders</h3>
            <p className="text-xs text-muted-foreground">
              Automatic alerts for home practice and Sunday morning rehearsal
            </p>
          </div>
        </div>

        {permission !== "granted" ? (
          <button
            type="button"
            onClick={handleEnablePush}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-xs shrink-0 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Enable Push Alerts</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>Notifications Active</span>
          </span>
        )}
      </div>

      {/* Reminder Schedule Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Saturday Evening */}
        <button
          type="button"
          onClick={() => saveSettings(!saturdayAlert, sundayAlert)}
          className="flex items-center justify-between p-4 rounded-2xl border border-border bg-secondary/35 hover:bg-secondary/60 transition text-left cursor-pointer"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Saturday Practice Alert</span>
            </div>
            <p className="text-[11px] text-muted-foreground">7:00 PM · Readiness check-in</p>
          </div>
          <span
            role="switch"
            aria-checked={saturdayAlert}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              saturdayAlert ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                saturdayAlert ? "translate-x-4.5" : "translate-x-1"
              }`}
            />
          </span>
        </button>

        {/* Sunday Morning */}
        <button
          type="button"
          onClick={() => saveSettings(saturdayAlert, !sundayAlert)}
          className="flex items-center justify-between p-4 rounded-2xl border border-border bg-secondary/35 hover:bg-secondary/60 transition text-left cursor-pointer"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Sunday Rehearsal Alert</span>
            </div>
            <p className="text-[11px] text-muted-foreground">7:30 AM · Call time at 9:00 AM</p>
          </div>
          <span
            role="switch"
            aria-checked={sundayAlert}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              sundayAlert ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                sundayAlert ? "translate-x-4.5" : "translate-x-1"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Test notification action */}
      <div className="flex items-center justify-between pt-3 border-t border-border/70 text-xs">
        <span className="text-xs text-muted-foreground">
          Want to verify alerts on your device?
        </span>
        <button
          type="button"
          onClick={handleSendTest}
          disabled={testSent}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border bg-card text-xs font-semibold hover:bg-secondary transition text-foreground cursor-pointer disabled:opacity-60"
        >
          {testSent ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sent!</span>
            </>
          ) : (
            <>
              <Send className="w-3 h-3 text-muted-foreground" />
              <span>Send Test Alert</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
