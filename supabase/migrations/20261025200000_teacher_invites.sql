create table if not exists public.teacher_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invite_code text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.teacher_invites enable row level security;
revoke all on table public.teacher_invites from anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  invite_id uuid;
  requested_role text := coalesce(new.raw_user_meta_data->>'role', 'student');
  invite_code_value text := nullif(trim(new.raw_user_meta_data->>'teacher_invite_code'), '');
begin
  if requested_role = 'teacher' then
    select id into invite_id
    from public.teacher_invites
    where invite_code = invite_code_value
      and lower(email) = lower(new.email)
      and used_at is null
      and expires_at > now()
    for update;

    if invite_id is null then
      raise exception 'A valid teacher invitation is required for this account';
    end if;

    insert into public.profiles (id, full_name, role)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'New teacher'), 'teacher');

    update public.teacher_invites set used_at = now() where id = invite_id;
  else
    insert into public.profiles (id, full_name, role)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'New student'), 'student');
  end if;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
