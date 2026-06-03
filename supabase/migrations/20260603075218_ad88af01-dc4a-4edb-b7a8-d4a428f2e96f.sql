ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS google_map_url text,
  ADD COLUMN IF NOT EXISTS yandex_map_url text;