-- Create Setlist Status Enum
CREATE TYPE setlist_status AS ENUM ('draft', 'published', 'archived');

-- Create Setlists Table
CREATE TABLE IF NOT EXISTS public.setlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_date DATE NOT NULL,
  song_leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  backup_singer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  drummer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status setlist_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Setlist Songs Junction Table
CREATE TABLE IF NOT EXISTS public.setlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setlist_id UUID NOT NULL REFERENCES public.setlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE RESTRICT,
  order_position INTEGER NOT NULL,
  assigned_key TEXT NOT NULL,
  reference_url TEXT,
  category song_category NOT NULL DEFAULT 'worship',
  custom_structure JSONB DEFAULT '[]'::jsonb,
  section_notes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_setlist_order UNIQUE (setlist_id, order_position)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_setlists_service_date ON public.setlists(service_date DESC);
CREATE INDEX IF NOT EXISTS idx_setlists_song_leader ON public.setlists(song_leader_id);
CREATE INDEX IF NOT EXISTS idx_setlists_drummer ON public.setlists(drummer_id);
CREATE INDEX IF NOT EXISTS idx_setlists_status ON public.setlists(status);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_setlist_id ON public.setlist_songs(setlist_id);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_song_id ON public.setlist_songs(song_id);

-- Enable Row Level Security
ALTER TABLE public.setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setlist_songs ENABLE ROW LEVEL SECURITY;

-- Setlists RLS: All team members can view
CREATE POLICY "Team members can view setlists"
  ON public.setlists
  FOR SELECT
  TO authenticated
  USING (true);

-- Setlists RLS: Song leaders and admins can insert
CREATE POLICY "Song leaders and admins can insert setlists"
  ON public.setlists
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_song_leader_or_admin());

-- Setlists RLS: Song leaders and admins can update
CREATE POLICY "Song leaders and admins can update setlists"
  ON public.setlists
  FOR UPDATE
  TO authenticated
  USING (public.is_song_leader_or_admin())
  WITH CHECK (public.is_song_leader_or_admin());

-- Setlists RLS: Only admins can delete
CREATE POLICY "Only admins can delete setlists"
  ON public.setlists
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Setlist Songs RLS
CREATE POLICY "Team members can view setlist songs"
  ON public.setlist_songs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Song leaders and admins can manage setlist songs"
  ON public.setlist_songs
  FOR ALL
  TO authenticated
  USING (public.is_song_leader_or_admin())
  WITH CHECK (public.is_song_leader_or_admin());

-- Update timestamp trigger
CREATE OR REPLACE TRIGGER update_setlists_updated_at
  BEFORE UPDATE ON public.setlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
