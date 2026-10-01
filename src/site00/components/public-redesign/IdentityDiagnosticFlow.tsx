import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  getIdntyAssessmentState,
  idntyAssessmentPath,
  idntyAssessmentCompletePath,
  idntyAssessmentReviewPath,
  type IdntyAssessmentStateId,
  type IdntyAssessmentStep,
} from '../../config/idnty-assessment';
import {
  identityQuestionCounter,
  identityStateMeta,
  identityStepPresentation,
  isOtherSelected,
} from '../../config/idnty-public-redesign';
import { useIdntyAssessment } from '../../hooks/useIdntyAssessment';
import { validateStep } from '../idnty-assessment/IdntyStepForm';
import {
  IDENTITY_AUTHORITY_DOMAIN_ORDER,
  identityEvidenceFromAnswers,
  identityEvidenceToAnswers,
  unavailableIdentityAuthorityGateway,
  type IdentityAuthorityDomain,
  type IdentityEvidenceState,
} from '../../lib/identityAuthorityVerification';
import { PublicRedesignShell } from './PublicRedesignShell';
import { SpatialEnvironmentFrame } from './SpatialEnvironmentFrame';
import {
  IdentityHero,
  IdentityMachineStage,
  IdentityStateProgression,
  TransformingStatePanel,
} from './IdentityDiagnosticChrome';
import { IdentityMachineGlyph } from './IdentityMachines';
import {
  ConditionalOtherField,
  PanelError,
  PanelQuestion,
  TechnicalOptionCards,
  TechnicalOptionTiles,
  TechnicalRadioRows,
  TechnicalTextarea,
} from './TechnicalControls';
import { PanelActions, PanelWideCta } from './PanelActions';
import { IdentityReviewSummary } from './IdentityReviewSummary';
import {
  BuildReadyAuthorityCheckList,
  BuildReadyEvidenceList,
  BuildReadyReview,
  BuildReadyVerificationList,
} from './BuildReadyVerification';

type IdentityDiagnosticFlowProps = {
  stateSlug: IdntyAssessmentStateId;
  /** null → state detail · 'review' → review mode · otherwise a step id. */
  segment: string | null;
};

type SubmitState = 'idle' | 'submitting' | 'failed' | 'unavailable';

const asArray = (value: string | string[] | undefined): string[] =>
  Array.isArray(value) ? value : value ? [value] : [];

const asText = (value: string | string[] | undefined): string =>
  typeof value === 'string' ? value : Array.isArray(value) ? (value[0] ?? '') : '';

function hasAnswer(step: IdntyAssessmentStep, value: string | string[] | undefined): boolean {
  if (step.type === 'custom') return false;
  if (step.type === 'textarea') return asText(value).trim().length > 0;
  return asArray(value).length > 0;
}

/**
 * IDNTY Diagnostic family — ONE continuous surface for overview-to-state detail, every question and
 * review. The hero, machine, 00–03 progression and shell stay mounted; only the LOWER state panel
 * transforms (detail → working → review). The route is the source of truth for which mode shows.
 */
