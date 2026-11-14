# OFS Pad Security Audit Notes

**Audit scope:** Read-only review of the connected Supabase project and the OFS Pad source. No policies, functions, Auth settings, or production data were changed.

## Current configuration observed

- Supabase project inspected: `rizdsqdabijcdjacknbz` (`OFS-PAD` is also present but inactive in the connected project list).
- Public application tables inspected: `profiles`, `classes`, `class_members`, `assignments`, `submissions`, `notifications`, `doubts`, `announcements`, `exams`, `teacher_invites`, and `notebooks`.
- RLS is enabled on the application tables reported by Supabase metadata.
- Notebook ownership is enforced by `user_id = auth.uid()` for read, insert, update, and delete operations.
- The frontend uses the Supabase publishable/anonymous browser key through `VITE_SUPABASE_ANON_KEY`; no service-role key is referenced in source.
- Supabase Auth leaked-password protection is currently disabled according to the security advisor.

## SECURITY DEFINER RPCs reviewed

The following functions are executable by the `authenticated` role and use `SECURITY DEFINER`:

| RPC | Intended role/use | Authorization observed |
|---|---|---|
| `admin_approve_teacher` | Administrator creates or renews a teacher approval | Calls `private.is_admin()`; validates email and expiry window (maximum 90 days) |
| `admin_list_teacher_approvals` | Administrator lists unused teacher approvals | Filters results through `private.is_admin()` |
| `admin_revoke_teacher_approval` | Administrator revokes an unused approval | Calls `private.is_admin()` and only deletes an unused approval |
| `create_doubt` | Student creates a class doubt | Requires signed-in class membership, validates subject and question length, stores owner privately |
| `answer_doubt` | Class teacher answers a doubt | Requires the caller to be the teacher of the doubt’s class and validates answer length |
| `join_class` | Student joins a class by code | Reads the caller’s role and requires `student`; normalizes the join code and uses `ON CONFLICT DO NOTHING` |
| `upvote_doubt` | Signed-in class member or teacher upvotes a doubt | Requires sign-in and class membership/teacher access; private vote table prevents duplicate votes |

### Risk assessment

The security-definer warning is expected for these RPCs because several operations need to write private support tables or perform controlled administrative actions. The important protection is the authorization and input validation inside each function. The current review did not identify a reason to modify or remove these functions without a dedicated migration and regression test plan.

## Tables reported without policies

Supabase reported RLS enabled without policies for:

- `public.teacher_invites`
- `private.doubt_owners`
- `private.doubt_votes`

The application does not directly query the private doubt tables from the browser. The security-definer RPCs use them to preserve anonymous-doubt ownership and prevent duplicate votes. `teacher_invites` is used through admin RPCs rather than direct browser table access.

### Risk assessment

A future hardening review should confirm that the API surface cannot expose these tables through direct PostgREST queries and should decide whether explicit restrictive policies or revoked direct grants are preferred. Because policy changes can break the existing admin approval and anonymous-doubt workflows, no policy was added during this release.

## Recommended future hardening

1. Enable Supabase leaked-password protection after confirming the school authentication policy and user communication plan.
2. Review direct `authenticated` execution grants for the seven RPCs and keep only the required application-facing functions.
3. Add explicit restrictive policies or privilege restrictions for the three RLS-enabled/no-policy tables after testing all admin and doubt workflows.
4. Add authenticated regression tests for student, teacher, and admin journeys before applying any database migration.
5. Re-run Supabase security advisors after the changes and retain a rollback migration.

## Verification limitation

No database policy or Auth setting was changed. Authenticated student, teacher, and admin UI journeys could not be declared fully verified without dedicated test accounts in the session. The code-level function authorization review and schema/RLS metadata review were completed.
