/**
 * Founder production shells (P0.JURNL.GLOBAL-EIGHT-OVERLAYS) — the behaviour host for an overlay drawn on one of the
 * eight installed inner shells (OV01–OV08, runtime/global/overlays/eight/registry.ts).
 *
 * The shell is one integrated composition plate (paper, sculpture, foliage, seals, coast). It is drawn at ONE uniform
 * contain scale inside the runtime's overlay host — the plate has the shell's exact 9:16 ratio, so nothing is cropped,
 * recentred or stretched — and every live label, value and control is placed on the shell's own blank wells and folios
 * by fractions of the shell (`ShellBox`), so it stays on them at every size. Decorative pixels are the shell's; no second
 * sculpture, foliage, medal or scene is layered over it. Type scales with the plate (container units) within bounds.
 *
 * Behaviour is the editorial host's: portal into the overlay layer, one scrim (optionally a blur of the live page),
 * dialog semantics, focus trap / Escape / focus return (useStableFocus), live square-rounded close at the top end.
 */
import { useId, type CSSProperties, type ReactNode } from 'react';
import { OverlayLayer } from '../../components/primitives';
import { useOverlayHost } from '../../components/OverlayAuthority';
import { overlayShell, type OverlayAssetId } from '../../global/overlays/eight/registry';
import { useStableFocus } from '../v3/V3Surfaces';
import './jurnl-shell-overlays.css';

/** A region of the shell as fractions of its width and height: [x0, y0, x1, y1]. */
export type ShellBox = readonly [number, number, number, number];
export const SHELL_W = 2016;
export const SHELL_H = 3584;

export function slot(b: ShellBox, extra?: CSSProperties): CSSProperties {
  return { position: 'absolute', left: `${b[0] * 100}%`, top: `${b[1] * 100}%`, width: `${(b[2] - b[0]) * 100}%`, height: `${(b[3] - b[1]) * 100}%`, ...extra };
}

/** The plate: the shell at one uniform contain scale in the host (optionally limited to a share of the host width). */
export function useShellPlate(widthShare = 1) {
  const { host, ref } = useOverlayHost();
  const k = Math.min((host.W * widthShare) / SHELL_W, host.H / SHELL_H);
  return { ref, k, w: Math.round(SHELL_W * k), h: Math.round(SHELL_H * k) };
}