export function IdentityDiagnosticFlow({ stateSlug, segment }: IdentityDiagnosticFlowProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = getIdntyAssessmentState(stateSlug)!;
  const meta = identityStateMeta(stateSlug);
  const {
    startState,
    setStepAnswers,
    markStepComplete,
    getAnswersForState,
    submitAssessment,
    serverSaveState,
    serverIntakeId,
  } = useIdntyAssessment();
  const answers = getAnswersForState(stateSlug);

  const mode: 'detail' | 'question' | 'review' =
    segment === null ? 'detail' : segment === 'review' ? 'review' : 'question';
  const step = segment && segment !== 'review' ? state.steps.find((s) => s.id === segment) : undefined;
  const stepIndex = step ? state.steps.findIndex((s) => s.id === step.id) : -1;

  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const isBuildReady = stateSlug === 'build-ready';
  const evidence: IdentityEvidenceState = useMemo(
    () => identityEvidenceFromAnswers(isBuildReady ? (answers as Record<string, string | string[]>) : undefined),
    [answers, isBuildReady],
  );

  useEffect(() => {
    if (segment !== null && segment !== 'review' && !step) return;
    startState(stateSlug, step?.id ?? null);
  }, [stateSlug, step?.id, segment]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setError(null);
    setSubmitState('idle');
  }, [segment, stateSlug]);

  // Unknown / retired step ids (e.g. a stored `project` or `services` resume point) → state detail.
  if (segment !== null && segment !== 'review' && !step) {
    return <Navigate to={idntyAssessmentPath(stateSlug)} replace />;
  }

  const go = (path: string) => navigate(path);

  const firstTarget = (): string => {
    const target = state.steps.find((s) => !hasAnswer(s, answers[s.id])) ?? state.steps[0];
    return idntyAssessmentPath(stateSlug, target?.id);
  };

  const backFromQuestion = () => {
    const prev = stepIndex > 0 ? state.steps[stepIndex - 1] : null;
    go(prev ? idntyAssessmentPath(stateSlug, prev.id) : idntyAssessmentPath(stateSlug));
  };

  const backFromReview = () => {
    const last = state.steps[state.steps.length - 1];
    go(idntyAssessmentPath(stateSlug, last?.id));
  };

  const continueFromQuestion = () => {
    if (!step) return;
    const message = validateStep(step, answers[step.id] ?? (step.type === 'multi' ? [] : ''));
    if (message) {
      setError(message);
      return;
    }
    markStepComplete(stateSlug, step.id);
    const next = state.steps[stepIndex + 1];
    go(next ? idntyAssessmentPath(stateSlug, next.id) : idntyAssessmentReviewPath(stateSlug));
  };

  const persistValue = (stepId: string, value: string | string[]) => {
    setError(null);
    setStepAnswers(stateSlug, stepId, { [stepId]: value });
  };

  const persistEvidence = (next: IdentityEvidenceState) => {
    setStepAnswers(stateSlug, 'evidence', identityEvidenceToAnswers(next));
  };

  const toggleSource = (domain: IdentityAuthorityDomain, sourceId: string) => {
    const current = evidence.sourcesByDomain[domain];
    persistEvidence({
      ...evidence,
      sourcesByDomain: {
        ...evidence.sourcesByDomain,
        [domain]: current.includes(sourceId) ? current.filter((id) => id !== sourceId) : [...current, sourceId],
      },
    });
  };

  const toggleReviewFlag = (domain: IdentityAuthorityDomain) => {
    persistEvidence({
      ...evidence,
      reviewFlags: evidence.reviewFlags.includes(domain)
        ? evidence.reviewFlags.filter((d) => d !== domain)
        : [...evidence.reviewFlags, domain],
    });
  };

  const handleSubmit = async () => {
    setSubmitState('submitting');
    if (isBuildReady) {
      // No identity-authority verification backend exists. Report that honestly; never fake a submission.
      const result = await unavailableIdentityAuthorityGateway.submitForVerification({
        intakeId: serverIntakeId ?? '',
        evidence,
      });
      setSubmitState(result.ok ? 'idle' : 'unavailable');
      return;
    }
    // Never submit an incomplete assessment: send the person to the first unanswered required question.
    const missing = state.steps.find((s) => validateStep(s, answers[s.id] ?? (s.type === 'multi' ? [] : '')) !== null);
    if (missing) {
      setSubmitState('idle');
      go(idntyAssessmentPath(stateSlug, missing.id));
      return;
    }
    const ok = await submitAssessment(stateSlug);
    if (ok) {
      go(idntyAssessmentCompletePath(stateSlug));
      return;
    }
    setSubmitState('failed');
  };

  /* ------------------------------------------------------------------ body */

  const primaryLabelFor = (): string => {
    if (!step) return 'CONTINUE';
    const isLast = stepIndex === state.steps.length - 1;
    if (isBuildReady) return isLast ? 'REVIEW VERIFICATION' : 'CONTINUE VERIFICATION';
    return isLast ? 'REVIEW ASSESSMENT' : 'CONTINUE';
  };

  const renderStepBody = (current: IdntyAssessmentStep) => {
    if (isBuildReady) {
      const openDomain = (domain: IdentityAuthorityDomain) =>
        navigate(idntyAssessmentPath(stateSlug, 'evidence'), { state: { openDomain: domain } });
      if (current.id === 'verification') {
        return <BuildReadyVerificationList evidence={evidence} snapshot={null} onOpenDomain={openDomain} />;
      }
      if (current.id === 'evidence') {
        const initiallyOpen = (location.state as { openDomain?: IdentityAuthorityDomain } | null)?.openDomain;
        return (
          <BuildReadyEvidenceList
            key={initiallyOpen ?? 'none'}
            evidence={evidence}
            snapshot={null}
            initiallyOpen={IDENTITY_AUTHORITY_DOMAIN_ORDER.includes(initiallyOpen as IdentityAuthorityDomain) ? (initiallyOpen as IdentityAuthorityDomain) : null}
            onToggleSource={toggleSource}
            onToggleReviewFlag={toggleReviewFlag}
          />
        );
      }
      return <BuildReadyAuthorityCheckList evidence={evidence} snapshot={null} onOpenDomain={openDomain} />;
    }

    const presentation = identityStepPresentation(stateSlug, current.id);
    const raw = answers[current.id];
    const options = current.options ?? [];
    const invalid = Boolean(error);

    if (current.type === 'textarea') {
      return (
        <TechnicalTextarea
          id={`s00pr-${stateSlug}-${current.id}`}
          value={asText(raw)}
          onChange={(value) => persistValue(current.id, value)}
          maxLength={current.maxLength ?? 500}
          placeholder={current.placeholder}
          fieldLabel={presentation?.fieldLabel}
          ariaLabel={current.title}
          invalid={invalid}
        />
      );
    }

    const mode = current.type === 'single' ? 'single' : 'multi';
    const selected = mode === 'single' ? asArray(raw).slice(0, 1) : asArray(raw);
    const toggle = (id: string) => {
      if (mode === 'single') {
        persistValue(current.id, id);
        return;
      }
      persistValue(current.id, selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    };

    const selector =
      presentation?.kind === 'cards' ? (
        <TechnicalOptionCards options={options} selected={selected} mode={mode} onToggle={toggle} icons={presentation.icons} groupLabel={current.title} invalid={invalid} />
      ) : presentation?.kind === 'rows' || presentation?.kind === 'timeline' ? (
        <TechnicalRadioRows
          options={options}
          selected={selected}
          onToggle={toggle}
          icons={presentation.icons}
          groupLabel={current.title}
          invalid={invalid}
          columns={presentation.kind === 'timeline' ? 2 : 1}
        />
      ) : (
        <TechnicalOptionTiles
          options={options}
          selected={selected}
          mode={mode}
          onToggle={toggle}
          icons={presentation?.icons}
          groupLabel={current.title}
          invalid={invalid}
          columns={presentation?.columns === 2 || presentation?.columns === 3 ? presentation.columns : presentation?.columns === 5 ? 5 : 3}
        />
      );

    const otherKey = current.conditionalOtherKey;
    return (
      <>
        {selector}
        {otherKey && isOtherSelected(raw) ? (
          <ConditionalOtherField
            id={`s00pr-${stateSlug}-${otherKey}`}
            value={asText(answers[otherKey])}
            onChange={(value) => {
              setError(null);
              setStepAnswers(stateSlug, current.id, { [otherKey]: value });
            }}
            label="OTHER — PLEASE SPECIFY"
            placeholder="DESCRIBE WHAT YOU MEAN…"
          />
        ) : null}
      </>
    );
  };

  /* ---------------------------------------------------------------- render */

  const subLine =
    mode === 'review'
      ? isBuildReady
        ? 'REVIEW VERIFICATION'
        : 'REVIEW ASSESSMENT'
      : isBuildReady && mode === 'question'
        ? step?.id === 'authority-check'
          ? 'AUTHORITY CHECK 03'
          : null
        : meta.quote;
  // Review keeps the state's own lead line (FOUNDATION / REFINE IDENTITY / EVOLVE IDENTITY) above the review label.
  const verificationLine =
    mode === 'detail'
      ? undefined
      : isBuildReady
        ? 'IDENTITY AUTHORITY VERIFICATION'
        : mode === 'review'
          ? (meta.workingEyebrow ?? 'FOUNDATION')
          : undefined;

  let body: ReactNode;
  let footer: ReactNode = null;
  let bodyKey = 'detail';

  if (mode === 'detail') {
    body = (
      <div className="s00pr-detail">
        <div className="s00pr-detail__means">
          <div>
            <h3 className="s00pr-sectionhead">WHAT THIS MEANS</h3>
            <p className="s00pr-detail__text">{meta.whatThisMeans}</p>
          </div>
          <IdentityMachineGlyph machine={meta.machine} className="s00pr-detail__glyph" />
        </div>
        <div className="s00pr-detail__facts">
          <div>
            <h3 className="s00pr-sectionhead">KEY DELIVERABLES</h3>
            <ul className="s00pr-pluslist">
              {meta.deliverables.map((item) => (
                <li key={item}>
                  <span className="s00pr-pluslist__plus" aria-hidden="true">
                    +
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <span className="s00pr-detail__vr" aria-hidden="true" />
          <div>
            <h3 className="s00pr-sectionhead">INVESTMENT</h3>
            <p className="s00pr-detail__price">{meta.investmentLabel}</p>
          </div>
        </div>
        <PanelWideCta label={meta.detailCta} onClick={() => go(firstTarget())} />
      </div>
    );
  } else if (mode === 'question' && step) {
    bodyKey = `question:${step.id}`;
    body = (
      <>
        <PanelQuestion
          eyebrow={meta.workingEyebrow}
          counter={identityQuestionCounter(stateSlug, step.id)}
          title={step.title}
          subtitle={step.subtitle}
          segments={state.steps.length}
          activeSegment={stepIndex}
        />
        <div className="s00pr-question__surface">{renderStepBody(step)}</div>
        {error ? <PanelError>{error}</PanelError> : null}
      </>
    );
    footer = (
      <PanelActions
        onBack={backFromQuestion}
        saveState={serverSaveState}
        primaryLabel={primaryLabelFor()}
        onPrimary={continueFromQuestion}
      />
    );
  } else {
    bodyKey = 'review';
    body = (
      <>
        {isBuildReady ? (
          <BuildReadyReview evidence={evidence} snapshot={null} />
        ) : (
          <IdentityReviewSummary
            state={state}
            answers={answers}
            onEdit={(stepId) => go(idntyAssessmentPath(stateSlug, stepId))}
          />
        )}
        {submitState === 'failed' ? (
          <PanelError>
            SITE 00 COULD NOT CONFIRM YOUR SUBMISSION. YOUR ANSWERS ARE SAVED ON THIS DEVICE — TRY AGAIN.
          </PanelError>
        ) : null}
        {submitState === 'unavailable' ? (
          <PanelError>
            VERIFICATION SUBMISSION IS NOT AVAILABLE YET. YOUR EVIDENCE IS SAVED AS A DRAFT AND NOTHING HAS BEEN SUBMITTED OR VERIFIED.
          </PanelError>
        ) : null}
      </>
    );
    footer = (
      <PanelActions
        onBack={backFromReview}
        saveState={serverSaveState}
        primaryLabel={isBuildReady ? 'SUBMIT FOR VERIFICATION' : 'SUBMIT IDENTITY ASSESSMENT'}
        onPrimary={handleSubmit}
        busy={submitState === 'submitting'}
      />
    );
  }

  if (mode === 'detail') {
    footer = null;
  }

  const domainsWithEvidence = isBuildReady
    ? Object.fromEntries(IDENTITY_AUTHORITY_DOMAIN_ORDER.map((d) => [d, evidence.sourcesByDomain[d].length > 0]))
    : undefined;

  return (
    <PublicRedesignShell
      section="idnty"
      className="s00pr-shell--identity"
      authorityId={authorityIdFor(stateSlug, segment)}
      environment={<SpatialEnvironmentFrame slotId="ENV.IDNTY.ATRIUM" />}
    >
      <div className="s00pr-identity" data-identity-state={stateSlug} data-identity-mode={mode}>
        <IdentityHero sideNote={meta.sideNote} />
        <IdentityMachineStage machine={meta.machine} domainsWithEvidence={domainsWithEvidence} />
        <IdentityStateProgression activeCode={meta.code} mode={mode === 'detail' ? 'link' : 'static'} />
        <TransformingStatePanel
          meta={meta}
          mode={mode}
          subLine={subLine}
          verificationLine={verificationLine}
          bodyKey={bodyKey}
          footer={footer}
        >
          {body}
        </TransformingStatePanel>
      </div>
    </PublicRedesignShell>
  );
}

/** Maps a flow position back to its authority record id (dev badge + QA). */
export function authorityIdFor(stateSlug: IdntyAssessmentStateId, segment: string | null): string {
  const detail: Record<IdntyAssessmentStateId, string> = {
    'starting-at-zero': '02_IDNTY_STATE_00_FOUNDATION',
    'some-pieces-exist': '03_IDNTY_STATE_01_REFINE',
    'ready-for-evolution': '04_IDNTY_STATE_02_EVOLUTION',
    'build-ready': '05_IDNTY_STATE_03_BUILD_READY',
  };
  if (segment === null) return detail[stateSlug];
  const table: Record<string, string> = {
    'starting-at-zero:goal': '01_FOUNDATION_PRIMARY_GOAL',
    'starting-at-zero:audience': '02_FOUNDATION_AUDIENCE',
    'starting-at-zero:timeline': '03_FOUNDATION_TIMELINE',
    'starting-at-zero:budget': '04_FOUNDATION_BUDGET',
    'starting-at-zero:review': '05_FOUNDATION_REVIEW',
    'some-pieces-exist:assets': '01_REFINE_EXISTING_ASSETS',
    'some-pieces-exist:cohesion-diagnostic': '02_REFINE_CONDITION',
    'some-pieces-exist:gaps': '03_REFINE_GAPS',
    'some-pieces-exist:review': '04_REFINE_REVIEW',
    'ready-for-evolution:pathways': '01_EVOLUTION_AREAS',
    'ready-for-evolution:goals': '02_EVOLUTION_GOALS',
    'ready-for-evolution:timeline': '03_EVOLUTION_TIMELINE',
    'ready-for-evolution:review': '04_EVOLUTION_REVIEW',
    'build-ready:verification': '01_BUILD_READY_VERIFICATION',
    'build-ready:evidence': '02_BUILD_READY_EVIDENCE',
    'build-ready:authority-check': '03_BUILD_READY_AUTHORITY_CHECK',
    'build-ready:review': '04_BUILD_READY_REVIEW_VERIFICATION',
  };
  return table[`${stateSlug}:${segment}`] ?? detail[stateSlug];
}
