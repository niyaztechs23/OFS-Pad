# OFS Pad implementation plan

## Product direction

OFS Pad will become a complete, privacy-first school learning platform: a calm digital school bag for students, teachers, school administrators and, later, guardians. The existing notebook-first visual system remains the source of truth. New modules should feel like connected pages in the same pad, not unrelated dashboards.

## Product modules to add

### Student workspace

- Home dashboard with joined classes, deadlines, unread notifications and next actions.
- Subject notebooks with typed notes, handwriting, pages, private rough work and teacher submission.
- Assignments with instructions, attachments, draft/submitted/graded states, marks and feedback.
- Doubt wall with anonymous questions, teacher/classmate answers, upvotes and moderation.
- Planner and calendar with assignments, exams, reminders and personal study blocks.
- Exam preparation with teacher-created tests, objective questions, written responses, attempts and results.
- Attendance view with daily/monthly status and absence notes.
- Resource library for teacher-shared files, links, worksheets and recorded lessons.
- Student profile, notification center, search and accessibility preferences.

### Teacher workspace

- Class management with join codes, roster, subjects and archived classes.
- Assignment builder with deadlines, attachments, rubrics, late policy and scheduled publishing.
- Submission review with notebook preview, marks, rubric criteria, feedback and resubmission support.
- Question bank and exam builder with automatic and manual grading.
- Attendance register with bulk marking and notes.
- Doubt moderation and class announcements.
- Resource library and lesson/topic organization.
- Class analytics: completion, late work, marks distribution, attendance and unanswered doubts.
- Teacher notification center and profile settings.

### School administration

- Admin-only school/workspace setup, teacher and student management, class enrollment and invitations.
- Academic year, terms, subjects, rooms and timetable management.
- School-wide announcements, moderation, audit log and data export.
- Role management with immutable authorization boundaries and controlled administrator elevation.
- Reports for attendance, performance, submissions and engagement.

### Guardian and operations extensions

- Optional guardian accounts linked to approved students with read-only progress, attendance and announcements.
- Messaging between approved school participants with reporting and moderation.
- Subscription/payment support only if the school later requires paid services; never add payment collection without a separate product decision.

## Delivery approach

Build in vertical slices so each phase is usable and secure:

1. **Foundation hardening:** fix role escalation, lock down internal RPCs, strengthen Auth settings, add explicit RLS checks, and keep the existing teacher–student workflow passing.
2. **Core classroom completeness:** real doubts, announcements, resources, attendance, planner/calendar and assignment attachments.
3. **Assessment suite:** tests, question bank, rubrics, gradebook, resubmissions and analytics.
4. **School operations:** admin workspace, roster/invitations, terms, timetable, reports and audit log.
5. **Optional guardian and communication layer:** guardian read-only access, moderated messaging and school-wide announcements.

Each slice uses separate forward-only Supabase migrations, reusable hooks, role-specific policies and the existing design system. No mock data may appear in a live workflow once its module is connected to Supabase.

## Implementation approach

- Keep React + Vite + TypeScript + Tailwind and the existing route guards.
- Keep Supabase as the authentication and data layer, using only the publishable anon key in the browser.
- Treat RLS, immutable role boundaries and database constraints as the actual security boundary; client guards are UX only.
- Add small, reusable domain hooks and components instead of growing large page files.
- Add attachments through Supabase Storage with private buckets and signed URLs.
- Add audit-friendly database timestamps and actor IDs to all mutable school records.
- Maintain the calm paper/ink visual language: ruled surfaces, ink-blue navigation, green completion state, amber attention state and clay urgency state.
- Keep every new route in `public/manus-routes.json`.

## Project structure

- `src/pages`: landing, auth, student, teacher and future admin routes.
- `src/components`: shared shell, notebook editor, assignment, doubt, attendance, calendar, analytics and modal components.
- `src/hooks`: domain-specific Supabase data flows with explicit loading, empty, error and mutation-result states.
- `src/lib`: Supabase client, notebook persistence, submission formatting, permissions and validation helpers.
- `supabase/migrations`: forward-only schema, RLS, functions, triggers and storage policies.
- `public/manus-routes.json`: complete route manifest.

## Design system

- **Movement:** quiet digital stationery: a soft paper canvas, ink-blue navigation, compact cards and notebook-like detail surfaces.
- **Core principles:** calm focus, touch-first controls, visible progress and privacy made legible.
- **Color philosophy:** paper and ink create a trustworthy classroom surface; green means complete, amber means attention, and clay-red means urgency.
- **Layout paradigm:** persistent desktop rail and mobile tab bar frame a spacious reading surface; actions sit where the hand naturally reaches.
- **Signature elements:** ruled notebook textures, rounded paper cards and subject-colored tags.
- **Interaction philosophy:** every action gives a clear state change, friendly empty state, recoverable error and accessible focus treatment.
- **Animation:** restrained transitions only; no distracting motion in study surfaces.
- **Typography:** Nunito for headings; Inter for body text.
- **Brand essence:** a private digital school bag that carries knowledge instead of notebooks; calm, trustworthy, student-first.
- **Brand voice:** “Everything you need for class, in one calm place.” and “Ask freely. Learn together.”
- **Signature brand color:** ink-blue `#2B4C7E`.

## Security principles

- Roles are assigned server-side and cannot be changed by ordinary users.
- Internal SECURITY DEFINER helpers are not public RPC endpoints.
- Every table has explicit SELECT, INSERT, UPDATE and DELETE policies where needed, with explicit `WITH CHECK` clauses.
- Ownership fields are immutable unless an authorized admin workflow changes them.
- Private files use private storage buckets and signed URLs.
- Auth uses strong passwords, leaked-password protection, rate limits and verified email or school-controlled onboarding for production.
- All destructive or administrative actions are auditable.
