import { subjects, type SubjectKey } from '@/data/mock';

export function SubjectTag({
  subject,
  size = 'md',
}: {
  subject: SubjectKey;
  size?: 'sm' | 'md';
}) {
  const s = subjects[subject];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold font-heading ${pad} bg-subj-${s.color} text-subjInk-${s.color}`}
    >
      <span className={`w-2 h-2 rounded-full bg-subjInk-${s.color}`} />
      {s.name}
    </span>
  );
}

export default SubjectTag;

// Subject dot — compact colored marker
export function SubjectDot({ subject }: { subject: SubjectKey }) {
  const s = subjects[subject];
  return <span className={`w-2.5 h-2.5 rounded-full bg-subjInk-${s.color}`} />;
}
