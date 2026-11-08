# OFS Pad — Student Workflows

## Student home

After sign-in, students land on `/student`. The home page summarizes:

- Due assignments
- Upcoming exams
- Joined classes
- Classroom updates
- Notebook shortcuts
- Notifications

## Join a class

1. From the student home page, select **Join class**.
2. Enter the class join code supplied by a teacher.
3. The protected `join_class` flow validates the code.
4. The class appears in the student's workspace.
5. Assignments, announcements, doubts, and exams become class-scoped.

Students cannot view another class's private data.

## Notebooks

Student notebook pages are available at `/student/notebooks`.

Students can:

- Open the seeded subject notebooks
- Create a custom notebook with a name and subject
- Rename a notebook from the notebook editor title field
- Add pages
- Write with pen, pencil, highlight, eraser, type, and move tools
- Undo, redo, clear handwriting, and change zoom
- Submit notebook work to a teacher
- Use the private rough notebook for practice

The create and rename workflow was verified in production with the secondary Google student account. Current notebook state is stored per user/browser using the app's notebook store; it is not yet a cross-device cloud notebook sync feature.

## Assignments

1. Open `/student/assignments`.
2. Filter by all, upcoming, overdue, or graded work.
3. Open an assignment from a joined class.
4. Complete or submit notebook work.
5. View teacher marks and feedback after grading.

## Doubt Wall

Students can ask class-scoped questions anonymously. Other joined students can upvote. Teachers can answer from their class workspace. The author identity is hidden from classmates while the database still enforces ownership and class membership.

## Announcements and planner

Students receive class announcements and notification entries. Exams and deadlines appear in the planner and relevant dashboard summaries.
