import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { gradeLabel } from '@/utils/grade';

export type StudentAssignment = {
  id: string;
  class_id: string;
  class_name: string;
  title: string;
  description: string | null;
  subject: string | null;
  deadline: string;
  status: 'pending' | 'submitted' | 'graded';
  marks: number | null;
  feedback: string | null;
  submitted_at: string | null;
};

export type StudentClass = {
  id: string;
  name: string;
  subject: string;
};

export type NotificationRow = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
};

// Supabase can return a joined row as an object or as a one-item array.
function pick<T>(x: T | T[] | null | undefined): T | undefined {
  if (!x) return undefined;
  return Array.isArray(x) ? x[0] : x;
}

export function useStudentAssignments(studentId: string | undefined) {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);

    // Row Level Security makes sure a student only gets assignments from classes they joined.
    const { data, error: ae } = await supabase
      .from('assignments')
      .select('id, class_id, title, description, subject, deadline, classes(name)')
      .order('deadline', { ascending: true });
    if (ae) {
      setError(ae.message);
      setAssignments([]);
      setLoading(false);
      return;
    }

    const { data: subs, error: se } = await supabase
      .from('submissions')
      .select('assignment_id, status, marks, feedback, submitted_at')
      .eq('student_id', studentId);
    if (se) {
      setError(se.message);
      setAssignments([]);
      setLoading(false);
      return;
    }
    const subMap = new Map((subs ?? []).map((s) => [s.assignment_id as string, s]));

    setAssignments(
      (data ?? []).map((a) => {
        const sub = subMap.get(a.id as string);
        const cls = pick(a.classes as { name: string } | { name: string }[] | null);
        return {
          id: a.id as string,
          class_id: a.class_id as string,
          class_name: cls?.name ?? '',
          title: a.title as string,
          description: (a.description as string | null) ?? null,
          subject: (a.subject as string | null) ?? null,
          deadline: a.deadline as string,
          status: ((sub?.status as StudentAssignment['status']) ?? 'pending'),
          marks: (sub?.marks as number | null) ?? null,
          feedback: (sub?.feedback as string | null) ?? null,
          submitted_at: (sub?.submitted_at as string | null) ?? null,
        };
      })
    );
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { assignments, loading, error, refresh };
}

