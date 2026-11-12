"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { getCurrentUserProfile, updateUserProfile } from "@/lib/users"
import { signOut } from "@/lib/auth"
import { INSTRUMENTS, type UserProfile, type InstrumentType } from "@/types/database"
import { User, Phone, Music, Mic2, LogOut, Loader2, CheckCircle2, AlertCircle, Shield } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [instrument, setInstrument] = useState<InstrumentType>("Vocals")
  const [vocalRange, setVocalRange] = useState("")

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCurrentUserProfile()
        if (data) {
          setProfile(data)
          setName(data.name || "")
          setPhone(data.phone || "")
          setInstrument((data.instrument as InstrumentType) || "Vocals")
          setVocalRange(data.vocal_range || "")
        }
      } catch (err: unknown) {
        console.error("Failed to load profile:", err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    setMessage(null)

    const res = await updateUserProfile(profile.id, {
      name: name.trim(),
      phone: phone.trim() || null,
      instrument,
      vocal_range: vocalRange.trim() || null,
    })

    if (res.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" })
      setProfile((prev) => (prev ? { ...prev, name, phone, instrument, vocal_range: vocalRange } : null))
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update profile." })
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
      router.refresh()
    } catch (err) {
      console.error("Sign out failed:", err)
    }
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

  const roleBadgeColor = {
    admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    song_leader: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    member: "bg-muted text-muted-foreground border-border/40",
  }[profile?.role || "member"]

  return (
    <AppShell>
      <div className="max-w-xl mx-auto space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center justify-between p-5 rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold text-lg shadow-inner">
              {name ? name.substring(0, 2).toUpperCase() : "WF"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{name || "Musician"}</h1>
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                  {profile?.role === "song_leader" ? "Song Leader" : profile?.role || "Member"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{profile?.email || "No email linked"}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Message notification */}
        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl border text-xs ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold border-b border-border/40 pb-3">Musician Details</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 912 345 6789"
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Primary Instrument / Role</span>
            </label>
            <select
              value={instrument}
              onChange={(e) => setInstrument(e.target.value as InstrumentType)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {INSTRUMENTS.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Mic2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Vocal Range / Notes (Optional)</span>
            </label>
            <input
              type="text"
              value={vocalRange}
              onChange={(e) => setVocalRange(e.target.value)}
              placeholder="e.g. Alto (C4 - F5) or Tenor"
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Save Profile</span>}
            </button>
          </div>
        </form>

        {/* Admin Navigation Shortcut */}
        {profile?.role === "admin" && (
          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-xs font-semibold text-purple-300">Admin Privileges</div>
                <div className="text-[11px] text-muted-foreground">Manage worship team roster & roles</div>
              </div>
            </div>
            <button
              onClick={() => router.push("/admin/team")}
              className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 font-medium transition-colors"
            >
              Team Roster
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
