# WorshipFlow — Church Music Team Companion (v1.0)

**WorshipFlow** is a full-stack, mobile-first Progressive Web App (PWA) built for church worship teams to organize weekly setlists, standardize song arrangements, prepare during the week, and stay synchronized on stage every Sunday.

---

## Built Around Our Weekly Worship Routine

- **Lineup Format:** 4–6 songs per Sunday service — **2–3 Joyful (Fast Praise)** songs followed by **2–3 Worship (Slow)** songs.
- **Weekday – Saturday:** Individual home practice using unified chord sheets, reference links, capo transpositions, and personal practice notes.
- **Sunday 9:00 AM:** Full-band rehearsal run-through with shared **Song Structure Blueprints**, dynamic cues, and AI-generated rehearsal briefings.
- **Sunday 2:30 PM:** Live service execution with low-light **Live Performance Mode** and real-time Supabase section syncing across phones and tablets.

### Team Roster Model
- **5 Rotating Vocal Song Leaders:** France, Maegan, Deanne, Argel, and Andrei (leaders serve as backup vocalists when not leading the week).
- **2 Alternating Drummers:** Kyle and Aeron.
- **Band Instrumentation:** Keyboard 1 (Piano), Keyboard 2 (Pad/Synth), Electric Guitar, Acoustic Guitar, and Bass Guitar.

---

## Key Features

### 1. Song Library & Chord Engine
- Full searchable catalog filterable by **Joyful / Worship**, key, and BPM.
- **Real-Time Transposition & Capo Calculator** (supports sharps/flats, Nashville-friendly display).
- **Leader Key Memory:** Remembers each song leader's preferred singing key per song and auto-fills when building setlists.

### 2. Setlist Builder & Song Structure Blueprints
- Drag-and-drop **Joyful ➔ Worship** setlist builder with automatic key lookup.
- Visual **Structure Map** (Intro, Verse, Pre-Chorus, Chorus, Bridge, Instrumental, Tag, Outro) with bar counts, repeats, and per-section band cues.
- **Schedule Calendar** showing upcoming Sunday assignments and quick **Share Lineup** copy-to-clipboard export for Messenger/Viber.

### 3. Practice Tracking & Live Performance Mode
- Per-song **Practice Check-In** (`Ready`, `Needs Work`, `Not Started`) with private practice notes and team readiness dashboards.
- **Live Performance Mode (`/perform`)**: High-contrast dark stage UI, large fonts, keep-screen-awake (`WakeLock`), fullscreen mode, Bluetooth page-turner/keyboard shortcuts, and **Supabase Realtime** controller/follower sync.

### 4. WorshipFlow AI Director (Google Gemini 2.5)
- **AI Chord Chart Generator:** Draft bracket-notation chord charts (`[G]Amazing [C]grace`) with human-review & verification badges.
- **AI Song Structure Extractor:** Auto-detects section arrangements and band dynamics.
- **Smart Key Recommender:** Suggests optimal keys with reasoning based on each leader's vocal comfort range.
- **Setlist Flow Intelligence:** Evaluates joyful/worship balance, key-to-key intervals, and offers one-click harmonic auto-sorting.
- **9:00 AM Rehearsal Briefing:** Printable stage briefing with key transitions and rehearsal checkpoints.
- **Worship Director Chat (`/chat`):** Team-aware AI assistant injected with your roster, vocal profiles, and song catalog, complete with thumbs up/down feedback and daily quota tracking.

### 5. Repertoire Analytics & Launch Polish
- **Song History & Frequency (`/analytics/songs`):** Tracks play counts, recency badges, and **Repeat Detector** alerts in the setlist builder.
- **Leader Key Analytics (`/analytics/leaders`):** Per-leader service stats, key distributions, and top songs.
- **PWA & Offline Support:** Service worker caching, `/offline` fallback page, dark/light theme switcher, accessibility landmarks, and team onboarding wizard (`/onboard`).

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling:** Tailwind CSS v4, `lucide-react`
- **Backend & Realtime:** Supabase (PostgreSQL, Row Level Security, Realtime Broadcast)
- **AI:** Google Gemini 2.5 (`gemini-2.5-flash`, `gemini-2.5-flash-lite`) via App Router API

---

## Getting Started (Local Development)

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   Copy `.env.local.example` to `.env.local` and fill in your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
   > Note: WorshipFlow includes smart local mock fallbacks when offline or before keys are configured, so you can explore the full UI immediately.

3. **Run database migrations & seed data (Supabase):**
   Run the SQL files in `supabase/migrations/` in chronological order, then run `supabase/seed.sql`.

4. **Start the development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the production Vercel + Supabase launch checklist.
