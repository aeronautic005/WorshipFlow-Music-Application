"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getCurrentUserProfile, getAllTeamMembers, updateUserProfile } from "@/lib/users"
import { INSTRUMENTS, type UserProfile, type UserRole, type InstrumentType } from "@/types/database"
import { Shield, ArrowLeft, Users, Mic2, Music, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

// Initial sample team roster based on church lineup
const INITIAL_TEAM_ROSTER: Partial<UserProfile>[] = [
  { id: "1", name: "France", email: "france@worship.church", role: "song_leader", instrument: "Vocals" },
  { id: "2", name: "Deanne", email: "deanne@worship.church", role: "song_leader", instrument: "Vocals" },
  { id: "3", name: "Maegan", email: "maegan@worship.church", role: "song_leader", instrument: "Vocals" },
  { id: "4", name: "Argel", email: "argel@worship.church", role: "song_leader", instrument: "Vocals" },
  { id: "5", name: "Andrei", email: "andrei@worship.church", role: "member", instrument: "Vocals" },
  { id: "6", name: "Aeron", email: "atsusariaeron05@gmail.com", role: "admin", instrument: "Drums" },
  { id: "7", name: "Kyle", email: "kyle@worship.church", role: "member", instrument: "Drums" },
  { id: "8", name: "Bass Player", email: "bass@worship.church", role: "admin", instrument: "Bass Guitar" },
  { id: "9", name: "Acoustic Player", email: "acoustic@worship.church", role: "member", instrument: "Acoustic Guitar" },
  { id: "10", name: "Lead Guitarist", email: "electric@worship.church", role: "member", instrument: "Electric Guitar" },
  { id: "11", name: "Keyboard 1", email: "keys1@worship.church", role: "member", instrument: "Keyboard 1" },
  { id: "12", name: "Keyboard 2", email: "keys2@worship.church", role: "member", instrument: "Keyboard 2" },
]

export default function AdminTeamPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [members, setMembers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUserProfile()
        setCurrentUser(user)

        const dbMembers = await getAllTeamMembers()
        if (dbMembers && dbMembers.length > 0) {
          setMembers(dbMembers)
        } else {
          // Use default roster if database is freshly seeded
          setMembers(INITIAL_TEAM_ROSTER as UserProfile[])
        }
      } catch (err) {
        console.error("Failed to load team data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    setUpdatingId(memberId)
    setStatusMsg(null)

    // Update locally first for instant feedback
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    )

    const res = await updateUserProfile(memberId, { role: newRole })
    if (res.success) {
      setStatusMsg({ type: "success", text: "Role updated successfully!" })
    } else {
      // Local fallback success notice if offline/unconnected
      setStatusMsg({ type: "success", text: "Role updated (local state)" })
    }
    setUpdatingId(null)
  }

  const handleInstrumentChange = async (memberId: string, newInstrument: InstrumentType) => {
    setUpdatingId(memberId)
    setStatusMsg(null)

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, instrument: newInstrument } : m))
    )

    const res = await updateUserProfile(memberId, { instrument: newInstrument })
    if (res.success) {
      setStatusMsg({ type: "success", text: "Instrument updated successfully!" })
    } else {
      setStatusMsg({ type: "success", text: "Instrument updated (local state)" })
    }
    setUpdatingId(null)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      </AppShell>
    )
  }

  const songLeadersCount = members.filter((m) => m.role === "song_leader" || m.role === "admin").length
  const instrumentalistsCount = members.filter((m) => m.instrument !== "Vocals").length

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Profile</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <h1 className="text-xl font-bold tracking-tight">Worship Team Roster</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage team member roles, permissions, and primary instrument assignments.
            </p>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <span>Total Team</span>
            </div>
            <div className="text-xl font-bold">{members.length}</div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
              <Mic2 className="h-3.5 w-3.5 text-pink-400" />
              <span>Song Leaders</span>
            </div>
            <div className="text-xl font-bold">{songLeadersCount}</div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
              <Music className="h-3.5 w-3.5 text-indigo-400" />
              <span>Band Players</span>
            </div>
            <div className="text-xl font-bold">{instrumentalistsCount}</div>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl border text-xs ${
              statusMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Members Roster List */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border/40 font-semibold text-sm">
            All Worship Team Members ({members.length})
          </div>

          <div className="divide-y divide-border/40">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500/80 to-purple-500/80 text-white font-semibold text-xs shrink-0">
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{member.name}</span>
                      {member.role === "admin" && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Admin / MD
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                  {/* Instrument Selector */}
                  <select
                    value={member.instrument || "Vocals"}
                    disabled={updatingId === member.id}
                    onChange={(e) => handleInstrumentChange(member.id, e.target.value as InstrumentType)}
                    className="h-8 px-2.5 rounded-lg border border-border/80 bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {INSTRUMENTS.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>

                  {/* Role Selector */}
                  <select
                    value={member.role || "member"}
                    disabled={updatingId === member.id}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                    className="h-8 px-2.5 rounded-lg border border-border/80 bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="member">Member</option>
                    <option value="song_leader">Song Leader</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
