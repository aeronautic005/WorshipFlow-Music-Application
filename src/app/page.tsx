import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import {
  CalendarDays,
  Music,
  CheckCircle2,
  Radio,
  Sparkles,
  ArrowRight,
  Flame,
  Heart,
  User,
} from "lucide-react"

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-background to-background p-5 sm:p-6 shadow-sm">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-3 w-3" />
              <span>Music Team Companion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready for Sunday Worship
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              One source of truth for weekly setlists, agreed song structures, unified practice references, and live worship synchronization.
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/setlists"
            className="group flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/40 hover:border-indigo-500/30 transition-all shadow-sm"
          >
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 w-fit mb-3 group-hover:scale-105 transition-transform">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">Weekly Setlist</div>
              <div className="text-xs text-muted-foreground">Nov 15 lineup</div>
            </div>
          </Link>

          <Link
            href="/songs"
            className="group flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/40 hover:border-indigo-500/30 transition-all shadow-sm"
          >
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit mb-3 group-hover:scale-105 transition-transform">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">Song Library</div>
              <div className="text-xs text-muted-foreground">Chords & keys</div>
            </div>
          </Link>

          <Link
            href="/practice"
            className="group flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/40 hover:border-indigo-500/30 transition-all shadow-sm"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-3 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">Practice Hub</div>
              <div className="text-xs text-muted-foreground">Check-in readiness</div>
            </div>
          </Link>

          <Link
            href="/perform"
            className="group flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/40 hover:border-red-500/30 transition-all shadow-sm"
          >
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 w-fit mb-3 group-hover:scale-105 transition-transform">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">Live Service</div>
              <div className="text-xs text-muted-foreground">Follow structure</div>
            </div>
          </Link>
        </div>

        {/* Current Setlist Preview Card */}
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <h2 className="font-semibold text-base">This Week&apos;s Lineup</h2>
            </div>
            <Link
              href="/setlists"
              className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium"
            >
              <span>View full setlist</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/40">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <User className="h-3.5 w-3.5 text-blue-400" />
              <span>Leader: <strong>France</strong></span>
            </div>
            <span className="text-border">•</span>
            <div>Backup: <strong>Andrei</strong></div>
            <span className="text-border">•</span>
            <div>Drums: <strong>Aeron</strong></div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border/30 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="p-1 rounded bg-orange-500/10 text-orange-400">
                  <Flame className="h-3.5 w-3.5" />
                </span>
                <div>
                  <div className="text-sm font-medium">Thank God I&apos;m Free</div>
                  <div className="text-[11px] text-muted-foreground">Fast / Joyful</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-muted font-mono font-medium">Key: G</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border/30 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="p-1 rounded bg-blue-500/10 text-blue-400">
                  <Heart className="h-3.5 w-3.5" />
                </span>
                <div>
                  <div className="text-sm font-medium">Jesus Be The Center</div>
                  <div className="text-[11px] text-muted-foreground">Slow / Worship</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-muted font-mono font-medium">Key: D</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border/30 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="p-1 rounded bg-blue-500/10 text-blue-400">
                  <Heart className="h-3.5 w-3.5" />
                </span>
                <div>
                  <div className="text-sm font-medium">Shout To The Lord</div>
                  <div className="text-[11px] text-muted-foreground">Slow / Worship</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-muted font-mono font-medium">Key: A</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
