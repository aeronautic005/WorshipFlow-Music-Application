-- WorshipFlow Seed Script: Initial Church Song Library (Joyful + Worship)

INSERT INTO public.songs (title, artist, original_key, bpm, category, language, tags)
VALUES
  ('House of the Lord', 'Phil Wickham', 'Bb', 118, 'joyful', 'English', ARRAY['praise', 'opener', 'joy']),
  ('Praise', 'Elevation Worship', 'A', 127, 'joyful', 'English', ARRAY['praise', 'high-energy', 'opener']),
  ('This Is Amazing Grace', 'Phil Wickham', 'Bb', 98, 'joyful', 'English', ARRAY['grace', 'upbeat']),
  ('Alive', 'Hillsong Young & Free', 'D', 130, 'joyful', 'English', ARRAY['youth', 'celebration']),
  ('Joy of the Lord', 'Rend Collective', 'G', 124, 'joyful', 'English', ARRAY['joy', 'celebration']),
  ('Glorious Day', 'Passion', 'D', 110, 'joyful', 'English', ARRAY['salvation', 'praise']),
  ('Goodness of God', 'Bethel Music', 'Ab', 63, 'worship', 'English', ARRAY['faithfulness', 'adoration']),
  ('Holy Forever', 'Chris Tomlin', 'Db', 72, 'worship', 'English', ARRAY['holiness', 'anthem']),
  ('Way Maker', 'Sinach / Leeland', 'E', 68, 'worship', 'English', ARRAY['faith', 'miracles', 'declaration']),
  ('Gratitude', 'Brandon Lake', 'B', 78, 'worship', 'English', ARRAY['thanksgiving', 'acoustic']),
  ('10,000 Reasons (Bless the Lord)', 'Matt Redman', 'G', 73, 'worship', 'English', ARRAY['classic', 'praise']),
  ('What A Beautiful Name', 'Hillsong Worship', 'D', 68, 'worship', 'English', ARRAY['jesus', 'communion'])
ON CONFLICT DO NOTHING;
