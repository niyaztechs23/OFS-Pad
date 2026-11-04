-- Let approved teachers use Google OAuth without passing role metadata from the browser.
-- The approved email row remains the source of truth for teacher role assignment.

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  approval_id uuid;
  requested_role text := coalesce(new.raw_user_meta_data->>'role', 'student');
begin
  select id into approval_id
  from public.teacher_invites
  where lower(email) = lower(new.email)
    and used_at is null
    and expires_at > now()
  order by created_at asc
  limit 1
  for update;

  if requested_role = 'teacher' or approval_id is not null then
    if approval_id is null then
      raise exception 'An approved teacher email is required for this account';
    end if;

    insert into public.profiles (id, full_name, role)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New teacher'), 'teacher');

    update public.teacher_invites
    set used_at = now()
    where id = approval_id;
  else
    insert into public.profiles (id, full_name, role)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New student'), 'student');
  end if;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
