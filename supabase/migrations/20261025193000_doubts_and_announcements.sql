-- OFS Pad real doubts and announcements

create table if not exists doubts (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  subject text not null check (subject in ('maths','science','english','history','computer')),
  question text not null check (char_length(trim(question)) between 5 and 1000),
  author_label text not null,
  status text not null default 'open' check (status in ('open','answered')),
  answer text,
  upvotes integer not null default 0 check (upvotes >= 0),
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 120),
  body text not null check (char_length(trim(body)) between 1 and 5000),
  created_at timestamptz not null default now()
);

create table if not exists private.doubt_owners (
  doubt_id uuid primary key references doubts(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade
);

create table if not exists private.doubt_votes (
  doubt_id uuid not null references doubts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (doubt_id, user_id)
);

alter table doubts enable row level security;
alter table announcements enable row level security;
alter table private.doubt_owners enable row level security;
alter table private.doubt_votes enable row level security;

revoke all on table private.doubt_owners, private.doubt_votes from public, anon, authenticated;
revoke all on table doubts from anon, authenticated;
grant select on table doubts to authenticated;
revoke all on table announcements from anon, authenticated;
grant select, insert, update, delete on table announcements to authenticated;

create policy "class participants read doubts" on doubts
for select using (private.is_class_member(class_id) or private.is_class_teacher(class_id));

create policy "class participants read announcements" on announcements
for select using (private.is_class_member(class_id) or private.is_class_teacher(class_id));
create policy "teacher creates announcements" on announcements
for insert with check (teacher_id = auth.uid() and private.is_class_teacher(class_id));
create policy "teacher edits announcements" on announcements
for update using (teacher_id = auth.uid() and private.is_class_teacher(class_id))
with check (teacher_id = auth.uid() and private.is_class_teacher(class_id));
create policy "teacher deletes announcements" on announcements
for delete using (teacher_id = auth.uid() and private.is_class_teacher(class_id));

create or replace function create_doubt(p_class_id uuid, p_subject text, p_question text, p_anonymous boolean default true)
returns uuid language plpgsql security definer set search_path = public, private as $$
declare
  new_id uuid;
  label text;
  current_name text;
begin
  if auth.uid() is null or not private.is_class_member(p_class_id) then
    raise exception 'Only students in this class can ask a doubt';
  end if;
  if p_subject not in ('maths','science','english','history','computer') then
    raise exception 'Invalid subject';
  end if;
  if char_length(trim(p_question)) < 5 or char_length(trim(p_question)) > 1000 then
    raise exception 'Question must be between 5 and 1000 characters';
  end if;
  select full_name into current_name from profiles where id = auth.uid();
  label := case when p_anonymous then 'Anonymous ' || substr(md5(auth.uid()::text || clock_timestamp()::text), 1, 6) else coalesce(current_name, 'Student') end;
  insert into doubts(class_id, subject, question, author_label)
  values (p_class_id, p_subject, trim(p_question), label)
  returning id into new_id;
  insert into private.doubt_owners(doubt_id, student_id) values (new_id, auth.uid());
  return new_id;
end;
$$;

create or replace function upvote_doubt(p_doubt_id uuid)
returns boolean language plpgsql security definer set search_path = public, private as $$
begin
  if auth.uid() is null then raise exception 'You must be signed in'; end if;
  if not exists (select 1 from doubts d where d.id = p_doubt_id and (private.is_class_member(d.class_id) or private.is_class_teacher(d.class_id))) then
    raise exception 'Doubt not found';
  end if;
  insert into private.doubt_votes(doubt_id, user_id) values (p_doubt_id, auth.uid()) on conflict do nothing;
  if found then update doubts set upvotes = upvotes + 1 where id = p_doubt_id; return true; end if;
  return false;
end;
$$;

create or replace function answer_doubt(p_doubt_id uuid, p_answer text)
returns boolean language plpgsql security definer set search_path = public, private as $$
declare target_class uuid; owner_id uuid; question_title text;
begin
  if char_length(trim(p_answer)) < 2 or char_length(trim(p_answer)) > 3000 then raise exception 'Answer must be between 2 and 3000 characters'; end if;
  select class_id into target_class from doubts where id = p_doubt_id;
  if target_class is null or not private.is_class_teacher(target_class) then raise exception 'Only the class teacher can answer this doubt'; end if;
  update doubts set answer = trim(p_answer), status = 'answered', answered_at = now() where id = p_doubt_id;
  select student_id into owner_id from private.doubt_owners where doubt_id = p_doubt_id;
  select question into question_title from doubts where id = p_doubt_id;
  if owner_id is not null then
    insert into notifications(user_id, type, message) values(owner_id, 'doubt', 'Your doubt was answered: ' || left(question_title, 80));
  end if;
  return true;
end;
$$;

create or replace function notify_students_on_announcement()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into notifications(user_id, type, message)
  select student_id, 'announcement', 'New announcement: ' || new.title
  from class_members where class_id = new.class_id;
  return new;
end;
$$;

drop trigger if exists on_announcement_created on announcements;
create trigger on_announcement_created after insert on announcements
for each row execute function notify_students_on_announcement();

revoke execute on function create_doubt(uuid,text,text,boolean) from public, anon;
grant execute on function create_doubt(uuid,text,text,boolean) to authenticated;
revoke execute on function upvote_doubt(uuid) from public, anon;
grant execute on function upvote_doubt(uuid) to authenticated;
revoke execute on function answer_doubt(uuid,text) from public, anon;
grant execute on function answer_doubt(uuid,text) to authenticated;
revoke execute on function notify_students_on_announcement() from public, anon, authenticated;
