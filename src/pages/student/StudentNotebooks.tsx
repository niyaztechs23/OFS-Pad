import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { NotebookCard } from '@/components/widgets/Cards';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/StateMessage';
import { studentNav } from '@/data/nav';
import { studentNotifications, subjectList, type SubjectKey } from '@/data/mock';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNotebooks } from '@/hooks/useNotebooks';
import { previewOf } from '@/lib/notebookStore';
import { timeAgo } from '@/utils/time';
import { Plus, Lock, X } from 'lucide-react';

export function StudentNotebooks() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const { notebooks, ready, add } = useNotebooks(session?.userId);
  const [filter, setFilter] = useState<SubjectKey | 'all'>('all');
  const [showNew, setShowNew] = useState(false);

  const name = profile?.full_name?.split(' ')[0] ?? 'there';
  const regular = notebooks.filter((n) => !n.isRough);
  const rough = notebooks.filter((n) => n.isRough);
  const filtered = filter === 'all' ? regular : regular.filter((n) => n.subject === filter);

  return (
    <AppShell role="student" nav={studentNav} name={name} notifications={studentNotifications}>
      <div className="space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white">My Notebooks</h1>
            <p className="text-ink-400 dark:text-ink-200 mt-1">All your subject notes in one pad.</p>
          </div>
          <Button size="md" onClick={() => setShowNew(true)}><Plus size={16} /> New notebook</Button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          <FilterChip label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
          {subjectList.map((s) => (
            <FilterChip
              key={s.key}
              label={s.name}
              active={filter === s.key}
              onClick={() => setFilter(s.key)}
              color={s.color}
            />
          ))}
        </div>

        {!ready ? (
          <p className="text-sm text-ink-300 dark:text-ink-200">Opening your notebooks…</p>
        ) : filtered.length === 0 ? (
          <Empty title="No notebooks here yet" hint="Tap New notebook to make one for this subject." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((n) => (
              <Link key={n.id} to={`/student/notebooks/${n.id}`} className="block">
                <NotebookCard
                  subject={n.subject}
                  title={n.title}
                  pages={n.pages.length}
                  updated={timeAgo(n.updatedAt)}
                  preview={previewOf(n)}
                />
              </Link>
            ))}
          </div>
        )}

        {rough.length > 0 && (
          <section className="space-y-3">
            <div>
              <h2 className="font-heading font-bold text-lg text-ink-600 dark:text-white flex items-center gap-2">
                <Lock size={18} /> Private rough notebook
              </h2>
              <p className="text-sm text-ink-400 dark:text-ink-200">
                Practise, make mistakes, solve problems. Only you can open this. Teachers cannot see it.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rough.map((n) => (
                <Link key={n.id} to={`/student/notebooks/${n.id}`} className="block">
                  <NotebookCard
                    subject={n.subject}
                    title={n.title}
                    pages={n.pages.length}
                    updated={timeAgo(n.updatedAt)}
                    preview={previewOf(n)}
                  />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {showNew && (
        <NewNotebookModal
          onClose={() => setShowNew(false)}
          onCreate={(title, subject) => {
            const id = add(title, subject);
            setShowNew(false);
            navigate(`/student/notebooks/${id}`);
          }}
        />
      )}
    </AppShell>
  );
}

function NewNotebookModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, subject: SubjectKey) => void;
}) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectKey>('maths');
  const fieldClass =
    'w-full h-12 px-3 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-ink-600 dark:text-white focus:outline-none focus:border-ink-400 min-h-[44px]';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink-900/40 backdrop-blur-sm" onClick={onClose}>
      <form
        className="w-full max-w-md rounded-2xl bg-white dark:bg-ink-800 shadow-pop p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          const subjectName = subjectList.find((s) => s.key === subject)?.name ?? 'Notebook';
          onCreate(title.trim() || `${subjectName} Notebook`, subject);
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-extrabold text-xl text-ink-600 dark:text-white">New notebook</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="w-11 h-11 grid place-items-center rounded-lg text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700">
            <X size={18} />
          </button>
        </div>
        <label className="block">
          <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1.5">Name</span>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Algebra classwork" className={fieldClass} />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1.5">Subject</span>
          <select value={subject} onChange={(e) => setSubject(e.target.value as SubjectKey)} className={fieldClass}>
            {subjectList.map((s) => (
              <option key={s.key} value={s.key}>{s.name}</option>
            ))}
          </select>
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="md" type="button" onClick={onClose}>Cancel</Button>
          <Button size="md" type="submit">Create</Button>
        </div>
      </form>
    </div>
  );
}

function FilterChip({
  label, active, onClick, color,
}: { label: string; active: boolean; onClick: () => void; color?: SubjectKey }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 h-10 px-4 rounded-full text-sm font-heading font-semibold transition-colors min-h-[44px] ${
        active
          ? 'bg-ink-500 text-white'
          : color
          ? `bg-subj-${color} text-subjInk-${color} hover:brightness-95`
          : 'bg-white dark:bg-ink-800 text-ink-400 dark:text-ink-200 border border-ink-100 dark:border-ink-700'
      }`}
    >
      {label}
    </button>
  );
}

export default StudentNotebooks;
