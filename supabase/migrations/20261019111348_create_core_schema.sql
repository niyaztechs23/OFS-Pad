create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('student','teacher')),
  created_at timestamptz default now()
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  teacher_id uuid not null references profiles(id) on delete cascade,
  join_code text unique not null default upper(substr(md5(random()::text), 1, 6)),
  created_at timestamptz default now()
);

create table class_members (
  class_id uuid references classes(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (class_id, student_id)
);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  title text not null,
  description text,
  subject text,
  deadline timestamptz not null,
  created_at timestamptz default now()
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  content text,
  status text not null default 'pending' check (status in ('pending','submitted','graded')),
  marks integer,
  feedback text,
  submitted_at timestamptz,
  unique (assignment_id, student_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);

create or replace function is_class_teacher(cid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from classes where id = cid and teacher_id = auth.uid());
$$;

create or replace function is_class_member(cid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from class_members where class_id = cid and student_id = auth.uid());
$$;

create or replace function class_of_assignment(aid uuid)
returns uuid language sql security definer stable set search_path = public as $$
  select class_id from assignments where id = aid;
$$;

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New user'),
    case when new.raw_user_meta_data->>'role' = 'teacher' then 'teacher' else 'student' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace function join_class(code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  cid uuid;
  my_role text;
begin
  select role into my_role from profiles where id = auth.uid();
  if my_role is distinct from 'student' then
    raise exception 'Only students can join a class';
  end if;

  select id into cid from classes where join_code = upper(trim(code));
  if cid is null then
    raise exception 'Invalid join code';
  end if;

  insert into class_members (class_id, student_id)
  values (cid, auth.uid())
  on conflict do nothing;

  return cid;
end;
$$;

create or replace function notify_new_assignment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into notifications (user_id, type, message)
  select student_id, 'assignment', 'New assignment: ' || new.title
  from class_members
  where class_id = new.class_id;
  return new;
end;
$$;

create trigger on_assignment_created
  after insert on assignments
  for each row execute function notify_new_assignment();

alter table profiles enable row level security;
alter table classes enable row level security;
alter table class_members enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table notifications enable row level security;

create policy "read own profile" on profiles
  for select using (id = auth.uid());
create policy "teacher reads own students" on profiles
  for select using (
    exists (
      select 1 from class_members m
      where m.student_id = profiles.id and is_class_teacher(m.class_id)
    )
  );
create policy "update own profile" on profiles
  for update using (id = auth.uid());

create policy "see my classes" on classes
  for select using (teacher_id = auth.uid() or is_class_member(id));
create policy "teacher creates class" on classes
  for insert with check (
    teacher_id = auth.uid()
    and exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
  );
create policy "teacher edits class" on classes
  for update using (teacher_id = auth.uid());
create policy "teacher deletes class" on classes
  for delete using (teacher_id = auth.uid());

create policy "see class members" on class_members
  for select using (student_id = auth.uid() or is_class_teacher(class_id));
create policy "student leaves class" on class_members
  for delete using (student_id = auth.uid());

create policy "see class assignments" on assignments
  for select using (is_class_teacher(class_id) or is_class_member(class_id));
create policy "teacher creates assignment" on assignments
  for insert with check (is_class_teacher(class_id));
create policy "teacher edits assignment" on assignments
  for update using (is_class_teacher(class_id));
create policy "teacher deletes assignment" on assignments
  for delete using (is_class_teacher(class_id));

create policy "see submissions" on submissions
  for select using (
    student_id = auth.uid()
    or is_class_teacher(class_of_assignment(assignment_id))
  );
create policy "student submits" on submissions
  for insert with check (
    student_id = auth.uid()
    and is_class_member(class_of_assignment(assignment_id))
  );
create policy "student edits own before grading" on submissions
  for update using (student_id = auth.uid() and status <> 'graded');
create policy "teacher grades" on submissions
  for update using (is_class_teacher(class_of_assignment(assignment_id)));

create policy "read own notifications" on notifications
  for select using (user_id = auth.uid());
create policy "mark own notifications read" on notifications
  for update using (user_id = auth.uid());
