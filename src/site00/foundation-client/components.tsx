/**
 * Digital Foundation universal component system (DF-U01..U16).
 * Presentation and interaction only: every component renders state it is given and never decides business outcomes.
 * Overlays portal to `body` with the shared `df-portal` scope so tokens and typography match `.df-root`.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { DfIcon, type DfIconName } from './icons';

// ─── Overlay utilities ─────────────────────────────────────────────────────────────────────────

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let scrollLocks = 0;

/**
 * Reference-counted page lock shared by every modal overlay: freezes page scroll and makes the app root inert
 * (overlays portal outside it), so nested overlays never leave the page frozen or unreachable.
 */
export function useDfScrollLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return undefined;
    scrollLocks += 1;
    document.body.classList.add('df-scroll-locked');
    document.getElementById('root')?.setAttribute('inert', '');
    return () => {
      scrollLocks = Math.max(0, scrollLocks - 1);
      if (!scrollLocks) {
        document.body.classList.remove('df-scroll-locked');
        document.getElementById('root')?.removeAttribute('inert');
      }
    };
  }, [active]);
}

export function dfScrollLockCount(): number {
  return scrollLocks;
}

export function dfPrefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/** Moves focus into `panel`, traps Tab inside it, routes Escape, and restores focus to the opener on release. */
export function useDfDialogFocus(
  active: boolean,
  panel: React.RefObject<HTMLElement>,
  onEscape: (() => void) | null,
  initial?: React.RefObject<HTMLElement>,
) {
  const escRef = useRef(onEscape);
  escRef.current = onEscape;
  useEffect(() => {
    if (!active) return undefined;
    const opener = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() => {
      (initial?.current ?? panel.current)?.focus({ preventScroll: true });
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && escRef.current) {
        e.stopPropagation();
        escRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) {
        e.preventDefault();
        panel.current.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey, true);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [active, panel, initial]);
}

function portal(node: ReactNode) {
  return typeof document !== 'undefined' ? createPortal(node, document.body) : node;
}

/** Keeps an overlay mounted for its exit transition. */
function usePresence(open: boolean, ms: number): boolean {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      return undefined;
    }
    if (dfPrefersReducedMotion()) {
      setMounted(false);
      return undefined;
    }
    const t = window.setTimeout(() => setMounted(false), ms);
    return () => window.clearTimeout(t);
  }, [open, ms]);
  return mounted;
}

// ─── DF BUTTON (U01) ───────────────────────────────────────────────────────────────────────────

export type DfButtonTone = 'primary' | 'secondary' | 'text';
const BUTTON_CLASS: Record<DfButtonTone, string> = { primary: 'red', secondary: 'outline', text: 'text' };

