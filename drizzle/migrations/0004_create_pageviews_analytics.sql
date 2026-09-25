CREATE TABLE public.pageviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL DEFAULT '/',
  referrer TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX pageviews_created_at_idx ON public.pageviews (created_at DESC);
CREATE INDEX pageviews_path_idx ON public.pageviews (path);

GRANT INSERT ON public.pageviews TO anon;
GRANT SELECT ON public.pageviews TO authenticated;
GRANT ALL ON public.pageviews TO service_role;

ALTER TABLE public.pageviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a pageview"
ON public.pageviews FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read pageviews"
ON public.pageviews FOR SELECT TO authenticated
USING (public.is_admin());