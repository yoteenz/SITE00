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
import '../../../styles/site00-narrative-momentum-wizard.css';

function tensionBarHeight(stage: NarrativeBeat['tensionStage']): string {
  const map: Record<NarrativeBeat['tensionStage'], string> = {
    LOW: '22%',
    RISING: '38%',
    INTERRUPTION: '48%',
    ESCALATION: '62%',
    PEAK: '100%',
    RELEASE: '72%',
    RESIDUAL: '40%',
  };
  return map[stage] ?? '50%';
}

function reelTimecode(index: number): string {
  const start = index * 2;
  const end = start + 2;
  const fmt = (n: number) => String(n).padStart(2, '0');
  return `${fmt(start)}–${fmt(end)}s`;
}

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
    <section className="site00-nme-wizard site00-nme-wizard--ndx" data-testid="narrative-momentum-wizard">
      <header className="site00-nme-wizard__header" data-testid="nme-wizard-header">
        <div>
          <p className="site00-nme-wizard__index-meta">Narrative momentum · Entry dossier</p>
          <h2 className="site00-nme-wizard__display">Narrative Momentum</h2>
          <p className="site00-nme-wizard__index-meta">
            {entryTitle} · {plan.founderStatus.replace(/_/g, ' ')} · {plan.selectedGrammarId.replace(/_/g, ' ')}
          </p>
          {plan.layerMode === 'RETROACTIVE_AUTHORITY_LAYER' ?
            <span className="site00-nme-wizard__stamp">Retroactive authority layer</span>
          : null}
        </div>
        <button
          type="button"
          className="site00-nme-wizard__btn site00-nme-wizard__btn--ghost"
          onClick={() => setShowTechnical((v) => !v)}
        >
          {showTechnical ? 'Hide index' : 'Technical index'}
        </button>
        {showTechnical ?
          <p className="site00-nme-wizard__meta">
            v{plan.version} · {plan.id} · library {grammarLibraryCount} · provider spend {plan.providerDispatchCount}
          </p>
        : null}
      </header>

      {plan.castingRequirements.length > 0 ?
        <div className="site00-nme-wizard__cast-teaser" data-testid="nme-cast-requirements-teaser">
          <span>
            <strong>Cast</strong> · {plan.castingRequirements.length} character roles detected
          </span>
          <span>→ Review in CAST</span>
        </div>
      : null}

      <nav className="site00-nme-wizard__chapter-rail" data-testid="nme-wizard-step-nav" aria-label="Chapter index">
        {NME_WIZARD_STEPS.map((s) => {
          const done = completedSteps.includes(s.id) || s.id < step;
          const flagged = stepHasFlagWarning(s.id, issues);
          return (
            <button
              key={s.id}
              type="button"
              className={`site00-nme-wizard__chapter${step === s.id ? ' site00-nme-wizard__chapter--active' : ''}${done ? ' site00-nme-wizard__chapter--done' : ''}${flagged ? ' site00-nme-wizard__chapter-warn' : ''}`}
              onClick={() => {
                setStep(s.id);
                setInspector(null);
              }}
            >
              <span className="site00-nme-wizard__chapter-code">{s.code}</span>
              <span className="site00-nme-wizard__chapter-name">{s.chapter}</span>
            </button>
          );
        })}
      </nav>

      <div className="site00-nme-wizard__shell">
        <main className="site00-nme-wizard__paper-field" data-testid={`nme-wizard-step-${stepMeta.slug}`}>
          <p className="site00-nme-wizard__meta">
            Step {String(step).padStart(2, '0')} / {String(NME_WIZARD_STEP_COUNT).padStart(2, '0')}
          </p>
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

      <footer className="site00-nme-wizard__decision-bar site00-nme-wizard__action-bar" data-testid="nme-wizard-action-bar">
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
        title={activeBeat ? activeBeat.label : 'Beat'}
        subtitle={activeBeat ? `Beat ${String(activeBeat.order).padStart(2, '0')} · Case file` : undefined}
        onClose={() => setInspector(null)}
        testId="nme-beat-inspector"
        showEvidencePlate
      >
        {activeBeat ? <BeatInspectorDetail beat={activeBeat} /> : null}
      </NarrativeMomentumInspectorSheet>

      <NarrativeMomentumInspectorSheet
        open={inspector === 'proof' && !!activeProof}
        title={activeProof ? activeProof.proofType.replace(/_/g, ' ') : 'Proof'}
        subtitle={activeProof ? `Accession · ${activeProof.id}` : undefined}
        onClose={() => setInspector(null)}
        testId="nme-proof-inspector"
        showEvidencePlate
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
      <div className="site00-nme-wizard__thesis-spread">
        <div className="site00-nme-wizard__thesis-col">
          <p className="site00-nme-wizard__label">Starting belief</p>
          <p className="site00-nme-wizard__body">{plan.audienceStartingBelief}</p>
        </div>
        <div className="site00-nme-wizard__thesis-arrow" aria-hidden>
          →
        </div>
        <div className="site00-nme-wizard__thesis-col">
          <p className="site00-nme-wizard__label">Desired shift</p>
          <p className="site00-nme-wizard__body">{plan.audienceDesiredShift}</p>
        </div>
      </div>
      <p className="site00-nme-wizard__thesis-note">
        <span className="site00-nme-wizard__label">Narrative goal · thesis</span>
        <br />
        {plan.narrativeGoal}
      </p>
      <div className="site00-nme-wizard__grammar-primary">
        <p className="site00-nme-wizard__label">Primary narrative grammar · NG-{plan.selectedGrammarId}</p>
        <p className="site00-nme-wizard__grammar-title">{plan.selectedGrammarId.replace(/_/g, ' ')}</p>
        <p className="site00-nme-wizard__body-sm">{plan.grammarReason}</p>
      </div>
      {plan.alternateGrammarId ?
        <div className="site00-nme-wizard__grammar-alt">
          <p className="site00-nme-wizard__label">Alternate · investigation</p>
          <p className="site00-nme-wizard__body-sm">{plan.alternateGrammarId.replace(/_/g, ' ')}</p>
        </div>
      : null}
      <div className="site00-nme-wizard__inline-actions">
        <button type="button" className="site00-nme-wizard__btn site00-nme-wizard__btn--primary" disabled={judging} onClick={() => void onJudgment('LOVE_IT')}>
          Confirm shift
        </button>
        <button type="button" className="site00-nme-wizard__btn" disabled={judging} onClick={() => void onJudgment('REFINE_NARRATIVE')}>
          Refine
        </button>
        <button type="button" className="site00-nme-wizard__btn" disabled={judging} onClick={() => void onJudgment('CHANGE_GRAMMAR')}>
          Change grammar
        </button>
      </div>
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
    <div data-testid="narrative-momentum-beats" data-nme-section="beat-map">
      <p className="site00-nme-wizard__label">Story index · investigative sequence</p>
      {beats.map((b) => (
        <button
          key={b.beatId}
          type="button"
          className={`site00-nme-wizard__ledger-row${selectedBeatId === b.beatId ? ' site00-nme-wizard__ledger-row--active' : ''}`}
          onClick={() => onSelectBeat(b.beatId)}
        >
          <span className="site00-nme-wizard__ledger-num">{String(b.order).padStart(2, '0')}</span>
          <span>
            <p className="site00-nme-wizard__ledger-title">{b.label}</p>
            <p className="site00-nme-wizard__meta">{b.whatChangesInThisBeat.slice(0, 72)}{b.whatChangesInThisBeat.length > 72 ? '…' : ''}</p>
          </span>
          <span className="site00-nme-wizard__tension-tag">{b.tensionStage}</span>
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
      <div className="site00-nme-wizard__black-field">
        <p className="site00-nme-wizard__label">Tension analysis · editorial graphic</p>
        <div className="site00-nme-wizard__tension-graph" data-testid="narrative-momentum-tension-curve">
          {beats.map((b) => (
            <button
              key={b.beatId}
              type="button"
              className={`site00-nme-wizard__tension-plot${selectedBeatId === b.beatId ? ' site00-nme-wizard__tension-plot--active' : ''}${b.tensionStage === 'PEAK' ? ' site00-nme-wizard__tension-plot--peak' : ''}`}
              onClick={() => {
                onSelectBeat(b.beatId);
                onOpenBeat();
              }}
            >
              <div className="site00-nme-wizard__tension-bar" style={{ height: tensionBarHeight(b.tensionStage) }} />
              <span className="site00-nme-wizard__meta">{String(b.order).padStart(2, '0')}</span>
              <span className="site00-nme-wizard__label">{b.tensionStage}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="site00-nme-wizard__label">Proof ledger</p>
      <div className="site00-nme-wizard__proof-ledger">
        {evidence.map((e, idx) => (
          <button key={e.id} type="button" className="site00-nme-wizard__archival-plate" onClick={() => onOpenProof(e.id)}>
            <span className="site00-nme-wizard__accession">A-{String(idx + 1).padStart(2, '0')}</span>
            <span className="site00-nme-wizard__plate-thumb" aria-hidden />
            <span>
              <p className="site00-nme-wizard__plate-title">{e.proofType.replace(/_/g, ' ')}</p>
              <p className="site00-nme-wizard__meta">{e.strength} · Beat {e.placement.beatId}</p>
              <p className="site00-nme-wizard__body-sm">{e.whatIsObserved.slice(0, 90)}{e.whatIsObserved.length > 90 ? '…' : ''}</p>
            </span>
            <span
              className={`site00-nme-wizard__signal-stamp${e.status === 'SOURCE_REQUIRED' ? ' site00-nme-wizard__signal-stamp--required' : ''}`}
            >
              {proofStatusChip(e.status)}
            </span>
            {e.status === 'SOURCE_REQUIRED' ?
              <span className="site00-nme-wizard__source-needed">Source required — founder archive needed</span>
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
      <div className="site00-nme-wizard__reframe-before">
        <p className="site00-nme-wizard__label">Before · archived take</p>
        <p className="site00-nme-wizard__body-sm">{plan.reframe.before}</p>
      </div>
      <div className="site00-nme-wizard__reframe-after">
        <p className="site00-nme-wizard__label">After · active reframe</p>
        <p className="site00-nme-wizard__body-sm">{plan.reframe.after}</p>
      </div>
      {plan.culturalGlitch ?
        <div className="site00-nme-wizard__glitch-field">
          <p className="site00-nme-wizard__label">Cultural glitch · signature device</p>
          <div className="site00-nme-wizard__glitch-grid">
            <div className="site00-nme-wizard__glitch-fragment">
              <p className="site00-nme-wizard__meta">Past · now</p>
              {plan.culturalGlitch.familiarReality}
            </div>
            <div className="site00-nme-wizard__glitch-rupture">SAME CODE · NEW LABEL</div>
            <div className="site00-nme-wizard__glitch-fragment">
              <p className="site00-nme-wizard__meta">Archived receipt</p>
              {plan.culturalGlitch.receiptSource}
            </div>
          </div>
          <p className="site00-nme-wizard__body-sm" style={{ marginTop: '0.45rem' }}>
            {plan.culturalGlitch.glitchMoment}
          </p>
        </div>
      : null}
      <p className="site00-nme-wizard__open-loop-display">{plan.openLoop.newQuestion}</p>
      <p className="site00-nme-wizard__meta">Unresolved · next question</p>
      <p className="site00-nme-wizard__body-sm">{plan.nextNarrativeOpportunity}</p>
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
      <div className="site00-nme-wizard__format-switch" role="tablist">
        <button type="button" role="tab" aria-pressed={formatTab === 'REEL'} onClick={() => setFormatTab('REEL')}>
          Reel · filmstrip
        </button>
        <button type="button" role="tab" aria-pressed={formatTab === 'CAROUSEL'} onClick={() => setFormatTab('CAROUSEL')}>
          Carousel · contact sheet
        </button>
      </div>
      <p className="site00-nme-wizard__meta">Master narrative lineage locked across formats</p>
      {formatTab === 'REEL' && reel?.reelDetail ?
        <div className="site00-nme-wizard__filmstrip" data-testid="narrative-momentum-reel-tab">
          {reel.reelDetail.beatSequence.map((rb, idx) => (
            <button key={rb.sourceNarrativeBeatId} type="button" className="site00-nme-wizard__film-frame" onClick={() => onSelectReel(rb.sourceNarrativeBeatId)}>
              <span className="site00-nme-wizard__timecode">{reelTimecode(idx)}</span>
              <span>
                <p className="site00-nme-wizard__ledger-title">{rb.narrativePurpose}</p>
                <p className="site00-nme-wizard__meta">{rb.screenAction.slice(0, 64)}{rb.screenAction.length > 64 ? '…' : ''}</p>
              </span>
              <span className="site00-nme-wizard__meta">→</span>
            </button>
          ))}
        </div>
      : null}
      {formatTab === 'CAROUSEL' && carousel?.carouselDetail ?
        <div className="site00-nme-wizard__slide-contact" data-testid="narrative-momentum-carousel-tab">
          {carousel.carouselDetail.slideSequence.map((s) => (
            <button key={s.slideNumber} type="button" className="site00-nme-wizard__contact-cell" onClick={() => onSelectSlide(s.slideNumber)}>
              <span className="site00-nme-wizard__ledger-num">{String(s.slideNumber).padStart(2, '0')}</span>
              <p className="site00-nme-wizard__meta">{s.contentRole}</p>
              <p className="site00-nme-wizard__tension-tag">{s.tensionStage}</p>
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
  return (
    <div className="site00-nme-wizard__stack" data-nme-section="review" data-testid="narrative-momentum-judgment">
      <p className="site00-nme-wizard__section">{readiness.headline}</p>
      <div className="site00-nme-wizard__review-board">
        <div className="site00-nme-wizard__review-row">
          <span>Narrative</span>
          <span className="site00-nme-wizard__body-sm">{plan.narrativeGoal.slice(0, 48)}…</span>
          <span>✓</span>
        </div>
        <div className="site00-nme-wizard__review-row">
          <span>Tension</span>
          <span className="site00-nme-wizard__meta">{tensionOk ? 'Valid sequence' : 'Review sequence'}</span>
          <span>{tensionOk ? '✓' : '!'}</span>
        </div>
        <div className={`site00-nme-wizard__review-row${proofSummary.sourceNeeded ? ' site00-nme-wizard__review-row--alert' : ''}`}>
          <span>Proof</span>
          <span className="site00-nme-wizard__meta">
            {proofSummary.verified} verified · {proofSummary.sourceNeeded} source gap
          </span>
          <span>{proofSummary.sourceNeeded ? '!' : '✓'}</span>
        </div>
        <div className="site00-nme-wizard__review-row">
          <span>Reframe</span>
          <span className="site00-nme-wizard__meta">Defined</span>
          <span>✓</span>
        </div>
        <div className="site00-nme-wizard__review-row">
          <span>Open loop</span>
          <span className="site00-nme-wizard__meta">Active</span>
          <span>✓</span>
        </div>
        <div className="site00-nme-wizard__review-row">
          <span>Formats</span>
          <span className="site00-nme-wizard__meta">Reel · Carousel</span>
          <span>✓</span>
        </div>
      </div>
      {readiness.blockers.map((b) => (
        <p key={b} className="site00-nme-wizard__source-needed" style={{ margin: '0.35rem 0' }}>
          {b}
        </p>
      ))}
      {issues.length ?
        <div className="site00-nme-wizard__flag-index" data-testid="narrative-momentum-flags">
          {issues.map((issue, idx) => (
            <button key={`${issue.flagId}-${idx}`} type="button" onClick={() => onFlagInspect(issue)}>
              <span>{issue.flagId.replace(/_/g, ' ')}</span>
              <span>{issue.severity} · View dossier</span>
            </button>
          ))}
        </div>
      : null}
      <div className="site00-nme-wizard__decision-field">
        <p className="site00-nme-wizard__label">Founder judgment · editorial sign-off</p>
        <div className="site00-nme-wizard__judgment">
          <button type="button" disabled={judging} onClick={() => void onJudgment('LOVE_IT')}>
            Love it
          </button>
          <button type="button" disabled={judging} onClick={() => void onJudgment('PROMISING')}>
            Promising
          </button>
          <button type="button" disabled={judging} onClick={() => void onJudgment('TOO_CLOSE')}>
            Too close
          </button>
          <button type="button" disabled={judging} onClick={() => void onJudgment('NOT_NDXBOOK')}>
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
        <button
          type="button"
          className="site00-nme-wizard__signoff"
          disabled={judging || !readiness.ready}
          onClick={() => void onJudgment('APPROVE_NARRATIVE')}
        >
          Approve narrative · sign-off
        </button>
      </div>
    </div>
  );
}

function BeatInspectorDetail({ beat }: { beat: NarrativeBeat }) {
  return (
    <div className="site00-nme-wizard__inspector">
      <div className="site00-nme-wizard__dossier-block">
        <p className="site00-nme-wizard__label">What we know</p>
        <p className="site00-nme-wizard__body-sm">{beat.whatAudienceKnows}</p>
      </div>
      <div className="site00-nme-wizard__dossier-block site00-nme-wizard__dossier-block--marginal">
        <p className="site00-nme-wizard__label">What changes</p>
        <p className="site00-nme-wizard__body-sm">{beat.whatChangesInThisBeat}</p>
      </div>
      {beat.evidenceUsed.length ?
        <div className="site00-nme-wizard__dossier-block">
          <p className="site00-nme-wizard__label">Proof</p>
          <p className="site00-nme-wizard__body-sm">{beat.evidenceUsed.join(', ')}</p>
        </div>
      : null}
      {beat.interpretationIntroduced.length ?
        <div className="site00-nme-wizard__dossier-block">
          <p className="site00-nme-wizard__label">Interpretation</p>
          <p className="site00-nme-wizard__body-sm">{beat.interpretationIntroduced.join(', ')}</p>
        </div>
      : null}
      <div className="site00-nme-wizard__dossier-block">
        <p className="site00-nme-wizard__label">Why next</p>
        <p className="site00-nme-wizard__body-sm">{beat.whyNextBeatIsNecessary ?? '—'}</p>
      </div>
      <p className="site00-nme-wizard__meta">
        Tension {beat.tensionBefore} → {beat.tensionAfter} · {beat.tensionStage}
      </p>
    </div>
  );
}

function ProofInspectorDetail({ proof }: { proof: NarrativeEvidenceObject }) {
  return (
    <div className="site00-nme-wizard__inspector">
      <span className="site00-nme-wizard__signal-stamp">{proof.strength}</span>
      <span className={`site00-nme-wizard__signal-stamp${proof.status === 'SOURCE_REQUIRED' ? ' site00-nme-wizard__signal-stamp--required' : ''}`}>
        {proofStatusChip(proof.status)}
      </span>
      <div className="site00-nme-wizard__dossier-block">
        <p className="site00-nme-wizard__label">Source</p>
        <p className="site00-nme-wizard__body-sm">{proof.sourceReference}</p>
      </div>
      <div className="site00-nme-wizard__dossier-block">
        <p className="site00-nme-wizard__label">Observation</p>
        <p className="site00-nme-wizard__body-sm">{proof.whatIsObserved}</p>
      </div>
      <div className="site00-nme-wizard__dossier-block">
        <p className="site00-nme-wizard__label">Supports</p>
        <p className="site00-nme-wizard__body-sm">{proof.whatItSupports}</p>
      </div>
      <div className="site00-nme-wizard__dossier-block">
        <p className="site00-nme-wizard__label">Placement · validation</p>
        <p className="site00-nme-wizard__body-sm">
          Beat {proof.placement.beatId} · {proof.placement.whyNow}
        </p>
        <p className="site00-nme-wizard__meta">{proof.placement.beliefBefore} → {proof.placement.beliefAfter}</p>
      </div>
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
