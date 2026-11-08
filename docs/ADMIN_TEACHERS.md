# OFS Pad — Admin and Teacher Onboarding

## Design goal

Teachers are kept out of the public sign-up experience. An administrator approves a teacher email first, then shares a private signup link. The database remains the source of truth; hiding the UI alone is not the security boundary.

## First administrator bootstrap

1. Create a normal OFS Pad account for the administrator.
2. Open the Supabase SQL Editor using a trusted administrator session.
3. Run the bootstrap function once:

```sql
select public.bootstrap_first_admin('deendeen084@gmail.com');
```

The function only works while no administrator exists. After it succeeds, sign in again. The account should route to `/admin`.

## Approve a teacher in the app

1. Sign in as an administrator.
2. Open `/admin`.
3. Enter the teacher's exact Google/email address.
4. Select an approval duration: 7, 30, or 90 days.
5. Create the approval.
6. Copy or send the private URL:

```text
/auth?mode=signup&role=teacher
```

The teacher must use the approved email address. The link is intentionally unlisted; it is not a substitute for database approval.

## Teacher signup

1. The teacher opens the private link.
2. The teacher signs up with the approved email, by password or Google OAuth.
3. Supabase verifies that the email is approved, unused, and not expired.
4. The account receives the `teacher` role.
5. The teacher is routed to the teacher workspace.

A normal Google signup without an approved teacher email becomes a student.

## Routine admin controls

The admin dashboard can:

- List pending and active teacher approvals
- Approve emails for 7, 30, or 90 days
- Copy the private signup URL
- Send the private link using the available share action
- Revoke an unused approval

The browser does not write directly to `teacher_invites`; it uses protected database functions/RPCs.

## Teacher workflow

A teacher can:

1. Create a class.
2. Share the generated class join code with students.
3. Create assignments and deadlines.
4. Review submissions and grade them.
5. Answer anonymous doubts.
6. Publish announcements.
7. Schedule exams.
8. Review live notifications and activity.

## Safety rules

- Never share a service-role key.
- Never manually change a role from the browser console.
- Revoke unused approvals when an invitation should no longer work.
- Configure email confirmation in Supabase for production.
