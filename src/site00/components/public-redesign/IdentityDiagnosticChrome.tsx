import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  IDENTITY_PUBLIC_STATES,
  IDENTITY_STATE_ORDER,
  type IdentityPublicStateMeta,
  type IdentityStateCode,
} from '../../config/idnty-public-redesign';
import { idntyAssessmentPath } from '../../config/idnty-assessment';
import { AssetSlot } from './AssetSlot';
import { IdentityMachine, IdentityMachineGlyph, IdentityOverviewMachine } from './IdentityMachines';
import type { IdentityAuthorityDomain } from '../../lib/identityAuthorityVerification';

/** The diamond used across the family (header, side notes). */
export function PublicDiamond({ className = '' }: { className?: string }) {
  return <span className={`s00pr-diamond ${className}`.trim()} aria-hidden="true" />;
}

/** `[ ]` corner brackets — the expand/scan glyph on panels and cards. */
export function PublicCornerBrackets({ className = '' }: { className?: string }) {
  return (
    <svg className={`s00pr-corners ${className}`.trim()} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
      <path d="M2 11V2h9M30 11V2h-9M2 21v9h9M30 21v9h-9" />
    </svg>
  );
}

type IdentityHeroProps = {
  sideNote: string;
  /** Secondary side note (overview shows two). */
  sideNoteSecondary?: string;
};

/** IDNTY / IDENTITY DIAGNOSTIC — constant across every state, step and review (continuity). */
export function IdentityHero({ sideNote, sideNoteSecondary }: IdentityHeroProps) {
  return (
    <section className="s00pr-idhero" aria-label="IDENTITY DIAGNOSTIC">
      <div className="s00pr-idhero__copy">
        <p className="s00pr-idhero__crumb">
          <span>IDNTY /</span>
        </p>
        <h1 className="s00pr-idhero__title">
          IDENTITY
          <br />
          DIAGNOSTIC
        </h1>
        <span className="s00pr-idhero__rule" aria-hidden="true" />
        <p className="s00pr-idhero__question">
          WHERE IS YOUR
          <br />
          BRAND RIGHT NOW?
        </p>
        <p className="s00pr-idhero__body">
          CHOOSE THE STATE THAT BEST DESCRIBES YOUR FOUNDATION. WE'LL DETERMINE WHAT YOU ACTUALLY NEED FROM THERE.
        </p>
      </div>
      <aside className="s00pr-sidenote s00pr-sidenote--top" aria-hidden="true">
        <p>{sideNote}</p>
        <PublicDiamond />
      </aside>
      {sideNoteSecondary ? (
        <aside className="s00pr-sidenote s00pr-sidenote--mid" aria-hidden="true">
          <p>{sideNoteSecondary}</p>
          <PublicDiamond />
        </aside>
      ) : null}
    </section>
  );
}

type IdentityMachineStageProps =
  | { machine: 'overview'; domainsWithEvidence?: undefined }
  | {
      machine: IdentityPublicStateMeta['machine'];
      domainsWithEvidence?: Partial<Record<IdentityAuthorityDomain, boolean>>;
    };

/** Central machine. The asset slot holds a future material upgrade; the SVG is the live scaffold. */
export function IdentityMachineStage(props: IdentityMachineStageProps) {
  const slot =
    props.machine === 'foundation'
      ? 'MACHINE.IDNTY.FOUNDATION.ORB'
      : props.machine === 'partial'
        ? 'MACHINE.IDNTY.PARTIAL.LATTICE'
        : props.machine === 'evolution'
          ? 'MACHINE.IDNTY.EVOLUTION.WAVES'
          : props.machine === 'authority'
            ? 'MACHINE.IDNTY.AUTHORITY.STAR'
            : 'MACHINE.IDNTY.FOUNDATION.ORB';
  return (
    <div className={`s00pr-stage s00pr-stage--${props.machine}`} data-machine={props.machine}>
      <AssetSlot slotId={slot} className="s00pr-stage__slot" />
      {props.machine === 'overview' ? (
        <IdentityOverviewMachine className="s00pr-stage__svg" />
      ) : (
        <IdentityMachine machine={props.machine} domainsWithEvidence={props.domainsWithEvidence} className="s00pr-stage__svg" />
      )}
    </div>
  );
}

