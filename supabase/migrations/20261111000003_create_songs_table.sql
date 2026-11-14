-- Create Song Category Enum
CREATE TYPE song_category AS ENUM ('joyful', 'worship');

-- Create Songs Table
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  original_key TEXT NOT NULL,
  bpm INTEGER,
  category song_category NOT NULL DEFAULT 'worship',
  language TEXT NOT NULL DEFAULT 'English',
  lyrics TEXT,
  default_structure JSONB DEFAULT '[]'::jsonb,
  reference_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Search and filter indexes
CREATE INDEX IF NOT EXISTS idx_songs_title ON public.songs USING gin(to_tsvector('simple', title));
CREATE INDEX IF NOT EXISTS idx_songs_artist ON public.songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_category ON public.songs(category);
CREATE INDEX IF NOT EXISTS idx_songs_original_key ON public.songs(original_key);

-- Enable Row Level Security
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is a song leader or admin
CREATE OR REPLACE FUNCTION public.is_song_leader_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'song_leader')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: Authenticated team members can view all songs
CREATE POLICY "Authenticated members can view songs"
  ON public.songs
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS: Song leaders and admins can insert new songs
CREATE POLICY "Song leaders and admins can add songs"
  ON public.songs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_song_leader_or_admin());

-- RLS: Song leaders and admins can update songs
CREATE POLICY "Song leaders and admins can update songs"
  ON public.songs
  FOR UPDATE
  TO authenticated
  USING (public.is_song_leader_or_admin())
  WITH CHECK (public.is_song_leader_or_admin());

-- RLS: Only admins can delete songs
CREATE POLICY "Only admins can delete songs"
  ON public.songs
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON public.songs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
