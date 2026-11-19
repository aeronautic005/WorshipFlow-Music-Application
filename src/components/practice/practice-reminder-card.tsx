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
    <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Practice & Rehearsal Reminders</h3>
            <p className="text-[11px] text-muted-foreground">
              Automatic alerts for home practice and Sunday morning rehearsal
            </p>
          </div>
        </div>

        {permission !== "granted" ? (
          <button
            type="button"
            onClick={handleEnablePush}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Enable Push Alerts
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            Notifications Active
          </span>
        )}
      </div>

      {/* Reminder Schedule Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Saturday Evening */}
        <div className="flex items-center justify-between p-3 rounded-xl border bg-background/60">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Saturday Practice Alert</span>
            </div>
            <p className="text-[11px] text-muted-foreground">7:00 PM • Readiness check-in</p>
          </div>
          <input
            type="checkbox"
            checked={saturdayAlert}
            onChange={(e) => saveSettings(e.target.checked, sundayAlert)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        {/* Sunday Morning */}
        <div className="flex items-center justify-between p-3 rounded-xl border bg-background/60">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Sunday Rehearsal Alert</span>
            </div>
            <p className="text-[11px] text-muted-foreground">7:30 AM • Call time at 9:00 AM</p>
          </div>
          <input
            type="checkbox"
            checked={sundayAlert}
            onChange={(e) => saveSettings(saturdayAlert, e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Test notification action */}
      <div className="flex items-center justify-between pt-2 border-t text-xs">
        <span className="text-[11px] text-muted-foreground">
          Want to verify alerts on your device?
        </span>
        <button
          type="button"
          onClick={handleSendTest}
          disabled={testSent}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition text-foreground"
        >
          {testSent ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sent!</span>
            </>
          ) : (
            <>
              <Send className="w-3 h-3 text-primary" />
              <span>Send Test Alert</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
