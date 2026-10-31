create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) between 2 and 160),
  subject text not null check (length(trim(subject)) between 2 and 80),
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  constraint exams_end_after_start check (ends_at is null or ends_at >= starts_at)
);

create index if not exists exams_class_starts_idx on public.exams(class_id, starts_at);
create index if not exists exams_teacher_starts_idx on public.exams(teacher_id, starts_at);
alter table public.exams enable row level security;
alter table public.exams replica identity full;

drop policy if exists "Students can view joined class exams" on public.exams;
create policy "Students can view joined class exams" on public.exams
  for select to authenticated using (private.is_class_member(class_id));

drop policy if exists "Teachers can view own exams" on public.exams;
create policy "Teachers can view own exams" on public.exams
  for select to authenticated using (teacher_id = auth.uid());

drop policy if exists "Teachers can create own class exams" on public.exams;
create policy "Teachers can create own class exams" on public.exams
  for insert to authenticated
  with check (teacher_id = auth.uid() and private.is_class_teacher(class_id));

drop policy if exists "Teachers can update own exams" on public.exams;
create policy "Teachers can update own exams" on public.exams
  for update to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid() and private.is_class_teacher(class_id));

drop policy if exists "Teachers can delete own exams" on public.exams;
create policy "Teachers can delete own exams" on public.exams
  for delete to authenticated using (teacher_id = auth.uid());

drop function if exists public.notify_new_exam();
create function public.notify_new_exam()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  insert into public.notifications (user_id, type, message)
  select cm.student_id, 'exam', 'New exam: ' || new.title
  from public.class_members cm
  where cm.class_id = new.class_id;
  return new;
end;
$$;

revoke all on function public.notify_new_exam() from public, anon, authenticated;

drop trigger if exists exams_notify_students on public.exams;
create trigger exams_notify_students
after insert on public.exams
for each row execute function public.notify_new_exam();

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'exams') then
    alter publication supabase_realtime add table public.exams;
  end if;
end $$;
