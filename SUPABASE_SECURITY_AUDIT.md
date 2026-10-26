
## Remediation status after audit

The confirmed application-level vulnerabilities were remediated on the active backend after the audit:

- Ordinary users can no longer change `profiles.role`; a database trigger rejects role changes.
- RLS helper functions were moved into a non-public `private` schema and the old public helper RPCs were removed.
- Anonymous callers cannot execute the internal helper functions or `join_class`.
- Authenticated callers can execute only the intended `join_class` RPC among the public security-definer functions.
- Explicit `WITH CHECK` clauses were added for profile, notification, assignment and submission updates.
- The existing grading protection remains active.

Post-remediation tests passed for student login, student profile reads, role-escalation blocking, anonymous internal-RPC blocking, anonymous join blocking, authenticated join-RPC behavior and anonymous table-read blocking.

The remaining live advisor finding is intentional authenticated execution of `join_class(text)` because the browser needs that RPC and its function enforces the student role. The other outstanding advisor finding is leaked-password protection being disabled; that setting must be enabled in Supabase Auth configuration. A strong minimum password length and production email-verification policy should be configured before public launch.
