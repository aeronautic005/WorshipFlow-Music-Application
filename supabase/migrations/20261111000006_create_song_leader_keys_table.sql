-- Create Song Leader Keys Table (Memory of what key each song leader sings in)
CREATE TABLE IF NOT EXISTS public.song_leader_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  preferred_key TEXT NOT NULL,
  last_used TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_leader_song UNIQUE (song_leader_id, song_id)
);

-- Performance Index
CREATE INDEX IF NOT EXISTS idx_song_leader_keys_lookup 
  ON public.song_leader_keys(song_leader_id, song_id);

-- Enable Row Level Security
ALTER TABLE public.song_leader_keys ENABLE ROW LEVEL SECURITY;

-- Team members can read key preferences
CREATE POLICY "Team members can view song leader keys"
  ON public.song_leader_keys
  FOR SELECT
  TO authenticated
  USING (true);

-- Song leaders and admins can insert or update key preferences
CREATE POLICY "Song leaders and admins can manage keys"
  ON public.song_leader_keys
  FOR ALL
  TO authenticated
  USING (public.is_song_leader_or_admin())
  WITH CHECK (public.is_song_leader_or_admin());
