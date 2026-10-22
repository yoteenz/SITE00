/**
 * Optional prose mark helper for non-header UI (prefer plain body copy on DF/BLDR ledes).
 * FNDATN-01 email body uses plain punctuation — display marks belong on headline lines only.
 */
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

/** Thousands separator rule (emails use plain body punctuation; this helper is for live DF/BLDR pages only). */
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

/** True when a display headline line already ends with ? or ! (no separate red period). */
export function displayLineEndsWithSplitMark(line: string): boolean {
  return /[!?]$/.test(line.trimEnd());
}

const DISPLAY_SPLIT_MARKS: Record<'!' | '?', { file: string; w: number; h: number }> = {
  '?': { file: 'question.png', w: 79, h: 221 },
  '!': { file: 'exclamation.png', w: 34, h: 222 },
};

/** Two-color ? and ! from traced display face (symbol sheet rule — not clip-path on plain glyph). */
function SplitBangQuestion({ ch }: { ch: '!' | '?' }) {
  const m = DISPLAY_SPLIT_MARKS[ch];
  return (
    <img
      className={`correspondence-display-split correspondence-display-split--${ch === '?' ? 'question' : 'exclamation'}`}
      src={`${CORRESPONDENCE_MARK_BASE}/${m.file}`}
      alt={ch}
      width={m.w}
      height={m.h}
    />
  );
}

/** Display headline line: red comma/semicolon/asterisk in-line; ? and ! use black stem + red dot (symbol sheet). */
export function CorrespondenceDisplayLine({ line }: { line: string }) {
  const m = line.match(/^(.*?)([!?])$/);
  if (m?.[1] !== undefined && m[2]) {
    return (
      <>
        {correspondenceDisplayString(m[1])}
        <SplitBangQuestion ch={m[2] as '!' | '?'} />
      </>
    );
  }
  return <>{correspondenceDisplayString(line)}</>;
}
