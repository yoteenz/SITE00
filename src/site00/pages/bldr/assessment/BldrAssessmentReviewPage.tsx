import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getBldrAssessmentState,
  bldrAssessmentCompletePath,
  bldrAssessmentPath,
  bldrAssessmentAllSteps,
  type BldrAssessmentStateId,
} from '../../../config/bldr-assessment';
import {
  BLDR_EXPERIENCE_QUESTIONS,
  bldrExperienceFirstStep,
  bldrExperiencePath,
  getExperienceQuestion,
} from '../../../../../shared/site00-brand-lore/bldr-experience-questions';
import { isSkippedAnswer } from '../../../../../shared/site00-brand-lore/adaptivity';
import { useBldrAssessment } from '../../../hooks/useBldrAssessment';
import { BldrAssessmentShell, BldrAssessmentActions } from '../../../components/bldr-assessment/BldrAssessmentShell';
import { IdntyProcessStripPanel } from '../../../components/idnty-assessment/IdntyAssessmentPanels';
import { formatAnswerLabel } from '../../../components/idnty-assessment/IdntyStepForm';
import { useSite00DesktopArtboardPreview } from '../../../components/shell/Site00DesktopArtboardContext';
import { site00BldrAssessmentDesktopPath } from '../../../config/routes';

type BldrAssessmentReviewPageProps = {
  classSlug: BldrAssessmentStateId;
};

/** BUILDER OPERATIONAL INTAKE → REVIEW → EXPERIENCE TRANSLATION → FINAL REVIEW → SUBMIT (XV/XVI).
 * `not-sure` is a diagnostic quiz, not a build brief — it has no Experience Translation phase. */
function experienceApplies(classSlug: BldrAssessmentStateId): boolean {
  return classSlug !== 'not-sure';
}

export default function BldrAssessmentReviewPage({ classSlug }: BldrAssessmentReviewPageProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getBldrAssessmentState(classSlug)!;
  const { getAnswersForClass, completeAssessment, record, setCurrentStep } = useBldrAssessment();
  const answers = getAnswersForClass(classSlug);
  const allSteps = bldrAssessmentAllSteps(state);

  // Track that resume should land back on review, not the last operational step (XXXVI).
  useEffect(() => {
    setCurrentStep(classSlug, 'review');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classSlug]);

  const experienceRequired = experienceApplies(classSlug);
  const experienceComplete =
    !experienceRequired || record.experienceCompletedSteps.length >= BLDR_EXPERIENCE_QUESTIONS.length;

  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00BldrAssessmentDesktopPath(path) : path);
  };

  const handlePrimary = () => {
    if (!experienceComplete) {
      // REQUIRED TRANSITION — no manual URL needed to reach Experience Translation (XV).
      navigateTo(bldrExperiencePath(classSlug, bldrExperienceFirstStep()));
      return;
    }
    completeAssessment(classSlug);
    navigateTo(bldrAssessmentCompletePath(classSlug));
  };

  const panel = (
    <div className="site00-idnty-assessment-card site00-idnty-assessment-card--review">
      <p className="site00-bldr-context-label">{state.contextLabel}</p>
      <h2 className="site00-idnty-assessment-card__title">
        {experienceComplete ? 'FINAL REVIEW' : 'YOUR BUILD BLUEPRINT'}
      </h2>
      <p className="site00-idnty-assessment-card__subtitle">
        {experienceComplete
          ? 'CONFIRM EVERYTHING BEFORE YOU SUBMIT.'
          : 'REVIEW YOUR RESPONSES — THEN WE\'LL TRANSLATE THIS INTO HOW YOUR DIGITAL EXPERIENCE BEHAVES.'}
      </p>

      <dl className="site00-idnty-review-list">
        {allSteps.map((step) => (
          <div key={step.id} className="site00-idnty-review-list__row">
            <dt>{step.title}</dt>
            <dd>{formatAnswerLabel(step.options, answers[step.id] ?? '')}</dd>
            <button
              type="button"
              className="site00-idnty-review-list__edit"
              onClick={() => {
                const isLanding = state.landingFields.some((f) => f.id === step.id);
                navigateTo(isLanding ? bldrAssessmentPath(classSlug) : bldrAssessmentPath(classSlug, step.id));
              }}
            >
              EDIT
            </button>
          </div>
        ))}
      </dl>

      {experienceRequired && experienceComplete ? (
        <>
          <p className="site00-idnty-assessment-card__subtitle">DIGITAL EXPERIENCE</p>
          <dl className="site00-idnty-review-list">
            {BLDR_EXPERIENCE_QUESTIONS.map((step) => {
              const value = record.experienceAnswers[step.id];
              return (
                <div key={step.id} className="site00-idnty-review-list__row">
                  <dt>{step.title.replace(/\n/g, ' ')}</dt>
                  <dd>
                    {isSkippedAnswer(value) ? 'SKIPPED' : formatAnswerLabel(step.options, value ?? '')}
                  </dd>
                  <button
                    type="button"
                    className="site00-idnty-review-list__edit"
                    onClick={() => {
                      if (getExperienceQuestion(step.id)) navigateTo(bldrExperiencePath(classSlug, step.id));
                    }}
                  >
                    EDIT
                  </button>
                </div>
              );
            })}
          </dl>
        </>
      ) : null}

      <BldrAssessmentActions
        primaryLabel={experienceComplete ? 'SUBMIT →' : 'CONTINUE → DIGITAL EXPERIENCE'}
        onPrimary={handlePrimary}
        secondaryLabel="BACK"
        onSecondary={() => {
          const last = state.steps[state.steps.length - 1];
          navigateTo(last ? bldrAssessmentPath(classSlug, last.id) : bldrAssessmentPath(classSlug));
        }}
      />
    </div>
  );

  return (
    <BldrAssessmentShell
      state={state}
      panel={panel}
      processStrip={<IdntyProcessStripPanel strip={state.processStrip} />}
    />
  );
}
