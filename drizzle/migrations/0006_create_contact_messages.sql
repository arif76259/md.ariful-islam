CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  purpose text NOT NULL DEFAULT 'General',
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact public submit" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 100
    AND length(btrim(email)) BETWEEN 3 AND 255
    AND length(btrim(message)) BETWEEN 1 AND 2000
    AND is_read = false
  );

CREATE POLICY "contact admin read" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "contact admin update" ON public.contact_messages
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "contact admin delete" ON public.contact_messages
  FOR DELETE TO authenticated USING (public.is_admin());

CREATE INDEX contact_messages_created_at_idx ON public.contact_messages (created_at DESC);

CREATE TRIGGER contact_messages_touch BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();