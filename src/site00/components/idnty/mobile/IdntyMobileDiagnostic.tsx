import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { IdntyBrandStateIconId } from '../../../config/idnty-brand-state-icons';
import {
  IDNTY_DEFAULT_BRAND_STATE,
  resolveIdntyStateDestination,
} from '../../../config/idnty-diagnostic';
import { brandStateToAssessmentSlug } from '../../../config/idnty-assessment-brand-map';
import { IDNTY_BRAND_STATES } from '../../../config/identity';
import { IdntyDiagnosticHero } from './IdntyDiagnosticHero';
import { IdntyProgression } from './IdntyProgression';
import { IdntyStateGrid } from './IdntyStateGrid';
import { IdntyInvestment } from './IdntyInvestment';
import { IdntyHandoff } from './IdntyHandoff';

type IdntyMobileDiagnosticProps = {
  selectedStateId: string | null;
  onSelectState: (stateId: string) => void;
  hasResume: boolean;
  resumeTarget: string | null;
  resumeStateLabel: string;
};

function resolveActiveStateId(selectedStateId: string | null): IdntyBrandStateIconId {
  const known = IDNTY_BRAND_STATES.some((state) => state.id === selectedStateId);
  if (known && selectedStateId) {
    return selectedStateId as IdntyBrandStateIconId;
  }
  return IDNTY_DEFAULT_BRAND_STATE;
}

export function IdntyMobileDiagnostic({
  selectedStateId,
  onSelectState,
  hasResume,
  resumeTarget,
  resumeStateLabel,
}: IdntyMobileDiagnosticProps) {
  const navigate = useNavigate();
  const handoffRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const activeStateId = resolveActiveStateId(selectedStateId);
  const activeCode = IDNTY_BRAND_STATES.find((s) => s.id === activeStateId)?.code ?? '00';

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const handleSelectState = useCallback(
    (stateId: string) => {
      onSelectState(stateId);

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reducedMotion && handoffRef.current) {
        handoffRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },
    [onSelectState],
  );

  const handleProceed = useCallback(
    (stateId: string) => {
      onSelectState(stateId);
      const slug = brandStateToAssessmentSlug(stateId);
      if (!slug && stateId !== 'build-ready') return;
      navigate(resolveIdntyStateDestination(stateId as IdntyBrandStateIconId, false));
    },
    [navigate, onSelectState],
  );

  return (
    <div
      ref={rootRef}
      className={`site00-idnty-diagnostic ${revealed ? 'site00-idnty-diagnostic--revealed' : ''}`.trim()}
    >
      {hasResume && resumeTarget ? (
        <div className="site00-idnty-state-resume">
          <p className="site00-idnty-state-resume__label">RESUME IDNTY ASSESSMENT — {resumeStateLabel}</p>
          <Link to={resumeTarget} className="site00-idnty-state-resume__link">
            CONTINUE →
          </Link>
        </div>
      ) : null}

      <IdntyDiagnosticHero />
      <IdntyProgression activeCode={activeCode} />
      <IdntyStateGrid
        selectedStateId={activeStateId}
        onSelectState={handleSelectState}
        onProceedState={handleProceed}
      />
      <IdntyInvestment activeStateId={activeStateId} onProceed={handleProceed} />
      <section ref={handoffRef}>
        <IdntyHandoff activeStateId={activeStateId} onProceed={handleProceed} />
      </section>
    </div>
  );
}
