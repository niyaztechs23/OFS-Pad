# OFS Pad

OFS Pad is a calm, privacy-first school workspace for students and teachers. It includes role-based authentication, teacher classes and assignments, student class joining, notebook pages, assignment submission, grading, feedback, real class doubts, teacher answers, student upvotes, live exams, class announcements, and clickable notifications.

## Run locally

1. Install Node.js 20 or newer.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Confirm `.env` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Run `npm run dev`.
6. Open the local URL shown by Vite.

## Quality checks

- `npm run typecheck` checks TypeScript.
- `npm run lint` checks the source. The current project has two non-blocking Fast Refresh warnings because the auth and theme modules also export their hooks.
- `npm run build` creates the production bundle in `dist/`.

## Core demo path

Create a teacher account, create a class, and copy its join code. Create an assignment for that class. Then create or use a student account, join the class with the code, and open Assignments. Submit notebook work, return to the teacher account, open the grading notification, set marks and feedback, and return to the student account to confirm the graded result.

The frontend uses the publishable Supabase anon key only. Authorization and privacy depend on Supabase Row Level Security; do not put a service-role key in `.env` or frontend code. The complete expansion plan is documented in [`OFS_PAD_PRODUCT_SCOPE.md`](./OFS_PAD_PRODUCT_SCOPE.md) and [`plan.md`](./plan.md).

## Backend migration

The core schema is already represented in `supabase/migrations/20261019111348_create_core_schema.sql`. The forward-only migration `supabase/migrations/20261025180000_harden_submissions_and_notifications.sql` has now been applied to the Supabase project currently used by this app. The security migration `supabase/migrations/20261025190000_security_hardening_roles_and_rpc.sql` is also applied: ordinary users cannot change roles, internal RLS helpers are private, and only the intended authenticated `join_class` RPC is public. If you point `.env` at a different Supabase project later, apply all migrations there too.

## Verified in this working copy

The TypeScript check passes, the lint command completes with only the two non-blocking warnings documented above, the production Vite build succeeds, the development server serves the landing page and all declared routes, and the configured Supabase REST endpoint responds successfully.

## Real doubts and announcements

The migration `supabase/migrations/20261025193000_doubts_and_announcements.sql` adds class-scoped doubts, privacy-preserving anonymous labels, one-vote-per-user upvotes, teacher answer RPCs, announcements and announcement notifications. Students can ask in a joined class, teachers can answer doubts from their own classes, teachers can publish announcements, and students receive both the announcement row and a notification. The live backend flow was smoke-tested and temporary test rows were removed afterward.

## Realtime behavior

The migration `supabase/migrations/20261025194000_enable_realtime_community.sql` enables Supabase Realtime for doubts, announcements, notifications and submissions. The student and teacher dashboards subscribe to live doubt, announcement, notification and grading changes, clean up channels on unmount, and use a 15-second refresh fallback so a temporarily missed websocket event cannot leave a stale screen.

The final regression pass covered teacher and student authentication, class membership, assignment visibility, submission, teacher grading, student feedback, anonymous doubts, teacher answers, announcements, notification creation, the student Doubt Wall and Announcements screens, and the teacher dashboard, Doubts and Announcements screens. Temporary test records were removed.

## Live exams

The migration `supabase/migrations/20261025194500_exams.sql` adds the real `exams` table with RLS, teacher ownership, joined-class student visibility, exam notifications and Realtime publication. Teachers create and delete exams from `/teacher/exams`; students see exams in `/student/planner` and on the student dashboard. There are no seeded exam records in the application.

## Teacher account access

Teacher registration is invitation-only and email-approved. The public signup screen does not expose teacher onboarding. An authorized school administrator approves a teacher email in Supabase, then shares the private signup URL `/auth?mode=signup&role=teacher`. The Supabase Auth trigger independently verifies that the email is approved, unused and not expired before assigning the `teacher` role. A student cannot create a teacher account by changing browser fields or request metadata.

To approve a teacher, an authorized school administrator can run this in the Supabase SQL editor:

```sql
insert into public.teacher_invites (email, expires_at)
values ('teacher@school.edu', now() + interval '7 days');
```

The teacher must sign up with the approved email. After successful authentication, the role-protected teacher workflow becomes available automatically. Configure Supabase email confirmation for production so only the owner of the approved email can activate the account.
