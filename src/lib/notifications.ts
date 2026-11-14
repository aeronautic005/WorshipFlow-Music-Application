export interface AppNotification {
  id: string
  title: string
  body: string
  type: "setlist_published" | "practice_reminder" | "song_added" | "general"
  created_at: string
  read: boolean
  link?: string
}

const STORAGE_KEY = "worshipflow_notifications_v1"

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Sunday Setlist Published",
    body: "France has published the setlist for Nov 15 service. 3 songs queued.",
    type: "setlist_published",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    read: false,
    link: "/setlists/sl-nov15",
  },
  {
    id: "notif-2",
    title: "Drum Rotation Notice",
    body: "Aeron is on drums for this upcoming Sunday service.",
    type: "general",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    link: "/setlists/sl-nov15",
  },
]

export function getNotifications(): AppNotification[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS))
      return INITIAL_NOTIFICATIONS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_NOTIFICATIONS
  }
}

export function saveNotification(notif: Omit<AppNotification, "id" | "created_at" | "read">): AppNotification {
  const all = getNotifications()
  const newNotif: AppNotification = {
    ...notif,
    id: "notif-" + Date.now(),
    created_at: new Date().toISOString(),
    read: false,
  }
  const updated = [newNotif, ...all]
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }
  return newNotif
}

export function markAsRead(id: string): void {
  if (typeof window === "undefined") return
  const all = getNotifications()
  const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function markAllAsRead(): void {
  if (typeof window === "undefined") return
  const all = getNotifications()
  const updated = all.map((n) => ({ ...n, read: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied"
  }
  if (Notification.permission === "granted") {
    return "granted"
  }
  return await Notification.requestPermission()
}

export async function sendNativeNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window)) return
  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        ...options,
      })
    } catch {
      // Fallback for service worker push if native constructor fails
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready
        reg.showNotification(title, options)
      }
    }
  }
}

export async function notifySetlistPublished(setlist: {
  service_date: string
  song_leader_name?: string
  song_count?: number
}) {
  const title = `Setlist Published for ${setlist.service_date}`
  const body = `${setlist.song_leader_name || "Song leader"} published ${
    setlist.song_count || 4
  } songs. Practice and check in your readiness!`

  // In-app notification
  saveNotification({
    title,
    body,
    type: "setlist_published",
    link: "/setlists",
  })

  // Native web push notification
  await sendNativeNotification(title, {
    body,
    tag: `setlist-${setlist.service_date}`,
  })
}
