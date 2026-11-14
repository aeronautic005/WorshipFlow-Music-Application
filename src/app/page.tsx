import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import {
  CalendarDays,
  Music,
  CheckCircle2,
  Radio,
  Sparkles,
} from "lucide-react"
import { WeekAtAGlanceCard } from "@/components/setlist/week-at-a-glance"

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
              <div className="text-xs text-muted-foreground">Lineup & archives</div>
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

        {/* Dynamic Week At A Glance Card */}
        <WeekAtAGlanceCard />
      </div>
    </AppShell>
  )
}
