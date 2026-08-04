CREATE TABLE public.telegram_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  chat_id bigint NOT NULL,
  first_name text,
  last_name text,
  username text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.telegram_users TO service_role;

ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "telegram_users admin read" ON public.telegram_users
FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER telegram_users_updated_at BEFORE UPDATE ON public.telegram_users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_telegram_users_phone ON public.telegram_users (phone_number);