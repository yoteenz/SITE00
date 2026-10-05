import type { ReactNode, SVGProps } from 'react';

/** NDXBOOK glyphs — stroke icons, currentColor. */
type IconProps = SVGProps<SVGSVGElement>;
const base = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'square' as const, 'aria-hidden': true };

export const IconArrow = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);
export const IconBack = (p: IconProps) => (
  <svg {...base} {...p}><path d="M20 12H5M11 6l-6 6 6 6" /></svg>
);
export const IconChevron = (p: IconProps) => (
  <svg {...base} {...p}><path d="M9 5l7 7-7 7" /></svg>
);
export const IconClose = (p: IconProps) => (
  <svg {...base} {...p}><path d="M5 5l14 14M19 5L5 19" /></svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 12.5l5 5L20 6.5" /></svg>
);
export const IconBolt = (p: IconProps) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></svg>
);
export const IconHeart = (p: IconProps) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.7-8 11-8 11z" /></svg>
);
export const IconHalf = (p: IconProps) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="8" /><path d="M12 4v16" fill="currentColor" /><path d="M12 4a8 8 0 010 16z" fill="currentColor" /></svg>
);
export const IconTooClose = (p: IconProps) => (
  <svg {...base} {...p}><rect x="4" y="4" width="16" height="16" /><rect x="9" y="9" width="6" height="6" /></svg>
);
export const IconReject = (p: IconProps) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="8" /><path d="M6.5 6.5l11 11" /></svg>
);
export const IconTune = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>
);
export const IconSwap = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 9h14l-4-4M20 15H6l4 4" /></svg>
);

type SheetProps = {
  open: boolean;
  title: string;
  /** Mono kicker above the title, e.g. "BEAT 04 / 07". */
  kicker?: string;
  /** Standfirst under the title. */
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
  /** Prev / next within the inspected set. */
  onPrev?: () => void;
  onNext?: () => void;
  chips?: ReactNode;
};

/** Dark production surface — the inspector for beats, proofs, shots, slides and flags. */
export function NarrativeMomentumInspectorSheet({
  open,
  title,
  kicker,
  subtitle,
  onClose,
  children,
  testId,
  onPrev,
  onNext,
  chips,
}: SheetProps) {
  if (!open) return null;
  return (
    <div className="site00-nme-wizard__overlay" data-testid={testId ?? 'nme-wizard-inspector'}>
      <button type="button" className="site00-nme-wizard__overlay-backdrop" aria-label="Close" onClick={onClose} />
      <div className="site00-nme-wizard__dossier" role="dialog" aria-modal="true" aria-label={title}>
        <header className="site00-nme-wizard__dossier-head">
          <div className="site00-nme-wizard__dossier-headtext">
            {kicker ? <p className="site00-nme-wizard__dossier-kicker">{kicker}</p> : null}
            <h4 className="site00-nme-wizard__dossier-title">
              {title}
              {chips}
            </h4>
            {subtitle ? <p className="site00-nme-wizard__dossier-sub">{subtitle}</p> : null}
          </div>
          <button type="button" className="site00-nme-wizard__dossier-x" aria-label="Close" onClick={onClose}>
            <IconClose />
          </button>
        </header>
        <div className="site00-nme-wizard__dossier-body">{children}</div>
        <footer className="site00-nme-wizard__dossier-foot">
          {onPrev || onNext ?
            <>
              <button type="button" className="site00-nme-wizard__dossier-step" disabled={!onPrev} onClick={onPrev} aria-label="Previous">
                <IconBack />
              </button>
              <button type="button" className="site00-nme-wizard__dossier-step" disabled={!onNext} onClick={onNext} aria-label="Next">
                <IconArrow />
              </button>
            </>
          : null}
          <button type="button" className="site00-nme-wizard__dossier-close" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
