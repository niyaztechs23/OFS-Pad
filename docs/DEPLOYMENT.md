# OFS Pad — Deployment and Release Workflow

## Current production deployment

- Production URL: `https://ofs-pad-mqy1.vercel.app`
- GitHub repository: `https://github.com/niyaztechs23/OFS-Pad`
- Hosting: Vercel
- Backend/auth/database: Supabase

## Vercel environment variables

Set these in the Vercel project for Preview and Production as appropriate:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Use the publishable anon key only. Do not add the Supabase service-role key to Vercel frontend environment variables.

## Build settings

The project uses the standard Vite build:

```bash
npm install
npm run build
```

The output directory is `dist/`. `vercel.json` rewrites application routes to `/index.html` so React Router routes work on direct navigation.

The managed Webdev publish contract uses `Dockerfile` and `server.mjs` for production. The container builds the Vite bundle, serves `dist/` on `0.0.0.0`, honors the platform `PORT`, and exposes the unauthenticated readiness endpoint `/health`.

## Supabase URL configuration

For production Google OAuth:

- Site URL: `https://ofs-pad-mqy1.vercel.app`
- Redirect URL: `https://ofs-pad-mqy1.vercel.app/auth`

The Supabase provider callback shown in the Google provider settings must also be registered in Google Cloud Console.

## Release checklist

1. Pull the latest `main` branch.
2. Confirm `.env` is not tracked and contains the intended Supabase project locally.
3. Run:

   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

4. Review the migration list if database changes are included.
5. Commit with a descriptive message.
6. Push to `main`.
7. Wait for Vercel deployment completion.
8. Smoke-test landing page, Google login, student route, admin route, and any changed workflow.
9. Confirm no secrets appear in the commit or build output.

## OAuth smoke test

Use a secondary Google account and confirm the callback URL stays on the Vercel origin. A successful student login should land on `/student`. If the browser attempts to open localhost, fix Supabase URL Configuration before changing application code.
