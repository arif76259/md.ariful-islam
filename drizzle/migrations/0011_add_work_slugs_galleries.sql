create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select nullif(
    regexp_replace(lower(trim(coalesce(input, ''))), '[^a-z0-9]+', '-', 'g'),
    '-'
  )
$$;

create or replace function public.set_work_slug()
returns trigger
language plpgsql
as $$
declare
  src text;
  base text;
  candidate text;
  n int := 1;
  found int;
begin
  src := to_jsonb(NEW) ->> TG_ARGV[0];
  if NEW.slug is null or NEW.slug = '' then
    base := public.slugify(src);
  else
    base := public.slugify(NEW.slug);
    if base is null or base = '' then
      base := public.slugify(src);
    end if;
  end if;
  if base is null or base = '' then
    base := TG_TABLE_NAME;
  end if;
  candidate := base;
  loop
    execute format('select 1 from public.%I where slug = $1 and id <> $2 limit 1', TG_TABLE_NAME)
      into found using candidate, NEW.id;
    exit when found is null;
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  NEW.slug := candidate;
  return NEW;
end;
$$;

alter table public.experiences add column slug text;
alter table public.experiences add column gallery text[] not null default '{}';
alter table public.ambassadors add column slug text;
alter table public.ambassadors add column gallery text[] not null default '{}';
alter table public.projects add column slug text;
alter table public.articles add column slug text;

create trigger set_experiences_slug before insert or update of title, slug on public.experiences
for each row execute function public.set_work_slug('title');
create trigger set_ambassadors_slug before insert or update of brand, slug on public.ambassadors
for each row execute function public.set_work_slug('brand');
create trigger set_projects_slug before insert or update of name, slug on public.projects
for each row execute function public.set_work_slug('name');
create trigger set_articles_slug before insert or update of title, slug on public.articles
for each row execute function public.set_work_slug('title');

update public.experiences set slug = null;
update public.ambassadors set slug = null;
update public.projects set slug = null;
update public.articles set slug = null;

create unique index experiences_slug_key on public.experiences (slug);
create unique index ambassadors_slug_key on public.ambassadors (slug);
create unique index projects_slug_key on public.projects (slug);
create unique index articles_slug_key on public.articles (slug);
