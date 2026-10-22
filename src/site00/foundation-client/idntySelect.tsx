/**
 * IDNTY responsive single-choice selector (Phase 2 — FD-1).
 * Coarse narrow viewports: editorial selection sheet. Otherwise: anchored DfSelect listbox.
 */
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { BUSINESS_TYPES } from './model';
import {
  DfSelect,
  type DfSelectOption,
  dfPrefersReducedMotion,
  useDfDialogFocus,
  useDfScrollLock,
} from './components';

const SHEET_MS = 240;

export function dfCustomIndustrySelectEnabled(): boolean {
  const flag = import.meta.env.VITE_DF_CUSTOM_INDUSTRY_SELECT;
  if (flag === '0' || flag === 'false') return false;
  if (flag === '1' || flag === 'true') return true;
  return import.meta.env.DEV;
}

/** Exact enum preservation + legacy row when stored value is not in BUSINESS_TYPES. */
export function businessTypeSelectOptions(storedIndustry: string): DfSelectOption[] {
  const base = BUSINESS_TYPES.map((t) => ({ value: t, label: t }));
  const trimmed = storedIndustry.trim();
  if (trimmed && !BUSINESS_TYPES.includes(trimmed as (typeof BUSINESS_TYPES)[number])) {
    return [{ value: trimmed, label: `${trimmed.toUpperCase()} · ON FILE · NOT IN THE LIST` }, ...base];
  }
  return base;
}

function useIdntySelectPresentation(): 'sheet' | 'listbox' {
  const [mode, setMode] = useState<'sheet' | 'listbox'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse) and (max-width: 600px)').matches ? 'sheet' : 'listbox',
  );
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse) and (max-width: 600px)');
    const apply = () => setMode(mq.matches ? 'sheet' : 'listbox');
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return mode;
}

function useSheetPresence(open: boolean): boolean {
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
    const t = window.setTimeout(() => setMounted(false), SHEET_MS);
    return () => window.clearTimeout(t);
  }, [open]);
  return mounted;
}

function IdntySelectionSheet({
  open,
  title,
  value,
  options,
  onClose,
  onPick,
}: {
  open: boolean;
  title: string;
  value: string;
  options: DfSelectOption[];
  onClose: () => void;
  onPick: (value: string) => void;
}) {
  const mounted = useSheetPresence(open);
  const [entered, setEntered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const titleId = useId();
  const listId = useId();
  useDfScrollLock(open);
  useDfDialogFocus(open, panelRef, onClose);

  useLayoutEffect(() => {
    if (!open || !mounted) {
      setEntered(false);
      return undefined;
    }
    const f = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(f);
  }, [open, mounted]);

  if (!mounted) return null;

  const sheet = (
    <div className={`df-portal idnty-sel-sheet${entered ? ' idnty-sel-sheet--on' : ''}`}>
      <button type="button" className="idnty-sel-sheet__backdrop" aria-hidden="true" tabIndex={-1} onClick={onClose} />
      <div
        ref={panelRef}
        className="idnty-sel-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="idnty-sel-sheet__head">
          <h2 className="idnty-sel-sheet__title" id={titleId}>
            {title}
          </h2>
          <button type="button" className="idnty-sel-sheet__cancel" onClick={onClose}>
            CANCEL
          </button>
        </header>
        <ul ref={listRef} id={listId} className="idnty-sel-sheet__list" role="listbox" aria-labelledby={titleId}>
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <li key={o.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={o.disabled}
                  className={`idnty-sel-sheet__option${selected ? ' idnty-sel-sheet__option--selected' : ''}`}
                  onClick={() => {
                    if (o.disabled) return;
                    onPick(o.value);
                  }}
                >
                  <span className="idnty-sel-sheet__option-label">{o.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
  return createPortal(sheet, document.body);
}

export type IdntySelectProps = {
  id: string;
  value: string;
  options: DfSelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  labelledBy?: string;
  sheetTitle?: string;
  readOnly?: boolean;
  /** Test / story override; defaults to responsive detection. */
  presentation?: 'sheet' | 'listbox';
};

export function IdntySelect({
  id,
  value,
  options,
  placeholder,
  onChange,
  disabled,
  invalid,
  describedBy,
  labelledBy,
  sheetTitle = 'SELECT BUSINESS TYPE',
  readOnly,
  presentation: presentationOverride,
}: IdntySelectProps) {
  const detected = useIdntySelectPresentation();
  const presentation = presentationOverride ?? detected;
  const [sheetOpen, setSheetOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }, []);

  useEffect(() => {
    if (!sheetOpen) return undefined;
    const mq = window.matchMedia('(pointer: coarse) and (max-width: 600px)');
    const onChangeMode = () => {
      if (!mq.matches) closeSheet();
    };
    mq.addEventListener('change', onChangeMode);
    return () => mq.removeEventListener('change', onChangeMode);
  }, [sheetOpen, closeSheet]);

  const openSheet = () => {
    if (disabled || readOnly) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== triggerRef.current) active.blur();
    setSheetOpen(true);
  };

  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled || readOnly) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      openSheet();
    }
  };

  if (presentation === 'listbox') {
    return (
      <DfSelect
        id={id}
        value={value}
        options={options}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled || readOnly}
        invalid={invalid}
        describedBy={describedBy}
        labelledBy={labelledBy}
      />
    );
  }

  return (
    <>
      <div className={`df-select idnty-select${selected ? '' : ' df-select--empty'}${invalid ? ' df-select--invalid' : ''}`}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          className="df-select__trigger"
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          aria-labelledby={labelledBy}
          disabled={disabled || readOnly}
          onClick={openSheet}
          onKeyDown={onTriggerKeyDown}
        >
          <span className="df-select__value">{selected ? selected.label : placeholder}</span>
          <svg className="df-select__chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      <IdntySelectionSheet
        open={sheetOpen}
        title={sheetTitle}
        value={value}
        options={options}
        onClose={closeSheet}
        onPick={(v) => {
          onChange(v);
          setSheetOpen(false);
          window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
        }}
      />
    </>
  );
}
