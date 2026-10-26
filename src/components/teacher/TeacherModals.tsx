import { useState, useEffect, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { subjectList } from '@/data/mock';

const SUBJECT_OPTIONS = subjectList.map((s) => s.name);

export function CreateClassModal({
  teacherId,
  onClose,
  onCreated,
}: {
  teacherId: string;
  onClose: () => void;
  onCreated: (code: string) => void;
}) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a class name.');
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .from('classes')
      .insert({ name: name.trim(), subject, teacher_id: teacherId })
      .select('join_code')
      .single();
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    onCreated(data.join_code);
  };

  return (
    <ModalShell title="Create class" onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Class name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Class 8-A Mathematics"
            className={inputCls}
          />
        </Field>
        <Field label="Subject">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputCls}
          >
            {SUBJECT_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        {error && <ErrorText text={error} />}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="md" type="button" onClick={onClose}>Cancel</Button>
          <Button size="md" type="submit" disabled={busy}>
            <Plus size={16} /> {busy ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

export function CreateAssignmentModal({
  teacherId,
  onClose,
  onCreated,
}: {
  teacherId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [classId, setClassId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadClasses = useCallback(async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('id, name')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      setLoaded(true);
      return;
    }
    setClasses(data ?? []);
    if ((data ?? []).length > 0) setClassId(data![0].id);
    setLoaded(true);
  }, [teacherId]);

  useEffect(() => {
    void loadClasses();
  }, [loadClasses]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }
    if (!classId) {
      setError('Select a class first.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase.from('assignments').insert({
      class_id: classId,
      title: title.trim(),
      description: description.trim() || null,
      subject,
      deadline: new Date(deadline).toISOString(),
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    onCreated();
  };

  return (
    <ModalShell title="Create assignment" onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Class">
          {loaded && classes.length === 0 ? (
            <p className="text-sm text-ink-300 dark:text-ink-200">
              Create a class first before adding assignments.
            </p>
          ) : (
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className={inputCls}
              disabled={classes.length === 0}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Algebra Worksheet 5"
            className={inputCls}
          />
        </Field>
        <Field label="Instructions">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What should students do?"
            className={`${inputCls} resize-none`}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Subject">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputCls}
            >
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Due date">
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        {error && <ErrorText text={error} />}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="md" type="button" onClick={onClose}>Cancel</Button>
          <Button size="md" type="submit" disabled={busy}>
            <Plus size={16} /> {busy ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

const inputCls =
  'w-full h-11 px-3 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-ink-600 dark:text-white focus:outline-none focus:border-ink-400 min-h-[44px]';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function ErrorText({ text }: { text: string }) {
  return (
    <p className="text-sm text-clay-600 dark:text-clay-100 bg-clay-50 dark:bg-clay-500/20 rounded-lg px-3 py-2">
      {text}
    </p>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-ink-800 shadow-pop p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-extrabold text-xl text-ink-600 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 grid place-items-center rounded-lg text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700 min-h-[44px]"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
