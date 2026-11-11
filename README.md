# OFS Pad

OFS Pad is a calm, privacy-first school workspace for students and teachers. It includes role-based authentication, teacher classes and assignments, student class joining, notebook pages, assignment submission, grading, feedback, real class doubts, teacher answers, student upvotes, live exams, class announcements, and clickable notifications.

## Links

- Production: https://ofs-pad-mqy1.vercel.app
- GitHub: https://github.com/niyaztechs23/OFS-Pad

## Documentation

The detailed notes are separated by workflow in the [`docs/`](./docs) directory:

- [`SETUP.md`](./docs/SETUP.md) — install, environment variables, local development, and checks
- [`AUTHENTICATION.md`](./docs/AUTHENTICATION.md) — email auth, Google OAuth, sessions, and roles
- [`ADMIN_TEACHERS.md`](./docs/ADMIN_TEACHERS.md) — admin bootstrap, private teacher approval, and teacher workflow
- [`STUDENT_WORKFLOWS.md`](./docs/STUDENT_WORKFLOWS.md) — classes, notebooks, assignments, doubts, announcements, and planner
- [`DATABASE_SECURITY.md`](./docs/DATABASE_SECURITY.md) — migrations, RLS, RPCs, Realtime, and secrets
- [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — Vercel, Supabase, Google Cloud, and release checklist
- [`TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) — common auth, routing, notebook, realtime, and build problems
- [`PROJECT_MAP.md`](./docs/PROJECT_MAP.md) — source-code map and recommended change flow

## Run locally

1. Install Node.js 20 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
5. Run `npm run dev`.
6. Open the local URL shown by Vite.

Only the publishable Supabase anon key belongs in the frontend. Never put a Supabase service-role key, Google Client Secret, database password, or personal password in `.env` or source code.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

The current lint output contains two non-blocking Fast Refresh warnings because the auth and theme modules also export their hooks. TypeScript and the production Vite build should complete successfully.

## Backend migrations

Apply every file in `supabase/migrations/` in filename order when setting up a Supabase project. The migrations create the core schema, submissions, notifications, role security, doubts, announcements, Realtime publication, exams, teacher approvals, admin controls, and Google teacher-role protection.

If you point `.env` at a different Supabase project, apply the complete migration set there before testing. Authorization and privacy depend on Supabase Row Level Security; the frontend is not the security boundary.

## Teacher access

Teacher registration is invitation-only and email-approved. The public signup screen does not expose teacher onboarding. An administrator approves a teacher email in `/admin`, then shares `/auth?mode=signup&role=teacher`. The authenticated email must match an approved, unused, unexpired approval before the database assigns the `teacher` role.

The first administrator is bootstrapped once from a trusted Supabase SQL Editor session. Create the administrator account first, then run:

```sql
select public.bootstrap_first_admin('deendeen084@gmail.com');
```

Afterward, routine teacher approvals happen inside the in-app admin dashboard. Never store the administrator password in this repository.

## Google authentication

Supabase Authentication → Providers → Google must be enabled with the Google OAuth Client ID and Client Secret. Google Cloud should use the Supabase callback URL shown by the provider settings. Supabase URL Configuration should use:

```text
Site URL: https://ofs-pad-mqy1.vercel.app
Redirect URL: https://ofs-pad-mqy1.vercel.app/auth
```

The app uses durable browser sessions, automatic refresh, PKCE callbacks, and profile/role synchronization after auth events. A production smoke test with the secondary Google student account completed successfully and landed at `/student`.

## Student notebooks

Students can open `/student/notebooks`, create notebooks with a name and subject, rename notebook titles from the editor, add pages, use handwriting/type tools, and submit work to teachers. The create-and-rename flow was verified in production. Current notebook state is stored per user/browser through the notebook store; it is not yet cross-device cloud notebook synchronization.

## Profile dashboard and password visibility

Every signed-in user has a profile dashboard at `/profile`, reachable from the avatar in the top bar and the **Profile** item in the sidebar. It shows the registered account name, email, role, sign-in method, member-since date, classes, quick links, and role-specific study or teaching statistics. The profile is read-only after registration: the registered name, email, and password are not changed from this page.

Password fields on the sign-in and sign-up screens include a visible **eye** button that switches between hidden and visible text, so students can check what they typed before submitting. Passwords are still masked by default and are never stored in the app.

The OFS Pad logo supplied for the project is used across the app, sign-in screen, favicons, installed-app icons, and social preview. Brand assets live in `public/ofs-pad-*.png`.

## Deployment

Vercel builds the Vite app into `dist/` and uses `vercel.json` to rewrite application routes to `/index.html`. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Preview/Production environments. Follow [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) before changing production configuration.
