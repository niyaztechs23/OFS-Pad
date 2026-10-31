-- OFS Pad security hardening
-- Prevent ordinary users from changing authorization roles and reduce public RPC exposure.

create or replace function protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role then
    raise exception 'Profile roles can only be changed by an administrator';
  end if;
  return new;
end;
$$;
drop trigger if exists protect_profile_role on profiles;
create trigger protect_profile_role before update on profiles for each row execute function protect_profile_role();

revoke execute on function public.protect_profile_role() from public, anon, authenticated;
drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "mark own notifications read" on notifications;
create policy "mark own notifications read" on notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.is_class_teacher(cid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from classes where id = cid and teacher_id = auth.uid());
$$;
create or replace function private.is_class_member(cid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from class_members where class_id = cid and student_id = auth.uid());
$$;
create or replace function private.class_of_assignment(aid uuid)
returns uuid language sql security definer stable set search_path = public as $$
  select class_id from assignments where id = aid;
$$;
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'New user'), case when new.raw_user_meta_data->>'role' = 'teacher' then 'teacher' else 'student' end);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();
revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_class_teacher(uuid) to authenticated;
grant execute on function private.is_class_member(uuid) to authenticated;
grant execute on function private.class_of_assignment(uuid) to authenticated;

-- Rebind policies to private helpers.
drop policy if exists "teacher reads own students" on profiles;
create policy "teacher reads own students" on profiles for select using (exists (select 1 from class_members m where m.student_id = profiles.id and private.is_class_teacher(m.class_id)));
drop policy if exists "see my classes" on classes;
create policy "see my classes" on classes for select using (teacher_id = auth.uid() or private.is_class_member(id));
drop policy if exists "see class members" on class_members;
create policy "see class members" on class_members for select using (student_id = auth.uid() or private.is_class_teacher(class_id));
drop policy if exists "see class assignments" on assignments;
create policy "see class assignments" on assignments for select using (private.is_class_teacher(class_id) or private.is_class_member(class_id));
drop policy if exists "teacher creates assignment" on assignments;
create policy "teacher creates assignment" on assignments for insert with check (private.is_class_teacher(class_id));
drop policy if exists "teacher edits assignment" on assignments;
create policy "teacher edits assignment" on assignments for update using (private.is_class_teacher(class_id)) with check (private.is_class_teacher(class_id));
drop policy if exists "teacher deletes assignment" on assignments;
create policy "teacher deletes assignment" on assignments for delete using (private.is_class_teacher(class_id));
drop policy if exists "see submissions" on submissions;
create policy "see submissions" on submissions for select using (student_id = auth.uid() or private.is_class_teacher(private.class_of_assignment(assignment_id)));
drop policy if exists "student submits" on submissions;
create policy "student submits" on submissions for insert with check (student_id = auth.uid() and private.is_class_member(private.class_of_assignment(assignment_id)));
drop policy if exists "student edits own before grading" on submissions;
create policy "student edits own before grading" on submissions for update using (student_id = auth.uid() and status <> 'graded') with check (student_id = auth.uid() and status <> 'graded');
drop policy if exists "teacher grades" on submissions;
create policy "teacher grades" on submissions for update using (private.is_class_teacher(private.class_of_assignment(assignment_id))) with check (private.is_class_teacher(private.class_of_assignment(assignment_id)));

-- Remove old public helper functions after policies no longer reference them.
drop function if exists public.is_class_teacher(uuid);
drop function if exists public.is_class_member(uuid);
drop function if exists public.class_of_assignment(uuid);
drop function if exists public.handle_new_user();
revoke execute on function public.notify_new_assignment() from public, anon, authenticated;
revoke execute on function public.notify_student_on_grade() from public, anon, authenticated;
revoke execute on function public.notify_teacher_on_submission() from public, anon, authenticated;
revoke execute on function public.protect_submission_grading_fields() from public, anon, authenticated;

-- The app intentionally calls this RPC for student class joining.
revoke execute on function public.join_class(text) from public, anon;
grant execute on function public.join_class(text) to authenticated;
