import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  evaluateCreativeDirectionReadiness,
  missingDomainsToLoreSteps,
} from '../../../../../shared/site00-brand-lore/readiness';
import {
  evaluateBrandPersonalityReadiness,
  missingPersonalityDomainsToSteps,
  canBeginCoreDirectionFormation,
} from '../../../../../shared/site00-brand-lore/personalityReadiness';
import { synthesizeBrandLoreProfile } from '../../../../../shared/site00-brand-lore/loreSynthesis';
import { buildLoreSummaryFromAnswers } from '../../../../../shared/site00-brand-lore/loreSummary';
import { buildPersonalitySummaryFromAnswers } from '../../../../../shared/site00-brand-lore/personalitySummary';
import {
  idntyLoreCalibratePath,
  idntyLorePath,
} from '../../../../../shared/site00-brand-lore/idnty-lore-questions';
import { idntyPersonalityCalibratePath } from '../../../../../shared/site00-brand-lore/idnty-personality-questions';
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
  includePersonalityReview?: boolean;
};

export function IdentityLoreWorldReview({ stateSlug, includePersonalityReview }: IdentityLoreWorldReviewProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getIdntyAssessmentState(stateSlug)!;
  const { completeAssessment, getLoreAnswers, getPersonalityAnswers } = useIdntyAssessment();
  const loreAnswers = getLoreAnswers();
  const personalityAnswers = getPersonalityAnswers();

  const profile = useMemo(
    () =>
      synthesizeBrandLoreProfile({
        loreAnswers,
        personalityAnswers,
        sourceIntakeId: null,
        operationalAnswers: { projectTypes: [], goals: [] },
      }),
    [loreAnswers, personalityAnswers],
  );

  const readiness = evaluateCreativeDirectionReadiness(profile);
  const personalityReadiness = evaluateBrandPersonalityReadiness(profile.brandPersonality, profile);
  const sections = buildLoreSummaryFromAnswers(loreAnswers);
  const personalitySections = buildPersonalitySummaryFromAnswers(personalityAnswers);

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
    if (personalityReadiness.state !== 'PERSONALITY_READY') {
      const pSteps = missingPersonalityDomainsToSteps(personalityReadiness.missingDomains);
      if (pSteps[0]) {
        navigateTo(idntyPersonalityCalibratePath(stateSlug, pSteps[0]));
        return;
      }
    }
    completeAssessment(stateSlug);
    navigateTo(idntyAssessmentCompletePath(stateSlug));
  };

  const formationReady = canBeginCoreDirectionFormation({
    loreState: readiness.state,
    personalityState: personalityReadiness.state,
  });
  const needsCalibration = !formationReady;

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
          {(includePersonalityReview ?? personalitySections.length > 0) ? (
            <>
              <h2 className="site00-idnty-calibration-review__title site00-idnty-calibration-review__title--spaced">
                HOW YOU SHOW UP
              </h2>
              <p className="site00-idnty-calibration-review__subtitle">
                YOUR PERSONALITY — CORRECT ANYTHING BEFORE WE PROCEED.
              </p>
              {personalitySections.length > 0 ? (
                <dl className="site00-idnty-calibration-review__list">
                  {personalitySections.map((section) => (
                    <div key={section.key} className="site00-idnty-calibration-review__row">
                      <dt>{section.label}</dt>
                      <dd>{section.value}</dd>
                      <button
                        type="button"
                        className="site00-idnty-calibration-review__edit"
                        onClick={() => navigateTo(`/idnty/${stateSlug}/personality/${section.key}`)}
                      >
                        EDIT →
                      </button>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="site00-idnty-calibration-review__empty">
                  NO PERSONALITY ANSWERS YET — CONTINUE TO CAPTURE HOW YOU SHOW UP.
                </p>
              )}
            </>
          ) : null}
        </div>
      </IdentityCalibrationConsole>
    </div>
  );
}
