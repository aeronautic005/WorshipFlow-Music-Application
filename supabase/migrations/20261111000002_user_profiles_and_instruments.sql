-- Add avatar_url to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Index for searching team members by name or instrument
CREATE INDEX IF NOT EXISTS idx_profiles_instrument ON public.profiles(instrument);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(name);

-- Helper view to quickly list active worship team roster
CREATE OR REPLACE VIEW public.worship_team_roster AS
SELECT 
  id,
  name,
  email,
  phone,
  role,
  instrument,
  vocal_range,
  avatar_url,
  created_at
FROM public.profiles
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'song_leader' THEN 2
    ELSE 3
  END,
  name ASC;
