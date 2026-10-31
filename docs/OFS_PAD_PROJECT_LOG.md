# OFS Pad Project Log

## Project

OFS Pad is a calm school workspace for students and teachers. The app is a React + Vite + TypeScript frontend backed by Supabase.

## What was built

- Student and teacher authentication with role-based route protection.
- Teacher classes with generated join codes.
- Student class joining through the secure `join_class` RPC.
- Real assignments, student notebook submissions, teacher grading and feedback.
- Durable assignment, grading and submission notifications.
- Anonymous student doubts, upvotes and teacher answers.
- Teacher announcements targeted to class members.
- Supabase Realtime subscriptions for doubts, announcements, notifications, submissions and exams, with refresh fallback.
- Live scheduled exams: teachers create/delete exams at `/teacher/exams`; students see joined-class exams in `/student/planner` and on the dashboard.
- Invitation-only teacher signup. Students cannot create teacher accounts by changing browser fields or request metadata.
- Supabase Row Level Security and private helper functions hardened for classroom data access.

## Important Supabase migrations

- `20261019111348_create_core_schema.sql` — core tables and classroom workflow.
- `20261025180000_harden_submissions_and_notifications.sql` — grading protection and notifications.
- `20261025190000_security_hardening_roles_and_rpc.sql` — role integrity, private helper functions and RPC hardening.
- `20261025193000_doubts_and_announcements.sql` — real doubts and announcements.
- `20261025194000_enable_realtime_community.sql` — Realtime publication membership.
- `20261025194500_exams.sql` — live exams table, RLS, notifications and Realtime.
- `20261025200000_teacher_invites.sql` — invitation-only teacher onboarding.

## Teacher onboarding

Teachers need an invitation created by an authorized school administrator in Supabase SQL Editor:

```sql
insert into public.teacher_invites (email, invite_code, expires_at)
values ('teacher@school.edu', 'use-a-private-random-code', now() + interval '7 days');
```

The invitation must match the teacher email, remain unused and not be expired. It is consumed on successful signup.

## Security work completed

- Temporary teacher and student browser-test accounts were deleted.
- Unauthorized teacher signup was tested directly against Supabase and rejected.
- Normal student signup was tested and allowed; the temporary student was deleted afterward.
- Student grading-field tampering is blocked by database protections.
- Teacher class and exam ownership is enforced by RLS.
- No service-role key is stored in the frontend repository.
- `.env` is ignored; use `.env.example` for setup.

## Validation completed

- `npm run typecheck` passes.
- `npm run lint` passes with two existing non-blocking Fast Refresh warnings in provider files.
- `npm run build` passes.
- Live Supabase RLS, Realtime, auth and classroom smoke tests were run.
- Live exam table currently has zero records until a real teacher creates the first exam.

## Current repository hygiene

Generated `node_modules`, `dist` and internal `.bolt` files are excluded from the published repository. The repository contains source, migrations, documentation and lockfiles only.

## First real-user launch steps

1. Create a private GitHub repository from the published project.
2. Configure the production host with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Configure Supabase Auth production URLs and email delivery.
4. Issue teacher invitations privately.
5. Create a real teacher account and class.
6. Create a real student account and join the class.
7. Test assignment, doubt, announcement, exam and grading flows with two browsers.
8. Keep database backups and a rollback deployment available.

## Hosting note

A private GitHub repository is safe code storage and version history, but a normal GitHub repository link is not itself a live web-app URL. The app needs a web host such as GitHub Pages, Vercel, Netlify or another static host. The host must support SPA fallback and the Supabase environment variables.