export function DfSpinner({ size = 'sm', label }: { size?: 'sm' | 'md'; label?: string }) {
  return (
    <span className={`df-spinner df-spinner--${size}`} role={label ? 'status' : undefined} aria-label={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle className="df-spinner__track" cx="12" cy="12" r="10" />
        <circle className="df-spinner__arc" cx="12" cy="12" r="10" />
      </svg>
    </span>
  );
}

export function DfButton({
  label,
  tone = 'primary',
  onClick,
  disabled,
  busy,
  busyLabel,
  arrow,
  type = 'button',
  action,
  describedBy,
}: {
  label: string;
  tone?: DfButtonTone;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  busyLabel?: string;
  /** Primary defaults to an arrow; secondary/text opt in. */
  arrow?: boolean;
  type?: 'button' | 'submit';
  /** Stable QA hook (`data-df-action`). */
  action?: string;
  describedBy?: string;
}) {
  const showArrow = (arrow ?? tone === 'primary') && !busy;
  return (
    // Busy stays focusable (aria-disabled) so focus isn't dropped to <body> mid-request; it also
    // demotes to type=button so a pending submit can't fire twice.
    <button
      type={busy ? 'button' : type}
      className={`df-cta df-cta--${BUTTON_CLASS[tone]}`}
      onClick={busy ? undefined : onClick}
      disabled={disabled}
      aria-disabled={busy || undefined}
      aria-busy={busy || undefined}
      aria-describedby={describedBy}
      data-busy={busy ? '1' : undefined}
      data-df-action={action}
    >
      {busy && <DfSpinner />}
      <span className="df-cta__label">{busy ? busyLabel ?? label : label}</span>
      {showArrow && (
        <svg className="df-cta__arrow" viewBox="0 0 24 12" aria-hidden="true" focusable="false">
          <path d="M1 6h21m-5-5 5 5-5 5" />
        </svg>
      )}
    </button>
  );
}

// ─── DF FIELD (U02) ────────────────────────────────────────────────────────────────────────────

export function DfField({
  id,
  label,
  error,
  hint,
  help,
  validating,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  /** Short contextual help rendered as a tooltip trigger beside the label. */
  help?: string;
  validating?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`df-field${error ? ' df-field--error' : ''}${validating ? ' df-field--validating' : ''}`}>
      <span className="df-field__head">
        <label className="df-field__label" htmlFor={id} id={`${id}-label`}>
          {label}
        </label>
        {help && <DfTooltip label={`ABOUT ${label}`} content={help} />}
        {validating && (
          <span className="df-field__validating">
            <DfSpinner />
            CHECKING…
          </span>
        )}
      </span>
      {children}
      {error ? (
        <p className="df-field__error" id={`${id}-error`}>
          {error}
        </p>
      ) : (
        hint && (
          <p className="df-field__hint" id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

// ─── DF SELECT (U03) ───────────────────────────────────────────────────────────────────────────

export type DfSelectOption = { value: string; label: string; disabled?: boolean };

/**
 * Select-only combobox (WAI-ARIA APG). The trigger shows only the committed `value`; highlighting an option never
 * changes form state until Enter/Space/click commits it.
 */
export function DfSelect({
  id,
  value,
  options,
  placeholder,
  onChange,
  disabled,
  invalid,
  describedBy,
  labelledBy,
}: {
  id: string;
  value: string;
  options: DfSelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  labelledBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [placement, setPlacement] = useState<'below' | 'above'>('below');
  const [maxHeight, setMaxHeight] = useState(240);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = `${id}-listbox`;
  const typeahead = useRef<{ text: string; at: number }>({ text: '', at: 0 });
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.visualViewport?.height ?? window.innerHeight;
    // A collapsed peek sheet owns the bottom edge; the list must never open underneath it.
    const peek = document.querySelector('.df-bsheet[data-snap="peek"] .df-bsheet__panel');
    const floor = peek ? Math.min(vh, peek.getBoundingClientRect().top) : vh;
    const reserve = 12;
    const below = floor - rect.bottom - reserve;
    const above = rect.top - reserve;
    const want = Math.min(options.length * 38 + 2, 300);
    if (below >= Math.min(want, 180) || below >= above) {
      setPlacement('below');
      setMaxHeight(Math.max(120, Math.min(want, below)));
    } else {
      setPlacement('above');
      setMaxHeight(Math.max(120, Math.min(want, above)));
    }
  }, [options.length]);

  const openList = useCallback(
    (start?: number) => {
      if (disabled) return;
      place();
      setOpen(true);
      setActive(start ?? (selectedIndex >= 0 ? selectedIndex : options.findIndex((o) => !o.disabled)));
    },
    [disabled, place, selectedIndex, options],
  );

  const close = useCallback((refocus = true) => {
    setOpen(false);
    setActive(-1);
    if (refocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const commit = useCallback(
    (i: number) => {
      const o = options[i];
      if (!o || o.disabled) return;
      onChange(o.value);
      close();
    },
    [options, onChange, close],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    const onResize = () => place();
    document.addEventListener('pointerdown', onDown, true);
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
    };
  }, [open, close, place]);

  useLayoutEffect(() => {
    if (!open || active < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!el) return;
    const list = listRef.current;
    if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop;
    else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
    }
  }, [open, active]);

  const move = (from: number, dir: 1 | -1) => {
    let i = from;
    for (let n = 0; n < options.length; n += 1) {
      i = (i + dir + options.length) % options.length;
      if (!options[i].disabled) return i;
    }
    return from;
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const key = e.key;
    if (!open) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        e.preventDefault();
        openList(key === 'ArrowUp' && selectedIndex < 0 ? options.length - 1 : undefined);
      }
      return;
    }
    if (key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => move(a < 0 ? -1 : a, 1));
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => move(a < 0 ? 0 : a, -1));
    } else if (key === 'Home') {
      e.preventDefault();
      setActive(move(-1, 1));
    } else if (key === 'End') {
      e.preventDefault();
      setActive(move(0, -1));
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      if (active >= 0) commit(active);
    } else if (key === 'Tab') {
      close(false);
    } else if (key.length === 1 && /\S/.test(key)) {
      const now = Date.now();
      const t = typeahead.current;
      t.text = now - t.at > 700 ? key.toUpperCase() : t.text + key.toUpperCase();
      t.at = now;
      const hit = options.findIndex((o) => !o.disabled && o.label.toUpperCase().startsWith(t.text));
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`df-select${open ? ' df-select--open' : ''}${selected ? '' : ' df-select--empty'}${invalid ? ' df-select--invalid' : ''} df-select--${placement}`}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        className="df-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-labelledby={labelledBy}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
      >
        <span className="df-select__value">{selected ? selected.label : placeholder}</span>
        <svg className="df-select__chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        className="df-select__list"
        aria-labelledby={labelledBy}
        hidden={!open}
        style={{ maxHeight }}
        tabIndex={-1}
      >
        {options.map((o, i) => (
          <li
            key={o.value}
            id={`${id}-opt-${i}`}
            data-index={i}
            role="option"
            aria-selected={o.value === value}
            aria-disabled={o.disabled || undefined}
            className={`df-select__option${i === active ? ' df-select__option--active' : ''}${o.value === value ? ' df-select__option--selected' : ''}`}
            onPointerMove={() => !o.disabled && setActive(i)}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => commit(i)}
          >
            {o.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── DF CHECKBOX / RADIO / TOGGLE (U04..U06) ───────────────────────────────────────────────────

/** Visual checkbox mark; pair with a native input or an element carrying `role="checkbox"`. */
export function DfCheckMark({ checked, locked, disabled }: { checked: boolean; locked?: boolean; disabled?: boolean }) {
  return (
    <span
      className={`df-check${checked ? ' df-check--on' : ''}${locked ? ' df-check--locked' : ''}${disabled ? ' df-check--disabled' : ''}`}
      aria-hidden="true"
    >
      {checked && (
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="m5.5 12.5 4 4 9-9" />
        </svg>
      )}
    </span>
  );
}

export function DfRadioMark({ checked, disabled }: { checked: boolean; disabled?: boolean }) {
  return <span className={`df-radio${checked ? ' df-radio--on' : ''}${disabled ? ' df-radio--disabled' : ''}`} aria-hidden="true" />;
}

export function DfToggleMark({ on, disabled }: { on: boolean; disabled?: boolean }) {
  return (
    <span className={`df-toggle${on ? ' df-toggle--on' : ''}${disabled ? ' df-toggle--disabled' : ''}`} aria-hidden="true">
      <span className="df-toggle__thumb" />
    </span>
  );
}

export function DfCheckbox({
  label,
  checked,
  onChange,
  disabled,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
}) {
  return (
    <label className={`df-choice${disabled ? ' df-choice--disabled' : ''}`}>
      <input type="checkbox" className="df-choice__input" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="df-choice__text">
        <span className="df-choice__label">{label}</span>
        {description && <span className="df-choice__desc">{description}</span>}
      </span>
      <DfCheckMark checked={checked} disabled={disabled} />
    </label>
  );
}

export function DfRadio({
  name,
  label,
  checked,
  onChange,
  disabled,
  description,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  description?: string;
}) {
  return (
    <label className={`df-choice${disabled ? ' df-choice--disabled' : ''}`}>
      <input type="radio" className="df-choice__input" name={name} checked={checked} disabled={disabled} onChange={onChange} />
      <span className="df-choice__text">
        <span className="df-choice__label">{label}</span>
        {description && <span className="df-choice__desc">{description}</span>}
      </span>
      <DfRadioMark checked={checked} disabled={disabled} />
    </label>
  );
}

export function DfToggle({
  label,
  on,
  onChange,
  disabled,
  description,
  stateLabels = true,
}: {
  label: string;
  on: boolean;
  onChange: (on: boolean) => void;
  disabled?: boolean;
  description?: string;
  stateLabels?: boolean;
}) {
  return (
    <label className={`df-choice df-choice--toggle${disabled ? ' df-choice--disabled' : ''}`}>
      <input
        type="checkbox"
        role="switch"
        className="df-choice__input"
        checked={on}
        aria-checked={on}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="df-choice__text">
        <span className="df-choice__label">{label}</span>
        {description && <span className="df-choice__desc">{description}</span>}
      </span>
      {stateLabels && (
        <span className={`df-choice__state${on ? ' df-choice__state--on' : ''}`} aria-hidden="true">
          {on ? 'ON' : 'OFF'}
        </span>
      )}
      <DfToggleMark on={on} disabled={disabled} />
    </label>
  );
}

// ─── DF BOTTOM SHEET (U07) ─────────────────────────────────────────────────────────────────────

export type DfSheetSnap = 'closed' | 'peek' | 'half' | 'full';

const SHEET_MS = 240;
const DRAG_COMMIT_PX = 56;
const FLICK_PX_PER_MS = 0.45;

/**
 * Bottom sheet that rises from the bottom edge.
 * - `variant="modal"`: opens at `full`, dims and inerts the page, traps focus; handle drag down or backdrop dismisses.
 * - `variant="peek"`: non-modal peek bar while collapsed; expanding (tap, chevron, swipe up, Enter) promotes it to a
 *   modal panel with backdrop; swipe down / Escape / close collapse back to the peek bar.
 * Gestures only start on the handle + header, so scrolling the body never drags or dismisses the sheet.
 */
export function DfBottomSheet({
  open,
  onClose,
  title,
  summary,
  variant = 'modal',
  snap: snapProp,
  onSnapChange,
  footer,
  children,
  label,
}: {
  open: boolean;
  onClose?: () => void;
  title: string;
  /** Peek bar supporting line (peek variant). */
  summary?: string;
  variant?: 'modal' | 'peek';
  /** Controlled snap for the peek variant; defaults to internal state starting at `peek`. */
  snap?: Exclude<DfSheetSnap, 'closed'>;
  onSnapChange?: (snap: Exclude<DfSheetSnap, 'closed'>) => void;
  footer?: ReactNode;
  children: ReactNode;
  /** Accessible name override; defaults to the title. */
  label?: string;
}) {
  const [innerSnap, setInnerSnap] = useState<Exclude<DfSheetSnap, 'closed'>>(variant === 'peek' ? 'peek' : 'full');
  const snap = variant === 'peek' ? snapProp ?? innerSnap : 'full';
  const setSnap = useCallback(
    (s: Exclude<DfSheetSnap, 'closed'>) => {
      setInnerSnap(s);
      onSnapChange?.(s);
    },
    [onSnapChange],
  );
  const mounted = usePresence(open, SHEET_MS);
  const [entered, setEntered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const bodyId = useId();
  const [heights, setHeights] = useState({ panel: 0, peek: 0 });
  const [drag, setDrag] = useState<number | null>(null);
  const dragRef = useRef<{ y0: number; t0: number; base: number; moved: boolean; id: number } | null>(null);
  const handlersRef = useRef<{ move: (e: PointerEvent) => void; end: (e: PointerEvent) => void; cancel: () => void }>({
    move: () => {},
    end: () => {},
    cancel: () => {},
  });

  const expanded = variant === 'modal' || snap !== 'peek';
  const modal = open && expanded;

  useDfScrollLock(modal);
  const collapse = useCallback(() => {
    if (variant === 'peek') setSnap('peek');
    else onClose?.();
  }, [variant, setSnap, onClose]);
  useDfDialogFocus(modal, panelRef, collapse);

  useEffect(() => {
    if (variant === 'peek' && !open) setInnerSnap('peek');
  }, [variant, open]);

  // The expanded bar replaces the peek button, so collapsing hands focus back to the peek bar explicitly.
  const wasExpanded = useRef(expanded);
  useEffect(() => {
    const was = wasExpanded.current;
    wasExpanded.current = expanded;
    if (variant !== 'peek' || !was || expanded || !open) return undefined;
    const f = window.requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!active || active === document.body || panelRef.current?.contains(active)) {
        panelRef.current?.querySelector<HTMLElement>('.df-bsheet__peek')?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(f);
  }, [variant, expanded, open]);

  useLayoutEffect(() => {
    if (!mounted) {
      setEntered(false);
      return undefined;
    }
    if (!open) {
      setEntered(false);
      return undefined;
    }
    const f = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(f);
  }, [mounted, open]);

  useLayoutEffect(() => {
    if (!mounted || !panelRef.current) return undefined;
    const measure = () => {
      setHeights({ panel: panelRef.current?.offsetHeight ?? 0, peek: headRef.current?.offsetHeight ?? 0 });
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) {
      ro.observe(panelRef.current);
      if (headRef.current) ro.observe(headRef.current);
    }
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [mounted, snap]);

  // Half snap only exists when the expanded panel is materially taller than half the viewport.
  const vh = typeof window !== 'undefined' ? window.visualViewport?.height ?? window.innerHeight : 800;
  const halfVisible = Math.round(vh * 0.5);
  const hasHalf = variant === 'peek' && heights.panel > halfVisible + 80;

  const offsetFor = useCallback(
    (s: DfSheetSnap): number => {
      if (s === 'closed') return heights.panel + 24;
      if (s === 'peek') return Math.max(0, heights.panel - heights.peek);
      if (s === 'half') return Math.max(0, heights.panel - halfVisible);
      return 0;
    },
    [heights, halfVisible],
  );

  const restingOffset = !entered ? offsetFor(variant === 'peek' && open ? 'peek' : 'closed') : offsetFor(open ? snap : 'closed');
  const offset = drag ?? restingOffset;

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('[data-sheet-nodrag]')) return;
    dragRef.current = { y0: e.clientY, t0: performance.now(), base: restingOffset, moved: false, id: e.pointerId };
    // The head sits at the viewport edge, so the pointer leaves it almost immediately. Track on window
    // rather than capturing, which would retarget the handle's click to the head.
    const move = (ev: PointerEvent) => handlersRef.current.move(ev);
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      detach();
      handlersRef.current[ev.type === 'pointercancel' ? 'cancel' : 'end'](ev);
    };
    const detach = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };
  const onPointerMove = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = e.clientY - d.y0;
    if (!d.moved && Math.abs(dy) < 6) return;
    d.moved = true;
    const max = variant === 'peek' ? offsetFor('peek') : offsetFor('closed');
    const next = d.base + dy;
    // Resist past the fully-expanded edge instead of rubber-banding the whole sheet.
    setDrag(next < 0 ? next / 4 : Math.min(next, max + 40));
  };
  const endDrag = (e: PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d || !d.moved) {
      setDrag(null);
      return;
    }
    const swallowClick = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
    };
    window.addEventListener('click', swallowClick, { capture: true, once: true });
    window.setTimeout(() => window.removeEventListener('click', swallowClick, { capture: true }), 0);
    const dy = e.clientY - d.y0;
    const v = dy / Math.max(1, performance.now() - d.t0);
    setDrag(null);
    if (variant === 'modal') {
      if (dy > DRAG_COMMIT_PX || v > FLICK_PX_PER_MS) onClose?.();
      return;
    }
    const at = d.base + dy;
    const candidates: Exclude<DfSheetSnap, 'closed'>[] = hasHalf ? ['full', 'half', 'peek'] : ['full', 'peek'];
    let target: Exclude<DfSheetSnap, 'closed'>;
    if (v < -FLICK_PX_PER_MS) target = 'full';
    else if (v > FLICK_PX_PER_MS) target = snap === 'full' && hasHalf && at < offsetFor('half') ? 'half' : 'peek';
    else target = candidates.reduce((best, s) => (Math.abs(offsetFor(s) - at) < Math.abs(offsetFor(best) - at) ? s : best), candidates[0]);
    setSnap(target);
  };
  const cancelDrag = () => {
    dragRef.current = null;
    setDrag(null);
  };
  handlersRef.current = { move: onPointerMove, end: endDrag, cancel: cancelDrag };

  if (!mounted) return null;

  const showBackdrop = expanded && open;
  const sheet = (
    <div
      className={`df-portal df-bsheet df-bsheet--${variant === 'peek' ? 'peekable' : 'modal'}${drag !== null ? ' df-bsheet--dragging' : ''}`}
      data-snap={open ? snap : 'closed'}
    >
      <div
        className={`df-bsheet__backdrop${showBackdrop && entered ? ' df-bsheet__backdrop--on' : ''}`}
        aria-hidden="true"
        onClick={collapse}
      />
      <div
        ref={panelRef}
        className="df-bsheet__panel"
        role={expanded ? 'dialog' : 'region'}
        aria-modal={expanded ? true : undefined}
        aria-labelledby={label ? undefined : titleId}
        aria-label={label}
        tabIndex={-1}
        style={{ transform: `translate3d(0, ${Math.round(offset)}px, 0)` }}
      >
        <div
          ref={headRef}
          className="df-bsheet__head"
          onPointerDown={onPointerDown}
        >
          {variant === 'peek' ? (
            <button
              type="button"
              className="df-bsheet__handle"
              aria-label={expanded ? `COLLAPSE ${title}` : `EXPAND ${title}`}
              aria-expanded={expanded}
              aria-controls={bodyId}
              onClick={() => setSnap(expanded ? 'peek' : 'full')}
            >
              <span aria-hidden="true" />
            </button>
          ) : (
            <span className="df-bsheet__handle df-bsheet__handle--static" aria-hidden="true">
              <span />
            </span>
          )}
          {variant === 'peek' && !expanded ? (
            <button
              type="button"
              className="df-bsheet__peek"
              aria-expanded={false}
              aria-controls={bodyId}
              onClick={() => setSnap('full')}
            >
              <span className="df-bsheet__peek-text">
                <span className="df-bsheet__title" id={titleId}>
                  {title}
                </span>
                {summary && <span className="df-bsheet__summary">{summary}</span>}
              </span>
              <svg className="df-bsheet__chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="m6 15 6-6 6 6" />
              </svg>
            </button>
          ) : (
            <div className="df-bsheet__bar">
              <h2 className="df-bsheet__title df-bsheet__title--rule" id={titleId}>
                {title}
              </h2>
              <button type="button" className="df-bsheet__close" aria-label={variant === 'peek' ? `COLLAPSE ${title}` : 'CLOSE'} onClick={collapse} data-sheet-nodrag>
                <DfIcon name="close" />
              </button>
            </div>
          )}
        </div>
        <div ref={bodyRef} id={bodyId} className="df-bsheet__body" hidden={!expanded} aria-hidden={!expanded || undefined}>
          {children}
        </div>
        {footer && expanded && <div className="df-bsheet__foot">{footer}</div>}
      </div>
    </div>
  );
  return portal(sheet);
}

/** Interactive sheet row: icon · title · description · chevron (reference anatomy). */
export function DfSheetRow({
  icon,
  title,
  description,
  tag,
  expanded,
  onToggle,
  children,
}: {
  icon: DfIconName;
  title: string;
  description: string;
  tag?: string;
  expanded?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
}) {
  const detailId = useId();
  const inner = (
    <>
      <DfIcon name={icon} className="df-srow__icon" />
      <span className="df-srow__text">
        <span className="df-srow__title">{title}</span>
        <span className="df-srow__desc">{description}</span>
      </span>
      {onToggle && (
        <svg className={`df-srow__chev${expanded ? ' df-srow__chev--open' : ''}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m9 6 6 6-6 6" />
        </svg>
      )}
    </>
  );
  return (
    <li className={`df-srow${expanded ? ' df-srow--open' : ''}`}>
      {onToggle ? (
        <button type="button" className="df-srow__main" aria-expanded={expanded} aria-controls={detailId} onClick={onToggle}>
          {inner}
        </button>
      ) : (
        <div className="df-srow__main">{inner}</div>
      )}
      {onToggle && (
        <div className="df-srow__detail" id={detailId} hidden={!expanded}>
          {tag && <span className="df-srow__tag">{tag}</span>}
          {children}
        </div>
      )}
    </li>
  );
}

// ─── DF MODAL (U08) ────────────────────────────────────────────────────────────────────────────

export type DfModalTone = 'info' | 'confirm' | 'success' | 'warning' | 'error' | 'destructive' | 'payment' | 'approval';

const MODAL_ICON: Record<DfModalTone, 'check' | 'alert' | 'info' | 'clock' | 'question'> = {
  info: 'info',
  confirm: 'question',
  success: 'check',
  warning: 'alert',
  error: 'alert',
  destructive: 'alert',
  payment: 'clock',
  approval: 'question',
};

function StatusGlyph({ kind }: { kind: 'check' | 'alert' | 'info' | 'clock' | 'question' }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="21" />
      {kind === 'check' && <path d="m14.5 24.5 6.5 6.5 13-13.5" />}
      {kind === 'alert' && <path d="M24 13.5v13M24 32.5v1" />}
      {kind === 'info' && <path d="M24 21v13M24 14.5v1" />}
      {kind === 'clock' && <path d="M24 14v10.5l7 4" />}
      {kind === 'question' && <path d="M18.8 19a5.4 5.4 0 0 1 10.5 1.7c0 3.6-5.3 4.6-5.3 8.3M24 34v1" />}
    </svg>
  );
}

export function DfModal({
  open,
  onClose,
  tone = 'info',
  title,
  children,
  primary,
  secondary,
  busy,
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  tone?: DfModalTone;
  title: string;
  children?: ReactNode;
  primary?: { label: string; onClick: () => void; busyLabel?: string; arrow?: boolean };
  secondary?: { label: string; onClick: () => void };
  /** While true the modal cannot be dismissed and actions are locked (async confirmation). */
  busy?: boolean;
  /** Backdrop/Escape dismissal; disable when closing would discard critical unsubmitted work. */
  dismissible?: boolean;
}) {
  const mounted = usePresence(open, 180);
  const [entered, setEntered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const bodyId = useId();
  const canDismiss = dismissible && !busy;
  useDfScrollLock(open);
  useDfDialogFocus(open, panelRef, canDismiss ? onClose : null);
  useLayoutEffect(() => {
    if (!open || !mounted) {
      setEntered(false);
      return undefined;
    }
    const f = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(f);
  }, [open, mounted]);
  if (!mounted) return null;
  const alertish = tone === 'error' || tone === 'destructive' || tone === 'warning';
  return portal(
    <div className={`df-portal df-modal df-modal--${tone}${entered ? ' df-modal--on' : ''}`}>
      <div className="df-modal__backdrop" aria-hidden="true" onClick={canDismiss ? onClose : undefined} />
      <div
        ref={panelRef}
        className="df-modal__panel"
        role={alertish ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={children ? bodyId : undefined}
        aria-busy={busy || undefined}
        tabIndex={-1}
      >
        <button type="button" className="df-modal__close" aria-label="CLOSE" onClick={onClose} disabled={!canDismiss}>
          <DfIcon name="close" />
        </button>
        <span className={`df-modal__glyph df-modal__glyph--${tone}`}>
          <StatusGlyph kind={MODAL_ICON[tone]} />
        </span>
        <h2 className="df-modal__title" id={titleId}>
          {title}
        </h2>
        {children && (
          <div className="df-modal__body" id={bodyId}>
            {children}
          </div>
        )}
        {(primary || secondary) && (
          <div className="df-modal__actions">
            {primary && (
              <DfButton
                label={primary.label}
                onClick={primary.onClick}
                busy={busy}
                busyLabel={primary.busyLabel}
                arrow={primary.arrow ?? tone !== 'destructive'}
                action="modal-primary"
              />
            )}
            {secondary && <DfButton label={secondary.label} tone="secondary" onClick={secondary.onClick} disabled={busy} action="modal-secondary" />}
          </div>
        )}
      </div>
    </div>,
  );
}

// ─── DF POPOVER + TOOLTIP (U09, U10) ───────────────────────────────────────────────────────────

type Placement = { top: number; left: number; side: 'top' | 'bottom'; arrow: number };

function useAnchoredPosition(open: boolean, trigger: React.RefObject<HTMLElement>, panel: React.RefObject<HTMLElement>, prefer: 'top' | 'bottom') {
  const [pos, setPos] = useState<Placement | null>(null);
  const compute = useCallback(() => {
    const t = trigger.current;
    const p = panel.current;
    if (!t || !p) return;
    const r = t.getBoundingClientRect();
    const w = p.offsetWidth;
    const h = p.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const gap = 10;
    const margin = 12;
    const fitsTop = r.top - h - gap > margin;
    const fitsBottom = r.bottom + h + gap < vh - margin;
    const side = prefer === 'top' ? (fitsTop || !fitsBottom ? 'top' : 'bottom') : fitsBottom || !fitsTop ? 'bottom' : 'top';
    const center = r.left + r.width / 2;
    const left = Math.min(Math.max(center - w / 2, margin), vw - w - margin);
    const top = side === 'top' ? r.top - h - gap : r.bottom + gap;
    setPos({ top, left, side, arrow: Math.min(Math.max(center - left, 14), w - 14) });
  }, [trigger, panel, prefer]);
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return undefined;
    }
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [open, compute]);
  return pos;
}

function Floating({
  open,
  triggerRef,
  prefer,
  className,
  id,
  role,
  children,
  onDismiss,
}: {
  open: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  prefer: 'top' | 'bottom';
  className: string;
  id: string;
  role: 'tooltip' | 'dialog';
  children: ReactNode;
  onDismiss: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pos = useAnchoredPosition(open, triggerRef, panelRef, prefer);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      onDismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onDismiss();
        triggerRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open, onDismiss, triggerRef]);
  if (!open) return null;
  return portal(
    <div
      ref={panelRef}
      id={id}
      role={role}
      className={`df-portal ${className} ${className}--${pos?.side ?? prefer}`}
      style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, ['--df-arrow-x' as string]: `${pos?.arrow ?? 0}px` }}
    >
      {children}
    </div>,
  );
}

/** Dark contextual tooltip for short help. Works on hover, keyboard focus and tap. Never the only home of pricing/legal copy. */
export function DfTooltip({ label, content, prefer = 'top' }: { label: string; content: string; prefer?: 'top' | 'bottom' }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pointer = useRef<string | null>(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  return (
    <span className="df-tip">
      <button
        ref={triggerRef}
        type="button"
        className="df-tip__trigger"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onPointerDown={(e) => {
          pointer.current = e.pointerType;
        }}
        onClick={() => {
          // Mouse already opened it on hover; touch toggles; keyboard activation toggles too.
          if (pointer.current === 'mouse') setOpen(true);
          else setOpen((o) => !o);
          pointer.current = null;
        }}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
        onFocus={() => {
          if (!pointer.current) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6M12 7.5v.5" />
        </svg>
      </button>
      <Floating open={open} triggerRef={triggerRef} prefer={prefer} className="df-tooltip" id={id} role="tooltip" onDismiss={close}>
        {content}
      </Floating>
    </span>
  );
}

/** Light contextual popover for explanations that need a little more room than a tooltip. */
export function DfPopover({
  triggerLabel,
  title,
  children,
  prefer = 'bottom',
}: {
  triggerLabel: string;
  title: string;
  children: ReactNode;
  prefer?: 'top' | 'bottom';
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="df-pop__trigger"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      >
        {triggerLabel}
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6M12 7.5v.5" />
        </svg>
      </button>
      <Floating open={open} triggerRef={triggerRef} prefer={prefer} className="df-popover" id={id} role="dialog" onDismiss={close}>
        <span className="df-popover__head">
          <span className="df-popover__title">{title}</span>
          <button type="button" className="df-popover__close" aria-label="CLOSE" onClick={close}>
            <DfIcon name="close" />
          </button>
        </span>
        <div className="df-popover__body">{children}</div>
      </Floating>
    </>
  );
}

// ─── DF TOAST (U11) ────────────────────────────────────────────────────────────────────────────

export type DfToastTone = 'success' | 'error' | 'warning' | 'info';
export type DfToastInput = { tone: DfToastTone; message: string; key?: string; persistent?: boolean };
type ToastItem = DfToastInput & { id: number; key: string };

type ToastApi = { push: (t: DfToastInput) => void; dismiss: (key: string) => void };
const ToastContext = createContext<ToastApi | null>(null);
const TOAST_MAX = 3;
const TOAST_MS: Record<DfToastTone, number> = { success: 4000, info: 5000, warning: 6000, error: 0 };

/** Toast region. Errors persist until dismissed or resolved; a repeated `key` replaces rather than stacks. */
export function DfToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((key: string) => {
    const t = timers.current.get(key);
    if (t) window.clearTimeout(t);
    timers.current.delete(key);
    setItems((list) => list.filter((i) => i.key !== key));
  }, []);

  const push = useCallback(
    (input: DfToastInput) => {
      seq.current += 1;
      const key = input.key ?? `${input.tone}:${input.message}`;
      const item: ToastItem = { ...input, id: seq.current, key };
      setItems((list) => [item, ...list.filter((i) => i.key !== key)].slice(0, TOAST_MAX));
      const prev = timers.current.get(key);
      if (prev) window.clearTimeout(prev);
      timers.current.delete(key);
      const ms = input.persistent ? 0 : TOAST_MS[input.tone];
      if (ms) timers.current.set(key, window.setTimeout(() => dismiss(key), ms));
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current.clear();
    },
    [],
  );

  const api = useMemo(() => ({ push, dismiss }), [push, dismiss]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      {portal(
        <div className="df-portal df-toasts" aria-label="NOTIFICATIONS">
          <div className="df-toasts__polite" aria-live="polite" aria-atomic="false">
            {items.filter((i) => i.tone !== 'error').map((i) => (
              <DfToast key={i.id} item={i} onDismiss={() => dismiss(i.key)} />
            ))}
          </div>
          <div className="df-toasts__assertive" aria-live="assertive" aria-atomic="false">
            {items.filter((i) => i.tone === 'error').map((i) => (
              <DfToast key={i.id} item={i} onDismiss={() => dismiss(i.key)} />
            ))}
          </div>
        </div>,
      )}
    </ToastContext.Provider>
  );
}

function ToastGlyph({ tone }: { tone: DfToastTone }) {
  if (tone === 'error') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="df-toast__glyph df-toast__glyph--solid">
        <path d="M12 3.2 2.4 20h19.2L12 3.2Z" />
        <path className="df-toast__glyph-mark" d="M12 10v4.6M12 17v.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="df-toast__glyph">
      <circle cx="12" cy="12" r="9" />
      {tone === 'success' && <path d="m8 12.3 2.8 2.8L16.2 9.6" />}
      {tone === 'warning' && <path d="M12 7.5v5.5M12 16v.4" />}
      {tone === 'info' && <path d="M12 11v5.5M12 7.8v.4" />}
    </svg>
  );
}

export function DfToast({ item, onDismiss }: { item: Pick<ToastItem, 'tone' | 'message'>; onDismiss?: () => void }) {
  return (
    <div className={`df-toast df-toast--${item.tone}`} role={item.tone === 'error' ? 'alert' : 'status'}>
      <ToastGlyph tone={item.tone} />
      <p className="df-toast__msg">{item.message}</p>
      {onDismiss && (
        <button type="button" className="df-toast__close" aria-label="DISMISS" onClick={onDismiss}>
          <DfIcon name="close" />
        </button>
      )}
    </div>
  );
}

/** No-op outside a provider so components stay renderable in isolation (tests, gallery). */
export function useDfToasts(): ToastApi {
  return useContext(ToastContext) ?? NOOP_TOASTS;
}
const NOOP_TOASTS: ToastApi = { push: () => undefined, dismiss: () => undefined };

// ─── DF PROGRESS (U12) ─────────────────────────────────────────────────────────────────────────

export type DfProgressState = 'complete' | 'current' | 'future' | 'locked';
export type DfProgressStep = { index: string; label: string; state: DfProgressState };

export function DfProgress({ steps, label = 'FOUNDATION PROGRESS' }: { steps: DfProgressStep[]; label?: string }) {
  return (
    <ol className="df-progress" aria-label={label}>
      {steps.map((s) => (
        <li key={s.index} className={`df-progress__step df-progress__step--${s.state}`} aria-current={s.state === 'current' ? 'step' : undefined}>
          <span className="df-progress__node" aria-hidden="true">
            {s.index}
          </span>
          <span className="df-progress__label">{s.label}</span>
          <span className="df-visually-hidden">
            {s.state === 'complete' ? ', COMPLETE' : s.state === 'current' ? ', CURRENT STEP' : s.state === 'locked' ? ', LOCKED' : ', UPCOMING'}
          </span>
        </li>
      ))}
    </ol>
  );
}

// ─── DF EMPTY + LOADING STATES (U13, U14) ──────────────────────────────────────────────────────

export function DfEmptyState({
  icon = 'document',
  title,
  body,
  action,
}: {
  icon?: DfIconName;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="df-empty" role="status">
      <DfIcon name={icon} className="df-empty__icon" />
      <p className="df-empty__title">{title}</p>
      {body && <p className="df-empty__body">{body}</p>}
      {action && <div className="df-empty__action">{action}</div>}
    </div>
  );
}

export function DfLoadingState({ label = 'LOADING…', block }: { label?: string; block?: boolean }) {
  return (
    <div className={`df-loading${block ? ' df-loading--block' : ''}`} role="status" aria-live="polite">
      <DfSpinner size="md" />
      <span className="df-loading__label">{label}</span>
    </div>
  );
}
