import type { CSSProperties } from 'react';
import type { Stroke, Tool, Pt } from '@/lib/notebookStore';

export const PAGE_W = 900;
export const PAGE_H = 1200;
export const SCALE = 2; // sharper lines on high-resolution screens

export const PALETTES: Record<Exclude<Tool, 'eraser'>, string[]> = {
  pen: ['#1F2933', '#2B4C7E', '#D1495B', '#4C9F70'],
  pencil: ['#4A4F57', '#7A7F87'],
  highlighter: ['#FFE066', '#A8E6A1', '#FFB3C7', '#A5D8FF'],
};
export const DEFAULT_SIZE: Record<Exclude<Tool, 'eraser'>, number> = { pen: 3, pencil: 2, highlighter: 6 };

export const r1 = (v: number) => Math.round(v * 10) / 10;

// One page = 30 ruled lines. All sizes use container units (cqw = 1% of page width),
// so typed text, ruled lines and handwriting always stay lined up at any screen size.
export const PAPER_STYLE: CSSProperties = {
  aspectRatio: `${PAGE_W} / ${PAGE_H}`,
  backgroundColor: '#FFFEFA',
  containerType: 'inline-size',
} as CSSProperties;

export const RULES_STYLE: CSSProperties = {
  backgroundImage:
    'linear-gradient(to bottom, transparent calc(100% - 1px), rgba(43,76,126,0.16) calc(100% - 1px))',
  backgroundSize: `100% ${(100 / 30).toFixed(4)}%`,
};

export const MARGIN_LEFT = '8.5%';

export const TYPE_STYLE: CSSProperties = {
  fontSize: '2.5cqw',
  lineHeight: '4.4444cqw',
  padding: '0 2.6667cqw 0 9.5cqw',
  fontFamily: 'inherit',
  letterSpacing: 'normal',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  tabSize: 4,
  margin: 0,
  border: 0,
};

export function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  const pts = s.points;
  if (!pts.length) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;

  if (s.tool === 'highlighter') {
    ctx.globalAlpha = 0.38;
    ctx.lineWidth = s.size * 4;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    if (pts.length === 1) ctx.lineTo(pts[0][0] + 0.01, pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2;
      const my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    if (pts.length > 1) ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (s.tool === 'pencil') ctx.globalAlpha = 0.9;
  const base = s.size * (s.tool === 'pencil' ? 0.8 : 1);
  const widthAt = (p: number) => Math.max(0.6, base * (0.45 + p * 1.1));

  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0][0], pts[0][1], widthAt(pts[0][2]) / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  let prevMid: [number, number] = [pts[0][0], pts[0][1]];
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    const next = pts[i + 1];
    const mid: [number, number] = next ? [(p[0] + next[0]) / 2, (p[1] + next[1]) / 2] : [p[0], p[1]];
    ctx.beginPath();
    ctx.moveTo(prevMid[0], prevMid[1]);
    ctx.quadraticCurveTo(p[0], p[1], mid[0], mid[1]);
    ctx.lineWidth = widthAt((pts[i - 1][2] + p[2]) / 2);
    ctx.stroke();
    prevMid = mid;
  }
  ctx.restore();
}

function distToSegment(px: number, py: number, a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - a[0]) * dx + (py - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy));
}

export function strokeHit(s: Stroke, x: number, y: number, radius: number): boolean {
  const extra = s.tool === 'highlighter' ? s.size * 2 : s.size / 2;
  const r = radius + extra;
  if (s.points.length === 1) return Math.hypot(x - s.points[0][0], y - s.points[0][1]) <= r;
  for (let i = 1; i < s.points.length; i++) {
    if (distToSegment(x, y, s.points[i - 1], s.points[i]) <= r) return true;
  }
  return false;
}
