
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS map_type text NOT NULL DEFAULT 'google';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email IN ('gnnon030@gmail.com','gbbob17@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE auth.users
SET encrypted_password = crypt('00808888', gen_salt('bf')),
    updated_at = now()
WHERE email IN ('gnnon030@gmail.com','gbbob17@gmail.com');
