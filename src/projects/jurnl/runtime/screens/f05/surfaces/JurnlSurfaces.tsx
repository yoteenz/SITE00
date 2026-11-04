/**
 * F05 interactive surfaces (shared by DOT 01–04): JURNL_POPOVER, JURNL_SELECT and JURNL_DATE_PICKER.
 *
 * They replace the native <select> and <input type="date">, whose open state is drawn by the platform (iOS shows a
 * translucent system menu or wheel over the collage, in system type), with parchment surfaces in the JURNL language.
 *
 * - The popover is rendered inside the page's own stage (`.jrn-d01`, fixed to the viewport), not inside the scrolling
 *   content box: it is never clipped by a paper, never adds document height, and stays inside the dialog's focus trap.
 *   It opens below its field, or above when there is more room there, and its list scrolls internally.
 * - JURNL_SELECT follows the WAI-ARIA select-only combobox: focus stays on the field; arrows, Home / End, Page keys and
 *   type-ahead move the active option; Enter / Space choose; Escape and Tab close; aria-activedescendant names the
 *   active option. Values are the same stable ids the native select carried.
 * - JURNL_DATE_PICKER follows the date-picker dialog pattern: a month grid with one tab stop, arrows (day / week),
 *   Page Up / Down (month), Home / End (week), Enter / Space choose, Escape closes; focus returns to the field. The
 *   value stays ISO YYYY-MM-DD; the field shows it as `NOV 4, 2026`.
 * Live text only (uppercase); no circular controls; reduced motion removes the 160 ms rise.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import './jurnl-f05-surfaces.css';

type Place = { left: number; width: number; top?: number; bottom?: number; maxH: number };

function hostOf(el: HTMLElement | null): HTMLElement {
  return (el?.closest('.jrn-d01, [data-jrn-surface-host]') as HTMLElement | null) ?? document.body;
}

/** JURNL_POPOVER: a parchment surface anchored to a field, in the stage's layer. */
export function JurnlPopover({ anchor, onDismiss, children, minWidth = 220, want = 320, className = '', testId }: { anchor: RefObject<HTMLElement | null>; onDismiss: () => void; children: ReactNode; minWidth?: number; want?: number; className?: string; testId?: string }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const measure = useCallback(() => {
    const a = anchor.current;
    if (!a) return;
    const h = hostOf(a);
    setHost(h);
    const ar = a.getBoundingClientRect();
    const hr0 = h.getBoundingClientRect();
    // the global dock (06, 31) is drawn above the stage: the surface never opens underneath it
    const nav = document.querySelector<HTMLElement>('.jrn-nav');
    const nr = nav && nav.offsetParent !== null ? nav.getBoundingClientRect() : null;
    const floor = nr && nr.height > 0 && nr.top < hr0.bottom && nr.top > ar.bottom ? nr.top : hr0.bottom;
    const hr = { left: hr0.left, top: hr0.top, width: hr0.width, bottom: floor, hostBottom: hr0.bottom };
    const gap = 6;
    const below = hr.bottom - ar.bottom - gap - 8;
    const above = ar.top - hr.top - gap - 8;
    const up = below < Math.min(want, 240) && above > below;
    const maxH = Math.max(140, Math.min(want, up ? above : below));
    const width = Math.min(Math.max(ar.width, minWidth), hr.width - 16);
    const left = Math.min(Math.max(8, ar.left - hr.left + (ar.width - width) / 2), hr.width - width - 8);
    setPlace(up ? { left, width, bottom: hr.hostBottom - ar.top + gap, maxH } : { left, width, top: ar.bottom - hr.top + gap, maxH });
  }, [anchor, minWidth, want]);
  useLayoutEffect(() => {
    measure();
  }, [measure]);
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (box.current?.contains(t) || anchor.current?.contains(t)) return;
      onDismiss();
    };
    const onMove = (e: Event) => {
      if (box.current && e.target instanceof Node && box.current.contains(e.target)) return;
      measure();
    };
    document.addEventListener('pointerdown', onDown, true);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onMove, true);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [anchor, measure, onDismiss]);
  if (!host || !place) return null;
  const style: CSSProperties = { left: place.left, width: place.width, maxHeight: place.maxH, top: place.top, bottom: place.bottom };
  return createPortal(
    <div ref={box} className={`jrn-pop ${className}`} style={style} data-side={place.top != null ? 'below' : 'above'} data-testid={testId}>
      {children}
    </div>,
    host,
  );
}

