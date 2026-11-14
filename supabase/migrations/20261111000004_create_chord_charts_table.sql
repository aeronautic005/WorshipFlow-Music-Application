-- Create Chord Charts Table
CREATE TABLE IF NOT EXISTS public.chord_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  chart_content TEXT NOT NULL,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  last_edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_song_key UNIQUE (song_id, key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chord_charts_song_id ON public.chord_charts(song_id);
CREATE INDEX IF NOT EXISTS idx_chord_charts_key ON public.chord_charts(key);

-- Enable Row Level Security
ALTER TABLE public.chord_charts ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated team members can view chord charts
CREATE POLICY "Team members can view chord charts"
  ON public.chord_charts
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS: Song leaders and admins can insert or update chord charts
CREATE POLICY "Song leaders and admins can insert chord charts"
  ON public.chord_charts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_song_leader_or_admin());

CREATE POLICY "Song leaders and admins can update chord charts"
  ON public.chord_charts
  FOR UPDATE
  TO authenticated
  USING (public.is_song_leader_or_admin())
  WITH CHECK (public.is_song_leader_or_admin());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE TRIGGER update_chord_charts_updated_at
  BEFORE UPDATE ON public.chord_charts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
