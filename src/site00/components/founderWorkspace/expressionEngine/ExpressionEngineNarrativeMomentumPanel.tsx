/**
 * P0.NDX.NARRATIVE-MOMENTUM-COMPACT-WIZARD-WORKSPACE1 — six-step founder review wizard.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  NarrativeBeat,
  NarrativeEvidenceObject,
  NarrativeMomentumPlan,
  NarrativeValidationIssue,
} from '../../../../../shared/site00-expression-engine/narrative-momentum/types.js';
import { NarrativeMomentumInspectorSheet } from './NarrativeMomentumWizardInspectors.js';
import {
  deriveNarrativeApprovalReadiness,
  ENTRY_002_NME_DISPLAY_TITLE,
  NME_WIZARD_STEP_COUNT,
  NME_WIZARD_STEPS,
  proofStatusChip,
  stepHasFlagWarning,
  summarizeProofStatus,
  tensionSequenceValid,
  type NmeWizardStep,
} from './narrativeMomentumWizardModel.js';
import {
  defaultWizardState,
  loadNmeWizardState,
  saveNmeWizardState,
} from './narrativeMomentumWizardPersistence.js';
import '../../../styles/site00-narrative-momentum-review.css';
import '../../../styles/site00-narrative-momentum-wizard.css';

type Props = {
  plan: NarrativeMomentumPlan;
  grammarLibraryCount: number;
  entryTitle?: string;
  judging: boolean;
  onJudgment: (
    action:
      | 'APPROVE_NARRATIVE'
      | 'REFINE_NARRATIVE'
      | 'CHANGE_GRAMMAR'
      | 'LOVE_IT'
      | 'PROMISING'
      | 'TOO_CLOSE'
      | 'NOT_NDXBOOK',
  ) => Promise<void>;
  onRecompile: () => Promise<void>;
};

type InspectorKind = 'beat' | 'proof' | 'flag' | 'reel' | 'carousel' | null;

export function ExpressionEngineNarrativeMomentumPanel({
  plan,
  grammarLibraryCount,
  entryTitle = ENTRY_002_NME_DISPLAY_TITLE,
  judging,
  onJudgment,
  onRecompile,
}: Props) {
  const issues = plan.validationIssues?.length ? plan.validationIssues : [];
  const evidence = plan.evidence ?? [];
  const reel = plan.formatAdaptations.find((f) => f.format === 'REEL');
  const carousel = plan.formatAdaptations.find((f) => f.format === 'CAROUSEL');

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<NmeWizardStep>(1);
  const [selectedBeatId, setSelectedBeatId] = useState<string | null>(plan.beats[0]?.beatId ?? null);
  const [selectedProofId, setSelectedProofId] = useState<string | null>(null);
  const [formatTab, setFormatTab] = useState<'REEL' | 'CAROUSEL'>('REEL');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [inspector, setInspector] = useState<InspectorKind>(null);
  const [flagInspect, setFlagInspect] = useState<NarrativeValidationIssue | null>(null);
  const [selectedReelBeatId, setSelectedReelBeatId] = useState<string | null>(null);
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    const saved = loadNmeWizardState(plan.id);
    const base = defaultWizardState(plan.beats[0]?.beatId ?? null);
    if (saved) {
      if (saved.currentWizardStep && saved.currentWizardStep >= 1 && saved.currentWizardStep <= NME_WIZARD_STEP_COUNT) {
        setStep(saved.currentWizardStep as NmeWizardStep);
      }
      if (saved.selectedBeatId) setSelectedBeatId(saved.selectedBeatId);
      if (saved.selectedProofId) setSelectedProofId(saved.selectedProofId);
      if (saved.selectedFormat) setFormatTab(saved.selectedFormat);
      if (saved.completedSteps) setCompletedSteps(saved.completedSteps);
    } else {
      setStep(base.currentWizardStep);
    }
    setHydrated(true);
  }, [plan.id, plan.beats]);

  useEffect(() => {
    if (!hydrated) return;
    saveNmeWizardState(plan.id, {
      currentWizardStep: step,
      selectedBeatId,
      selectedProofId,
      selectedFormat: formatTab,
      completedSteps,
    });
  }, [hydrated, plan.id, step, selectedBeatId, selectedProofId, formatTab, completedSteps]);

  const activeBeat = useMemo(
    () => plan.beats.find((b) => b.beatId === selectedBeatId) ?? plan.beats[0],
    [plan.beats, selectedBeatId],
  );

  const activeProof = useMemo(
    () => evidence.find((e) => e.id === selectedProofId) ?? null,
    [evidence, selectedProofId],
  );

  const proofSummary = useMemo(() => summarizeProofStatus(evidence), [evidence]);
  const readiness = useMemo(() => deriveNarrativeApprovalReadiness(plan, issues), [plan, issues]);

  const markStepComplete = useCallback((s: number) => {
    setCompletedSteps((prev) => (prev.includes(s) ? prev : [...prev, s]));
  }, []);

  const goNext = useCallback(() => {
    markStepComplete(step);
    setStep((s) => (s < NME_WIZARD_STEP_COUNT ? ((s + 1) as NmeWizardStep) : s));
    setInspector(null);
  }, [markStepComplete, step]);

  const goBack = useCallback(() => {
    setStep((s) => (s > 1 ? ((s - 1) as NmeWizardStep) : s));
    setInspector(null);
  }, []);

  const openBeatInspector = (beatId: string) => {
    setSelectedBeatId(beatId);
    setInspector('beat');
  };

  const openProofInspector = (proofId: string) => {
    setSelectedProofId(proofId);
    setInspector('proof');
  };

  const stepMeta = NME_WIZARD_STEPS.find((s) => s.id === step)!;

  const contextRail = (
    <aside className="site00-nme-wizard__context" data-testid="nme-wizard-context-rail">
      <p className="site00-nme-wizard__label">Context</p>
      {activeBeat ?
        <p className="site00-nme-wizard__body-sm">
          Beat {String(activeBeat.order).padStart(2, '0')} · {activeBeat.label}
        </p>
      : null}
      {activeProof ?
        <p className="site00-nme-wizard__meta">{activeProof.proofType.replace(/_/g, ' ')}</p>
      : null}
      <p className="site00-nme-wizard__meta">{stepMeta.question}</p>
    </aside>
  );

  return (
    <section className="site00-nme-wizard" data-testid="narrative-momentum-wizard">
      <header className="site00-nme-wizard__header" data-testid="nme-wizard-header">
        <div>
          <h2 className="site00-nme-wizard__display">Narrative Momentum</h2>
          <p className="site00-nme-wizard__meta">
            Entry · {entryTitle} · Status · {plan.founderStatus.replace(/_/g, ' ')} · Grammar ·{' '}
            {plan.selectedGrammarId.replace(/_/g, ' ')}
          </p>
          {plan.layerMode === 'RETROACTIVE_AUTHORITY_LAYER' ?
            <span className="site00-nme-wizard__chip">Retroactive authority</span>
          : null}
        </div>
        <button
          type="button"
          className="site00-nme-wizard__btn site00-nme-wizard__btn--ghost"
          onClick={() => setShowTechnical((v) => !v)}
        >
          {showTechnical ? 'Hide technical' : 'Technical details'}
        </button>
        {showTechnical ?
          <p className="site00-nme-wizard__meta">
            v{plan.version} · {plan.id} · library {grammarLibraryCount} · provider spend {plan.providerDispatchCount}
          </p>
        : null}
      </header>

      <nav className="site00-nme-wizard__steps" data-testid="nme-wizard-step-nav" aria-label="Wizard steps">
        {NME_WIZARD_STEPS.map((s) => {
          const done = completedSteps.includes(s.id) || s.id < step;
          const flagged = stepHasFlagWarning(s.id, issues);
          return (
            <button
              key={s.id}
              type="button"
              className={`site00-nme-wizard__step-pill${step === s.id ? ' site00-nme-wizard__step-pill--active' : ''}${done ? ' site00-nme-wizard__step-pill--done' : ''}`}
              onClick={() => {
                setStep(s.id);
                setInspector(null);
              }}
            >
              {done ? '✓ ' : ''}
              {s.nav}
              {flagged ? ' ⚠' : ''}
            </button>
          );
        })}
      </nav>

      <div className="site00-nme-wizard__shell">
        <main className="site00-nme-wizard__stage" data-testid={`nme-wizard-step-${stepMeta.slug}`}>
          <p className="site00-nme-wizard__section">{stepMeta.question}</p>

          {step === 1 ?
            <StoryShiftStep plan={plan} onJudgment={onJudgment} judging={judging} />
          : null}
          {step === 2 ?
            <BeatMapStep beats={plan.beats} selectedBeatId={selectedBeatId} onSelectBeat={openBeatInspector} />
          : null}
          {step === 3 ?
            <TensionProofStep
              beats={plan.beats}
              evidence={evidence}
              selectedBeatId={selectedBeatId}
              onSelectBeat={(id) => {
                setSelectedBeatId(id);
              }}
              onOpenBeat={() => setInspector('beat')}
              onOpenProof={openProofInspector}
            />
          : null}
          {step === 4 ?
            <ReframeLoopStep plan={plan} />
          : null}
          {step === 5 ?
            <FormatStep
              formatTab={formatTab}
              setFormatTab={setFormatTab}
              reel={reel}
              carousel={carousel}
              onSelectReel={(id) => {
                setSelectedReelBeatId(id);
                setInspector('reel');
              }}
              onSelectSlide={(n) => {
                setSelectedSlide(n);
                setInspector('carousel');
              }}
            />
          : null}
          {step === 6 ?
            <ReviewStep
              plan={plan}
              issues={issues}
              proofSummary={proofSummary}
              readiness={readiness}
              tensionOk={tensionSequenceValid(issues)}
              onFlagInspect={setFlagInspect}
              onJudgment={onJudgment}
              judging={judging}
              onRecompile={onRecompile}
            />
          : null}
        </main>
        {contextRail}
      </div>

      <footer className="site00-nme-wizard__action-bar" data-testid="nme-wizard-action-bar">
        <button type="button" className="site00-nme-wizard__btn" disabled={step === 1} onClick={goBack}>
          Back
        </button>
        {step === 2 && activeBeat ?
          <button type="button" className="site00-nme-wizard__btn" onClick={() => openBeatInspector(activeBeat.beatId)}>
            Review selected beat
          </button>
        : null}
        {step === 6 ?
          <button
            type="button"
            className="site00-nme-wizard__btn site00-nme-wizard__btn--primary"
            disabled={judging || !readiness.ready}
            onClick={() => void onJudgment('APPROVE_NARRATIVE')}
          >
            Approve narrative
          </button>
        : (
          <button type="button" className="site00-nme-wizard__btn site00-nme-wizard__btn--primary" onClick={goNext}>
            Next
          </button>
        )}
      </footer>

      <NarrativeMomentumInspectorSheet
        open={inspector === 'beat' && !!activeBeat}
        title={activeBeat ? `Beat ${activeBeat.order} · ${activeBeat.label}` : 'Beat'}
        onClose={() => setInspector(null)}
        testId="nme-beat-inspector"
      >
        {activeBeat ? <BeatInspectorDetail beat={activeBeat} /> : null}
      </NarrativeMomentumInspectorSheet>

      <NarrativeMomentumInspectorSheet
        open={inspector === 'proof' && !!activeProof}
        title={activeProof ? activeProof.proofType.replace(/_/g, ' ') : 'Proof'}
        onClose={() => setInspector(null)}
        testId="nme-proof-inspector"
      >
        {activeProof ? <ProofInspectorDetail proof={activeProof} /> : null}
      </NarrativeMomentumInspectorSheet>

      <NarrativeMomentumInspectorSheet
        open={!!flagInspect}
        title={flagInspect?.flagId.replace(/_/g, ' ') ?? 'Flag'}
        onClose={() => setFlagInspect(null)}
        testId="nme-flag-inspector"
      >
        {flagInspect ?
          <FlagInspectorDetail issue={flagInspect} />
        : null}
      </NarrativeMomentumInspectorSheet>

      <NarrativeMomentumInspectorSheet
        open={inspector === 'reel' && !!selectedReelBeatId}
        title="Reel beat"
        onClose={() => setInspector(null)}
        testId="nme-reel-inspector"
      >
        {reel?.reelDetail?.beatSequence.find((b) => b.sourceNarrativeBeatId === selectedReelBeatId) ?
          <ReelInspectorDetail
            beat={reel.reelDetail.beatSequence.find((b) => b.sourceNarrativeBeatId === selectedReelBeatId)!}
          />
        : null}
      </NarrativeMomentumInspectorSheet>

      <NarrativeMomentumInspectorSheet
        open={inspector === 'carousel' && selectedSlide != null}
        title={`Slide ${selectedSlide}`}
        onClose={() => setInspector(null)}
        testId="nme-carousel-inspector"
      >
        {carousel?.carouselDetail?.slideSequence.find((s) => s.slideNumber === selectedSlide) ?
          <CarouselInspectorDetail
            slide={carousel.carouselDetail.slideSequence.find((s) => s.slideNumber === selectedSlide)!}
          />
        : null}
      </NarrativeMomentumInspectorSheet>
    </section>
  );
}

function StoryShiftStep({
  plan,
  onJudgment,
  judging,
}: {
  plan: NarrativeMomentumPlan;
  onJudgment: Props['onJudgment'];
  judging: boolean;
}) {
  return (
    <div className="site00-nme-wizard__stack" data-nme-section="story-shift">
      <div className="site00-nme-wizard__card-grid">
        <article className="site00-nme-wizard__card">
          <p className="site00-nme-wizard__label">Starting belief</p>
          <p className="site00-nme-wizard__body">{plan.audienceStartingBelief}</p>
        </article>
        <article className="site00-nme-wizard__card">
          <p className="site00-nme-wizard__label">Narrative goal</p>
          <p className="site00-nme-wizard__body">{plan.narrativeGoal}</p>
        </article>
        <article className="site00-nme-wizard__card">
          <p className="site00-nme-wizard__label">Desired shift</p>
          <p className="site00-nme-wizard__body">{plan.audienceDesiredShift}</p>
        </article>
      </div>
      <article className="site00-nme-wizard__card">
        <p className="site00-nme-wizard__label">Selected grammar</p>
        <p className="site00-nme-wizard__body-sm">
          <strong>{plan.selectedGrammarId.replace(/_/g, ' ')}</strong>
          {plan.alternateGrammarId ?
            <span className="site00-nme-wizard__meta"> · Alternate · {plan.alternateGrammarId.replace(/_/g, ' ')}</span>
          : null}
        </p>
        <p className="site00-nme-wizard__body-sm">{plan.grammarReason}</p>
        <div className="site00-nme-wizard__inline-actions">
          <button
            type="button"
            className="site00-nme-wizard__btn site00-nme-wizard__btn--primary"
            disabled={judging}
            onClick={() => void onJudgment('LOVE_IT')}
          >
            Approve shift
          </button>
          <button type="button" className="site00-nme-wizard__btn" disabled={judging} onClick={() => void onJudgment('REFINE_NARRATIVE')}>
            Refine
          </button>
          <button type="button" className="site00-nme-wizard__btn" disabled={judging} onClick={() => void onJudgment('CHANGE_GRAMMAR')}>
            Change grammar
          </button>
        </div>
      </article>
    </div>
  );
}

function BeatMapStep({
  beats,
  selectedBeatId,
  onSelectBeat,
}: {
  beats: readonly NarrativeBeat[];
  selectedBeatId: string | null;
  onSelectBeat: (id: string) => void;
}) {
  return (
    <div className="site00-nme-wizard__beat-rail" data-testid="narrative-momentum-beats" data-nme-section="beat-map">
      {beats.map((b) => (
        <button
          key={b.beatId}
          type="button"
          className={`site00-nme-wizard__beat-compact${selectedBeatId === b.beatId ? ' site00-nme-wizard__beat-compact--active' : ''}`}
          onClick={() => onSelectBeat(b.beatId)}
        >
          <span className="site00-nme-wizard__beat-num">{String(b.order).padStart(2, '0')}</span>
          <span className="site00-nme-wizard__body-sm">{b.label}</span>
          <span className="site00-nme-wizard__chip">{b.tensionStage}</span>
          {b.beatRole ?
            <span className="site00-nme-wizard__meta">{b.beatRole}</span>
          : null}
        </button>
      ))}
    </div>
  );
}

function TensionProofStep({
  beats,
  evidence,
  selectedBeatId,
  onSelectBeat,
  onOpenBeat,
  onOpenProof,
}: {
  beats: readonly NarrativeBeat[];
  evidence: readonly NarrativeEvidenceObject[];
  selectedBeatId: string | null;
  onSelectBeat: (id: string) => void;
  onOpenBeat: () => void;
  onOpenProof: (id: string) => void;
}) {
  return (
    <div className="site00-nme-wizard__stack" data-nme-section="tension-proof">
      <div className="site00-nme-wizard__tension-path" data-testid="narrative-momentum-tension-curve">
        {beats.map((b, i) => (
          <div key={b.beatId} className="site00-nme-wizard__tension-node-wrap">
            {i > 0 ?
              <span className="site00-nme-wizard__tension-connector" aria-hidden />
            : null}
            <button
              type="button"
              className={`site00-nme-wizard__tension-node${selectedBeatId === b.beatId ? ' site00-nme-wizard__tension-node--active' : ''}`}
              onClick={() => {
                onSelectBeat(b.beatId);
                onOpenBeat();
              }}
            >
              <span className="site00-nme-wizard__meta">{String(b.order).padStart(2, '0')}</span>
              <span className="site00-nme-wizard__label">{b.tensionStage}</span>
            </button>
          </div>
        ))}
      </div>
      <div className="site00-nme-wizard__proof-row">
        {evidence.map((e) => (
          <button key={e.id} type="button" className="site00-nme-wizard__proof-compact" onClick={() => onOpenProof(e.id)}>
            <span className="site00-nme-wizard__label">{e.proofType.replace(/_/g, ' ')}</span>
            <span className="site00-nme-wizard__chip">{e.strength}</span>
            <span
              className={
                e.status === 'SOURCE_REQUIRED' ?
                  'site00-nme-wizard__chip site00-nme-wizard__chip--warn'
                : 'site00-nme-wizard__chip'
              }
            >
              {proofStatusChip(e.status)}
            </span>
            {e.status === 'SOURCE_REQUIRED' ?
              <span className="site00-nme-wizard__source-needed">Source needed</span>
            : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReframeLoopStep({ plan }: { plan: NarrativeMomentumPlan }) {
  return (
    <div className="site00-nme-wizard__stack" data-nme-section="reframe-loop">
      {plan.culturalGlitch ?
        <article className="site00-nme-wizard__card site00-nme-wizard__card--accent">
          <p className="site00-nme-wizard__label">Cultural glitch</p>
          <p className="site00-nme-wizard__body-sm">
            <strong>Present</strong> {plan.culturalGlitch.familiarReality}
          </p>
          <p className="site00-nme-wizard__body-sm">
            <strong>Archived</strong> {plan.culturalGlitch.receiptSource}
          </p>
          <p className="site00-nme-wizard__body-sm">
            <strong>Collision</strong> {plan.culturalGlitch.glitchMoment}
          </p>
        </article>
      : null}
      <article className="site00-nme-wizard__card">
        <p className="site00-nme-wizard__label">Reframe</p>
        <div className="site00-nme-wizard__reframe">
          <div>
            <p className="site00-nme-wizard__meta">Before</p>
            <p className="site00-nme-wizard__body-sm">{plan.reframe.before}</p>
          </div>
          <div className="site00-nme-wizard__reframe-arrow">↓</div>
          <div>
            <p className="site00-nme-wizard__meta">After</p>
            <p className="site00-nme-wizard__body-sm">{plan.reframe.after}</p>
          </div>
        </div>
      </article>
      <article className="site00-nme-wizard__card">
        <p className="site00-nme-wizard__label">Open loop</p>
        <p className="site00-nme-wizard__body-sm">
          <strong>Unresolved</strong> {plan.openLoop.newQuestion}
        </p>
        <p className="site00-nme-wizard__body-sm">
          <strong>Next opportunity</strong> {plan.nextNarrativeOpportunity}
        </p>
      </article>
    </div>
  );
}

function FormatStep({
  formatTab,
  setFormatTab,
  reel,
  carousel,
  onSelectReel,
  onSelectSlide,
}: {
  formatTab: 'REEL' | 'CAROUSEL';
  setFormatTab: (t: 'REEL' | 'CAROUSEL') => void;
  reel: NarrativeMomentumPlan['formatAdaptations'][number] | undefined;
  carousel: NarrativeMomentumPlan['formatAdaptations'][number] | undefined;
  onSelectReel: (sourceBeatId: string) => void;
  onSelectSlide: (n: number) => void;
}) {
  return (
    <div data-nme-section="formats">
      <div className="site00-nme-wizard__tabs">
        <button
          type="button"
          className={`site00-nme-wizard__tab${formatTab === 'REEL' ? ' site00-nme-wizard__tab--active' : ''}`}
          onClick={() => setFormatTab('REEL')}
        >
          Reel
        </button>
        <button
          type="button"
          className={`site00-nme-wizard__tab${formatTab === 'CAROUSEL' ? ' site00-nme-wizard__tab--active' : ''}`}
          onClick={() => setFormatTab('CAROUSEL')}
        >
          Carousel
        </button>
      </div>
      <p className="site00-nme-wizard__meta">Same narrative goal · core proof · reframe · open-loop lineage</p>
      {formatTab === 'REEL' && reel?.reelDetail ?
        <div className="site00-nme-wizard__format-grid" data-testid="narrative-momentum-reel-tab">
          {reel.reelDetail.beatSequence.map((rb, idx) => (
            <button
              key={rb.sourceNarrativeBeatId}
              type="button"
              className="site00-nme-wizard__format-card"
              onClick={() => onSelectReel(rb.sourceNarrativeBeatId)}
            >
              <span className="site00-nme-wizard__label">{['Opening', 'Glitch', 'Proof', 'Escalation', 'Reveal', 'Reframe', 'Ending', 'Open loop'][idx] ?? rb.narrativePurpose}</span>
              <span className="site00-nme-wizard__body-sm">{rb.narrativePurpose}</span>
            </button>
          ))}
        </div>
      : null}
      {formatTab === 'CAROUSEL' && carousel?.carouselDetail ?
        <div className="site00-nme-wizard__slide-strip" data-testid="narrative-momentum-carousel-tab">
          {carousel.carouselDetail.slideSequence.map((s) => (
            <button
              key={s.slideNumber}
              type="button"
              className="site00-nme-wizard__slide-card"
              onClick={() => onSelectSlide(s.slideNumber)}
            >
              <span className="site00-nme-wizard__beat-num">{String(s.slideNumber).padStart(2, '0')}</span>
              <span className="site00-nme-wizard__body-sm">{s.contentRole}</span>
              <span className="site00-nme-wizard__chip">{s.tensionStage}</span>
            </button>
          ))}
        </div>
      : null}
    </div>
  );
}

function ReviewStep({
  plan,
  issues,
  proofSummary,
  readiness,
  tensionOk,
  onFlagInspect,
  onJudgment,
  judging,
  onRecompile,
}: {
  plan: NarrativeMomentumPlan;
  issues: readonly NarrativeValidationIssue[];
  proofSummary: ReturnType<typeof summarizeProofStatus>;
  readiness: ReturnType<typeof deriveNarrativeApprovalReadiness>;
  tensionOk: boolean;
  onFlagInspect: (i: NarrativeValidationIssue) => void;
  onJudgment: Props['onJudgment'];
  judging: boolean;
  onRecompile: () => Promise<void>;
}) {
  const warningCount = issues.filter((i) => i.severity === 'WARNING' || i.severity === 'ADVISORY').length;
  return (
    <div className="site00-nme-wizard__stack" data-nme-section="review" data-testid="narrative-momentum-judgment">
      <div className={`site00-nme-wizard__readiness${readiness.ready ? '' : ' site00-nme-wizard__readiness--blocked'}`}>
        <p className="site00-nme-wizard__section">{readiness.headline}</p>
        {readiness.blockers.map((b) => (
          <p key={b} className="site00-nme-wizard__chip site00-nme-wizard__chip--warn">
            {b}
          </p>
        ))}
      </div>
      <div className="site00-nme-wizard__summary-grid">
        <span className="site00-nme-wizard__chip">Grammar · {plan.selectedGrammarId.replace(/_/g, ' ')}</span>
        <span className="site00-nme-wizard__chip">Proof · {proofSummary.verified} verified · {proofSummary.sourceNeeded} source needed</span>
        <span className="site00-nme-wizard__chip">Tension · {tensionOk ? 'Valid' : 'Review'}</span>
        <span className="site00-nme-wizard__chip">Open loop · Defined</span>
        <span className="site00-nme-wizard__chip">Reel · Ready</span>
        <span className="site00-nme-wizard__chip">Carousel · Ready</span>
        <span className="site00-nme-wizard__chip">Flags · {warningCount || issues.length}</span>
      </div>
      {issues.length ?
        <div className="site00-nme-wizard__flag-list" data-testid="narrative-momentum-flags">
          {issues.map((issue, idx) => (
            <button key={`${issue.flagId}-${idx}`} type="button" className="site00-nme-wizard__flag-row" onClick={() => onFlagInspect(issue)}>
              <span>{issue.flagId.replace(/_/g, ' ')}</span>
              <span className="site00-nme-wizard__chip">{issue.severity}</span>
              <span className="site00-nme-wizard__meta">View flag</span>
            </button>
          ))}
        </div>
      : null}
      <div className="site00-nme-wizard__judgment">
        <button type="button" className="site00-nme-wizard__btn" disabled={judging} onClick={() => void onJudgment('LOVE_IT')}>
          Love it
        </button>
        <button type="button" className="site00-nme-wizard__btn" disabled={judging} onClick={() => void onJudgment('PROMISING')}>
          Promising
        </button>
        <button type="button" className="site00-nme-wizard__btn" disabled={judging} onClick={() => void onJudgment('TOO_CLOSE')}>
          Too close
        </button>
        <button type="button" className="site00-nme-wizard__btn" disabled={judging} onClick={() => void onJudgment('NOT_NDXBOOK')}>
          Not NDXBOOK
        </button>
      </div>
      <div className="site00-nme-wizard__workflow">
        <button type="button" className="site00-nme-wizard__btn" disabled={judging} onClick={() => void onJudgment('REFINE_NARRATIVE')}>
          Refine narrative
        </button>
        <button type="button" className="site00-nme-wizard__btn" disabled={judging} onClick={() => void onRecompile()}>
          Re-compile
        </button>
      </div>
    </div>
  );
}

function BeatInspectorDetail({ beat }: { beat: NarrativeBeat }) {
  return (
    <div className="site00-nme-wizard__inspector">
      <p className="site00-nme-wizard__label">What audience knows before</p>
      <p className="site00-nme-wizard__body-sm">{beat.whatAudienceKnows}</p>
      <p className="site00-nme-wizard__label">What changes here</p>
      <p className="site00-nme-wizard__body-sm">{beat.whatChangesInThisBeat}</p>
      {beat.evidenceUsed.length ?
        <>
          <p className="site00-nme-wizard__label">Evidence used</p>
          <p className="site00-nme-wizard__body-sm">{beat.evidenceUsed.join(', ')}</p>
        </>
      : null}
      {beat.interpretationIntroduced.length ?
        <>
          <p className="site00-nme-wizard__label">Interpretation</p>
          <p className="site00-nme-wizard__body-sm">{beat.interpretationIntroduced.join(', ')}</p>
        </>
      : null}
      <p className="site00-nme-wizard__label">Why next beat is necessary</p>
      <p className="site00-nme-wizard__body-sm">{beat.whyNextBeatIsNecessary ?? '—'}</p>
      <p className="site00-nme-wizard__label">Tension</p>
      <p className="site00-nme-wizard__body-sm">
        {beat.tensionBefore} → {beat.tensionAfter} ({beat.tensionStage})
      </p>
    </div>
  );
}

function ProofInspectorDetail({ proof }: { proof: NarrativeEvidenceObject }) {
  return (
    <div className="site00-nme-wizard__inspector">
      <p className="site00-nme-wizard__label">Source</p>
      <p className="site00-nme-wizard__body-sm">{proof.sourceReference}</p>
      <p className="site00-nme-wizard__label">Observed</p>
      <p className="site00-nme-wizard__body-sm">{proof.whatIsObserved}</p>
      <p className="site00-nme-wizard__label">Supports</p>
      <p className="site00-nme-wizard__body-sm">{proof.whatItSupports}</p>
      <p className="site00-nme-wizard__label">Placement</p>
      <p className="site00-nme-wizard__body-sm">
        Beat {proof.placement.beatId} · {proof.placement.whyNow}
      </p>
      <p className="site00-nme-wizard__label">Why now</p>
      <p className="site00-nme-wizard__body-sm">{proof.placement.beliefBefore} → {proof.placement.beliefAfter}</p>
    </div>
  );
}

function FlagInspectorDetail({ issue }: { issue: NarrativeValidationIssue }) {
  return (
    <div className="site00-nme-wizard__inspector">
      <p className="site00-nme-wizard__chip">{issue.severity}</p>
      <p className="site00-nme-wizard__label">Trigger</p>
      <p className="site00-nme-wizard__body-sm">{issue.trigger}</p>
      <p className="site00-nme-wizard__label">Explanation</p>
      <p className="site00-nme-wizard__body-sm">{issue.explanation}</p>
      <p className="site00-nme-wizard__label">Affected beats</p>
      <p className="site00-nme-wizard__body-sm">{issue.affectedBeatIds.join(', ')}</p>
      <p className="site00-nme-wizard__label">Suggested correction</p>
      <p className="site00-nme-wizard__body-sm">{issue.suggestedCorrection}</p>
      <p className="site00-nme-wizard__meta">Blocking · {issue.blocking ? 'Yes' : 'No'}</p>
    </div>
  );
}

function ReelInspectorDetail({
  beat,
}: {
  beat: NonNullable<
    NonNullable<NarrativeMomentumPlan['formatAdaptations'][number]['reelDetail']>['beatSequence'][number]
  >;
}) {
  return (
    <div className="site00-nme-wizard__inspector">
      <p className="site00-nme-wizard__label">Source narrative beat</p>
      <p className="site00-nme-wizard__body-sm">{beat.sourceNarrativeBeatId}</p>
      <p className="site00-nme-wizard__label">What viewer sees</p>
      <p className="site00-nme-wizard__body-sm">{beat.screenAction}</p>
      <p className="site00-nme-wizard__label">What viewer knows</p>
      <p className="site00-nme-wizard__body-sm">{beat.viewerKnowledgeState}</p>
      <p className="site00-nme-wizard__label">Why this shot exists</p>
      <p className="site00-nme-wizard__body-sm">{beat.narrativePurpose}</p>
      <p className="site00-nme-wizard__label">Proof used</p>
      <p className="site00-nme-wizard__body-sm">{beat.proofUsed?.join(', ') || '—'}</p>
      <p className="site00-nme-wizard__label">Transition</p>
      <p className="site00-nme-wizard__body-sm">{beat.transitionFunction}</p>
      <p className="site00-nme-wizard__label">Pacing</p>
      <p className="site00-nme-wizard__body-sm">{beat.estimatedDurationRange}</p>
    </div>
  );
}

function CarouselInspectorDetail({
  slide,
}: {
  slide: NonNullable<
    NonNullable<NarrativeMomentumPlan['formatAdaptations'][number]['carouselDetail']>['slideSequence'][number]
  >;
}) {
  return (
    <div className="site00-nme-wizard__inspector">
      <p className="site00-nme-wizard__label">Purpose</p>
      <p className="site00-nme-wizard__body-sm">{slide.purpose}</p>
      <p className="site00-nme-wizard__label">Content role</p>
      <p className="site00-nme-wizard__body-sm">{slide.contentRole}</p>
      <p className="site00-nme-wizard__label">Proof</p>
      <p className="site00-nme-wizard__body-sm">{slide.proofIds?.join(', ') || '—'}</p>
      <p className="site00-nme-wizard__label">Tension</p>
      <p className="site00-nme-wizard__body-sm">{slide.tensionStage}</p>
      <p className="site00-nme-wizard__label">Transition</p>
      <p className="site00-nme-wizard__body-sm">{slide.transition ?? '—'}</p>
    </div>
  );
}
