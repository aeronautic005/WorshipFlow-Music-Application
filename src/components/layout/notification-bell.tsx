"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Bell, Check, Sparkles, X, Volume2 } from "lucide-react"
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  requestNotificationPermission,
  type AppNotification,
} from "@/lib/notifications"

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setNotifications(getNotifications())
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [open])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleEnablePush = async () => {
    const res = await requestNotificationPermission()
    setPermissionStatus(res)
  }

  const handleItemClick = (id: string) => {
    markAsRead(id)
    setNotifications(getNotifications())
    setOpen(false)
  }

  const handleMarkAllRead = () => {
    markAllAsRead()
    setNotifications(getNotifications())
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border bg-card text-card-foreground shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b bg-muted/20">
            <div className="flex items-center gap-1.5 font-semibold text-sm">
              <Bell className="w-4 h-4 text-primary" />
              <span>Team Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Web Push Permission Banner */}
          {permissionStatus !== "granted" && (
            <div className="p-3 bg-primary/5 border-b flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">
                  Get notified when weekly setlists are published
                </span>
              </div>
              <button
                onClick={handleEnablePush}
                className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold shrink-0 hover:bg-primary/90 transition"
              >
                Enable
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => handleItemClick(n.id)}
                  className={`block p-3.5 hover:bg-muted/40 transition text-xs ${
                    !n.read ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                        <p className="font-semibold text-foreground text-xs">{n.title}</p>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                        {n.body}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                    {new Date(n.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
