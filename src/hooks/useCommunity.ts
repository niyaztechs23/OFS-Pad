import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { StudentClass } from './useStudent';

export type DoubtRow = {
  id: string;
  class_id: string;
  class_name: string;
  subject: string;
  question: string;
  author_label: string;
  status: 'open' | 'answered';
  answer: string | null;
  upvotes: number;
  created_at: string;
};

export type AnnouncementRow = {
  id: string;
  class_id: string;
  class_name: string;
  title: string;
  body: string;
  created_at: string;
};

function pick<T>(value: T | T[] | null | undefined): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function message(error: { message?: string } | null, fallback: string) {
  return error?.message || fallback;
}

export function useStudentDoubts(studentId: string | undefined) {
  const [doubts, setDoubts] = useState<DoubtRow[]>([]);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    const { data: memberships, error: memberError } = await supabase
      .from('class_members')
      .select('class_id, classes(name, subject)')
      .eq('student_id', studentId);
    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }
    const classRows = (memberships ?? []).flatMap((row) => {
      const c = pick(row.classes as { name: string; subject: string } | { name: string; subject: string }[] | null);
      return c ? [{ id: row.class_id as string, name: c.name, subject: c.subject }] : [];
    });
    setClasses(classRows);
    const { data, error: doubtError } = await supabase
      .from('doubts')
      .select('id, class_id, subject, question, author_label, status, answer, upvotes, created_at, classes(name)')
      .order('created_at', { ascending: false });
    if (doubtError) setError(doubtError.message);
    const names = new Map(classRows.map((c) => [c.id, c.name]));
    setDoubts((data ?? []).map((row) => ({
      id: row.id as string,
      class_id: row.class_id as string,
      class_name: names.get(row.class_id as string) ?? pick(row.classes as { name: string } | { name: string }[] | null)?.name ?? 'Class',
      subject: row.subject as string,
      question: row.question as string,
      author_label: row.author_label as string,
      status: row.status as DoubtRow['status'],
      answer: row.answer as string | null,
      upvotes: row.upvotes as number,
      created_at: row.created_at as string,
    })));
    setLoading(false);
  }, [studentId]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (!studentId) return;
    const channel = supabase.channel(`student-doubts:${studentId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'doubts' }, () => { void refresh(); }).subscribe();
    const poll = window.setInterval(() => { void refresh(); }, 15000);
    return () => { window.clearInterval(poll); void supabase.removeChannel(channel); };
  }, [studentId, refresh]);

  const createDoubt = useCallback(async (classId: string, subject: string, question: string, anonymous: boolean) => {
    const { error: createError } = await supabase.rpc('create_doubt', {
      p_class_id: classId,
      p_subject: subject,
      p_question: question,
      p_anonymous: anonymous,
    });
    if (createError) return { ok: false as const, message: message(createError, 'Could not ask this doubt.') };
    await refresh();
    return { ok: true as const };
  }, [refresh]);

  const upvote = useCallback(async (id: string) => {
    const { data, error: upvoteError } = await supabase.rpc('upvote_doubt', { p_doubt_id: id });
    if (upvoteError) return { ok: false as const, message: upvoteError.message };
    if (data) setDoubts((prev) => prev.map((d) => d.id === id ? { ...d, upvotes: d.upvotes + 1 } : d));
    return { ok: true as const, changed: Boolean(data) };
  }, []);

  return { doubts, classes, loading, error, refresh, createDoubt, upvote };
}

export function useTeacherDoubts(teacherId: string | undefined) {
  const [doubts, setDoubts] = useState<DoubtRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    const { data, error: doubtError } = await supabase
      .from('doubts')
      .select('id, class_id, subject, question, author_label, status, answer, upvotes, created_at, classes(name)')
      .order('created_at', { ascending: false });
    setError(doubtError?.message ?? null);
    setDoubts((data ?? []).map((row) => ({
      id: row.id as string,
      class_id: row.class_id as string,
      class_name: pick(row.classes as { name: string } | { name: string }[] | null)?.name ?? 'Class',
      subject: row.subject as string,
      question: row.question as string,
      author_label: row.author_label as string,
      status: row.status as DoubtRow['status'],
      answer: row.answer as string | null,
      upvotes: row.upvotes as number,
      created_at: row.created_at as string,
    })));
    setLoading(false);
  }, [teacherId]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (!teacherId) return;
    const channel = supabase.channel(`teacher-doubts:${teacherId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'doubts' }, () => { void refresh(); }).subscribe();
    const poll = window.setInterval(() => { void refresh(); }, 15000);
    return () => { window.clearInterval(poll); void supabase.removeChannel(channel); };
  }, [teacherId, refresh]);

  const answer = useCallback(async (id: string, text: string) => {
    const { error: answerError } = await supabase.rpc('answer_doubt', { p_doubt_id: id, p_answer: text });
    if (answerError) return { ok: false as const, message: answerError.message };
    await refresh();
    return { ok: true as const };
  }, [refresh]);

  return { doubts, loading, error, refresh, answer };
}

export function useStudentAnnouncements(studentId: string | undefined) {
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('announcements')
      .select('id, class_id, title, body, created_at, classes(name)')
      .order('created_at', { ascending: false });
    setError(fetchError?.message ?? null);
    setAnnouncements((data ?? []).map((row) => ({ id: row.id as string, class_id: row.class_id as string, class_name: pick(row.classes as { name: string } | { name: string }[] | null)?.name ?? 'Class', title: row.title as string, body: row.body as string, created_at: row.created_at as string })));
    setLoading(false);
  }, [studentId]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!studentId) return;
    const channel = supabase.channel(`student-announcements:${studentId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => { void refresh(); }).subscribe();
    const poll = window.setInterval(() => { void refresh(); }, 15000);
    return () => { window.clearInterval(poll); void supabase.removeChannel(channel); };
  }, [studentId, refresh]);
  return { announcements, loading, error, refresh };
}

export function useTeacherAnnouncements(teacherId: string | undefined) {
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    const { data: classData, error: classError } = await supabase.from('classes').select('id, name, subject').eq('teacher_id', teacherId).order('name');
    if (classError) { setError(classError.message); setLoading(false); return; }
    setClasses((classData ?? []) as StudentClass[]);
    const { data, error: fetchError } = await supabase.from('announcements').select('id, class_id, title, body, created_at, classes(name)').order('created_at', { ascending: false });
    setError(fetchError?.message ?? null);
    setAnnouncements((data ?? []).map((row) => ({ id: row.id as string, class_id: row.class_id as string, class_name: pick(row.classes as { name: string } | { name: string }[] | null)?.name ?? 'Class', title: row.title as string, body: row.body as string, created_at: row.created_at as string })));
    setLoading(false);
  }, [teacherId]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!teacherId) return;
    const channel = supabase.channel(`teacher-announcements:${teacherId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => { void refresh(); }).subscribe();
    const poll = window.setInterval(() => { void refresh(); }, 15000);
    return () => { window.clearInterval(poll); void supabase.removeChannel(channel); };
  }, [teacherId, refresh]);

  const createAnnouncement = useCallback(async (classId: string, title: string, body: string) => {
    const { error: createError } = await supabase.from('announcements').insert({ class_id: classId, teacher_id: teacherId, title: title.trim(), body: body.trim() });
    if (createError) return { ok: false as const, message: createError.message };
    await refresh();
    return { ok: true as const };
  }, [refresh, teacherId]);
  return { announcements, classes, loading, error, refresh, createAnnouncement };
}
