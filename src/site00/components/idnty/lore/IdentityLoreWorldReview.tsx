import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  evaluateCreativeDirectionReadiness,
  missingDomainsToLoreSteps,
} from '../../../../../shared/site00-brand-lore/readiness';
import { synthesizeBrandLoreProfile } from '../../../../../shared/site00-brand-lore/loreSynthesis';
import { buildLoreSummaryFromAnswers } from '../../../../../shared/site00-brand-lore/loreSummary';
import {
  idntyLoreCalibratePath,
  idntyLorePath,
} from '../../../../../shared/site00-brand-lore/idnty-lore-questions';
import type { IdntyAssessmentStateId } from '../../../config/idnty-assessment';
import { getIdntyAssessmentState, idntyAssessmentCompletePath } from '../../../config/idnty-assessment';
import { useIdntyAssessment } from '../../../hooks/useIdntyAssessment';
import { IdentityStateHero, IdentityStateProgress } from '../state-v2/IdentityStateProgress';
import { IdentityCalibrationConsole } from '../calibration/IdentityCalibrationConsole';
import { IdentityCalibrationCaptureStatus } from '../calibration/IdentityCalibrationCaptureStatus';
import { IdentityCalibrationNavigation } from '../calibration/IdentityCalibrationNavigation';
import { useSite00DesktopArtboardPreview } from '../../shell/Site00DesktopArtboardContext';
import { site00IdntyAssessmentDesktopPath } from '../../../config/routes';

type IdentityLoreWorldReviewProps = {
  stateSlug: IdntyAssessmentStateId;
};

export function IdentityLoreWorldReview({ stateSlug }: IdentityLoreWorldReviewProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getIdntyAssessmentState(stateSlug)!;
  const { completeAssessment, getLoreAnswers } = useIdntyAssessment();
  const loreAnswers = getLoreAnswers();

  const profile = useMemo(
    () =>
      synthesizeBrandLoreProfile({
        loreAnswers,
        sourceIntakeId: null,
        operationalAnswers: { projectTypes: [], goals: [] },
      }),
    [loreAnswers],
  );

  const readiness = evaluateCreativeDirectionReadiness(profile);
  const sections = buildLoreSummaryFromAnswers(loreAnswers);

  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00IdntyAssessmentDesktopPath(path) : path);
  };

  const handleSubmit = () => {
    if (readiness.state !== 'CORE_DIRECTION_READY') {
      const calSteps = missingDomainsToLoreSteps(readiness.missingDomains);
      if (calSteps[0]) {
        navigateTo(idntyLoreCalibratePath(stateSlug, calSteps[0]));
        return;
      }
    }
    completeAssessment(stateSlug);
    navigateTo(idntyAssessmentCompletePath(stateSlug));
  };

  const needsCalibration = readiness.state !== 'CORE_DIRECTION_READY';

  return (
    <div className="site00-idnty-calibration-flow">
      <IdentityStateProgress stateId={stateSlug} />
      <IdentityStateHero state={state} />
      <IdentityCalibrationConsole
        stepIndex={0}
        totalSteps={1}
        progressRail={<p className="site00-idnty-calibration-rail__category">WHAT WE HEARD</p>}
        captureStatus={
          <IdentityCalibrationCaptureStatus
            primary={needsCalibration ? 'NEEDS CALIBRATION' : 'WORLD CAPTURED'}
            secondary={
              needsCalibration
                ? 'WE KNOW WHAT YOU DO. WE NEED TO KNOW WHAT WORLD IT BELONGS TO.'
                : 'READY TO SUBMIT'
            }
            captured={!needsCalibration}
          />
        }
        navigation={
          <IdentityCalibrationNavigation
            stepIndex={0}
            totalSteps={1}
            onPrevious={() => navigateTo(idntyLorePath(stateSlug, 'no-go'))}
            onContinue={handleSubmit}
            continueLabel={needsCalibration ? 'CALIBRATE →' : 'SUBMIT ASSESSMENT'}
            nextStepLabel="COMPLETE"
          />
        }
      >
        <div className="site00-idnty-calibration-review">
          <h2 className="site00-idnty-calibration-review__title">WHAT WE HEARD</h2>
          <p className="site00-idnty-calibration-review__subtitle">
            YOUR BRAND WORLD — CORRECT ANYTHING BEFORE WE PROCEED.
          </p>
          {sections.length > 0 ? (
            <dl className="site00-idnty-calibration-review__list">
              {sections.map((section) => (
                <div key={section.key} className="site00-idnty-calibration-review__row">
                  <dt>{section.label}</dt>
                  <dd>{section.value}</dd>
                  <button
                    type="button"
                    className="site00-idnty-calibration-review__edit"
                    onClick={() => navigateTo(idntyLorePath(stateSlug, section.key))}
                  >
                    EDIT →
                  </button>
                </div>
              ))}
            </dl>
          ) : (
            <p className="site00-idnty-calibration-review__empty">
              NO BRAND WORLD ANSWERS YET — CONTINUE TO CAPTURE YOUR WORLD.
            </p>
          )}
        </div>
      </IdentityCalibrationConsole>
    </div>
  );
}
