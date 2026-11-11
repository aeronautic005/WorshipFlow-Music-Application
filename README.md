# 🎵 WorshipFlow

> **Worship Team Companion App** — Built for church music teams to streamline weekly practice, rehearsal, and Sunday worship.

---

## 🌟 The Problem WorshipFlow Solves

Church music teams go through a high-frequency weekly cycle:
1. **Weekdays to Saturday**: Individual practice at home
2. **Sunday Morning**: Team rehearsal at church
3. **Sunday Afternoon**: Live worship service

Traditional workflows rely on fragmented group chats, spreadsheets, and memory, resulting in recurring friction points:
- **🔑 The Key Mystery**: Instrumentalists scrambling because nobody remembers what key the song leader used last time.
- **🎧 The Reference Chaos**: Team members practicing different versions (live vs. studio, different artists or tempos).
- **🎼 The Structure Breakdown**: Song leaders skipping sections or calling chorus early while musicians have complex song structures committed to muscle memory.
- **📊 Accountability Void**: No visibility into team readiness before Sunday rehearsal.

**WorshipFlow** solves this by establishing **one source of truth for every song, every week, for everyone.**

---

## 🚀 Key Features

- **📚 Song Library**: Centralized catalog of songs with categories (Joyful / Worship), original keys, BPM, lyrics, and auto-transposing chord charts.
- **🔑 Song Leader × Song Key Memory**: Automatically remembers and suggests each song leader's preferred key for every song.
- **🎼 Song Structure Blueprint**: Visual song maps (`Intro → V1 → Pre-Chorus → Chorus → Bridge ×4 → Outro`) with per-section musical notes ("drums drop here", "keys pad only").
- **📋 Weekly Setlist Builder**: Replaces spreadsheets with clean weekly line-ups, category balancing, reference pinning, and team notifications.
- **✅ Practice Hub**: Individual readiness check-in (`Ready`, `Needs Work`, `Not Started`) with a live team readiness dashboard.
- **📱 Live Performance Mode**: A low-light, distraction-free stage screen that highlights the current song section live on every musician's phone simultaneously via real-time sync.
- **🤖 Integrated AI Assistant**: AI chord generation, automatic structure detection from song references, smart key suggestions based on vocal range, and weekly rehearsal briefings.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Mobile / Platform**: Progressive Web App (PWA) with service worker caching & offline support
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Realtime, Supabase Auth)
- **AI Intelligence**: [Google Gemini API](https://ai.google.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+ (LTS v26.13.0 recommended)
- [pnpm](https://pnpm.io/) package manager

### 1. Clone & Install

```bash
git clone https://github.com/aeronautic005/Music-Team-Application.git
cd "Music Team Application"
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Project Roadmap (100 Commits)

- [x] **Phase 1: Foundation (Commits 1–22)** — Scaffold Next.js, Tailwind, PWA, Supabase client, App shell, Auth, User management, Song library CRUD.
- [ ] **Phase 2: Setlist & Structure (Commits 23–47)** — Chord chart editor, transposition, setlist builder, key memory, visual structure blueprint.
- [ ] **Phase 3: Practice & Performance (Commits 48–65)** — Readiness tracking, real-time Performance Mode with live section follower.
- [ ] **Phase 4: AI Integration (Commits 66–81)** — Gemini-powered chord generation, auto structure extraction, key suggestions, and team AI chat.
- [ ] **Phase 5: Analytics & Polish (Commits 82–94)** — Song history, repeat detection, dark mode, accessibility, offline fallback.
- [ ] **Phase 6: Launch (Commits 95–100)** — Production deployment, data seeding, team onboarding, v1.0 release.

---

## 📄 License

Private repository for church worship team ministry use.
