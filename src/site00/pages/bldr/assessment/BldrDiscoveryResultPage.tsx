import {
  getBldrAssessmentState,
  type BldrAssessmentStateId,
} from '../../../config/bldr-assessment';
import { useBldrAssessment } from '../../../hooks/useBldrAssessment';
import { BldrAssessmentShell } from '../../../components/bldr-assessment/BldrAssessmentShell';
import { compileBuilderScopeDiagnosis } from '../../../../../shared/site00-project-discovery/builderDiagnosis.js';
import { diagnoseIdentityNeed } from '../../../../../shared/site00-project-discovery/identityDiagnosis.js';
import { compileProjectRecommendation } from '../../../../../shared/site00-project-discovery/recommendation.js';
import { DiscoveryResultPanel } from '../../../components/discovery/DiscoveryResultPanel';

type BldrDiscoveryResultPageProps = {
  classSlug: BldrAssessmentStateId;
};

export default function BldrDiscoveryResultPage({ classSlug }: BldrDiscoveryResultPageProps) {
  const state = getBldrAssessmentState(classSlug)!;
  const { getAnswersForClass } = useBldrAssessment();
  const answers = getAnswersForClass(classSlug);

  const scopeDiagnosis = compileBuilderScopeDiagnosis({ classSlug, answers });
  const identityNeed = diagnoseIdentityNeed({ stateSlug: 'build-ready', answers });
  scopeDiagnosis.identityNeed = identityNeed;

  const recommendation = compileProjectRecommendation({ identityNeed, scopeDiagnosis });

  return (
    <BldrAssessmentShell state={state}>
      <DiscoveryResultPanel title="YOUR BUILD PATH" recommendation={recommendation} />
    </BldrAssessmentShell>
  );
}
