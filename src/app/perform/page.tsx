"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSetlists, type FullSetlist } from "@/lib/setlists"
import { SetlistStatusBadge } from "@/components/setlist/setlist-status-badge"
import { Radio, Calendar, User, Music2, Play, AlertTriangle } from "lucide-react"

export default function PerformEntryPage() {
  const [setlists, setSetlists] = useState<FullSetlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getSetlists()
      setSetlists(data)
      setLoading(false)
    }
    load()
  }, [])

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], [])

  // Upcoming published services first (nearest date), then the rest
  const ordered = useMemo(() => {
    const upcoming = setlists
      .filter((s) => s.service_date >= todayStr)
      .sort((a, b) => a.service_date.localeCompare(b.service_date))
    const past = setlists
      .filter((s) => s.service_date < todayStr)
      .sort((a, b) => b.service_date.localeCompare(a.service_date))
    return [...upcoming, ...past]
  }, [setlists, todayStr])

  const featured = ordered.find((s) => s.status === "published") || ordered[0] || null

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/30 via-background to-background p-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/20">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Live Performance Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Start Sunday Service</h1>
          <p className="text-sm text-muted-foreground">
            Choose the service setlist. The whole team follows the same song and section in real time,
            so no one skips the bridge or comes in early on the chorus.
          </p>
        </div>

        {/* Featured service */}
        {loading ? (
          <div className="h-40 rounded-2xl border bg-muted/20 animate-pulse" />
        ) : featured ? (
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                  Next Service
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-lg font-bold">
                    {new Date(featured.service_date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                  <SetlistStatusBadge status={featured.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Lead: {featured.song_leader_name || "TBA"}
                  </span>
                  <span>Drums: {featured.drummer_name || "TBA"}</span>
                  <span className="flex items-center gap-1">
                    <Music2 className="h-3.5 w-3.5" /> {featured.songs?.length || 0} songs
                  </span>
                </p>
              </div>
              <Link
                href={`/perform/${featured.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md transition"
              >
                <Play className="h-4 w-4 fill-current" />
                Go Live
              </Link>
            </div>

            {featured.status !== "published" && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                This setlist is still a draft. Publish it so the arrangement is locked before going live.
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {(featured.songs || []).map((s, i) => (
                <span key={s.id || i} className="text-xs px-2.5 py-1 rounded-md border bg-muted/40">
                  <span className="text-muted-foreground font-mono mr-1">{i + 1}.</span>
                  {s.title}
                  <span className="ml-1.5 font-mono font-bold text-primary">{s.assigned_key}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl border border-dashed text-sm text-muted-foreground">
            No setlists yet.{" "}
            <Link href="/setlists/builder" className="text-primary hover:underline">
              Build one first
            </Link>
          </div>
        )}

        {/* Other services */}
        {ordered.length > 1 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Other Services
            </h3>
            {ordered
              .filter((s) => s.id !== featured?.id)
              .map((s) => (
                <Link
                  key={s.id}
                  href={`/perform/${s.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-red-500/40 transition text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {new Date(s.service_date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <SetlistStatusBadge status={s.status} />
                    {s.service_date < todayStr && (
                      <span className="text-[10px] text-muted-foreground">(past)</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {s.song_leader_name} · {s.songs?.length || 0} songs
                  </span>
                </Link>
              ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
