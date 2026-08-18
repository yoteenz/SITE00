import { useEffect } from 'react';
import { getEvolvePathConfig } from '../../../config/evolve-assessment';
import { useEvolveAssessment } from '../../../hooks/useEvolveAssessment';
import {
  EvolveAssessmentCompletePanel,
  EvolveAssessmentShell,
} from '../../../components/evolve-assessment/EvolveAssessmentShell';
import { SITE00_CTRL_ROOM_PATH } from '../../../config/mobile-directory-nav';
import type { EvolvePathId } from '../../../config/evolve';

type EvolveAssessmentCompletePageProps = {
  pathSlug: EvolvePathId;
};

export default function EvolveAssessmentCompletePage({ pathSlug }: EvolveAssessmentCompletePageProps) {
  const pathConfig = getEvolvePathConfig(pathSlug);
  const { completeIntake } = useEvolveAssessment();

  useEffect(() => {
    completeIntake(pathSlug);
  }, [pathSlug, completeIntake]);

  return (
    <EvolveAssessmentShell state={pathConfig} pathId={pathSlug}>
      <EvolveAssessmentCompletePanel
        title={pathConfig.completionTitle}
        subtitle={pathConfig.completionSubtitle}
        href={SITE00_CTRL_ROOM_PATH}
      />
    </EvolveAssessmentShell>
  );
}
