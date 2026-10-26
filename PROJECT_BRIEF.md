# OFS Pad — Carry Knowledge, Not Notebooks

A calm, distraction-free school study app (web app that works on tablets with a stylus). No games, no social feeds. Two roles: Student and Teacher.

## Modules

1. **Assignments and Planner**: teachers send assignments with deadlines to a class. Students get notifications for new assignments, deadlines and exams, and a planner that spreads work across days to avoid last-minute stress.
2. **Anonymous Doubts**: students ask questions with no name visible to teachers or classmates. Teachers answer publicly so everyone learns.
3. **Digital Notebook**: subject-wise notebooks with pen, pencil, eraser, highlighter and stylus support, plus a typing mode with spell check. Students submit pages, and teachers mark and give feedback.
4. **Private Rough Notebook**: only the student can see it. Teachers have no access.

## Design rules

- Warm paper background (`#FAF8F3`)
- Ink-blue primary (`#2B4C7E`)
- Soft green for success, amber for upcoming, soft red for overdue
- Pastel color per subject
- Nunito for headings, Inter for body text
- Rounded corners, large touch targets, mobile and tablet first
- Light and dark mode

## Tech

React + Vite + TypeScript, Tailwind, Supabase (auth, Postgres, storage, Row Level Security).

## Rules

- Build in small steps and change only what is asked.
- Privacy is a core promise: never expose teacher-only or private data to the wrong role, and enforce it with Row Level Security.
- Keep the existing design unless asked to change it.
