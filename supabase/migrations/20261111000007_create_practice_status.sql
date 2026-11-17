-- Migration 20261111000007: Create practice_status table
-- Tracks personal home practice readiness and private notes per member per song in a setlist

create table if not exists public.practice_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  setlist_id uuid not null references public.setlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  status text not null check (status in ('not_started', 'needs_work', 'ready')) default 'not_started',
  confidence_rating integer check (confidence_rating between 1 and 5) default 3,
  private_notes text,
  last_practiced_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint practice_status_user_setlist_song_unique unique (user_id, setlist_id, song_id)
);

-- Enable RLS
alter table public.practice_status enable row level security;

-- Policies:
-- 1. Members can view their own practice statuses
create policy "Users can view their own practice statuses"
  on public.practice_status for select
  using (auth.uid() = user_id);

-- 2. Members can insert/update their own practice statuses
create policy "Users can insert their own practice statuses"
  on public.practice_status for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own practice statuses"
  on public.practice_status for update
  using (auth.uid() = user_id);

-- 3. Song leaders and admins can view team members' practice readiness
create policy "Leaders and admins can view all team practice statuses"
  on public.practice_status for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'song_leader')
    )
  );

-- Indexes for performance
create index if not exists idx_practice_status_user on public.practice_status(user_id);
create index if not exists idx_practice_status_setlist on public.practice_status(setlist_id);
create index if not exists idx_practice_status_song on public.practice_status(song_id);
