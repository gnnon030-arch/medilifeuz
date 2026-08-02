CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS medicines_name_trgm_idx ON public.medicines USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS medicines_name_cyrl_trgm_idx ON public.medicines USING gin (name_cyrl gin_trgm_ops);
CREATE INDEX IF NOT EXISTS medicines_language_name_idx ON public.medicines (language, name);
CREATE INDEX IF NOT EXISTS medicines_price_idx ON public.medicines (price);