CREATE TABLE public.admin_invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(extensions.gen_random_bytes(24),'hex'),
  email text,
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, DELETE ON public.admin_invites TO authenticated;
GRANT ALL ON public.admin_invites TO service_role;
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invites admin read" ON public.admin_invites FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "invites admin create" ON public.admin_invites FOR INSERT TO authenticated WITH CHECK (public.is_admin() AND created_by = auth.uid());
CREATE POLICY "invites admin delete" ON public.admin_invites FOR DELETE TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.redeem_admin_invite(_token text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
declare uid uuid := auth.uid(); inv public.admin_invites; uemail text;
begin
  if uid is null then return false; end if;
  select * into inv from public.admin_invites where token = _token for update;
  if inv.id is null or inv.used_at is not null or inv.expires_at < now() then return false; end if;
  select email into uemail from auth.users where id = uid;
  if inv.email is not null and lower(inv.email) <> lower(uemail) then return false; end if;
  insert into public.user_roles(user_id, role) values (uid, 'admin') on conflict do nothing;
  update public.admin_invites set used_at = now(), used_by = uid where id = inv.id;
  return true;
end; $$;

CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE(user_id uuid, email text, joined_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query select r.user_id, u.email::text, r.created_at from public.user_roles r join auth.users u on u.id = r.user_id where r.role = 'admin' order by r.created_at;
end; $$;

CREATE OR REPLACE FUNCTION public.revoke_admin(_user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if _user_id = auth.uid() then raise exception 'You cannot remove your own access'; end if;
  delete from public.user_roles where user_id = _user_id and role = 'admin';
  return true;
end; $$;

REVOKE EXECUTE ON FUNCTION public.redeem_admin_invite(text), public.list_admins(), public.revoke_admin(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.redeem_admin_invite(text), public.list_admins(), public.revoke_admin(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_public_submissions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
declare n int;
begin
  if public.is_admin() then return new; end if;
  if TG_TABLE_NAME = 'contact_messages' then
    select count(*) into n from public.contact_messages where lower(email) = lower(new.email) and created_at > now() - interval '1 hour';
    if n >= 3 then raise exception 'Too many messages. Please try again later.'; end if;
    select count(*) into n from public.contact_messages where created_at > now() - interval '10 minutes';
  else
    select count(*) into n from public.recommendations where created_at > now() - interval '10 minutes';
  end if;
  if n >= 20 then raise exception 'Too many submissions right now. Please try again later.'; end if;
  return new;
end; $$;
CREATE TRIGGER contact_guard BEFORE INSERT ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.guard_public_submissions();
CREATE TRIGGER rec_guard BEFORE INSERT ON public.recommendations FOR EACH ROW EXECUTE FUNCTION public.guard_public_submissions();