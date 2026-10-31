# What a complete OFS Pad app contains

OFS Pad is being expanded from a notebook-and-assignment app into a complete school learning workspace.

A complete version contains four connected experiences:

1. **Student:** notebooks, assignments, submissions, feedback, doubts, planner, exams, attendance, resources, notifications and search.
2. **Teacher:** classes, roster, assignments, grading, rubrics, exams, attendance, resources, announcements, doubt moderation and analytics.
3. **School admin:** users, roles, classes, subjects, terms, invitations, announcements, moderation, reports, audit logs and exports.
4. **Optional guardian:** read-only progress, attendance, assignments and school announcements for approved student relationships.

The expansion will be delivered in secure vertical slices. Each module gets real Supabase tables, RLS policies, empty/loading/error states, role-aware routes and a production test path. Existing working flows remain intact while the missing modules are replaced one at a time instead of filling the product with disconnected mock screens.

The immediate priority is security hardening, followed by doubts, announcements, resources, attendance, planner/calendar, assessments and school administration.
