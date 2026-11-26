-- Migration: Create song_history table and auto-logging trigger for archived setlists

CREATE TABLE IF NOT EXISTS public.song_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  setlist_id uuid REFERENCES public.setlists(id) ON DELETE SET NULL,
  song_leader_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  leader_name text,
  assigned_key text NOT NULL,
  category text NOT NULL DEFAULT 'worship',
  played_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_setlist_song_history UNIQUE (setlist_id, song_id)
);

-- Performance indexes for frequency & leader history queries
CREATE INDEX IF NOT EXISTS idx_song_history_song_id ON public.song_history(song_id);
CREATE INDEX IF NOT EXISTS idx_song_history_played_date ON public.song_history(played_date DESC);
CREATE INDEX IF NOT EXISTS idx_song_history_leader_id ON public.song_history(song_leader_id);

-- Row Level Security
ALTER TABLE public.song_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view song history"
  ON public.song_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert song history"
  ON public.song_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Trigger Function: Auto-log setlist songs into song_history when setlist is archived
CREATE OR REPLACE FUNCTION public.log_setlist_to_song_history()
RETURNS TRIGGER AS $$
DECLARE
  v_leader_name text;
BEGIN
  IF NEW.status = 'archived' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'archived') THEN
    SELECT name INTO v_leader_name FROM public.users WHERE id = NEW.song_leader_id;

    INSERT INTO public.song_history (
      song_id,
      setlist_id,
      song_leader_id,
      leader_name,
      assigned_key,
      category,
      played_date
    )
    SELECT
      ss.song_id,
      NEW.id,
      NEW.song_leader_id,
      COALESCE(v_leader_name, 'Worship Leader'),
      ss.assigned_key,
      COALESCE(s.category, 'worship'),
      NEW.service_date
    FROM public.setlist_songs ss
    JOIN public.songs s ON s.id = ss.song_id
    WHERE ss.setlist_id = NEW.id
    ON CONFLICT (setlist_id, song_id) DO UPDATE SET
      assigned_key = EXCLUDED.assigned_key,
      played_date = EXCLUDED.played_date,
      leader_name = EXCLUDED.leader_name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_setlist_song_history ON public.setlists;
CREATE TRIGGER trigger_log_setlist_song_history
  AFTER INSERT OR UPDATE ON public.setlists
  FOR EACH ROW
  EXECUTE FUNCTION public.log_setlist_to_song_history();
