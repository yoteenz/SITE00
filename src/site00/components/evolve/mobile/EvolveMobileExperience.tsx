import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { EvolvePathId } from '../../../config/evolve';
import { EVOLVE_PATHS } from '../../../config/evolve';
import {
  EVOLVE_DEFAULT_PATH,
  resolveEvolveAssessmentDestination,
} from '../../../config/evolve-diagnostic';
import { EvolveMobileHero } from './EvolveMobileHero';
import { EvolutionIntensityRail } from './EvolutionIntensityRail';
import { EvolutionPathGrid } from './EvolutionPathGrid';
import { SelectedEvolutionPath } from './SelectedEvolutionPath';
import { EvolveProcessTimeline } from './EvolveProcessTimeline';
import { EvolveClosingModule } from './EvolveClosingModule';

type EvolveMobileExperienceProps = {
  selectedPathId: string | null;
  onSelectPath: (pathId: string) => void;
  hasResume: boolean;
  resumeTarget: string | null;
  resumePathLabel: string;
};

function resolveActivePathId(selectedPathId: string | null): EvolvePathId {
  const known = EVOLVE_PATHS.some((path) => path.id === selectedPathId);
  if (known && selectedPathId) {
    return selectedPathId as EvolvePathId;
  }
  return EVOLVE_DEFAULT_PATH;
}

export function EvolveMobileExperience({
  selectedPathId,
  onSelectPath,
  hasResume,
  resumeTarget,
  resumePathLabel,
}: EvolveMobileExperienceProps) {
  const navigate = useNavigate();
  const selectedRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const activePathId = resolveActivePathId(selectedPathId);
  const activeCode = EVOLVE_PATHS.find((path) => path.id === activePathId)?.code ?? '01';

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

  const handleSelectPath = useCallback(
    (pathId: EvolvePathId) => {
      onSelectPath(pathId);

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reducedMotion && selectedRef.current) {
        selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },
    [onSelectPath],
  );

  const handleProceed = useCallback(
    (pathId: EvolvePathId) => {
      onSelectPath(pathId);
      navigate(resolveEvolveAssessmentDestination(pathId, false));
    },
    [navigate, onSelectPath],
  );

  return (
    <div
      ref={rootRef}
      className={`site00-evolve-mobile ${revealed ? 'site00-evolve-mobile--revealed' : ''}`.trim()}
    >
      {hasResume && resumeTarget ? (
        <div className="site00-idnty-state-resume">
          <p className="site00-idnty-state-resume__label">RESUME EVOLVE — {resumePathLabel}</p>
          <Link to={resumeTarget} className="site00-idnty-state-resume__link">
            CONTINUE →
          </Link>
        </div>
      ) : null}

      <EvolveMobileHero />
      <EvolutionIntensityRail activeCode={activeCode} />
      <EvolutionPathGrid
        selectedPathId={activePathId}
        onSelectPath={handleSelectPath}
        onProceedPath={handleProceed}
      />
      <section ref={selectedRef}>
        <SelectedEvolutionPath activePathId={activePathId} onBeginAssessment={handleProceed} />
      </section>
      <EvolveProcessTimeline />
      <EvolveClosingModule onBeginAssessment={() => handleProceed(activePathId)} />
    </div>
  );
}
