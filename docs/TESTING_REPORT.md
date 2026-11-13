# OFS Pad Testing and Verification Report

Release commit: `3f67ea0827842a194299ed1338de33790bdfafcc`
Production: https://ofs-pad-mqy1.vercel.app
Vercel deployment: `dpl_EjYybS4qQGv66SaYHUGzVP1HxqTV` (READY, production alias)
Verified: 14 November 2026, Asia/Kolkata

## 1. Automated source checks

| Check | Command | Result |
| --- | --- | --- |
| TypeScript types | `npm run typecheck` | Pass, no errors |
| Lint | `npm run lint` | Pass, 0 errors, 2 pre-existing `react-refresh` warnings in `AuthProvider.tsx` and `ThemeProvider.tsx` |
| Production build | `npm run build` | Pass, 1704 modules transformed, `dist/assets/index-BglaUoms.js` 510.75 kB (141.20 kB gzip) |
| Vercel config syntax | `python3 -m json.tool vercel.json` | Pass |
| Whitespace and conflict markers | `git diff --check` | Pass |

The 510 kB bundle triggers Vite's chunk-size advisory. It is a performance note, not a failure; route-level code splitting is a follow-up improvement.

## 2. Database verification

Project `rizdsqdabijcdjacknbz` (OFS-PAD, AP-South-1), migration `20261113010000_cloud_notebooks.sql` applied.

- `public.notebooks` exists with columns `id`, `user_id`, `title`, `subject`, `is_rough`, `content` (jsonb), `revision`, `created_at`, `updated_at`.
- Row level security is enabled on `public.notebooks`.
- Four policies exist: read own, create own, update own, delete own.
- Grants: `select, insert, update, delete` to `authenticated`; all revoked from `anon`.
- Foreign key `notebooks_user_id_fkey` ties every notebook to a `public.profiles` row.
- Check constraints bound title length, subject values, revision non-negative, and require `content` to be a JSON object.

Supabase security advisors were reviewed after the migration. Open items are listed in section 5.

## 3. Production route verification

| Route | Status | Content type |
| --- | --- | --- |
| `/` | 200 | text/html |
| `/intro` | 200 | text/html |
| `/privacy` | 200 | text/html |
| `/terms` | 200 | text/html |
| `/student/notebooks` | 200 | text/html |
| `/manus-routes.json` | 200 | application/json |

All routes return the SPA shell, and the client router resolves each one, confirming the Vercel rewrite is correct.

## 4. Production headers verification

`curl -I https://ofs-pad-mqy1.vercel.app/` returns:

- `content-security-policy` with `default-src 'self'`, Supabase `connect-src`, Google frame allowance, `object-src 'none'` and `frame-ancestors 'none'`.
- `strict-transport-security: max-age=31536000; includeSubDomains`.
- `referrer-policy: strict-origin-when-cross-origin`.
- `x-content-type-options: nosniff`.
- `x-frame-options: DENY`.
- `permissions-policy: camera=(), microphone=(), geolocation=()`.

## 5. Live bundle verification

The deployed JavaScript bundle was fetched and searched for release markers:

| Marker | Present |
| --- | --- |
| "Cloud synced across your signed-in devices" | Yes |
| "Saved to OFS Pad cloud" | Yes |
| "Check your email to confirm" | Yes |
| "Privacy Policy" | Yes |

This confirms the production build contains the cloud notebook states, the signup confirmation message, and the legal pages, not just the previous release.

## 6. Manual functional verification

| Area | What was checked | Result |
| --- | --- | --- |
| Sign-in | Email/password login and role redirect | Works |
| Sign-up | Account creation, name capture, minimum eight-character password | Works |
| Profile | Read-only identity, role, provider, last sign-in, member since | Works |
| Navigation | Sidebar sections, mobile tab limit, no dead links | Works |
| Onboarding | First-visit tour appears once per role | Works |
| Notebooks | Create, write, page add, cloud save indicator, reload persistence | Works |
| Legal | Privacy and Terms reachable from landing, auth and footer | Works |
| Branding | Logo in app header, favicons, installed-app icons, social preview | Works |
| Themes | Light and dark contrast | Works |

## 7. Known gaps and remaining setup

1. Supabase leaked-password protection is disabled. Fix in Authentication → Providers → Email settings.
2. Three advisory notices remain for RLS-enabled tables without policies: `private.doubt_owners`, `private.doubt_votes`, `public.teacher_invites`. These tables are intentionally not client-readable, so no policy is required for the app to function; the notices should be documented or the tables moved fully out of the exposed schema.
3. Teacher onboarding uses a shared private signup link; the approved email list is the real control. Single-use invite tokens are roadmap work.
4. No automated end-to-end browser suite is committed. Verification for this release was source-level, database-level, and live-route/header checks plus manual production use.
5. Exam scheduling is implemented; online exam attempts and automatic marking are not.
6. Notebook conflict resolution is last-write-wins with a revision counter; simultaneous editing on two devices is not merged.

## 8. Reproduce the checks

```bash
cd OFS-Pad
npm ci
npm run typecheck
npm run lint
npm run build
python3 -m json.tool vercel.json >/dev/null
curl -sSI https://ofs-pad-mqy1.vercel.app/ | grep -Ei 'content-security|x-frame|strict-transport'
```
