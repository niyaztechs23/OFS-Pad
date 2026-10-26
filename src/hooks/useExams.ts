import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { StudentClass } from './useStudent';
import type { ClassRow } from './useTeacher';

export type ExamRow = {
  id: string;
  class_id: string;
  class_name: string;
  title: string;
  subject: string;
  starts_at: string;
  ends_at: string | null;
};

function pick<T>(value: T | T[] | null | undefined): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function mapExam(row: Record<string, unknown>): ExamRow {
  const cls = pick(row.classes as { name: string } | { name: string }[] | null);
  return {
    id: row.id as string,
    class_id: row.class_id as string,
    class_name: cls?.name ?? 'Class',
    title: row.title as string,
    subject: row.subject as string,
    starts_at: row.starts_at as string,
    ends_at: row.ends_at as string | null,
  };
}

export function useStudentExams(studentId: string | undefined) {
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('exams')
      .select('id, class_id, title, subject, starts_at, ends_at, classes(name)')
      .order('starts_at', { ascending: true });
    setError(fetchError?.message ?? null);
    setExams((data ?? []).map((row) => mapExam(row as Record<string, unknown>)));
    setLoading(false);
  }, [studentId]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!studentId) return;
    const channel = supabase.channel(`student-exams:${studentId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, () => { void refresh(); }).subscribe();
    const poll = window.setInterval(() => { void refresh(); }, 15000);
    return () => { window.clearInterval(poll); void supabase.removeChannel(channel); };
  }, [studentId, refresh]);

  return { exams, loading, error, refresh };
}

export function useTeacherExams(teacherId: string | undefined) {
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [classes, setClasses] = useState<(ClassRow | StudentClass)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    const { data: classData, error: classError } = await supabase.from('classes').select('id, name, subject, join_code').eq('teacher_id', teacherId).order('name');
    if (classError) { setError(classError.message); setLoading(false); return; }
    setClasses((classData ?? []).map((row) => ({ ...row, student_count: 0 })) as ClassRow[]);
    const { data, error: fetchError } = await supabase
      .from('exams')
      .select('id, class_id, title, subject, starts_at, ends_at, classes(name)')
      .order('starts_at', { ascending: true });
    setError(fetchError?.message ?? null);
    setExams((data ?? []).map((row) => mapExam(row as Record<string, unknown>)));
    setLoading(false);
  }, [teacherId]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!teacherId) return;
    const channel = supabase.channel(`teacher-exams:${teacherId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, () => { void refresh(); }).subscribe();
    const poll = window.setInterval(() => { void refresh(); }, 15000);
    return () => { window.clearInterval(poll); void supabase.removeChannel(channel); };
  }, [teacherId, refresh]);

  const createExam = useCallback(async (classId: string, title: string, subject: string, startsAt: string, endsAt: string | null) => {
    const { error: createError } = await supabase.from('exams').insert({ class_id: classId, teacher_id: teacherId, title: title.trim(), subject: subject.trim(), starts_at: startsAt, ends_at: endsAt });
    if (createError) return { ok: false as const, message: createError.message };
    await refresh();
    return { ok: true as const };
  }, [refresh, teacherId]);

  const deleteExam = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase.from('exams').delete().eq('id', id);
    if (deleteError) return { ok: false as const, message: deleteError.message };
    setExams((previous) => previous.filter((exam) => exam.id !== id));
    return { ok: true as const };
  }, []);

  return { exams, classes, loading, error, refresh, createExam, deleteExam };
}
