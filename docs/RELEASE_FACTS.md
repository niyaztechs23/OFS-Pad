# OFS Pad Release Fact Sheet

Verified on 2026-11-14 (Asia/Kolkata) against production.

## Delivered
- GitHub: https://github.com/niyaztechs23/OFS-Pad
- Release commit: 3f67ea0827842a194299ed1338de33790bdfafcc
- Production: https://ofs-pad-mqy1.vercel.app
- Vercel deployment: dpl_EjYybS4qQGv66SaYHUGzVP1HxqTV (READY, aliased)
- Supabase project: OFS-PAD / rizdsqdabijcdjacknbz (AP-South-1)
- Cloud notebook migration: 20261113010000_cloud_notebooks.sql, applied live
- Live routes verified: /, /intro, /privacy, /terms, /student/notebooks, /manus-routes.json (HTTP 200)
- Live security headers verified: CSP, HSTS, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, X-Frame-Options
- Source checks: npm run typecheck, lint (0 errors, 2 pre-existing warnings), build, JSON validation, git diff --check

## Implemented product scope
- React 18 + TypeScript + Vite frontend; React Router role routes; Tailwind CSS.
- Supabase Auth (email/password and Google OAuth), profiles, role guards.
- Student, teacher, administrator role experiences.
- Classes and join codes; assignments and submissions; grading and feedback.
- Doubts, announcements, notifications, exam scheduling, planner.
- Digital notebook: handwriting, typed text, pages, private rough notebook, assignment submission.
- NEW: cloud notebook persistence in public.notebooks with RLS, revision tracking, local cache fallback, one-time local migration.
- Profile dashboard, read-only identity after registration, password visibility toggle on auth.
- First-visit role-specific onboarding tour, public intro guide, Privacy Policy, Terms & Conditions.
- Responsive desktop sidebar and mobile bottom navigation; light/dark themes.
- OFS Pad supplied brand logo across app, favicons, installed-app icons, and social preview.

## Known remaining setup items
- Supabase leaked-password protection is disabled in Auth settings.
- Three advisory notices remain for RLS-enabled tables without policies (private.doubt_owners, private.doubt_votes, public.teacher_invites); these tables are intentionally not exposed to clients.
- Teacher invitations copy a generic private signup link; the approved email remains the authoritative server-side control.
- No automated end-to-end browser test suite is checked in; verification in this release was source-level plus live route/header checks and manual production use.
- Exam scheduling is implemented; full online exam attempts and automatic grading are roadmap, not current features.

## Ideathon narrative
Problem: school work is scattered across notebooks, messaging, paper deadlines, and separate class tools.
Solution: one calm workspace that connects classes, notes, assignments, questions, announcements, planning, and profiles.
Differentiator: cloud-synced handwriting notebooks plus class-scoped privacy enforced in the database.
Impact: fewer lost notes, clearer deadlines, faster teacher feedback, and controlled school access.
Roadmap: offline conflict resolution, teacher invite tokens, automated end-to-end tests, exam attempts, analytics for learning support.
