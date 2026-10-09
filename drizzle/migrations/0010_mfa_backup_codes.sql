create table public.mfa_backup_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

grant all on public.mfa_backup_codes to service_role;

alter table public.mfa_backup_codes enable row level security;
-- no client policies: codes are only reachable through the security-definer functions below

create or replace function public.generate_backup_codes()
returns table(code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  i int;
  c text;
begin
  if uid is null then raise exception 'not signed in'; end if;
  delete from public.mfa_backup_codes where user_id = uid;
  for i in 1..8 loop
    c := upper(substr(encode(extensions.gen_random_bytes(5), 'hex'), 1, 4) || '-' || substr(encode(extensions.gen_random_bytes(5), 'hex'), 1, 4));
    insert into public.mfa_backup_codes (user_id, code_hash)
    values (uid, encode(extensions.digest(c, 'sha256'), 'hex'));
    code := c;
    return next;
  end loop;
end;
$$;

create or replace function public.count_backup_codes()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.mfa_backup_codes where user_id = auth.uid() and used_at is null
$$;

create or replace function public.redeem_backup_code(_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  h text;
  rid uuid;
begin
  if uid is null then return false; end if;
  h := encode(extensions.digest(upper(trim(_code)), 'sha256'), 'hex');
  select id into rid from public.mfa_backup_codes
  where user_id = uid and code_hash = h and used_at is null;
  if rid is null then return false; end if;
  update public.mfa_backup_codes set used_at = now() where id = rid;
  -- recovery: remove the lost TOTP factors so the owner can log in and re-enrol
  delete from auth.mfa_factors where user_id = uid;
  return true;
end;
$$;

grant execute on function public.generate_backup_codes() to authenticated;
grant execute on function public.count_backup_codes() to authenticated;
grant execute on function public.redeem_backup_code(text) to authenticated;