import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getIdntyAssessmentState,
  idntyAssessmentPath,
  IDNTY_EVOLUTION_PATHWAYS,
  IDNTY_EXISTING_ASSET_OPTIONS,
  type IdntyAssessmentStateId,
} from '../../../config/idnty-assessment';
import {
  computeFoundationProgress,
  computeInventorySummary,
} from '../../../config/identity-state-v2';
import { SITE00_ROUTES, site00IdntyAssessmentDesktopPath } from '../../../config/routes';
import { useIdntyAssessment } from '../../../hooks/useIdntyAssessment';
import { IdntyAssessmentActions } from '../../idnty-assessment/IdntyAssessmentShell';
import { IdntyQuestionList } from '../../idnty-assessment/IdntyAssessmentPanels';
import { IdentityStateHero } from './IdentityStateProgress';
import { IdentityStateProgress } from './IdentityStateProgress';
import { IdentityStatusOverview } from './IdentityStatusOverview';
import { IdentityInventoryScanner } from './IdentityInventoryScanner';
import { IdentityProcessSystem } from './IdentityProcessSystem';

type IdentityStateLandingV2Props = {
  stateSlug: IdntyAssessmentStateId;
  isDesktop: boolean;
};

export function IdentityStateLandingV2({ stateSlug, isDesktop }: IdentityStateLandingV2Props) {
  const navigate = useNavigate();
  const state = getIdntyAssessmentState(stateSlug)!;
  const { startState, setStepAnswers, markStepComplete, getAnswersForState } = useIdntyAssessment();

  const persisted = getAnswersForState(stateSlug);
  const persistedAssets = (persisted.assets ?? persisted[pathwaysKey(stateSlug)] ?? []) as string[];

  const [selected, setSelected] = useState<string[]>(() =>
    Array.isArray(persistedAssets) ? persistedAssets : [],
  );
  const [otherText, setOtherText] = useState(() => String(persisted['other-specify'] ?? ''));
  const [activeQuestion, setActiveQuestion] = useState<string | undefined>(
    state.landingType === 'question-list' ? state.landingOptions?.[0]?.id : undefined,
  );

  useEffect(() => {
    startState(stateSlug);
  }, [stateSlug, startState]);

  useEffect(() => {
    const assets = getAnswersForState(stateSlug);
    const list = assets.assets ?? assets[pathwaysKey(stateSlug)];
    if (Array.isArray(list)) setSelected(list);
    if (assets['other-specify']) setOtherText(String(assets['other-specify']));
  }, [getAnswersForState, stateSlug]);

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

  const foundationProgress = useMemo(
    () => computeFoundationProgress(completedQuestionIds),
    [completedQuestionIds],
  );

  const inventoryOptions =
    stateSlug === 'ready-for-evolution'
      ? IDNTY_EVOLUTION_PATHWAYS
      : stateSlug === 'build-ready'
        ? IDNTY_EXISTING_ASSET_OPTIONS
        : IDNTY_EXISTING_ASSET_OPTIONS;

  const inventorySummary = useMemo(
    () => computeInventorySummary(inventoryOptions, selected),
    [inventoryOptions, selected],
  );

  const toggleSelection = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, []);

  const persistSelection = useCallback(() => {
    const firstStep = state.steps[0];
    if (!firstStep) return;

    const storageStepId =
      stateSlug === 'build-ready' ? 'assets' : firstStep.id;
    const storageKey =
      stateSlug === 'ready-for-evolution'
        ? 'pathways'
        : stateSlug === 'build-ready'
          ? 'assets'
          : 'assets';

    const payload: Record<string, string | string[]> = { [storageKey]: selected };
    if (selected.includes('other') && otherText.trim()) {
      payload['other-specify'] = otherText.trim();
    }
    setStepAnswers(stateSlug, storageStepId, payload);
    if (selected.includes('other') && otherText.trim()) {
      setStepAnswers(stateSlug, 'other-specify', { 'other-specify': otherText.trim() });
    }
    markStepComplete(stateSlug, storageStepId);
  }, [markStepComplete, otherText, selected, setStepAnswers, state.steps, stateSlug]);

  const navigateToPath = (path: string) => {
    navigate(isDesktop ? site00IdntyAssessmentDesktopPath(path) : path);
  };

  const handleQuestionSelect = (id: string) => {
    setActiveQuestion(id);
    navigateToPath(idntyAssessmentPath(stateSlug, id));
  };

  const handleContinue = () => {
    if (stateSlug === 'starting-at-zero') {
      const firstIncomplete =
        state.steps.find((s) => !completedQuestionIds.includes(s.id)) ?? state.steps[0];
      if (firstIncomplete) handleQuestionSelect(firstIncomplete.id);
      return;
    }

    if (selected.length === 0 && state.steps[0]?.required) return;

    persistSelection();

    if (stateSlug === 'build-ready' && inventorySummary.completenessPct >= 60) {
      navigate(SITE00_ROUTES.bldrStart);
      return;
    }

    const nextStep = state.steps[1];
    navigateToPath(
      nextStep ? idntyAssessmentPath(stateSlug, nextStep.id) : idntyAssessmentPath(stateSlug, 'review'),
    );
  };

  const primaryLabel =
    stateSlug === 'starting-at-zero'
      ? 'CONTINUE FOUNDATION →'
      : stateSlug === 'some-pieces-exist'
        ? 'CONTINUE IDENTITY →'
        : stateSlug === 'ready-for-evolution'
          ? 'CONTINUE DIAGNOSTIC →'
          : inventorySummary.completenessPct >= 60
            ? 'VERIFY & CONTINUE TO BLDR →'
            : 'CONTINUE VERIFICATION →';

  const diagnosticLines =
    stateSlug === 'ready-for-evolution'
      ? [
          `CURRENT SYSTEM: ${selected.length > 0 ? 'AREAS IDENTIFIED' : 'ESTABLISHED'}`,
          'ASSESSMENT MODE: EVOLUTION',
          `OBJECTIVE: ${selected.length > 0 ? 'PRESERVE + IMPROVE' : 'AWAITING INPUT'}`,
        ]
      : [];

  const verificationStatus =
    inventorySummary.found === 0
      ? 'UNVERIFIED'
      : inventorySummary.completenessPct >= 80
        ? 'READY'
        : 'IN REVIEW';

  return (
    <div className="site00-idnty-state-v2">
      <IdentityStateProgress stateId={stateSlug} />
      <IdentityStateHero state={state} />

      {stateSlug === 'starting-at-zero' ? (
        <IdentityStatusOverview
          mode="foundation"
          foundationPct={foundationProgress.pct}
          foundationStatus={
            foundationProgress.pct === 0 ? 'FOUNDATION NOT YET DEFINED' : 'FOUNDATION IN PROGRESS'
          }
        />
      ) : null}

      {stateSlug === 'some-pieces-exist' ? (
        <IdentityStatusOverview mode="inventory" inventory={inventorySummary} />
      ) : null}

      {stateSlug === 'ready-for-evolution' ? (
        <IdentityStatusOverview mode="diagnostic" diagnosticLines={diagnosticLines} />
      ) : null}

      {stateSlug === 'build-ready' ? (
        <IdentityStatusOverview
          mode="verification"
          inventory={inventorySummary}
          verificationStatus={verificationStatus}
        />
      ) : null}

      <div className="site00-idnty-state-v2__panel">
        {stateSlug === 'starting-at-zero' && state.landingOptions ? (
          <section className="site00-idnty-state-v2__origin">
            <header className="site00-idnty-state-v2__scanner-header">
              <p className="site00-idnty-state-v2__scanner-kicker">IDENTITY ORIGIN</p>
              <h2 className="site00-idnty-state-v2__scanner-title">WHAT ARE WE BUILDING?</h2>
            </header>
            <IdntyQuestionList
              options={state.landingOptions}
              activeId={activeQuestion}
              completedIds={completedQuestionIds}
              onSelect={handleQuestionSelect}
            />
          </section>
        ) : null}

      {stateSlug === 'some-pieces-exist' ? (
        <IdentityInventoryScanner
          title="WHAT DO YOU ALREADY HAVE?"
          subtitle="SELECT ALL THAT APPLY. WE'LL HELP YOU FILL IN THE GAPS."
          options={IDNTY_EXISTING_ASSET_OPTIONS}
          selected={selected}
          onToggle={toggleSelection}
          showOtherField={selected.includes('other')}
          otherValue={otherText}
          onOtherChange={setOtherText}
        />
      ) : null}

      {stateSlug === 'ready-for-evolution' ? (
        <IdentityInventoryScanner
          kicker="IDENTITY DIAGNOSTIC"
          title="WHAT NEEDS TO EVOLVE?"
          subtitle="SELECT THE AREAS THAT REQUIRE REFINEMENT OR EVOLUTION."
          options={IDNTY_EVOLUTION_PATHWAYS}
          selected={selected}
          onToggle={toggleSelection}
          statusFound="SELECTED"
          statusMissing="NOT SELECTED"
        />
      ) : null}

      {stateSlug === 'build-ready' ? (
        <IdentityInventoryScanner
          kicker="BUILD KIT VERIFICATION"
          title="VERIFY YOUR IDENTITY ASSETS"
          subtitle="CONFIRM WHICH BUILD-REQUIRED ASSETS ARE ALREADY IN PLACE."
          options={IDNTY_EXISTING_ASSET_OPTIONS}
          selected={selected}
          onToggle={toggleSelection}
          statusFound="FOUND"
          statusMissing="NEEDED"
        />
      ) : null}

        <IdntyAssessmentActions
          primaryLabel={primaryLabel}
          onPrimary={handleContinue}
          secondaryLabel="BACK"
          secondaryHref={SITE00_ROUTES.idntyState}
          primaryDisabled={
            stateSlug !== 'starting-at-zero' && selected.length === 0 && Boolean(state.steps[0]?.required)
          }
        />
      </div>

      <IdentityProcessSystem strip={state.processStrip} stateId={stateSlug} />
    </div>
  );
}

function pathwaysKey(stateSlug: IdntyAssessmentStateId): string {
  if (stateSlug === 'ready-for-evolution') return 'pathways';
  return 'assets';
}
