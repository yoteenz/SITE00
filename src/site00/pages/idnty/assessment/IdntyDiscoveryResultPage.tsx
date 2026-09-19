import {
  getIdntyAssessmentState,
  type IdntyAssessmentStateId,
} from '../../../config/idnty-assessment';
import { useIdntyAssessment } from '../../../hooks/useIdntyAssessment';
import { IdntyAssessmentShell } from '../../../components/idnty-assessment/IdntyAssessmentShell';
import { IdentityCalibrationMobileComplete } from '../../../components/idnty/calibration';
import { useSite00DesktopArtboardPreview } from '../../../components/shell/Site00DesktopArtboardContext';
import { diagnoseIdentityNeed } from '../../../../../shared/site00-project-discovery/identityDiagnosis.js';
import { compileProjectRecommendation } from '../../../../../shared/site00-project-discovery/recommendation.js';
import { compileBuilderScopeDiagnosis } from '../../../../../shared/site00-project-discovery/builderDiagnosis.js';
import { DiscoveryResultPanel } from '../../../components/discovery/DiscoveryResultPanel';

type IdntyDiscoveryResultPageProps = {
  stateSlug: IdntyAssessmentStateId;
};

export default function IdntyDiscoveryResultPage({ stateSlug }: IdntyDiscoveryResultPageProps) {
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getIdntyAssessmentState(stateSlug)!;
  const { getAnswersForState } = useIdntyAssessment();
  const answers = getAnswersForState(stateSlug);

  const identityNeed = diagnoseIdentityNeed({ stateSlug, answers });
  const scopeDiagnosis = compileBuilderScopeDiagnosis({ classSlug: 'site', answers: { type: answers.project ?? 'site' } });
  scopeDiagnosis.identityNeed = identityNeed;

  const recommendation = compileProjectRecommendation({ identityNeed, scopeDiagnosis });

  if (!isDesktop) {
    return (
      <IdntyAssessmentShell state={state} mobileLayout="calibration" showProcessStrip={false}>
        <IdentityCalibrationMobileComplete stateSlug={stateSlug} />
      </IdntyAssessmentShell>
    );
  }

  return (
    <IdntyAssessmentShell state={state}>
      <DiscoveryResultPanel title="YOUR SITE 00 STARTING POINT" recommendation={recommendation} />
    </IdntyAssessmentShell>
  );
}
