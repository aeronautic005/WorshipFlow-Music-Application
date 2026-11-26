"use client"

import type { LeaderAnalyticsStat } from "@/lib/analytics"
import { User, Flame, Heart, Music, Calendar, Award } from "lucide-react"

export interface LeaderStatsCardProps {
  leader: LeaderAnalyticsStat
}

export function LeaderStatsCard({ leader }: LeaderStatsCardProps) {
  const totalCategory = leader.joyfulCount + leader.worshipCount
  const joyfulPct = totalCategory > 0 ? Math.round((leader.joyfulCount / totalCategory) * 100) : 50

  return (
    <div className="rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm space-y-4 hover:border-primary/40 transition">
      {/* Top Profile Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center font-bold text-base">
            {leader.leaderName.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{leader.leaderName}</h3>
            <p className="text-xs text-muted-foreground">{leader.vocalProfile}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-mono font-bold text-primary block">
            {leader.totalServicesLed} {leader.totalServicesLed === 1 ? "service" : "services"}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {leader.totalSongsLed} songs led
          </span>
        </div>
      </div>

      {/* Category Split Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-medium">
          <span className="flex items-center gap-1 text-orange-400">
            <Flame className="w-3 h-3" />
            <span>{leader.joyfulCount} Joyful</span>
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <Heart className="w-3 h-3" />
            <span>{leader.worshipCount} Worship</span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-blue-500/30 overflow-hidden flex">
          <div
            className="h-full bg-orange-500 transition-all"
            style={{ width: `${joyfulPct}%` }}
          />
        </div>
      </div>

      {/* Preferred Keys */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Music className="w-3 h-3" />
          <span>Preferred Keys</span>
        </span>
        {leader.preferredKeys.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No key history logged yet</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {leader.preferredKeys.map((k) => (
              <span
                key={k.key}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary font-mono text-xs font-bold"
              >
                <span>{k.key}</span>
                <span className="text-[10px] opacity-75 font-sans font-normal">({k.count}×)</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Top Songs */}
      {leader.topSongs.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" />
            <span>Recent / Top Songs</span>
          </span>
          <div className="space-y-1">
            {leader.topSongs.slice(0, 3).map((song) => (
              <div
                key={song.title}
                className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-muted/40 border border-border/40"
              >
                <span className="font-medium truncate pr-2">{song.title}</span>
                <span className="font-mono text-[11px] text-primary shrink-0">
                  Key {song.key}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Last Led */}
      {leader.lastLedDate && (
        <div className="pt-2 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>Last led Sunday service: {leader.lastLedDate}</span>
        </div>
      )}
    </div>
  )
}