const CHEV = (
  <svg className="jrn-sel__chev" viewBox="0 0 24 24" aria-hidden>
    <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CAL = (
  <svg className="jrn-sel__chev" viewBox="0 0 24 24" aria-hidden>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const TICK = (
  <svg className="jrn-opt__tick" viewBox="0 0 24 24" aria-hidden>
    <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type JurnlOption<T extends string> = { id: T; label: string };

/** JURNL_SELECT: select-only combobox with a parchment listbox. */
export function JurnlSelect<T extends string>({ id, value, options, onValue, trigger, placeholder = 'SELECT', labelledBy, ariaLabel, uncertain, className = '' }: { id: string; value: T | ''; options: JurnlOption<T>[]; onValue: (v: T) => void; trigger: string; placeholder?: string; labelledBy?: string; ariaLabel?: string; uncertain?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const sel = options.findIndex((o) => o.id === value);
  const [active, setActive] = useState(Math.max(0, sel));
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', at: 0 });
  const listId = `${id}-listbox`;
  const show = (to = Math.max(0, sel)) => {
    setActive(to);
    setOpen(true);
  };
  const close = useCallback(() => setOpen(false), []);
  const choose = (i: number) => {
    const o = options[i];
    if (o) onValue(o.id);
    setOpen(false);
    btn.current?.focus({ preventScroll: true });
  };
  useLayoutEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);
  const ahead = (ch: string) => {
    const now = Date.now();
    const t = now - typed.current.at < 600 ? typed.current.text + ch : ch;
    typed.current = { text: t, at: now };
    const from = open ? active : Math.max(0, sel);
    const order = [...options.keys()].map((k) => (from + (t.length === 1 ? 1 : 0) + k) % options.length);
    return order.find((k) => options[k]!.label.toUpperCase().startsWith(t.toUpperCase()));
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = options.length;
    if (!n) return;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        show(e.key === 'ArrowUp' ? Math.max(0, sel - 1) : Math.max(0, sel));
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        show(e.key === 'Home' ? 0 : n - 1);
      } else if (e.key.length === 1 && /\S/.test(e.key)) {
        const k = ahead(e.key);
        if (k != null) show(k);
      }
      return;
    }
    const moves: Record<string, number> = { ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: n - 1, PageDown: active + 8, PageUp: active - 8 };
    if (e.key in moves) {
      e.preventDefault();
      setActive(Math.min(n - 1, Math.max(0, moves[e.key]!)));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === 'Tab') {
      setOpen(false);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      const k = ahead(e.key);
      if (k != null) setActive(k);
    }
  };
  return (
    <>
      <button
        ref={btn}
        type="button"
        id={id}
        role="combobox"
        className={`jrn-sel ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
        aria-invalid={uncertain ? true : undefined}
        data-jrn-trigger={trigger}
        data-value={value}
        data-empty={sel < 0 ? 'true' : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKey}
      >
        <span className="jrn-sel__value">{sel >= 0 ? options[sel]!.label : placeholder}</span>
        {CHEV}
      </button>
      {open ? (
        <JurnlPopover anchor={btn} onDismiss={close} want={Math.min(340, options.length * 46 + 16)}>
          <ul ref={list} id={listId} role="listbox" className="jrn-pop__list" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : ariaLabel} data-jrn-listbox={trigger}>
            {options.map((o, i) => (
              <li
                key={o.id}
                id={`${listId}-${i}`}
                role="option"
                className="jrn-opt"
                aria-selected={o.id === value}
                data-index={i}
                data-active={i === active ? 'true' : undefined}
                data-jrn-option={o.id}
                onPointerDown={(e) => e.preventDefault()}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
              >
                {TICK}
                <span>{o.label}</span>
              </li>
            ))}
          </ul>
        </JurnlPopover>
      ) : null}
    </>
  );
}

// ---------- dates (calendar math on Y-M-D, no time zone) ----------
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const pad = (n: number) => String(n).padStart(2, '0');
const parse = (iso: string | null | undefined) => {
  const m = iso ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso) : null;
  return m ? { y: +m[1]!, m: +m[2]! - 1, d: +m[3]! } : null;
};
const isoOf = (y: number, m: number, d: number) => {
  const t = new Date(Date.UTC(y, m, d));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
};
const addDaysIso = (iso: string, n: number) => {
  const p = parse(iso)!;
  return isoOf(p.y, p.m, p.d + n);
};
const addMonthsIso = (iso: string, n: number) => {
  const p = parse(iso)!;
  const last = new Date(Date.UTC(p.y, p.m + n + 1, 0)).getUTCDate();
  return isoOf(p.y, p.m + n, Math.min(p.d, last));
};
const dow = (iso: string) => {
  const p = parse(iso)!;
  return new Date(Date.UTC(p.y, p.m, p.d)).getUTCDay();
};
export function displayDate(iso: string | null | undefined): string {
  const p = parse(iso);
  return p ? `${MONTHS[p.m]!.slice(0, 3)} ${p.d}, ${p.y}` : '';
}
function todayIso(): string {
  const t = new Date();
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

/** JURNL_DATE_PICKER: a field showing the date and a parchment month grid. */
export function JurnlDateField({ id, value, onValue, trigger, labelledBy, ariaLabel, placeholder = 'SELECT DATE', optional = false, uncertain, className = '' }: { id: string; value: string; onValue: (iso: string) => void; trigger: string; labelledBy?: string; ariaLabel?: string; placeholder?: string; optional?: boolean; uncertain?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const base = parse(value) ? value : todayIso();
  const [focus, setFocus] = useState(base);
  const btn = useRef<HTMLButtonElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const dialogId = `${id}-calendar`;
  const fp = parse(focus)!;
  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) btn.current?.focus({ preventScroll: true });
  }, []);
  const dismiss = useCallback(() => setOpen(false), []);
  useLayoutEffect(() => {
    if (open) grid.current?.querySelector<HTMLElement>(`[data-iso="${focus}"]`)?.focus({ preventScroll: true });
  }, [open, focus]);
  const cells = useMemo(() => {
    const first = isoOf(fp.y, fp.m, 1);
    const start = addDaysIso(first, -dow(first));
    return Array.from({ length: 42 }, (_, i) => addDaysIso(start, i));
  }, [fp.y, fp.m]);
  const pick = (iso: string) => {
    onValue(iso);
    close();
  };
  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, () => string> = {
      ArrowRight: () => addDaysIso(focus, 1),
      ArrowLeft: () => addDaysIso(focus, -1),
      ArrowDown: () => addDaysIso(focus, 7),
      ArrowUp: () => addDaysIso(focus, -7),
      Home: () => addDaysIso(focus, -dow(focus)),
      End: () => addDaysIso(focus, 6 - dow(focus)),
      PageDown: () => addMonthsIso(focus, e.shiftKey ? 12 : 1),
      PageUp: () => addMonthsIso(focus, e.shiftKey ? -12 : -1),
    };
    if (e.key in step) {
      e.preventDefault();
      setFocus(step[e.key]!());
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(focus);
    }
  };
  const onPopKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  };
  const today = todayIso();
  const weeks = [0, 1, 2, 3, 4, 5].map((w) => cells.slice(w * 7, w * 7 + 7));
  return (
    <>
      <button
        ref={btn}
        type="button"
        id={id}
        className={`jrn-sel jrn-sel--date ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-labelledby={labelledBy ? `${labelledBy} ${id}-value` : undefined}
        aria-label={labelledBy ? undefined : ariaLabel}
        aria-invalid={uncertain ? true : undefined}
        data-jrn-trigger={trigger}
        data-value={value}
        data-empty={value ? undefined : 'true'}
        onClick={() => {
          if (open) return close();
          setFocus(parse(value) ? value : today);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            setFocus(parse(value) ? value : today);
            setOpen(true);
          }
        }}
      >
        <span className="jrn-sel__value" id={`${id}-value`}>{value ? displayDate(value) : placeholder}</span>
        {CAL}
      </button>
      {open ? (
        <JurnlPopover anchor={btn} onDismiss={dismiss} minWidth={300} want={400} className="jrn-pop--cal">
          <div role="dialog" id={dialogId} aria-modal="false" aria-label={`CHOOSE A DATE · ${MONTHS[fp.m]} ${fp.y}`} data-jrn-calendar={trigger} onKeyDown={onPopKey}>
            <div className="jrn-cal__head">
              <button type="button" className="jrn-cal__nav" aria-label="PREVIOUS MONTH" data-jrn-trigger={`${trigger}-prev`} onClick={() => setFocus(addMonthsIso(focus, -1))}>
                <svg viewBox="0 0 24 24" aria-hidden><path d="m15 6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <p className="jrn-cal__month" aria-live="polite">{MONTHS[fp.m]} {fp.y}</p>
              <button type="button" className="jrn-cal__nav" aria-label="NEXT MONTH" data-jrn-trigger={`${trigger}-next`} onClick={() => setFocus(addMonthsIso(focus, 1))}>
                <svg viewBox="0 0 24 24" aria-hidden><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div ref={grid} role="grid" className="jrn-cal__grid" aria-label={`${MONTHS[fp.m]} ${fp.y}`} onKeyDown={onGridKey}>
              <div role="row" className="jrn-cal__row">
                {DOW.map((d) => (
                  <span key={d} role="columnheader" className="jrn-cal__dow" aria-label={d}>{d.slice(0, 1)}</span>
                ))}
              </div>
              {weeks.map((wk, wi) => (
                <div role="row" key={wi} className="jrn-cal__row">
                  {wk.map((iso) => {
                    const p = parse(iso)!;
                    const out = p.m !== fp.m;
                    return (
                      <span role="gridcell" key={iso} aria-selected={iso === value}>
                        <button
                          type="button"
                          className="jrn-cal__day"
                          tabIndex={iso === focus ? 0 : -1}
                          data-iso={iso}
                          data-out={out ? 'true' : undefined}
                          data-today={iso === today ? 'true' : undefined}
                          data-selected={iso === value ? 'true' : undefined}
                          aria-label={`${p.d} ${MONTHS[p.m]} ${p.y}${iso === today ? ', TODAY' : ''}`}
                          aria-pressed={iso === value}
                          onClick={() => pick(iso)}
                        >
                          {p.d}
                        </button>
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="jrn-cal__foot">
              <button type="button" className="jrn-cal__act" data-jrn-trigger={`${trigger}-today`} onClick={() => pick(today)}>TODAY</button>
              {optional && value ? <button type="button" className="jrn-cal__act" data-jrn-trigger={`${trigger}-clear`} onClick={() => pick('')}>CLEAR</button> : null}
            </div>
          </div>
        </JurnlPopover>
      ) : null}
    </>
  );
}
