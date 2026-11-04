-- Add a protected admin role and in-app teacher approval management.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('student', 'teacher', 'admin'));

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and current_user not in ('postgres', 'service_role')
     and not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Profile roles can only be changed by an administrator';
  end if;
  return new;
end;
$$;

-- One-time bootstrap only. Run this in Supabase SQL Editor for the first admin;
-- it refuses to run after an admin already exists and is not executable by app users.
create or replace function public.bootstrap_first_admin(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user not in ('postgres', 'service_role') then
    raise exception 'Bootstrap is only available from a trusted administrator session';
  end if;
  if exists (select 1 from public.profiles where role = 'admin') then
    raise exception 'An administrator already exists';
  end if;

  update public.profiles p
  set role = 'admin'
  from auth.users u
  where p.id = u.id
    and p.role = 'student'
    and lower(u.email) = lower(trim(p_email));

  if not found then
    raise exception 'No existing account found for that email';
  end if;
  return true;
end;
$$;
revoke all on function public.bootstrap_first_admin(text) from public, anon, authenticated;

create or replace function private.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function private.is_admin() from public, anon, authenticated;

drop function if exists public.admin_list_teacher_approvals();
create or replace function public.admin_list_teacher_approvals()
returns table (id uuid, email text, expires_at timestamptz, used_at timestamptz, created_at timestamptz)
language sql
security definer
stable
set search_path = public, private
as $$
  select ti.id, ti.email, ti.expires_at, ti.used_at, ti.created_at
  from public.teacher_invites ti
  where private.is_admin() and ti.used_at is null
  order by ti.expires_at asc;
$$;

create or replace function public.admin_approve_teacher(p_email text, p_expires_at timestamptz)
returns table (id uuid, email text, expires_at timestamptz, used_at timestamptz, created_at timestamptz)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  normalized_email text := lower(trim(p_email));
  approval_id uuid;
begin
  if not private.is_admin() then
    raise exception 'Administrator access required';
  end if;
  if normalized_email = '' or position('@' in normalized_email) < 2 then
    raise exception 'Enter a valid teacher email';
  end if;
  if p_expires_at <= now() or p_expires_at > now() + interval '90 days' then
    raise exception 'Approval expiry must be between now and 90 days';
  end if;

  select ti.id into approval_id
  from public.teacher_invites ti
  where lower(ti.email) = normalized_email and ti.used_at is null
  order by ti.created_at desc
  limit 1
  for update;

  if approval_id is null then
    insert into public.teacher_invites (email, invite_code, expires_at)
    values (normalized_email, null, p_expires_at)
    returning teacher_invites.id into approval_id;
  else
    update public.teacher_invites ti
    set expires_at = p_expires_at
    where ti.id = approval_id;
  end if;

  return query
  select ti.id, ti.email, ti.expires_at, ti.used_at, ti.created_at
  from public.teacher_invites ti
  where ti.id = approval_id;
end;
$$;

create or replace function public.admin_revoke_teacher_approval(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.is_admin() then
    raise exception 'Administrator access required';
  end if;
  delete from public.teacher_invites
  where id = p_id and used_at is null;
  return found;
end;
$$;

revoke all on function public.admin_list_teacher_approvals() from public, anon;
revoke all on function public.admin_approve_teacher(text, timestamptz) from public, anon;
revoke all on function public.admin_revoke_teacher_approval(uuid) from public, anon;
grant execute on function public.admin_list_teacher_approvals() to authenticated;
grant execute on function public.admin_approve_teacher(text, timestamptz) to authenticated;
grant execute on function public.admin_revoke_teacher_approval(uuid) to authenticated;
