# OFS Pad — Project Map

## Frontend

- `src/App.tsx` — top-level routes and role-protected route selection
- `src/pages/AuthPage.tsx` — email/password and Google auth entry point
- `src/pages/ProfilePage.tsx` — read-only profile dashboard for every signed-in role and role-specific study or teaching statistics
- `src/components/auth/AuthProvider.tsx` — session restoration, auth events, profile/role loading
- `src/components/ui/PasswordField.tsx` — masked password input with an accessible show/hide button
- `src/components/Logo.tsx` — compact wordmark lockup and full supplied logo tile
- `src/pages/student/` — student home, notebooks, assignments, doubts, announcements, planner
- `src/pages/teacher/` — class, assignment, grading, doubt, announcement, and exam workflows
- `src/pages/admin/AdminDashboard.tsx` — teacher approval management
- `src/components/notebook/` — notebook editor, canvas tools, autosave UI
- `src/lib/supabase.ts` — browser Supabase client configuration
- `src/lib/notebookStore.ts` — browser-local notebook persistence and seeded notebooks
- `src/hooks/` — data hooks and realtime refresh behavior

## Backend

- `supabase/migrations/` — schema, RLS, RPCs, triggers, and Realtime setup
- `supabase/migrations/20261104220000_admin_teacher_approvals.sql` — admin bootstrap and approval operations
- `supabase/migrations/20261104223000_google_auth_teacher_role.sql` — approved-email Google teacher role assignment

## Deployment and routing

- `vercel.json` — React SPA rewrite
- `public/manus-routes.json` — declared application routes
- `public/ofs-pad-logo.png` and `public/ofs-pad-*.png` — supplied brand logo, favicons, and installed-app icons
- `public/site.webmanifest` — installed-app name, colours, and icons
- `.env.example` — safe environment variable template
- `package.json` — development, typecheck, lint, and build commands

## Recommended change flow

1. Understand the existing hook/page/component boundary.
2. Add or update a migration for schema/RLS changes.
3. Keep role checks in the database as well as the UI.
4. Update route manifest for new pages.
5. Run typecheck, lint, and build.
6. Test the affected role workflow.
7. Update the relevant documentation file.
8. Commit and push to `main`.
