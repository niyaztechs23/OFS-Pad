# OFS Pad — Setup and Local Development

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project with the OFS Pad migrations applied
- Google OAuth configured in Supabase if Google login is required locally

## Install

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
```

Only the publishable Supabase anon key belongs in the Vite frontend. Never place a Supabase service-role key, Google Client Secret, or database password in `.env` or source code.

## Run the app

```bash
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

The lint command currently reports two non-blocking Fast Refresh warnings because the auth and theme modules export hooks alongside components. TypeScript and the production build should complete successfully.

## Important local OAuth setting

When testing Google OAuth locally, add the exact local callback URL used by the app to Supabase Authentication → URL Configuration. Keep the production URL configured too. The production deployment uses:

```text
https://ofs-pad-mqy1.vercel.app/auth
```

## Project conventions

- Use React + TypeScript components under `src/`.
- Keep Supabase schema changes as forward-only files under `supabase/migrations/`.
- Update `public/manus-routes.json` when adding page routes.
- Keep secrets out of GitHub.
- Run typecheck and build before pushing changes.