type IdentityStateProgressionProps = {
  activeCode: IdentityStateCode | null;
  /** When provided, nodes become links/buttons that switch state. */
  mode: 'select' | 'link' | 'static';
  onSelect?: (slug: IdentityPublicStateMeta['slug']) => void;
};

/** Canonical 00–01–02–03 progression. Visually primary; question progress never competes with it. */
export function IdentityStateProgression({ activeCode, mode, onSelect }: IdentityStateProgressionProps) {
  return (
    <div className="s00pr-progression" role="group" aria-label="IDENTITY STATE PROGRESSION">
      <ol className="s00pr-progression__rail">
        {IDENTITY_STATE_ORDER.map((slug) => {
          const meta = IDENTITY_PUBLIC_STATES[slug];
          const active = meta.code === activeCode;
          const node = (
            <span className={`s00pr-progression__node ${active ? 's00pr-progression__node--active' : ''}`.trim()}>
              {meta.code}
            </span>
          );
          const label = `STATE ${meta.code} — ${meta.title}`;
          return (
            <li key={slug} className="s00pr-progression__item">
              {mode === 'select' ? (
                <button type="button" className="s00pr-progression__hit" aria-label={label} aria-pressed={active} onClick={() => onSelect?.(slug)}>
                  {node}
                </button>
              ) : mode === 'link' ? (
                <Link to={idntyAssessmentPath(slug)} className="s00pr-progression__hit" aria-label={label} aria-current={active ? 'step' : undefined}>
                  {node}
                </Link>
              ) : (
                <span className="s00pr-progression__hit" role="img" aria-label={`${label}${active ? ' (CURRENT)' : ''}`}>
                  {node}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="s00pr-progression__label">IDENTITY STATE PROGRESSION</p>
    </div>
  );
}

type TransformingStatePanelProps = {
  meta: IdentityPublicStateMeta;
  mode: 'detail' | 'question' | 'review';
  /** Third header line: QUESTION 01 OF 04 / review sub-label / (detail: quote). */
  subLine: ReactNode;
  /** Build Ready only — second grey line under the classification. */
  verificationLine?: string;
  /** Mode key for the body so it can animate when the panel transforms. */
  bodyKey: string;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * The lower state-detail panel. It is the SAME element in detail, question and review modes —
 * only its body (and the third header line) transform into the working surface.
 */
export function TransformingStatePanel({ meta, mode, subLine, verificationLine, bodyKey, children, footer }: TransformingStatePanelProps) {
  return (
    <section
      className={`s00pr-panel s00pr-panel--${mode}`}
      data-panel-mode={mode}
      data-state-code={meta.code}
      aria-label={`STATE ${meta.code} — ${meta.title}`}
    >
      <header className="s00pr-panel__head">
        <span className="s00pr-panel__code" aria-hidden="true">
          {meta.code}
        </span>
        <span className="s00pr-panel__vr" aria-hidden="true" />
        <div className="s00pr-panel__titles">
          <h2 className="s00pr-panel__title">{meta.title}</h2>
          <p className="s00pr-panel__class">{meta.classification}</p>
          {verificationLine ? <p className="s00pr-panel__sub">{verificationLine}</p> : null}
          {subLine ? (
            <p className={`s00pr-panel__sub ${mode === 'review' ? 's00pr-panel__sub--review' : ''}`.trim()}>{subLine}</p>
          ) : null}
        </div>
        <div className="s00pr-panel__glyph">
          <IdentityMachineGlyph machine={meta.machine} className="s00pr-panel__glyph-svg" />
        </div>
        <PublicCornerBrackets className="s00pr-panel__corners" />
      </header>
      <div className="s00pr-panel__body" key={bodyKey} data-body-key={bodyKey}>
        {children}
      </div>
      {footer}
    </section>
  );
}
