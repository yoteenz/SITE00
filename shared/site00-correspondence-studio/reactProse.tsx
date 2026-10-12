/** Red traced commas, semicolons, and asterisks for live SITE 00 pages (matches FNDATN-01 email prose). */
import { Children, Fragment, type ReactNode } from 'react';

export const CORRESPONDENCE_RED = '#ce1017';
export const CORRESPONDENCE_MARK_BASE = '/site00-correspondence-studio/fndatn-01/marks';

const MARKS: Record<string, { file: string; w: number; h: number; drop: number }> = {
  ',': { file: 'comma.png', w: 6, h: 12, drop: 5 },
  ';': { file: 'semicolon.png', w: 6, h: 28, drop: 6 },
  '*': { file: 'asterisk.png', w: 12, h: 12, drop: 1 },
};

function markImg(ch: string, key: number) {
  const m = MARKS[ch];
  const src = `${CORRESPONDENCE_MARK_BASE}/${m.file}`;
  return (
    <img
      key={key}
      className={`correspondence-mark correspondence-mark--${ch === ',' ? 'comma' : ch === ';' ? 'semicolon' : 'asterisk'}`}
      src={src}
      alt={ch}
      width={m.w}
      height={m.h}
      style={{ verticalAlign: `-${m.drop}px` }}
    />
  );
}

/** Same thousands rule as `paintProse` in fndatn01/html.ts. */
export function correspondenceProseString(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let key = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (ch === ',' && /\d$/.test(text.slice(0, i)) && /^\d/.test(text.slice(i + 1))) {
      out.push(<Fragment key={key++}>{ch}</Fragment>);
      continue;
    }
    if (ch in MARKS) {
      out.push(markImg(ch, key++));
      continue;
    }
    out.push(<Fragment key={key++}>{ch}</Fragment>);
  }
  return out;
}

function mapProseChild(child: ReactNode, key: number): ReactNode {
  if (typeof child === 'string') return <Fragment key={key}>{correspondenceProseString(child)}</Fragment>;
  if (typeof child === 'number') return <Fragment key={key}>{correspondenceProseString(String(child))}</Fragment>;
  return <Fragment key={key}>{child}</Fragment>;
}

export function CorrespondenceProse({ children }: { children: ReactNode }) {
  return <>{Children.map(children, (child, i) => mapProseChild(child, i))}</>;
}

/** Display lines (SITE 00 Display): `.` `,` `;` `*` render in correspondence red — matches `displayText()` in fndatn01/html.ts. */
const RED_DISPLAY = new Set(['.', ',', ';', '*']);

export function correspondenceDisplayString(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let key = 0;
  for (const ch of text) {
    if (RED_DISPLAY.has(ch)) {
      out.push(
        <span key={key++} className="correspondence-display-mark" style={{ color: CORRESPONDENCE_RED }}>
          {ch}
        </span>,
      );
    } else {
      out.push(<Fragment key={key++}>{ch}</Fragment>);
    }
  }
  return out;
}

function mapDisplayChild(child: ReactNode, key: number): ReactNode {
  if (typeof child === 'string') return <Fragment key={key}>{correspondenceDisplayString(child)}</Fragment>;
  if (typeof child === 'number') return <Fragment key={key}>{correspondenceDisplayString(String(child))}</Fragment>;
  return <Fragment key={key}>{child}</Fragment>;
}

export function CorrespondenceDisplay({ children }: { children: ReactNode }) {
  return <>{Children.map(children, (child, i) => mapDisplayChild(child, i))}</>;
}
