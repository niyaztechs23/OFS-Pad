import { useEffect, useRef } from 'react';
import type { SubmittedPage } from '@/lib/submission';
import {
  PAGE_W, PAGE_H, SCALE, drawStroke, PAPER_STYLE, RULES_STYLE, TYPE_STYLE, MARGIN_LEFT,
} from '@/lib/ink';

// Read-only view of one notebook page (used by teachers to read submitted work).
export function PageView({ page }: { page: SubmittedPage }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = PAGE_W * SCALE;
    c.height = PAGE_H * SCALE;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    page.strokes.forEach((s) => drawStroke(ctx, s));
  }, [page]);

  return (
    <div className="relative w-full rounded-xl shadow-card overflow-hidden" style={PAPER_STYLE}>
      <div className="absolute inset-0" style={RULES_STYLE} />
      <div className="absolute top-0 bottom-0" style={{ left: MARGIN_LEFT, width: 1, backgroundColor: 'rgba(209,73,91,0.45)' }} />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ ...TYPE_STYLE, color: '#1F2933' }}
      >
        {page.text}
      </div>
      <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}

export default PageView;
