CREATE TABLE public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_title text NOT NULL DEFAULT '',
  author_organization text NOT NULL DEFAULT '',
  relationship text NOT NULL DEFAULT '',
  message text NOT NULL,
  author_avatar_url text,
  author_linkedin_url text,
  status text NOT NULL DEFAULT 'pending',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recommendations_status_check CHECK (status IN ('pending','approved','rejected')),
  CONSTRAINT recommendations_name_len CHECK (char_length(author_name) BETWEEN 2 AND 80),
  CONSTRAINT recommendations_message_len CHECK (char_length(message) BETWEEN 10 AND 1200),
  CONSTRAINT recommendations_title_len CHECK (char_length(author_title) <= 120),
  CONSTRAINT recommendations_org_len CHECK (char_length(author_organization) <= 120),
  CONSTRAINT recommendations_rel_len CHECK (char_length(relationship) <= 60)
);

CREATE INDEX recommendations_status_idx ON public.recommendations (status, sort_order);
CREATE INDEX recommendations_created_idx ON public.recommendations (created_at DESC);

CREATE TRIGGER recommendations_touch
BEFORE UPDATE ON public.recommendations
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT ON public.recommendations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendations TO authenticated;
GRANT ALL ON public.recommendations TO service_role;

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rec public read approved" ON public.recommendations
FOR SELECT TO anon, authenticated
USING (status = 'approved');

CREATE POLICY "rec public submit" ON public.recommendations
FOR INSERT TO anon, authenticated
WITH CHECK (status = 'pending' AND featured = false);

CREATE POLICY "rec admin read" ON public.recommendations
FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "rec admin update" ON public.recommendations
FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "rec admin delete" ON public.recommendations
FOR DELETE TO authenticated
USING (public.is_admin());
