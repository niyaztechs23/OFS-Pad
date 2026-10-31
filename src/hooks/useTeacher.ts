import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type ClassRow = {
  id: string;
  name: string;
  subject: string;
  join_code: string;
  student_count: number;
};

export type AssignmentRow = {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  subject: string | null;
  deadline: string;
  class_name?: string;
  submission_count?: number;
};

export function useTeacherClasses(teacherId: string | undefined) {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('classes')
      .select('id, name, subject, join_code')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      setClasses([]);
      setLoading(false);
      return;
    }
    const counts = await Promise.all(
      (data ?? []).map(async (c) => {
        const { count, error: ce } = await supabase
          .from('class_members')
          .select('student_id', { count: 'exact', head: true })
          .eq('class_id', c.id);
        if (ce) return { id: c.id, count: 0 };
        return { id: c.id, count: count ?? 0 };
      })
    );
    const countMap = new Map(counts.map((x) => [x.id, x.count]));
    setClasses((data ?? []).map((c) => ({ ...c, student_count: countMap.get(c.id) ?? 0 })));
    setLoading(false);
  }, [teacherId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { classes, loading, error, refresh: fetch };
}

export function useTeacherAssignments(teacherId: string | undefined) {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    const { data: classes, error: ce } = await supabase
      .from('classes')
      .select('id, name')
      .eq('teacher_id', teacherId);
    if (ce) {
      setError(ce.message);
      setAssignments([]);
      setLoading(false);
      return;
    }
    const classIds = (classes ?? []).map((c) => c.id);
    const classNameMap = new Map((classes ?? []).map((c) => [c.id, c.name]));
    if (classIds.length === 0) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    const { data: assigns, error: ae } = await supabase
      .from('assignments')
      .select('id, class_id, title, description, subject, deadline')
      .in('class_id', classIds)
      .order('deadline', { ascending: true });
    if (ae) {
      setError(ae.message);
      setAssignments([]);
      setLoading(false);
      return;
    }
    const counts = await Promise.all(
      (assigns ?? []).map(async (a) => {
        const { count, error: se } = await supabase
          .from('submissions')
          .select('id', { count: 'exact', head: true })
          .eq('assignment_id', a.id);
        if (se) return { id: a.id, count: 0 };
        return { id: a.id, count: count ?? 0 };
      })
    );
    const countMap = new Map(counts.map((x) => [x.id, x.count]));
    setAssignments(
      (assigns ?? []).map((a) => ({
        ...a,
        class_name: classNameMap.get(a.class_id),
        submission_count: countMap.get(a.id) ?? 0,
      }))
    );
    setLoading(false);
  }, [teacherId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { assignments, loading, error, refresh: fetch };
}

// ---------- submissions and grading ----------

export type SubmissionRow = {
  id: string;
  student_id: string;
  student_name: string;
  content: string | null;
  status: 'pending' | 'submitted' | 'graded';
  marks: number | null;
  feedback: string | null;
  submitted_at: string | null;
};

function pickOne<T>(x: T | T[] | null | undefined): T | undefined {
  if (!x) return undefined;
  return Array.isArray(x) ? x[0] : x;
}

export function useAssignmentSubmissions(assignmentId: string, classId: string) {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [notSubmitted, setNotSubmitted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: se } = await supabase
      .from('submissions')
      .select('id, student_id, content, status, marks, feedback, submitted_at, profiles(full_name)')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });
    if (se) {
      setError(se.message);
      setLoading(false);
      return;
    }
    const rows: SubmissionRow[] = (data ?? [])
      .filter((r) => r.status !== 'pending')
      .map((r) => ({
        id: r.id as string,
        student_id: r.student_id as string,
        student_name: pickOne(r.profiles as { full_name: string } | { full_name: string }[] | null)?.full_name ?? 'Student',
        content: (r.content as string | null) ?? null,
        status: r.status as SubmissionRow['status'],
        marks: (r.marks as number | null) ?? null,
        feedback: (r.feedback as string | null) ?? null,
        submitted_at: (r.submitted_at as string | null) ?? null,
      }));
    setSubmissions(rows);

    const { data: members } = await supabase
      .from('class_members')
      .select('student_id, profiles(full_name)')
      .eq('class_id', classId);
    const done = new Set(rows.map((r) => r.student_id));
    setNotSubmitted(
      (members ?? [])
        .filter((m) => !done.has(m.student_id as string))
        .map((m) => pickOne(m.profiles as { full_name: string } | { full_name: string }[] | null)?.full_name ?? 'Student')
    );
    setLoading(false);
  }, [assignmentId, classId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { submissions, notSubmitted, loading, error, refresh };
}

export async function gradeSubmission(
  id: string,
  marks: number,
  feedback: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase
    .from('submissions')
    .update({ marks, feedback, status: 'graded' })
    .eq('id', id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export type ToGradeItem = {
  id: string;
  assignment_id: string;
  student_name: string;
  title: string;
  submitted_at: string;
};

// Work that students have submitted and the teacher has not graded yet.
export function useToGrade(teacherId: string | undefined) {
  const [items, setItems] = useState<ToGradeItem[]>([]);

  const load = useCallback(async () => {
    if (!teacherId) return;
    const { data } = await supabase
      .from('submissions')
      .select('id, assignment_id, submitted_at, assignments(title), profiles(full_name)')
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false })
      .limit(30);
    if (!data) return;
    setItems(
      data.map((r) => ({
        id: r.id as string,
        assignment_id: r.assignment_id as string,
        student_name: pickOne(r.profiles as { full_name: string } | { full_name: string }[] | null)?.full_name ?? 'A student',
        title: pickOne(r.assignments as { title: string } | { title: string }[] | null)?.title ?? 'an assignment',
        submitted_at: (r.submitted_at as string | null) ?? new Date().toISOString(),
      }))
    );
  }, [teacherId]);

  useEffect(() => {
    if (!teacherId) {
      setItems([]);
      return;
    }
    void load();
    const t = setInterval(load, 30000);
    const channel = supabase
      .channel(`teacher-submissions:${teacherId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => { void load(); })
      .subscribe();
    return () => {
      clearInterval(t);
      void supabase.removeChannel(channel);
    };
  }, [teacherId, load]);

  return { items, refresh: load };
}
