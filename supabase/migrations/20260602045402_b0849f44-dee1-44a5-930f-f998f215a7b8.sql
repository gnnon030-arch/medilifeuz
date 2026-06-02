
-- 1) Fix reviews INSERT to require order ownership
DROP POLICY IF EXISTS "reviews self insert" ON public.reviews;
CREATE POLICY "reviews self insert"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = reviews.order_id AND o.user_id = auth.uid()
  )
);

-- 2) Restrict reviews SELECT to authenticated only (hide user_id from anon enumeration)
DROP POLICY IF EXISTS "reviews public read" ON public.reviews;
CREATE POLICY "reviews authenticated read"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- 3) Restrict orders INSERT to authenticated, require non-null user_id == auth.uid()
DROP POLICY IF EXISTS "orders self insert" ON public.orders;
CREATE POLICY "orders self insert"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "orders self select" ON public.orders;
CREATE POLICY "orders self select"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4) Restrict order_items INSERT/SELECT to authenticated
DROP POLICY IF EXISTS "order_items self insert" ON public.order_items;
CREATE POLICY "order_items self insert"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders o
  WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
));

DROP POLICY IF EXISTS "order_items self select" ON public.order_items;
CREATE POLICY "order_items self select"
ON public.order_items
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.orders o
  WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
));

-- 5) Set immutable search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$function$;
