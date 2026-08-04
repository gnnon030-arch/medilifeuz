-- Ensure RLS is on and enforced even for the table owner
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_otps FORCE ROW LEVEL SECURITY;

-- Remove any client-facing privileges (Data API roles must never touch OTPs)
REVOKE ALL ON public.phone_otps FROM anon;
REVOKE ALL ON public.phone_otps FROM authenticated;

-- Only trusted server-side code (service role) may access this table
GRANT ALL ON public.phone_otps TO service_role;

-- Explicit deny-all policy so any future accidental GRANT still yields no rows
DROP POLICY IF EXISTS "phone_otps deny all clients" ON public.phone_otps;
CREATE POLICY "phone_otps deny all clients"
ON public.phone_otps
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);