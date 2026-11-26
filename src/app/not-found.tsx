import Link from "next/link"
import { Music, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full rounded-2xl border border-border/80 bg-card p-6 text-center space-y-5 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
          <Music className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            404 — Page Not Found
          </span>
          <h1 className="text-xl font-bold tracking-tight">We couldn&apos;t find that chart</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The song, setlist, or page you requested doesn&apos;t exist or may have been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </Link>

          <Link
            href="/songs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Song Library</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
