# OFS Pad — Authentication and Sessions

## Supported sign-in methods

OFS Pad supports:

- Email and password sign-up/sign-in
- Google OAuth sign-in for students
- Google OAuth sign-up/sign-in for approved teachers
- Durable browser sessions with automatic token refresh
- Role-based routing for students, teachers, and administrators

The auth UI is at `/auth`. Public sign-up creates a student account. Teacher onboarding is intentionally hidden behind a private URL and an approved email record.

The sign-in and sign-up password fields use the shared `PasswordField` component. Each field is masked by default and includes an accessible eye button (`Show password` / `Hide password`) so the user can check what they typed. The profile page is read-only after registration and does not change the registered name or password.

## Google OAuth flow

1. The user selects **Continue with Google** on `/auth`.
2. The app calls Supabase OAuth with a redirect based on the current origin and `/auth?oauth=callback`.
3. Supabase sends the user to Google.
4. Google returns through the Supabase callback.
5. Supabase completes the PKCE flow and returns to the OFS Pad auth route.
6. `AuthProvider` restores the session, loads the profile, and routes the user according to the database role.

The browser Supabase client is configured with session persistence, automatic refresh, URL-session detection, and PKCE. The Google Client Secret is stored only in Supabase provider configuration.

## Production URLs

- App: `https://ofs-pad-mqy1.vercel.app`
- Supabase Site URL: `https://ofs-pad-mqy1.vercel.app`
- Supabase allowed redirect URL: `https://ofs-pad-mqy1.vercel.app/auth`

If Google login redirects to localhost, check Supabase Authentication → URL Configuration first. The production Site URL must not be `http://localhost:3000`.

## Google Cloud configuration

In Google Cloud Console, the authorized redirect URI must be the Supabase callback URL shown in Authentication → Providers → Google, similar to:

```text
https://<supabase-project-ref>.supabase.co/auth/v1/callback
```

Do not use the Vercel URL as the Google authorized redirect URI; Google redirects to Supabase, and Supabase redirects to OFS Pad.

## Role rules

- New ordinary accounts become students.
- A teacher role is granted only when the authenticated email matches an approved, unused, unexpired teacher approval.
- The client cannot safely assign itself a teacher or admin role.
- Admin access is controlled by the `profiles.role` value and protected by database policies/RPCs.

## Admin account

The configured administrator is `deendeen084@gmail.com`. Never store the password in this repository. If a fresh Supabase project is used, create the account normally and run the trusted bootstrap function described in `ADMIN_TEACHERS.md`.
