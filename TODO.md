# OFS Pad outcomes

## Foundation and security

- [ ] Ordinary users cannot change `profiles.role`; only a controlled administrator path can change authorization roles.
- [ ] Internal SECURITY DEFINER helpers are not executable by anonymous or ordinary authenticated API clients; only intentionally public RPCs are granted.
- [ ] RLS policies include explicit `WITH CHECK` clauses for ownership and role invariants.
- [ ] Submission ownership fields cannot be changed after creation, and grading fields remain teacher-only.
- [ ] Leaked-password protection and a strong password policy are enabled; signup/login errors do not disclose account existence or internal errors.
- [ ] Every live table, storage bucket and administrative action has an explicit security review.

## Existing classroom workflow

- [x] A teacher can create a class and share its generated join code.
- [x] A teacher can create assignments with title, description, subject and deadline.
- [x] A student can join a class through the database `join_class` flow.
- [x] A student can submit notebook work and sees grade, marks and teacher feedback after grading.
- [x] A teacher can review submitted work for their own classes and save marks and feedback.
- [x] Submission and grading notifications are durable database rows.

## Student workspace expansion

- [x] Students can view real doubts, ask anonymously, receive answers and upvote useful answers.
- [x] Students can view real planner events for assignments and teacher-created exams.
- [ ] Students can view real attendance history and absence notes.
- [ ] Students can browse teacher-shared resources and open permitted attachments through signed URLs.
- [ ] Students can search their own notebooks, assignments, resources and doubts.
- [ ] Students can manage profile, notification and accessibility preferences.

## Teacher workspace expansion

- [x] Teachers can post class announcements and students receive targeted notifications.
- [ ] Teachers can create resources and organize them by class, subject and topic.
- [ ] Teachers can record and edit attendance with a date-based register.
- [x] Teachers can create and manage live scheduled exams for their classes.
- [ ] Teachers can build exams from a question bank and grade objective and written responses.
- [ ] Teachers can use rubrics, resubmission rules and late-submission handling.
- [ ] Teachers can view class analytics for completion, late work, marks, attendance and unanswered doubts.

## School administration

- [ ] An admin can manage teachers, students, classes, subjects, terms and invitations.
- [ ] Admin-only routes and RLS policies prevent students and teachers from accessing administrative controls.
- [ ] School announcements, moderation queues, audit log and data export are available to authorized admins.
- [ ] Archived classes and academic terms retain read-only history without exposing unrelated school data.

## Optional guardian and communication layer

- [ ] Approved guardians can view linked student progress, attendance, assignments and announcements read-only.
- [ ] Approved school participants can exchange moderated messages with reporting and audit support.
- [ ] Any payment or subscription feature is separately approved and never added implicitly.

## Quality and delivery

- [ ] Typecheck, lint and production build pass after each feature slice.
- [ ] Every new route is included in `public/manus-routes.json`.
- [ ] Every new Supabase migration is forward-only, applied to the active project, and covered by positive and negative RLS tests.
- [ ] Production preview is visually checked for student, teacher and admin role flows after each major slice.
