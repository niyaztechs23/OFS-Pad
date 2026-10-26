-- OFS Pad backend hardening
-- Apply this migration after the existing core schema.
-- It does not drop or recreate existing tables.

-- Students may submit and edit their own content, but they must never be
-- able to change marks, feedback, or a graded status from the browser.
create or replace function protect_submission_grading_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.student_id then
    if old.status = 'graded'
      or new.status is distinct from old.status and new.status = 'graded'
      or new.marks is distinct from old.marks
      or new.feedback is distinct from old.feedback then
      raise exception 'Only the class teacher can change grading fields';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_submission_grading_fields on submissions;
create trigger protect_submission_grading_fields
before update on submissions
for each row execute function protect_submission_grading_fields();

-- Notify the teacher when a student submits work. The existing RLS rules still
-- decide who can read the resulting notification.
create or replace function notify_teacher_on_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment_title text;
  target_teacher uuid;
begin
  if new.status = 'submitted'
    and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    select a.title, c.teacher_id
      into assignment_title, target_teacher
      from assignments a
      join classes c on c.id = a.class_id
     where a.id = new.assignment_id;

    if target_teacher is not null then
      insert into notifications (user_id, type, message)
      values (
        target_teacher,
        'submission',
        'New submission: ' || coalesce(assignment_title, 'an assignment')
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_submission_created on submissions;
create trigger on_submission_created
after insert or update of status on submissions
for each row execute function notify_teacher_on_submission();

-- Notify the student when a teacher grades work. The frontend can route this
-- notification to the student's assignments page.
create or replace function notify_student_on_grade()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment_title text;
begin
  if new.status = 'graded'
    and (old.status is distinct from new.status or old.marks is distinct from new.marks or old.feedback is distinct from new.feedback) then
    select title into assignment_title from assignments where id = new.assignment_id;
    insert into notifications (user_id, type, message)
    values (
      new.student_id,
      'grade',
      'Work graded: ' || coalesce(assignment_title, 'your assignment')
        || case when new.marks is not null then ' (' || new.marks::text || '/100)' else '' end
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_submission_graded on submissions;
create trigger on_submission_graded
after update of status, marks, feedback on submissions
for each row execute function notify_student_on_grade();
