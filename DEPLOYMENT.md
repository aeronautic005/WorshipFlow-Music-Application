# WorshipFlow v1.0 — Production Deployment Guide

Use this checklist when deploying WorshipFlow to production on **Vercel** + **Supabase**.

---

## 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and execute all migration files in `supabase/migrations/` in chronological order:
   - `20261111000001_create_users_and_profiles.sql`
   - `20261111000002_user_profiles_and_instruments.sql`
   - `20261111000003_create_songs_table.sql`
   - `20261111000004_create_chord_charts_table.sql`
   - `20261111000005_create_setlists_tables.sql`
   - `20261111000006_create_song_leader_keys_table.sql`
   - `20261111000007_create_practice_status.sql`
   - `20261126000008_create_song_history.sql`
3. Run `supabase/seed.sql` to populate the initial church song catalog.
4. Ensure **Supabase Realtime** is enabled for broadcast channels (used by Live Performance Mode).
5. Under **Authentication → URL Configuration**, add your production Vercel URL (e.g., `https://worshipflow.vercel.app`) to **Site URL** and **Redirect URLs** (`/auth/callback`).

---

## 2. Google Gemini API Key

1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Add it as `GEMINI_API_KEY` in Vercel environment variables (server-side only; never expose secret keys in client code).

---

## 3. Vercel Deployment

1. Import the GitHub repository (`aeronautic005/WorshipFlow-Music-Application`) into Vercel.
2. Vercel will automatically detect `vercel.json` (`pnpm install --frozen-lockfile`, `pnpm build`).
3. Configure the following **Environment Variables** in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. Click **Deploy**.

---

## 4. Team Onboarding Launch

1. Open `/admin/team` in your deployed app and copy the team **Invite Link** (`/onboard?code=...`).
2. Share the link in your worship team group chat so France, Maegan, Deanne, Argel, Andrei, Kyle, Aeron, and band members can set their roles and vocal ranges.
3. Encourage members to **Add to Home Screen** on iOS Safari / Android Chrome to install WorshipFlow as a PWA for Sunday stage use.
