import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getIdntyAssessmentState,
  idntyAssessmentPath,
  type IdntyAssessmentStateId,
} from '../../../config/idnty-assessment';
import { useIdntyAssessment } from '../../../hooks/useIdntyAssessment';
import {
  IdntyAssessmentShell,
  IdntyAssessmentActions,
} from '../../../components/idnty-assessment/IdntyAssessmentShell';
import {
  IdntyProcessStripPanel,
  IdntyQuestionList,
  IdntyOptionGrid,
  IdntyOptionRows,
} from '../../../components/idnty-assessment/IdntyAssessmentPanels';
import { useSite00DesktopArtboardPreview } from '../../../components/shell/Site00DesktopArtboardContext';
import { SITE00_ROUTES, site00IdntyAssessmentDesktopPath } from '../../../config/routes';

type IdntyAssessmentLandingPageProps = {
  stateSlug: IdntyAssessmentStateId;
};

export default function IdntyAssessmentLandingPage({ stateSlug }: IdntyAssessmentLandingPageProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getIdntyAssessmentState(stateSlug)!;
  const { startState, setStepAnswers, markStepComplete, getAnswersForState } = useIdntyAssessment();

  const [selected, setSelected] = useState<string[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<string | undefined>(
    state.landingType === 'question-list' ? state.landingOptions?.[0]?.id : undefined,
  );

  useEffect(() => {
    startState(stateSlug);
  }, [stateSlug, startState]);

  const completedQuestionIds = useMemo(() => {
    const answers = getAnswersForState(stateSlug);
    return (state.landingOptions ?? [])
      .filter((q) => {
        const val = answers[q.id];
        if (Array.isArray(val)) return val.length > 0;
        return Boolean(val && String(val).trim());
      })
      .map((q) => q.id);
  }, [getAnswersForState, stateSlug, state.landingOptions]);

  const toggleSelection = useCallback(
    (id: string) => {
      if (state.landingType === 'question-list') return;
      if (state.landingType === 'pathway-grid' || state.landingType === 'service-grid') {
        setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
        return;
      }
      setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    },
    [state.landingType],
  );

  const handleQuestionSelect = (id: string) => {
    setActiveQuestion(id);
    const path = idntyAssessmentPath(stateSlug, id);
    navigate(isDesktop ? site00IdntyAssessmentDesktopPath(path) : path);
  };

  const handleNext = () => {
    if (state.landingType === 'question-list') {
      const firstIncomplete =
        state.steps.find((s) => !completedQuestionIds.includes(s.id)) ?? state.steps[0];
      if (firstIncomplete) {
        handleQuestionSelect(firstIncomplete.id);
      }
      return;
    }

    const firstStep = state.steps[0];
    if (!firstStep) return;

    if (selected.length === 0 && firstStep.required) return;

    setStepAnswers(stateSlug, firstStep.id, { [firstStep.id]: selected });
    markStepComplete(stateSlug, firstStep.id);

    const nextStep = state.steps[1];
    const path = nextStep ? idntyAssessmentPath(stateSlug, nextStep.id) : idntyAssessmentPath(stateSlug, 'review');
    navigate(isDesktop ? site00IdntyAssessmentDesktopPath(path) : path);
  };

  const handleSaveExit = () => {
    if (selected.length && state.steps[0]) {
      setStepAnswers(stateSlug, state.steps[0].id, { [state.steps[0].id]: selected });
    }
    navigate(SITE00_ROUTES.idnty);
  };

  const processVariant =
    state.processStrip.id === 'next' ? 'timeline' : state.processStrip.id === 'journey' ? 'journey' : 'default';

  const panel = (
    <div className="site00-idnty-assessment-card">
      <h2 className="site00-idnty-assessment-card__title">{state.landingTitle}</h2>
      {state.landingSubtitle ? (
        <p className="site00-idnty-assessment-card__subtitle">{state.landingSubtitle}</p>
      ) : null}

      {state.landingType === 'question-list' && state.landingOptions ? (
        <IdntyQuestionList
          options={state.landingOptions}
          activeId={activeQuestion}
          completedIds={completedQuestionIds}
          onSelect={handleQuestionSelect}
        />
      ) : null}

      {(state.landingType === 'option-grid' ||
        state.landingType === 'pathway-grid' ||
        state.landingType === 'service-grid') &&
      state.landingOptions ? (
        isDesktop ? (
          <IdntyOptionGrid
            options={state.landingOptions}
            selected={selected}
            onToggle={toggleSelection}
            mode="multi"
            columns={state.landingType === 'pathway-grid' || state.landingType === 'service-grid' ? 3 : 2}
            showExplore={state.landingType !== 'option-grid'}
          />
        ) : (
          <IdntyOptionRows options={state.landingOptions} selected={selected} onToggle={toggleSelection} />
        )
      ) : null}

      {state.landingType === 'pathway-grid' || state.landingType === 'service-grid' ? (
        <div className="site00-idnty-assessment-card__inline-cta">
          <p className="site00-idnty-assessment-card__inline-cta-text">
            {state.landingType === 'pathway-grid'
              ? 'READY TO START YOUR EVOLUTION? LET\'S BUILD A PLAN TAILORED TO YOUR BRAND\'S NEXT CHAPTER.'
              : 'READY TO START BUILDING?'}
          </p>
        </div>
      ) : null}

      <IdntyAssessmentActions
        primaryLabel={state.primaryCta}
        onPrimary={handleNext}
        secondaryLabel={state.landingType === 'question-list' ? 'SAVE & EXIT' : state.secondaryCta}
        onSecondary={state.landingType === 'question-list' ? handleSaveExit : undefined}
        secondaryHref={
          state.landingType !== 'question-list' && state.secondaryCta === 'BACK'
            ? SITE00_ROUTES.idntyState
            : undefined
        }
        primaryDisabled={
          (state.landingType === 'pathway-grid' || state.landingType === 'service-grid') && selected.length === 0
        }
      />
    </div>
  );

  return (
    <IdntyAssessmentShell
      state={state}
      panel={panel}
      processStrip={
        <IdntyProcessStripPanel
          strip={state.processStrip}
          variant={processVariant}
          activeStepId={state.processStrip.id === 'journey' ? 'build' : undefined}
        />
      }
    />
  );
}
