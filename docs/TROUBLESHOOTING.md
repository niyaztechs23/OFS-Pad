# OFS Pad — Troubleshooting

## Google login redirects to localhost

Cause: Supabase Site URL or redirect allowlist still points to an old local/Preview URL.

Fix:

1. Open Supabase Authentication → URL Configuration.
2. Set Site URL to `https://ofs-pad-mqy1.vercel.app`.
3. Add `https://ofs-pad-mqy1.vercel.app/auth` to Redirect URLs.
4. Confirm Google Cloud uses the Supabase callback URL, not the Vercel URL.
5. Retry in a fresh browser session.

## User signs in but gets the wrong workspace

Check:

- The profile exists in `public.profiles`.
- The profile role is correct.
- All role/profile migrations are applied.
- The user has fully signed out and signed back in so the profile is reloaded.

Do not solve role problems by trusting client metadata.

## Teacher cannot sign up

Check:

- The admin approved the exact email address.
- The approval has not expired.
- The teacher is using `/auth?mode=signup&role=teacher`.
- Google/email authentication is enabled in Supabase.
- Email confirmation settings are compatible with the intended production flow.

## Direct route shows a 404 on Vercel

Confirm `vercel.json` contains the SPA rewrite to `/index.html`, then redeploy. Also update `public/manus-routes.json` whenever routes change.

## Notebook rename appears not to save

The title saves on blur and autosaves with a short debounce. Leave the input or press Enter, then return to `/student/notebooks` and reopen the list. Notebook data currently persists per browser/device, not as cloud-synced notebook content.

## Realtime updates appear stale

Refresh the page first. The dashboards include a periodic refresh fallback. Then check Supabase Realtime publication and browser console errors without exposing credentials.

## Build failure

Run:

```bash
rm -rf node_modules
npm install
npm run typecheck
npm run build
```

Do not delete `.env` if it contains your local configuration; back it up safely first and never commit it.
