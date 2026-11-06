/**
 * Curated clean artwork hosts (P0.JURNL.GLOBAL-OVERLAYS.CLEAN-ARTWORK-CURATED-MOUNT-AND-CHILD-ENVIRONMENT-CONVERGENCE) — the
 * behaviour host for an overlay drawn on one curated art piece (runtime/global/overlays/clean/registry.ts): the OV05 open
 * search composition, and the shared OV08 menu environment under SAFE TO SPEND BUFFER and PRIVACY & CONSENTS.
 *
 * The art (L0 environment / L1 composition) is drawn at ONE uniform contain scale inside the runtime's overlay host — the
 * plate has the art's exact aspect ratio, so nothing is cropped, recentred or stretched. The art carries no UI: every
 * label, value, field, row, separator and control (L2) is live and lays itself out inside the art's open regions
 * (`ShellBox`, fractions of the art), growing with its content and scrolling only inside its own region. Independent
 * papers (L1 backings) travel with their own controls. Type scales with the plate (container units) within bounds.
 *
 * Behaviour is the editorial host's: portal into the overlay layer, one scrim (optionally a blur of the live page),
 * dialog semantics, focus trap / Escape / focus return (useStableFocus), live square-rounded close at the top end.
 */
import { useId, type CSSProperties, type ReactNode } from 'react';
import { OverlayLayer } from '../../components/primitives';
import { useOverlayHost } from '../../components/OverlayAuthority';
import { cleanArt, type CleanArtId } from '../../global/overlays/clean/registry';
import { useStableFocus } from '../v3/V3Surfaces';
import './jurnl-shell-overlays.css';

/**
 * Measured crop lines of the regenerated candidates (scripts/jurnl/global-menu/measure_shell_borders.py): a thin white
 * border left by cropping a generated board is not art, so it is clipped away; nothing is repainted.
 */
const SHELL_CROP: Partial<Record<CleanArtId, string>> = {
  OV05_SEARCH_SHELL: 'inset(0% 0.344% 0% 1.377%)',
};

/** A region of the shell as fractions of its width and height: [x0, y0, x1, y1]. */
export type ShellBox = readonly [number, number, number, number];
export const SHELL_W = 2016;
export const SHELL_H = 3584;

export function slot(b: ShellBox, extra?: CSSProperties): CSSProperties {
  return { position: 'absolute', left: `${b[0] * 100}%`, top: `${b[1] * 100}%`, width: `${(b[2] - b[0]) * 100}%`, height: `${(b[3] - b[1]) * 100}%`, ...extra };
}

/** The plate: the shell at one uniform contain scale in the host (optionally limited to a share of the host width). */
export function useShellPlate(widthShare = 1, artW = SHELL_W, artH = SHELL_H) {
  const { host, ref } = useOverlayHost();
  const k = Math.min((host.W * widthShare) / artW, host.H / artH);
  return { ref, k, w: Math.round(artW * k), h: Math.round(artH * k) };
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
  tag,
  ornament = false,
}: {
  testId: string;
  /** the curated clean art the overlay is drawn on (clean/registry.ts) */
  shell: CleanArtId;
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
  /** the art's blank tag paper: the live JURNL wordmark sits on it */
  tag?: ShellBox;
  /** the small live laurel ornament between two rules under the script (the founder authority's) */
  ornament?: boolean;
}) {
  const { ref: focusRef } = useStableFocus(onClose);
  const art = cleanArt(shell);
  const { ref: hostRef, w, h } = useShellPlate(widthShare, art.width, art.height);
  const id = useId();
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
          <img className="jsh-shell" src={art.src} width={art.width} height={art.height} alt="" aria-hidden draggable={false} data-asset-id={shell} style={SHELL_CROP[shell] ? { clipPath: SHELL_CROP[shell] } : undefined} />
          <div className="jsh-head" data-tone={headTone} style={slot(head, titleSize ? ({ '--jsh-title-size': `${titleSize}cqw` } as CSSProperties) : undefined)}>
            <h2 className="jsh-head__title" id={id}>
              {title}
            </h2>
            {script ? <p className="jed-script jsh-head__script">{script.toLowerCase()}</p> : null}
            {headNote ? <p className="jsh-text jsh-head__note">{headNote}</p> : null}
            {ornament ? <ShellOrnament /> : null}
          </div>
          {tag ? (
            <span className="jsh-tag" aria-hidden style={slot(tag)}>
              JURNL
            </span>
          ) : null}
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

/** The live laurel ornament: two hairline rules and the authority's V-shaped laurel sprig (drawn, not an image; it scales with the plate). */
export function ShellOrnament() {
  return (
    <span className="jsh-ornament" aria-hidden>
      <svg viewBox="8 2 24 20.5" aria-hidden>
        <path d="M20 21.2C18.4 17.2 15.6 11.6 11.4 5.6M20 21.2C21.6 17.2 24.4 11.6 28.6 5.6" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
        <g fill="currentColor">
          <path transform="translate(17.9 18.2) rotate(-62)" d="M0 0C1.5-1.1 1.7-3.3 0-5.4-1.7-3.3-1.5-1.1 0 0z" />
          <path transform="translate(16.2 15.1) rotate(-20)" d="M0 0C1.5-1.1 1.7-3.3 0-5.4-1.7-3.3-1.5-1.1 0 0z" />
          <path transform="translate(14.4 12.4) rotate(-66)" d="M0 0C1.5-1.1 1.7-3.3 0-5.4-1.7-3.3-1.5-1.1 0 0z" />
          <path transform="translate(12.9 9.4) rotate(-24)" d="M0 0C1.5-1.1 1.7-3.3 0-5.4-1.7-3.3-1.5-1.1 0 0z" />
          <path transform="translate(11.6 6.3) rotate(-48)" d="M0 0C1.5-1.1 1.7-3.3 0-5.4-1.7-3.3-1.5-1.1 0 0z" />
          <path transform="translate(22.1 18.2) rotate(62)" d="M0 0C1.5-1.1 1.7-3.3 0-5.4-1.7-3.3-1.5-1.1 0 0z" />
          <path transform="translate(23.8 15.1) rotate(20)" d="M0 0C1.5-1.1 1.7-3.3 0-5.4-1.7-3.3-1.5-1.1 0 0z" />
          <path transform="translate(25.6 12.4) rotate(66)" d="M0 0C1.5-1.1 1.7-3.3 0-5.4-1.7-3.3-1.5-1.1 0 0z" />
          <path transform="translate(27.1 9.4) rotate(24)" d="M0 0C1.5-1.1 1.7-3.3 0-5.4-1.7-3.3-1.5-1.1 0 0z" />
          <path transform="translate(28.4 6.3) rotate(48)" d="M0 0C1.5-1.1 1.7-3.3 0-5.4-1.7-3.3-1.5-1.1 0 0z" />
        </g>
      </svg>
    </span>
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
