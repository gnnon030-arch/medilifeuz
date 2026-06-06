DROP POLICY IF EXISTS "reviews authenticated read" ON public.reviews;
CREATE POLICY "reviews self read" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = user_id);