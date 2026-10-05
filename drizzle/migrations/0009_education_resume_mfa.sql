CREATE TABLE public.education (
  id uuid primary key default gen_random_uuid(),
  degree text not null,
  institution text not null default '',
  period text not null default '',
  field text not null default '',
  description text not null default '',
  achievements text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT ON public.education TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education TO authenticated;
GRANT ALL ON public.education TO service_role;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "edu public read" ON public.education FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "edu admin write" ON public.education FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER t_edu BEFORE UPDATE ON public.education FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.education (degree, institution, period, field, sort_order)
VALUES ('Bachelor of Business Administration (BBA)', 'Army Institute of Business Administration, Sylhet', 'Present', 'Business Administration', 0);

ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS resume_url text;

-- Admins who turned on 2FA must have completed it in this session
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin')
    and (
      coalesce(auth.jwt()->>'aal', 'aal1') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors f
        where f.user_id = auth.uid() and f.status = 'verified'
      )
    )
$$;