export function ShellOverlay({
  testId,
  shell,
  composition,
  title,
  script,
  head,
  onClose,
  children,
  closeLabel = 'CLOSE',
  blur = false,
  widthShare = 1,
  role = 'dialog',
  ariaLabel,
  dialogTestId,
  headTone = 'ink',
  close = true,
  titleSize,
  headNote,
}: {
  testId: string;
  shell: OverlayAssetId;
  /** the editorial composition this overlay belongs to (kept on the host as `data-jed`) */
  composition?: string;
  title: ReactNode;
  script?: string;
  head: ShellBox;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
  /** blur the live page behind (OV04: the shell's outside is transparent) */
  blur?: boolean;
  widthShare?: number;
  role?: 'dialog' | 'alertdialog';
  ariaLabel?: string;
  dialogTestId?: string;
  headTone?: 'ink' | 'cream';
  close?: boolean;
  /** title size in container width units when the head paper is narrow (default 7.2cqw) */
  titleSize?: number;
  /** one short uppercase line under the script on the headline paper */
  headNote?: string;
}) {
  const { ref: focusRef } = useStableFocus(onClose);
  const { ref: hostRef, w, h } = useShellPlate(widthShare);
  const id = useId();
  const art = overlayShell(shell);
  return (
    <OverlayLayer>
      <div ref={hostRef} className="jsh-host" data-jrn-overlay={testId} data-jed={composition} data-shell={shell} data-overlay-asset={shell}>
        <div className="jsh-scrim" data-blur={blur ? 'true' : undefined} onClick={onClose} aria-hidden />
        <div
          ref={focusRef}
          role={role}
          aria-modal="true"
          aria-labelledby={ariaLabel ? undefined : id}
          aria-label={ariaLabel}
          className="jsh-plate"
          data-testid={dialogTestId ?? `${testId}-folio`}
          style={{ width: w, height: h }}
        >
          <img className="jsh-shell" src={art.src} width={art.width} height={art.height} alt="" aria-hidden draggable={false} data-asset-id={shell} />
          <div className="jsh-head" data-tone={headTone} style={slot(head, titleSize ? ({ '--jsh-title-size': `${titleSize}cqw` } as CSSProperties) : undefined)}>
            <h2 className="jsh-head__title" id={id}>
              {title}
            </h2>
            {script ? <p className="jed-script jsh-head__script">{script.toLowerCase()}</p> : null}
            {headNote ? <p className="jsh-text jsh-head__note">{headNote}</p> : null}
          </div>
          {children}
          {close ? (
            <button type="button" className="jsh-close" data-jrn-trigger={`${testId}-close`} aria-label={closeLabel} onClick={onClose}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </OverlayLayer>
  );
}

/** A live region on the shell. */
export function ShellSlot({ box, className = '', children, testId, scroll = false, style, role, ariaLabel }: { box: ShellBox; className?: string; children: ReactNode; testId?: string; scroll?: boolean; style?: CSSProperties; role?: string; ariaLabel?: string }) {
  return (
    <div className={`jsh-slot ${className}`} data-scroll={scroll ? 'true' : undefined} data-testid={testId} role={role} aria-label={ariaLabel} style={slot(box, style)}>
      {children}
    </div>
  );
}

/**
 * A live control on one of the shell's blank folios / strips: the shell draws the surface, this draws the words. `tone`
 * is the surface the shell has there (parchment → ink, dark olive → cream, salmon → oxblood).
 */
export function ShellAction({ box, trigger, title, note, onClick, disabled, tone = 'paper', ariaLabel, className = '', role, children, align = 'start' }: {
  box: ShellBox;
  trigger: string;
  title: ReactNode;
  note?: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'paper' | 'dark' | 'salmon';
  ariaLabel?: string;
  className?: string;
  role?: string;
  children?: ReactNode;
  align?: 'start' | 'center';
}) {
  return (
    <button type="button" role={role} className={`jsh-action ${className}`} data-tone={tone} data-align={align} data-jrn-trigger={trigger} disabled={disabled} aria-label={ariaLabel} onClick={onClick} style={slot(box)}>
      <span className="jsh-action__title">{title}</span>
      {note ? <span className="jed-script jsh-action__note">{note.toLowerCase()}</span> : null}
      {children}
    </button>
  );
}

/** A live text field on one of the shell's blank wells: the label inside the well, the value typed after it. */
export function ShellField({ box, label, value, onValue, trigger, inputMode, placeholder, invalid, prefix, suffix, own }: {
  box: ShellBox;
  label: string;
  value: string;
  onValue: (v: string) => void;
  trigger: string;
  inputMode?: 'text' | 'decimal' | 'numeric';
  placeholder?: string;
  invalid?: boolean;
  prefix?: string;
  suffix?: string;
  /** the shell has no well here: draw the field's own well */
  own?: boolean;
}) {
  const id = useId();
  return (
    <div className="jsh-field" data-own={own ? 'true' : undefined} data-invalid={invalid ? 'true' : undefined} style={slot(box)}>
      <label className="jsh-field__label" htmlFor={id}>
        {label}
      </label>
      {prefix ? <span className="jsh-field__mark" aria-hidden>{prefix}</span> : null}
      <input id={id} className="jsh-field__input" value={value} onChange={(e) => onValue(e.target.value)} data-jrn-trigger={trigger} inputMode={inputMode} autoComplete="off" placeholder={placeholder} aria-invalid={invalid ? true : undefined} />
      {suffix ? <span className="jsh-field__mark" aria-hidden>{suffix}</span> : null}
    </div>
  );
}

/**
 * A pocket on one of the shell's FROM / TO wells: the direction, the chosen pocket and its figure on the well's paper
 * (right of the shell's illustrated inset), and the pocket choices under it. Triggers follow AccountChips
 * (`${trigger}-${account_id}`), so every journey still selects by id.
 */
export function ShellPocketWell({ box, dir, accountId, options, figure, onChange, trigger }: {
  box: ShellBox;
  dir: 'FROM' | 'TO';
  accountId: string | null;
  options: { account_id: string; display_name: string }[];
  figure: (a: never) => string;
  onChange: (id: string) => void;
  trigger: string;
}) {
  const sel = options.find((a) => a.account_id === accountId) ?? null;
  const fig = figure as unknown as (a: { account_id: string; display_name: string }) => string;
  return (
    <section className="jsh-well" aria-label={dir} style={slot(box)}>
      <div className="jsh-well__sel" data-testid={`${trigger}-selected`}>
        <span className="jsh-well__dir">{dir}</span>
        <span className="jsh-well__name">{sel ? sel.display_name : options.length ? 'CHOOSE A POCKET' : 'NO MATCHING POCKET YET'}</span>
        {sel ? <span className="jsh-well__fig">{fig(sel)}</span> : null}
      </div>
      <div className="jsh-well__strip" role="group" aria-label={`${dir} POCKET`}>
        {options.map((a) => (
          <button key={a.account_id} type="button" className="jsh-chip" aria-pressed={a.account_id === accountId} data-jrn-trigger={`${trigger}-${a.account_id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} onClick={() => onChange(a.account_id)}>
            {a.display_name}
          </button>
        ))}
      </div>
    </section>
  );
}
