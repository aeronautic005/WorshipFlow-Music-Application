"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  DEFAULT_CHURCH_INVITE_CODE,
  saveOnboardingProfile,
  getOnboardingProfile,
} from "@/lib/onboarding"
import {
  Music,
  Mic2,
  User,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Calendar,
  Radio,
} from "lucide-react"

const ROLES = [
  {
    id: "song_leader" as const,
    label: "Song Leader",
    desc: "Leads Sunday worship, chooses keys, publishes weekly setlist",
  },
  {
    id: "backup_vocal" as const,
    label: "Backup Vocalist",
    desc: "Supports lead vocals with harmonies and congregation cues",
  },
  {
    id: "musician" as const,
    label: "Band Musician",
    desc: "Drums, Keys 1 & 2, Electric/Acoustic Guitar, or Bass",
  },
]

const INSTRUMENTS = [
  "Vocals (Lead)",
  "Vocals (Backup)",
  "Drums",
  "Keyboard 1 (Piano)",
  "Keyboard 2 (Pad / Synth)",
  "Electric Guitar",
  "Acoustic Guitar",
  "Bass Guitar",
]

const VOCAL_RANGES = [
  "Soprano (C4 – A5)",
  "Mezzo / Alto (F3 – D5)",
  "Tenor (C3 – A4)",
  "Baritone / Bass (G2 – E4)",
  "Instrumentalist Only",
]

function OnboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState(1)
  const [inviteCode, setInviteCode] = useState(DEFAULT_CHURCH_INVITE_CODE)
  const [name, setName] = useState("")
  const [role, setRole] = useState<"song_leader" | "backup_vocal" | "musician">("musician")
  const [instrument, setInstrument] = useState("Keyboard 1 (Piano)")
  const [vocalRange, setVocalRange] = useState("Instrumentalist Only")
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const codeParam = searchParams.get("code")
    if (codeParam) setInviteCode(codeParam)

    const existing = getOnboardingProfile()
    if (existing) {
      setName(existing.name)
      setRole(existing.role)
      setInstrument(existing.instrument)
      if (existing.vocalRange) setVocalRange(existing.vocalRange)
    }
  }, [searchParams])

  const handleFinish = () => {
    saveOnboardingProfile({
      name: name.trim() || "Team Member",
      role,
      instrument,
      vocalRange,
      inviteCode: inviteCode.trim(),
      completedAt: new Date().toISOString(),
    })
    setCompleted(true)
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
        <div className="max-w-md w-full rounded-2xl border border-emerald-500/30 bg-card p-6 text-center space-y-5 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold tracking-tight">
              Welcome to the Team, {name || "Musician"}!
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your WorshipFlow profile is ready for <strong>{instrument}</strong>. You&apos;re all set for home practice, Sunday 9:00 AM rehearsal, and 2:30 PM live service.
            </p>
          </div>

          <div className="rounded-xl bg-muted/40 border border-border/50 p-3.5 text-left space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Check weekly setlists &amp; keys before Saturday</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Use Live Mode on Sunday 2:30 PM for real-time song cues</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Enter WorshipFlow Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="max-w-lg w-full rounded-2xl border border-border/80 bg-card p-6 space-y-6 shadow-xl">
        {/* Top Branding & Step Progress */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-pink-500 text-white flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none">WorshipFlow Onboarding</h1>
              <span className="text-[11px] text-muted-foreground">Step {step} of 3</span>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Invite Code & Name */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Join Your Music Team</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Confirm your team invite code and tell us what to call you on the roster.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  <span>Team Invite Code</span>
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="WORSHIP-SUNDAY-2026"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Your First Name / Nickname</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Kyle, France, Maegan, Aeron..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Role & Primary Instrument */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Role &amp; Instrument</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select how you serve during Sunday services.
              </p>
            </div>

            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`w-full p-3 rounded-xl border text-left transition cursor-pointer ${
                    role === r.id
                      ? "border-primary bg-primary/10"
                      : "border-border/70 bg-background/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="text-xs font-bold text-foreground">{r.label}</div>
                  <div className="text-[11px] text-muted-foreground">{r.desc}</div>
                </button>
              ))}
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Primary Instrument / Position
              </label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {INSTRUMENTS.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Vocal Comfort & AI Preferences */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <Mic2 className="w-5 h-5 text-purple-400" />
                <span>Vocal Range &amp; Key Matching</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Helps WorshipFlow AI recommend comfortable keys when you lead or sing backup.
              </p>
            </div>

            <div className="space-y-2">
              {VOCAL_RANGES.map((vr) => (
                <button
                  key={vr}
                  type="button"
                  onClick={() => setVocalRange(vr)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                    vocalRange === vr
                      ? "border-purple-500 bg-purple-500/15 text-foreground"
                      : "border-border/70 bg-background/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {vr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
              Skip for now
            </Link>
          )}

          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 && !name.trim()}
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complete Setup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OnboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <OnboardContent />
    </Suspense>
  )
}
