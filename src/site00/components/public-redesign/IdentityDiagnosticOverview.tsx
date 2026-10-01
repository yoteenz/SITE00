import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IDNTY_INVESTMENT_TIERS, IDNTY_STATE_COPY } from '../../config/identity';
import {
  IDENTITY_PUBLIC_STATES,
  IDENTITY_STATE_ORDER,
  type IdentityPublicStateMeta,
} from '../../config/idnty-public-redesign';
import { idntyAssessmentPath } from '../../config/idnty-assessment';
import { useIdntyAssessment } from '../../hooks/useIdntyAssessment';
import { useSite00 } from '../../state/Site00Context';
import { PublicRedesignShell } from './PublicRedesignShell';
import { SpatialEnvironmentFrame } from './SpatialEnvironmentFrame';
import {
  IdentityHero,
  IdentityMachineStage,
  IdentityStateProgression,
  PublicCornerBrackets,
  PublicDiamond,
} from './IdentityDiagnosticChrome';
import { IdentityMachineGlyph } from './IdentityMachines';
import { StateNumeral } from './StateNumeral';

function ArrowCircle() {
  return (
    <span className="s00pr-statecard__arrow" aria-hidden="true">
      <svg viewBox="0 0 20 12" width="12" height="8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 6h17M13 1l5 5-5 5" />
      </svg>
    </span>
  );
}

function StateCard({
  meta,
  selected,
  onSelect,
  onProceed,
}: {
  meta: IdentityPublicStateMeta;
  selected: boolean;
  onSelect: () => void;
  onProceed: () => void;
}) {
  const lines = meta.title.split(' ');
  return (
    <li className="s00pr-statecard-wrap">
      <article className={`s00pr-statecard ${selected ? 's00pr-statecard--selected' : ''}`.trim()} data-state-code={meta.code}>
        <button type="button" className="s00pr-statecard__select" aria-pressed={selected} onClick={onSelect} aria-label={`SELECT STATE ${meta.code} — ${meta.title}`}>
          <StateNumeral code={meta.code} className="s00pr-statecard__code" />
          <PublicCornerBrackets className="s00pr-statecard__corners" />
          <IdentityMachineGlyph machine={meta.machine} className="s00pr-statecard__glyph" />
          <h2 className="s00pr-statecard__title">{lines.join(' ')}</h2>
          <p className="s00pr-statecard__class">{meta.classification.replace('-', '-')}</p>
          <p className="s00pr-statecard__quote">{meta.quote.replace(/[“”]/g, '')}</p>
        </button>
        <button type="button" className="s00pr-statecard__cta" onClick={onProceed}>
          SELECT STATE
          <ArrowCircle />
        </button>
      </article>
    </li>
  );
}

/** IDNTY / IDENTITY DIAGNOSTIC — overview. Picking a state routes into that state's continuous surface. */
export function IdentityDiagnosticOverview() {
  const navigate = useNavigate();
  const { state, selectIdentityState } = useSite00();
  const { hasResume, resumeTarget, record } = useIdntyAssessment();
  const [investmentOpen, setInvestmentOpen] = useState(false);

  // Nothing chosen yet → 00 is the highlighted default (authority); it is only a visual default, not a selection.
  const chosenSlug =
    IDENTITY_STATE_ORDER.find((slug) => IDENTITY_PUBLIC_STATES[slug].brandStateId === state.selectedIdentityStateId) ??
    null;
  const selectedSlug = chosenSlug ?? 'starting-at-zero';
  const activeMeta = IDENTITY_PUBLIC_STATES[selectedSlug];

  const select = (slug: IdentityPublicStateMeta['slug']) => selectIdentityState(IDENTITY_PUBLIC_STATES[slug].brandStateId);
  const proceed = (slug: IdentityPublicStateMeta['slug']) => {
    select(slug);
    navigate(idntyAssessmentPath(slug));
  };

  return (
    <PublicRedesignShell
      section="idnty"
      className="s00pr-shell--identity"
      authorityId="01_IDNTY_DIAGNOSTIC_OVERVIEW"
      environment={<SpatialEnvironmentFrame slotId="ENV.IDNTY.ATRIUM" />}
    >
      <div className="s00pr-identity s00pr-identity--overview" data-identity-mode="overview">
        <IdentityHero sideNote="CLARITY CREATES DIRECTION." sideNoteSecondary="IDENTITY IS THE FOUNDATION OF EVERYTHING THAT FOLLOWS." />
        <IdentityMachineStage machine="overview" />
        <IdentityStateProgression
          activeCode={activeMeta.code}
          mode="select"
          onSelect={select}
        />
        {hasResume && resumeTarget ? (
          <div className="s00pr-resume">
            <p>RESUME IDNTY ASSESSMENT — {record.identityState?.replace(/-/g, ' ')}</p>
            <Link to={resumeTarget}>CONTINUE →</Link>
          </div>
        ) : null}
        <ul className="s00pr-statecards" aria-label="BRAND STATES">
          {IDENTITY_STATE_ORDER.map((slug) => (
            <StateCard
              key={slug}
              meta={IDENTITY_PUBLIC_STATES[slug]}
              selected={selectedSlug === slug}
              onSelect={() => select(slug)}
              onProceed={() => proceed(slug)}
            />
          ))}
        </ul>
        <section className="s00pr-investment" aria-label="IDENTITY INVESTMENT">
          <div className="s00pr-investment__head">
            <h2 className="s00pr-investment__title">IDENTITY INVESTMENT</h2>
            <span className="s00pr-investment__rule" aria-hidden="true" />
            <button
              type="button"
              className="s00pr-investment__toggle"
              aria-expanded={investmentOpen}
              aria-controls="s00pr-investment-tiers"
              onClick={() => setInvestmentOpen((open) => !open)}
            >
              <PublicDiamond />
              VIEW DETAILS
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <p className="s00pr-investment__sub">{IDNTY_STATE_COPY.investmentSubhead}</p>
          {investmentOpen ? (
            <ul className="s00pr-investment__tiers" id="s00pr-investment-tiers">
              {IDNTY_INVESTMENT_TIERS.map((tier) => (
                <li key={tier.id}>
                  <span className="s00pr-investment__tier-label">{tier.label}</span>
                  <span className="s00pr-investment__tier-price">{tier.priceLabel}</span>
                  <span className="s00pr-investment__tier-services">{tier.services.join(' · ')}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </PublicRedesignShell>
  );
}
