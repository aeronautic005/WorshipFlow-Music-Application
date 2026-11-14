"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getAllTeamMembers } from "@/lib/users"
import type { UserProfile } from "@/types/database"
import {
  ArrowLeft,
  Calendar,
  User,
  Users,
  Mic2,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react"

// Helper to get upcoming Sunday date formatted as YYYY-MM-DD
function getNextSunday(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = (7 - day) % 7 || 7
  const nextSunday = new Date(now)
  nextSunday.setDate(now.getDate() + diff)
  return nextSunday.toISOString().split("T")[0]
}

export default function NewSetlistPage() {
  const router = useRouter()
  const [members, setMembers] = useState<UserProfile[]>([])

  // Form states
  const [serviceDate, setServiceDate] = useState(getNextSunday())
  const [songLeaderId, setSongLeaderId] = useState("")
  const [backupSingerId, setBackupSingerId] = useState("")
  const [drummerId, setDrummerId] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMembers() {
      const data = await getAllTeamMembers()
      setMembers(data)
      // Pick first song leader and drummer if available
      const firstLeader = data.find((m) => m.role === "song_leader" || m.role === "admin")
      if (firstLeader) setSongLeaderId(firstLeader.id)

      const firstDrummer = data.find((m) => m.instrument === "Drums")
      if (firstDrummer) setDrummerId(firstDrummer.id)
    }
    loadMembers()
  }, [])

  const songLeaders = members.filter((m) => m.role === "song_leader" || m.role === "admin")
  const vocalists = members.filter((m) => m.instrument === "Vocals" || m.role === "song_leader")
  const drummers = members.filter((m) => m.instrument === "Drums")

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceDate || !songLeaderId) {
      setError("Please select the service date and the song leader.")
      return
    }

    // Pass configuration to song selection step via URL parameters or state
    const params = new URLSearchParams({
      date: serviceDate,
      leader: songLeaderId,
      backup: backupSingerId,
      drummer: drummerId,
      notes: notes,
    })

    router.push(`/setlists/builder?${params.toString()}`)
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="space-y-1">
          <Link
            href="/setlists"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Setlists</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Create Weekly Setlist</h1>
              <p className="text-xs text-muted-foreground">
                Step 1 of 2: Set the service date, assigned song leader, backup singer, and drummer.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs">
            {error}
          </div>
        )}

        {/* Setlist Setup Card */}
        <form onSubmit={handleNext} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
          {/* Sunday Service Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Sunday Service Date *</span>
            </label>
            <input
              type="date"
              required
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <p className="text-[11px] text-muted-foreground">
              Rehearsal is on Sunday morning; live worship service is Sunday afternoon.
            </p>
          </div>

          {/* Song Leader Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-blue-400" />
              <span>Main Song Leader *</span>
            </label>
            <select
              required
              value={songLeaderId}
              onChange={(e) => setSongLeaderId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">Select Song Leader...</option>
              {songLeaders.length > 0 ? (
                songLeaders.map((leader) => (
                  <option key={leader.id} value={leader.id}>
                    {leader.name} ({leader.role === "admin" ? "Admin / Leader" : "Song Leader"})
                  </option>
                ))
              ) : (
                <>
                  <option value="france">France</option>
                  <option value="deanne">Deanne</option>
                  <option value="maegan">Maegan</option>
                  <option value="argel">Argel</option>
                </>
              )}
            </select>
          </div>

          {/* Backup Singer Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Mic2 className="h-3.5 w-3.5 text-pink-400" />
              <span>Backup Singer (Optional)</span>
            </label>
            <select
              value={backupSingerId}
              onChange={(e) => setBackupSingerId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">None / Solo</option>
              {vocalists.length > 0 ? (
                vocalists.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="andrei">Andrei</option>
                  <option value="deanne">Deanne</option>
                  <option value="maegan">Maegan</option>
                </>
              )}
            </select>
          </div>

          {/* Drummer Rotation Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span>Assigned Drummer</span>
            </label>
            <select
              value={drummerId}
              onChange={(e) => setDrummerId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">Select Drummer...</option>
              {drummers.length > 0 ? (
                drummers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (Drums)
                  </option>
                ))
              ) : (
                <>
                  <option value="kyle">Kyle</option>
                  <option value="aeron">Aeron</option>
                </>
              )}
            </select>
            <p className="text-[11px] text-muted-foreground">
              Alternates weekly between Kyle and Aeron.
            </p>
          </div>

          {/* Service Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Service Notes / Instructions (Optional)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Communion service, fast song transitions, special altar call song..."
              className="w-full p-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Next Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-colors shadow-sm"
            >
              <span>Proceed to Song Selection</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
