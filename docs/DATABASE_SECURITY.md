# OFS Pad — Database, Migrations, and Security

## Supabase project

The production app uses Supabase project reference `rizdsqdabijcdjacknbz`. The frontend only needs:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-anon-key>
```

## Migration order

Apply every file in `supabase/migrations/` in filename order:

1. Core schema and reset preparation
2. Submission and notification hardening
3. Role and RPC security hardening
4. Doubts and announcements
5. Realtime publication
6. Exams
7. Teacher invites
8. Teacher email approval
9. Admin approval RPCs
10. Google teacher role trigger

When pointing the app at another Supabase project, apply all migrations before testing the frontend.

## Main tables and concepts

The schema includes profiles, classes, memberships, assignments, submissions, notifications, doubts, doubt votes, announcements, exams, notebooks, notebook pages, and teacher invitation/approval records.

Ownership and class membership are enforced in PostgreSQL. The frontend is not trusted for authorization.

## RLS principles

- Students can read only data belonging to themselves or classes they joined.
- Teachers can manage only classes they own and related class activity.
- Administrators can manage teacher approvals through protected operations.
- Ordinary users cannot update their own role.
- Teacher approval must match the authenticated email and approval state.
- Anonymous doubts hide author identity in presentation while preserving secure ownership internally.
- Realtime channels are limited to tables already protected by the database model.

## Realtime and fallback

Realtime is enabled for doubts, announcements, notifications, and submissions. The dashboards clean up subscriptions on unmount and use a periodic refresh fallback so missed websocket events do not leave stale screens.

## Secrets and credentials

Never commit:

- Supabase service-role keys
- Google OAuth Client Secrets
- Database passwords
- Vercel tokens
- Personal account passwords

Only publishable browser-safe values may be exposed through `VITE_*` variables.

## Database changes

For every schema change:

1. Add a new forward-only migration.
2. Include RLS policies and role checks in the migration.
3. Apply it to the intended Supabase project.
4. Run typecheck/build and a focused smoke test.
5. Document the change in `README.md` or this directory.
