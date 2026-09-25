ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS monogram text NOT NULL DEFAULT '';