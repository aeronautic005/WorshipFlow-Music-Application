"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getSetlists, type FullSetlist } from "@/lib/setlists"
import { SetlistStatusBadge } from "@/components/setlist/setlist-status-badge"
import { Calendar, User, Music2, Play, AlertTriangle, ArrowRight } from "lucide-react"

export default function PerformEntryPage() {
  const [setlists, setSetlists] = useState<FullSetlist[]>([])
  const [loading, setLoading] = useState(true)
  const [todayStr, setTodayStr] = useState("")

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0])
    async function load() {
      const data = await getSetlists()
      setSetlists(data)
      setLoading(false)
    }
    load()
  }, [])

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

  const featuredDateObj = featured ? new Date(featured.service_date + "T00:00:00") : null
  const featuredMonth = featuredDateObj
    ? featuredDateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    : ""
  const featuredDay = featuredDateObj
    ? featuredDateObj.toLocaleDateString("en-US", { day: "2-digit" })
    : ""

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Clean White + Deep Navy Header Card */}
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-[0_2px_12px_rgba(15,37,74,0.04)] space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary border border-border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]" />
            </span>
            <span>Live Performance Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
            Start Sunday Service
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Choose the service setlist. The whole team follows the same song and section in real time,
            so no one skips the bridge or comes in early on the chorus.
          </p>
        </div>

        {/* Featured Next Service Card */}
        {loading ? (
          <div className="h-44 rounded-3xl border border-border/70 bg-card animate-pulse" />
        ) : featured ? (
          <div className="rounded-3xl border border-border/70 bg-card overflow-hidden shadow-[0_2px_12px_rgba(15,37,74,0.04)]">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                {/* Deep Navy Date Block */}
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center shrink-0 leading-none">
                  <span className="text-[10px] font-semibold tracking-wider opacity-80">
                    {featuredMonth}
                  </span>
                  <span className="text-xl font-extrabold mt-0.5">{featuredDay}</span>
                </div>

                <div className="space-y-1 min-w-0">
                  <p className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                    Next Service
                  </p>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg font-bold text-primary">
                      {featuredDateObj?.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h2>
                    <SetlistStatusBadge status={featured.status} />
                  </div>
                  <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3.5 gap-y-1 pt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-primary" />
                      Lead:{" "}
                      <strong className="text-foreground font-semibold">
                        {featured.song_leader_name || "TBA"}
                      </strong>
                    </span>
                    <span>
                      Drums:{" "}
                      <strong className="text-foreground font-semibold">
                        {featured.drummer_name || "TBA"}
                      </strong>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Music2 className="h-3.5 w-3.5 text-primary" />
                      {featured.songs?.length || 0} songs
                    </span>
                  </p>
                </div>
              </div>

              {/* Preserved Go Live Button */}
              <Link
                href={`/perform/${featured.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md transition shrink-0"
              >
                <Play className="h-4 w-4 fill-current" />
                Go Live
              </Link>
            </div>

            {featured.status !== "published" && (
              <div className="mx-6 mb-4 flex items-center gap-2 p-3 rounded-xl bg-secondary border border-border text-xs text-foreground">
                <AlertTriangle className="h-4 w-4 text-primary shrink-0" />
                <span>
                  This setlist is still a draft. Publish it so the arrangement is locked before going live.
                </span>
              </div>
            )}

            {/* Clean Lineup Footer Strip */}
            <div className="px-6 py-4 bg-secondary/40 border-t border-border/70 flex flex-wrap gap-2">
              {(featured.songs || []).map((s, i) => (
                <span
                  key={s.id || i}
                  className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-full border border-border bg-card text-xs"
                >
                  <span className="text-muted-foreground font-semibold">{i + 1}.</span>
                  <span className="font-semibold text-foreground">{s.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                    {s.assigned_key}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 rounded-3xl border border-dashed border-border bg-card text-sm text-muted-foreground">
            No setlists yet.{" "}
            <Link href="/setlists/builder" className="text-primary font-semibold hover:underline">
              Build one first
            </Link>
          </div>
        )}

        {/* Other Services */}
        {ordered.length > 1 && (
          <div className="space-y-2.5 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 px-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Other Services</span>
            </h3>

            <div className="space-y-2">
              {ordered
                .filter((s) => s.id !== featured?.id)
                .map((s) => (
                  <Link
                    key={s.id}
                    href={`/perform/${s.id}`}
                    className="group flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl border border-border/70 bg-card hover:border-primary/40 shadow-[0_2px_8px_rgba(15,37,74,0.03)] transition-all text-sm"
                  >
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-primary">
                        {new Date(s.service_date + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <SetlistStatusBadge status={s.status} />
                      {todayStr && s.service_date < todayStr && (
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Past
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <span>
                        <strong className="text-foreground font-semibold">
                          {s.song_leader_name}
                        </strong>{" "}
                        · {s.songs?.length || 0} songs
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
