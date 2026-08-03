-- Public read tables
GRANT SELECT ON public.medicines TO anon, authenticated;
GRANT SELECT ON public.news TO anon, authenticated;
GRANT SELECT ON public.branches TO anon, authenticated;

-- Admin writes go through service role, but keep authenticated writes for RLS-guarded admin policies
GRANT INSERT, UPDATE, DELETE ON public.medicines TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.branches TO authenticated;

-- User owned data
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

GRANT ALL ON public.medicines, public.news, public.branches, public.orders,
  public.order_items, public.reviews, public.profiles, public.user_roles,
  public.phone_otps TO service_role;

-- Admin huquqi: +998 90 260 88 88 va +998 91 362 00 80
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE lower(u.email) IN ('998902608888@phone.medilife.uz', '998913620080@phone.medilife.uz')
ON CONFLICT (user_id, role) DO NOTHING;