export function useStudentClasses(studentId: string | undefined) {
  const [classes, setClasses] = useState<StudentClass[]>([]);

  const refresh = useCallback(async () => {
    if (!studentId) return;
    const { data, error } = await supabase
      .from('class_members')
      .select('class_id, classes(name, subject)')
      .eq('student_id', studentId);
    if (error) {
      setClasses([]);
      return;
    }
    setClasses(
      (data ?? []).flatMap((row) => {
        const c = pick(row.classes as { name: string; subject: string } | { name: string; subject: string }[] | null);
        return c ? [{ id: row.class_id as string, name: c.name, subject: c.subject }] : [];
      })
    );
  }, [studentId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { classes, refresh };
}

export type BellRow = {
  id: string;
  title: string;
  body: string;
  at: string | null;
  read: boolean;
  href: string;
};

const TYPE_TITLES: Record<string, string> = {
  assignment: 'New assignment',
  doubt: 'Doubt answered',
  grade: 'Work graded',
  exam: 'Exam reminder',
  announcement: 'New announcement',
};
const TYPE_HREF: Record<string, string> = {
  assignment: '/student/assignments',
  grade: '/student/assignments',
  doubt: '/student/doubts',
  exam: '/student/planner',
  announcement: '/student/announcements',
};

const readGradesKey = (userId: string) => `ofs:readGrades:v1:${userId}`;
function loadReadGrades(userId: string): string[] {
  try {
    const raw = localStorage.getItem(readGradesKey(userId));
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveReadGrades(userId: string, ids: string[]) {
  try {
    localStorage.setItem(readGradesKey(userId), JSON.stringify(ids.slice(-200)));
  } catch {
    /* storage blocked: the item simply shows as unread again */
  }
}

type GradeItem = { key: string; title: string; marks: number | null };

export function useStudentNotifications(userId: string | undefined) {
  const [db, setDb] = useState<NotificationRow[]>([]);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [readGrades, setReadGrades] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('notifications')
      .select('id, type, message, read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setDb(data as NotificationRow[]);

    // "Your work was graded" is worked out from graded submissions, so no extra database setup is needed.
    const { data: graded } = await supabase
      .from('submissions')
      .select('id, marks, assignments(title)')
      .eq('student_id', userId)
      .eq('status', 'graded');
    if (graded) {
      setGrades(
        graded.map((g) => ({
          key: `grade:${g.id as string}:${g.marks as number | null}`,
          title: pick(g.assignments as { title: string } | { title: string }[] | null)?.title ?? 'an assignment',
          marks: (g.marks as number | null) ?? null,
        }))
      );
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setDb([]);
      setGrades([]);
      return;
    }
    setReadGrades(loadReadGrades(userId));
    void load();
    const t = setInterval(load, 30000); // check for news every 30 seconds
    return () => clearInterval(t);
  }, [userId, load]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => { void load(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions', filter: `student_id=eq.${userId}` }, () => { void load(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [userId, load]);

  const items: BellRow[] = [
    ...grades.map((g) => ({
      id: g.key,
      title: 'Work graded',
      body: g.marks !== null ? `${g.title}: ${gradeLabel(g.marks)}` : g.title,
      at: null,
      read: readGrades.includes(g.key),
      href: '/student/assignments',
    })),
    ...db.map((n) => ({
      id: n.id,
      title: TYPE_TITLES[n.type] ?? 'Notification',
      body: n.message,
      at: n.created_at,
      read: n.read,
      href: TYPE_HREF[n.type] ?? '/student',
    })),
  ];
  const unread = items.filter((n) => !n.read).length;

  const markRead = useCallback(
    async (id: string) => {
      if (!userId) return;
      if (id.startsWith('grade:')) {
        setReadGrades((prev) => {
          if (prev.includes(id)) return prev;
          const next = [...prev, id];
          saveReadGrades(userId, next);
          return next;
        });
        return;
      }
      setDb((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', userId);
    },
    [userId]
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const allGrades = grades.map((g) => g.key);
    setReadGrades((prev) => {
      const next = Array.from(new Set([...prev, ...allGrades]));
      saveReadGrades(userId, next);
      return next;
    });
    setDb((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
  }, [userId, grades]);

  return { items, unread, markRead, markAllRead, refresh: load };
}

export async function joinClassByCode(
  code: string
): Promise<{ ok: true; className: string } | { ok: false; message: string }> {
  const clean = code.trim().toUpperCase();
  if (!clean) return { ok: false, message: 'Please enter the join code.' };

  const { data, error } = await supabase.rpc('join_class', { code: clean });
  if (error) {
    const m = error.message || '';
    if (/invalid join code/i.test(m)) return { ok: false, message: "That code doesn't look right" };
    if (/only students/i.test(m)) return { ok: false, message: 'Only student accounts can join a class.' };
    return { ok: false, message: m };
  }

  const classId = data as string;
  const { data: cls } = await supabase.from('classes').select('name').eq('id', classId).maybeSingle();
  return { ok: true, className: (cls?.name as string | undefined) ?? 'your class' };
}

export async function submitWork(
  assignmentId: string,
  studentId: string,
  content: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data: existing, error: e1 } = await supabase
    .from('submissions')
    .select('id, status')
    .eq('assignment_id', assignmentId)
    .eq('student_id', studentId)
    .maybeSingle();
  if (e1) return { ok: false, message: e1.message };
  if (existing?.status === 'graded') {
    return { ok: false, message: "This work has already been graded, so it can't be changed." };
  }

  const row = { content, status: 'submitted', submitted_at: new Date().toISOString() };
  if (existing) {
    const { error } = await supabase.from('submissions').update(row).eq('id', existing.id as string);
    if (error) return { ok: false, message: error.message };
  } else {
    const { error } = await supabase
      .from('submissions')
      .insert({ assignment_id: assignmentId, student_id: studentId, ...row });
    if (error) return { ok: false, message: error.message };
  }
  return { ok: true };
}
