/**
 * P0.NDX.NARRATIVE-MOMENTUM-SONNET-DIRECT-VISUAL-RECONSTRUCTION1
 *
 * Narrative Momentum WIDGET — six-stage workspace region embedded in the Expression Engine page,
 * between Production Journey and Derived Content. Owns no page chrome of its own.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  CarouselSlideAdaptation,
  NarrativeBeat,
  NarrativeEvidenceObject,
  NarrativeMomentumPlan,
  NarrativeValidationIssue,
  ReelBeatAdaptation,
} from '../../../../../shared/site00-expression-engine/narrative-momentum/types.js';
import {
  IconArrow,
  IconBack,
  IconBolt,
  IconCheck,
  IconChevron,
  IconHalf,
  IconHeart,
  IconReject,
  IconSwap,
  IconTooClose,
  IconTune,
  NarrativeMomentumInspectorSheet,
} from './NarrativeMomentumWizardInspectors.js';
import {
  deriveNarrativeApprovalReadiness,
  ENTRY_002_NME_DISPLAY_TITLE,
  NME_WIZARD_STEP_COUNT,
  NME_WIZARD_STEPS,
  pickBeatImages,
  proofStatusChip,
  stepHasFlagWarning,
  summarizeProofStatus,
  tensionAxisLabel,
  tensionLevel,
  tensionSequenceValid,
  tensionTone,
  type NmeChipTone,
  type NmeWizardStep,
} from './narrativeMomentumWizardModel.js';
import {
  defaultWizardState,
  loadNmeWizardState,
  saveNmeWizardState,
} from './narrativeMomentumWizardPersistence.js';
import '../../../styles/site00-narrative-momentum-wizard.css';

type JudgmentAction =
  | 'APPROVE_NARRATIVE'
  | 'REFINE_NARRATIVE'
  | 'CHANGE_GRAMMAR'
  | 'LOVE_IT'
  | 'PROMISING'
  | 'TOO_CLOSE'
  | 'NOT_NDXBOOK';

type Props = {
  plan: NarrativeMomentumPlan;
  grammarLibraryCount: number;
  entryTitle?: string;
  /** Entry 002 evidence imagery (authority boards, storyboard strip). Cycled across beats / shots. */
  images?: readonly string[];
  judging: boolean;
  onJudgment: (action: JudgmentAction) => Promise<void>;
  onRecompile: () => Promise<void>;
};

type InspectorKind = 'beat' | 'proof' | 'flag' | 'reel' | 'carousel' | null;

const pad = (n: number) => String(n).padStart(2, '0');
const words = (s: string) => s.replace(/_/g, ' ');

/** Sentence-case shouty seed copy so it reads as editorial, not as a banner. */
function tidy(s: string | undefined | null): string {
  if (!s) return '';
  const t = s.trim();
  if (t.length > 3 && t === t.toUpperCase()) {
    const lower = t.toLowerCase().replace(/([.!?]\s+)([a-z])/g, (_m, a: string, b: string) => a + b.toUpperCase());
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  return t;
}

function clip(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

function proofTone(status: NarrativeEvidenceObject['status']): NmeChipTone {
  if (status === 'SOURCE_REQUIRED') return 'warn';
  if (status === 'VERIFIED_SOURCE' || status === 'DERIVED_COMPARISON') return 'valid';
  return 'muted';
}

function beatForProof(beats: readonly NarrativeBeat[], e: NarrativeEvidenceObject): NarrativeBeat | undefined {
  return (
    beats.find((b) => b.proofIds.includes(e.id)) ??
    beats.find((b) => b.beatId === e.placement.beatId || b.beatId.endsWith(`-${e.placement.beatId}`))
  );
}

/** Retroactive layer: glitch + contradiction beats carry the 2016 | 2026 pairing. */
function isEraPair(plan: NarrativeMomentumPlan, beat: NarrativeBeat | undefined): boolean {
  return !!beat && plan.layerMode === 'RETROACTIVE_AUTHORITY_LAYER' && /GLITCH|CONTRADICTION/i.test(beat.label);
}

/* ────────────────────────────────────────────────────────────────────────────
   Plates — evidence imagery with a designed fallback when no frame is available
   ──────────────────────────────────────────────────────────────────────────── */

function Plate({
  src,
  index,
  label,
  className = '',
  children,
}: {
  src?: string | null;
  index?: number;
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span className={`site00-nme-wizard__plate ${src ? '' : 'site00-nme-wizard__plate--blank'} ${className}`}>
      {src ?
        <img src={src} alt="" loading="lazy" draggable={false} />
      : <span className="site00-nme-wizard__plate-mark" aria-hidden>
          {index != null ? pad(index) : '··'}
          {label ? <small>{label}</small> : null}
        </span>
      }
      {children}
    </span>
  );
}

function SplitPlate({ a, b, labels }: { a?: string | null; b?: string | null; labels?: [string, string] }) {
  return (
    <div className="site00-nme-wizard__split">
      <Plate src={a}>{labels ? <em>{labels[0]}</em> : null}</Plate>
      <Plate src={b}>{labels ? <em>{labels[1]}</em> : null}</Plate>
    </div>
  );
}

function Chip({ tone, children }: { tone: NmeChipTone | string; children: ReactNode }) {
  return <span className={`site00-nme-wizard__chip site00-nme-wizard__chip--${tone}`}>{children}</span>;
}

function DlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="site00-nme-wizard__dl">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Widget
   ──────────────────────────────────────────────────────────────────────────── */

export function ExpressionEngineNarrativeMomentumPanel({
  plan,
  grammarLibraryCount,
  entryTitle = ENTRY_002_NME_DISPLAY_TITLE,
  images = [],
  judging,
  onJudgment,
  onRecompile,
}: Props) {
  const issues = plan.validationIssues?.length ? plan.validationIssues : [];
  const evidence = plan.evidence ?? [];
  const reel = plan.formatAdaptations.find((f) => f.format === 'REEL');
  const carousel = plan.formatAdaptations.find((f) => f.format === 'CAROUSEL');
  const reelBeats = reel?.reelDetail?.beatSequence ?? [];
  const slides = carousel?.carouselDetail?.slideSequence ?? [];

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
  const [lastJudgment, setLastJudgment] = useState<JudgmentAction | null>(null);

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
  const activeShot = useMemo(
    () => reelBeats.find((b) => b.sourceNarrativeBeatId === selectedReelBeatId) ?? reelBeats[0] ?? null,
    [reelBeats, selectedReelBeatId],
  );
  const activeSlide = useMemo(
    () => slides.find((s) => s.slideNumber === selectedSlide) ?? slides[0] ?? null,
    [slides, selectedSlide],
  );

  const proofSummary = useMemo(() => summarizeProofStatus(evidence), [evidence]);
  const readiness = useMemo(() => deriveNarrativeApprovalReadiness(plan, issues), [plan, issues]);
  const tensionOk = tensionSequenceValid(issues);

  const imagesFor = useCallback(
    (order: number, count = 1) => pickBeatImages(images, order, count),
    [images],
  );

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

  const goTo = useCallback((s: NmeWizardStep) => {
    setStep(s);
    setInspector(null);
  }, []);

  const judge = useCallback(
    async (action: JudgmentAction) => {
      setLastJudgment(action);
      await onJudgment(action);
    },
    [onJudgment],
  );

  const stepMeta = NME_WIZARD_STEPS.find((s) => s.id === step)!;
  const stageTitle =
    step === 5 ? (formatTab === 'REEL' ? 'REEL ADAPTATION' : 'CAROUSEL ADAPTATION') : stepMeta.title;
  const stageSub =
    step === 2 ? 'THE STORY PROGRESSION'
    : step === 3 ? 'HOW THE STORY BUILDS'
    : step === 4 ? 'WHERE DOES THE AUDIENCE LAND?'
    : step === 5 ? (formatTab === 'REEL' ? 'SHOT SEQUENCE + NARRATIVE INTENT' : 'SLIDE SEQUENCE + ARGUMENT')
    : step === 6 ? 'EVERYTHING READY?'
    : 'WHAT CHANGES IN THE VIEWER?';

  const openBeat = (id: string) => {
    setSelectedBeatId(id);
    setInspector('beat');
  };
  const openProof = (id: string) => {
    setSelectedProofId(id);
    setInspector('proof');
  };

  const beatIndex = activeBeat ? plan.beats.findIndex((b) => b.beatId === activeBeat.beatId) : -1;
  const shotIndex = activeShot ? reelBeats.findIndex((b) => b === activeShot) : -1;
  const slideIndex = activeSlide ? slides.findIndex((s) => s === activeSlide) : -1;
  const proofIndex = activeProof ? evidence.findIndex((e) => e.id === activeProof.id) : -1;

  /* Bottom action bar — one primary decision per stage */
  const footer = (() => {
    const back = (
      <button type="button" className="site00-nme-wizard__btn" disabled={step === 1} onClick={goBack}>
        <IconBack /> Back
      </button>
    );
    const next = (
      <button type="button" className="site00-nme-wizard__btn site00-nme-wizard__btn--primary" onClick={goNext}>
        Continue <IconArrow />
      </button>
    );
    const skip = (
      <button type="button" className="site00-nme-wizard__btn site00-nme-wizard__btn--icon" onClick={goNext} aria-label="Next stage">
        <IconArrow />
      </button>
    );
    if (step === 1) {
      return (
        <>
          <button
            type="button"
            className="site00-nme-wizard__btn site00-nme-wizard__btn--primary site00-nme-wizard__btn--full"
            disabled={judging}
            onClick={() => {
              void judge('LOVE_IT');
              goNext();
            }}
          >
            Confirm &amp; continue <IconArrow />
          </button>
          <button type="button" className="site00-nme-wizard__btn site00-nme-wizard__btn--grow" disabled={judging} onClick={() => void judge('REFINE_NARRATIVE')}>
            <IconTune /> Refine
          </button>
          <button type="button" className="site00-nme-wizard__btn site00-nme-wizard__btn--grow" disabled={judging} onClick={() => void judge('CHANGE_GRAMMAR')}>
            <IconSwap /> Change grammar
          </button>
        </>
      );
    }
    if (step === 2) {
      return (
        <>
          {back}
          <button
            type="button"
            className="site00-nme-wizard__btn site00-nme-wizard__btn--primary site00-nme-wizard__btn--grow"
            disabled={!activeBeat}
            onClick={() => activeBeat && openBeat(activeBeat.beatId)}
          >
            View beat details <IconArrow />
          </button>
          {skip}
        </>
      );
    }
    if (step === 5) {
      const has = formatTab === 'REEL' ? !!activeShot : !!activeSlide;
      return (
        <>
          {back}
          <button
            type="button"
            className="site00-nme-wizard__btn site00-nme-wizard__btn--primary site00-nme-wizard__btn--grow"
            disabled={!has}
            onClick={() => {
              if (formatTab === 'REEL' && activeShot) {
                setSelectedReelBeatId(activeShot.sourceNarrativeBeatId);
                setInspector('reel');
              } else if (activeSlide) {
                setSelectedSlide(activeSlide.slideNumber);
                setInspector('carousel');
              }
            }}
          >
            {formatTab === 'REEL' ? 'View shot details' : 'View slide details'} <IconArrow />
          </button>
          {skip}
        </>
      );
    }
    if (step === 6) {
      return (
        <>
          {back}
          <button
            type="button"
            className="site00-nme-wizard__btn site00-nme-wizard__btn--primary site00-nme-wizard__btn--grow"
            disabled={judging || !readiness.ready}
            onClick={() => void judge('APPROVE_NARRATIVE')}
          >
            Approve narrative <IconArrow />
          </button>
        </>
      );
    }
    return (
      <>
        {back}
        <span className="site00-nme-wizard__btn--grow">{next}</span>
      </>
    );
  })();

  /* Desktop right rail — context for the active artifact */
  const railBeat = activeBeat;
  const contextRail = (
    <aside className="site00-nme-wizard__context" data-testid="nme-wizard-context-rail">
      <p className="site00-nme-wizard__label">In focus</p>
      {railBeat ?
        <>
          <Plate src={imagesFor(railBeat.order)[0]} index={railBeat.order} className="site00-nme-wizard__context-plate" />
          <p className="site00-nme-wizard__context-title">
            {pad(railBeat.order)} · {railBeat.label}
          </p>
          <Chip tone={tensionTone(railBeat.tensionStage)}>{railBeat.tensionStage}</Chip>
          <p className="site00-nme-wizard__context-copy">{tidy(railBeat.whatChangesInThisBeat)}</p>
          <button type="button" className="site00-nme-wizard__link" onClick={() => openBeat(railBeat.beatId)}>
            Inspect beat <IconArrow width={12} height={12} />
          </button>
        </>
      : null}
      <div className="site00-nme-wizard__context-proof">
        <p className="site00-nme-wizard__label">Proof</p>
        <p className="site00-nme-wizard__context-copy">
          {proofSummary.verified} verified · {proofSummary.sourceNeeded} source needed
        </p>
      </div>
    </aside>
  );

  return (
    <section className="site00-nme-wizard" data-testid="narrative-momentum-wizard" aria-label="Narrative Momentum">
      <div className="site00-nme-wizard__shell">
        <nav className="site00-nme-wizard__chapter-rail" data-testid="nme-wizard-step-nav" aria-label="Narrative Momentum stages">
          {NME_WIZARD_STEPS.map((s) => {
            const done = completedSteps.includes(s.id) || s.id < step;
            const flagged = stepHasFlagWarning(s.id, issues);
            const active = step === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-current={active ? 'step' : undefined}
                className={`site00-nme-wizard__chapter${active ? ' site00-nme-wizard__chapter--active' : ''}${done ? ' site00-nme-wizard__chapter--done' : ''}${flagged ? ' site00-nme-wizard__chapter-warn' : ''}`}
                onClick={() => goTo(s.id)}
              >
                <span className="site00-nme-wizard__chapter-code">{done && !active ? <IconCheck width={11} height={11} strokeWidth={3} /> : s.code}</span>
                <span className="site00-nme-wizard__chapter-name">{s.chapter}</span>
                <span className="site00-nme-wizard__chapter-full">{s.title}</span>
              </button>
            );
          })}
        </nav>

        <main className="site00-nme-wizard__stage" data-testid={`nme-wizard-step-${stepMeta.slug}`}>
          <header className="site00-nme-wizard__stage-head">
            <p className="site00-nme-wizard__meta">
              Step {pad(step)} / {pad(NME_WIZARD_STEP_COUNT)}
              {plan.layerMode === 'RETROACTIVE_AUTHORITY_LAYER' ? ' · Retroactive authority' : ''}
            </p>
            <h3 className="site00-nme-wizard__stage-title">{stageTitle}</h3>
            <p className="site00-nme-wizard__stage-sub">{stageSub}</p>
          </header>

          <div className="site00-nme-wizard__stage-body">
            {step === 1 ?
              <StoryShiftStep plan={plan} images={images} />
            : null}
            {step === 2 ?
              <BeatMapStep
                beats={plan.beats}
                selectedBeatId={activeBeat?.beatId ?? null}
                imagesFor={imagesFor}
                onSelectBeat={(id) => setSelectedBeatId(id)}
                onOpenBeat={openBeat}
              />
            : null}
            {step === 3 ?
              <TensionProofStep
                beats={plan.beats}
                evidence={evidence}
                activeBeat={activeBeat}
                imagesFor={imagesFor}
                onSelectBeat={setSelectedBeatId}
                onOpenBeat={openBeat}
                onOpenProof={openProof}
              />
            : null}
            {step === 4 ?
              <ReframeLoopStep plan={plan} imagesFor={imagesFor} />
            : null}
            {step === 5 ?
              <FormatStep
                plan={plan}
                formatTab={formatTab}
                setFormatTab={setFormatTab}
                reelBeats={reelBeats}
                slides={slides}
                reframeSlide={carousel?.carouselDetail?.reframeSlide}
                argument={carousel?.carouselDetail?.argumentEscalation}
                activeShot={activeShot}
                activeSlide={activeSlide}
                imagesFor={imagesFor}
                onSelectShot={(id) => setSelectedReelBeatId(id)}
                onSelectSlide={(n) => setSelectedSlide(n)}
                onOpenShot={(id) => {
                  setSelectedReelBeatId(id);
                  setInspector('reel');
                }}
                onOpenSlide={(n) => {
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
                tensionOk={tensionOk}
                hasReel={reelBeats.length > 0}
                hasCarousel={slides.length > 0}
                lastJudgment={lastJudgment}
                onGoTo={goTo}
                onFlagInspect={setFlagInspect}
                onJudgment={judge}
                judging={judging}
                onRecompile={onRecompile}
              />
            : null}
          </div>

          <footer className="site00-nme-wizard__actions site00-nme-wizard__action-bar" data-testid="nme-wizard-action-bar">
            {footer}
          </footer>

          <div className="site00-nme-wizard__technical">
            <button type="button" onClick={() => setShowTechnical((v) => !v)} aria-expanded={showTechnical}>
              {showTechnical ? 'Hide' : 'Technical index'}
            </button>
            {showTechnical ?
              <p>
                {entryTitle} · v{plan.version} · {plan.id} · library {grammarLibraryCount} · provider spend{' '}
                {plan.providerDispatchCount}
              </p>
            : null}
          </div>
        </main>

        {contextRail}
      </div>

      {plan.castingRequirements.length > 0 && step === 1 ?
        <div className="site00-nme-wizard__cast-teaser" data-testid="nme-cast-requirements-teaser">
          <span>
            <strong>Cast</strong> · {plan.castingRequirements.length} character roles detected
          </span>
          <span>→ Review in CAST</span>
        </div>
      : null}

      {/* ───────── Inspectors ───────── */}
      <NarrativeMomentumInspectorSheet
        open={inspector === 'beat' && !!activeBeat}
        kicker={activeBeat ? `Beat ${pad(activeBeat.order)} / ${pad(plan.beats.length)}` : undefined}
        title={activeBeat ? activeBeat.label : 'Beat'}
        subtitle={activeBeat ? activeBeat.whatChangesInThisBeat : undefined}
        onClose={() => setInspector(null)}
        onPrev={beatIndex > 0 ? () => setSelectedBeatId(plan.beats[beatIndex - 1]!.beatId) : undefined}
        onNext={beatIndex >= 0 && beatIndex < plan.beats.length - 1 ? () => setSelectedBeatId(plan.beats[beatIndex + 1]!.beatId) : undefined}
        testId="nme-beat-inspector"
      >
        {activeBeat ?
          <BeatInspectorDetail
            plan={plan}
            beat={activeBeat}
            prev={plan.beats[beatIndex - 1]}
            next={plan.beats[beatIndex + 1]}
            evidence={evidence}
            imagesFor={imagesFor}
            onOpenProof={openProof}
          />
        : null}
      </NarrativeMomentumInspectorSheet>

      <NarrativeMomentumInspectorSheet
        open={inspector === 'proof' && !!activeProof}
        title={activeProof ? words(activeProof.proofType) : 'Proof'}
        chips={
          activeProof ?
            <>
              <Chip tone={activeProof.strength === 'PRIMARY' ? 'primary' : 'muted'}>{activeProof.strength}</Chip>
              <Chip tone={proofTone(activeProof.status)}>{proofStatusChip(activeProof.status)}</Chip>
            </>
          : undefined
        }
        onClose={() => setInspector(null)}
        onPrev={proofIndex > 0 ? () => setSelectedProofId(evidence[proofIndex - 1]!.id) : undefined}
        onNext={proofIndex >= 0 && proofIndex < evidence.length - 1 ? () => setSelectedProofId(evidence[proofIndex + 1]!.id) : undefined}
        testId="nme-proof-inspector"
      >
        {activeProof ?
          <ProofInspectorDetail plan={plan} proof={activeProof} imagesFor={imagesFor} />
        : null}
      </NarrativeMomentumInspectorSheet>

      <NarrativeMomentumInspectorSheet
        open={!!flagInspect}
        title={flagInspect ? words(flagInspect.flagId) : 'Flag'}
        kicker="Flag"
        onClose={() => setFlagInspect(null)}
        testId="nme-flag-inspector"
      >
        {flagInspect ? <FlagInspectorDetail issue={flagInspect} /> : null}
      </NarrativeMomentumInspectorSheet>

      <NarrativeMomentumInspectorSheet
        open={inspector === 'reel' && !!activeShot}
        kicker={activeShot ? `Shot ${pad(shotIndex + 1)} / ${pad(reelBeats.length)}` : undefined}
        title={activeShot ? (plan.beats.find((b) => b.beatId === activeShot.sourceNarrativeBeatId)?.label ?? 'Shot') : 'Shot'}
        onClose={() => setInspector(null)}
        onPrev={shotIndex > 0 ? () => setSelectedReelBeatId(reelBeats[shotIndex - 1]!.sourceNarrativeBeatId) : undefined}
        onNext={shotIndex >= 0 && shotIndex < reelBeats.length - 1 ? () => setSelectedReelBeatId(reelBeats[shotIndex + 1]!.sourceNarrativeBeatId) : undefined}
        testId="nme-reel-inspector"
      >
        {activeShot ?
          <ReelInspectorDetail plan={plan} shot={activeShot} index={shotIndex} imagesFor={imagesFor} reelDetail={reel?.reelDetail} />
        : null}
      </NarrativeMomentumInspectorSheet>

      <NarrativeMomentumInspectorSheet
        open={inspector === 'carousel' && !!activeSlide}
        kicker={activeSlide ? `Slide ${pad(activeSlide.slideNumber)} / ${pad(slides.length)}` : undefined}
        title={activeSlide ? (plan.beats.find((b) => b.beatId === activeSlide.sourceBeatIds[0])?.label ?? `Slide ${activeSlide.slideNumber}`) : 'Slide'}
        onClose={() => setInspector(null)}
        onPrev={slideIndex > 0 ? () => setSelectedSlide(slides[slideIndex - 1]!.slideNumber) : undefined}
        onNext={slideIndex >= 0 && slideIndex < slides.length - 1 ? () => setSelectedSlide(slides[slideIndex + 1]!.slideNumber) : undefined}
        testId="nme-carousel-inspector"
      >
        {activeSlide ?
          <CarouselInspectorDetail plan={plan} slide={activeSlide} evidence={evidence} imagesFor={imagesFor} />
        : null}
      </NarrativeMomentumInspectorSheet>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   01 · STORY SHIFT
   ──────────────────────────────────────────────────────────────────────────── */

function StoryShiftStep({ plan, images }: { plan: NarrativeMomentumPlan; images: readonly string[] }) {
  const strip = images.slice(0, 4);
  return (
    <div className="site00-nme-wizard__stack" data-nme-section="story-shift">
      {strip.length ?
        <div className="site00-nme-wizard__contact" aria-hidden>
          {strip.map((src, i) => (
            <Plate key={`${src}-${i}`} src={src} index={i + 1} />
          ))}
        </div>
      : null}

      <div className="site00-nme-wizard__thesis">
        <div className="site00-nme-wizard__thesis-before">
          <p className="site00-nme-wizard__label">Starting belief</p>
          <p className="site00-nme-wizard__thesis-ask">What does the viewer believe before?</p>
          <p className="site00-nme-wizard__thesis-line">{plan.audienceStartingBelief}</p>
        </div>

        <div className="site00-nme-wizard__thesis-turn">
          <span className="site00-nme-wizard__thesis-arrow" aria-hidden>
            <IconArrow style={{ transform: 'rotate(90deg)' }} />
          </span>
          <div>
            <p className="site00-nme-wizard__label">Narrative goal</p>
            <p className="site00-nme-wizard__thesis-goal">{plan.narrativeGoal}</p>
          </div>
        </div>

        <div className="site00-nme-wizard__thesis-after">
          <p className="site00-nme-wizard__label">Desired shift</p>
          <p className="site00-nme-wizard__thesis-ask">What should they believe after?</p>
          <p className="site00-nme-wizard__thesis-line">{plan.audienceDesiredShift}</p>
        </div>
      </div>

      <div className="site00-nme-wizard__grammar-primary">
        <div className="site00-nme-wizard__grammar-top">
          <p className="site00-nme-wizard__label">Primary grammar</p>
          <Chip tone="primary">Primary</Chip>
        </div>
        <p className="site00-nme-wizard__grammar-title">{words(plan.selectedGrammarId)}</p>
        <p className="site00-nme-wizard__body-sm">{plan.grammarReason}</p>
      </div>
      {plan.alternateGrammarId ?
        <div className="site00-nme-wizard__grammar-alt">
          <div>
            <p className="site00-nme-wizard__label">Alternate grammar</p>
            <p className="site00-nme-wizard__grammar-alt-title">{words(plan.alternateGrammarId)}</p>
          </div>
          <Chip tone="muted">Secondary</Chip>
        </div>
      : null}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   02 · BEAT MAP
   ──────────────────────────────────────────────────────────────────────────── */

function BeatMapStep({
  beats,
  selectedBeatId,
  imagesFor,
  onSelectBeat,
  onOpenBeat,
}: {
  beats: readonly NarrativeBeat[];
  selectedBeatId: string | null;
  imagesFor: (order: number, count?: number) => string[];
  onSelectBeat: (id: string) => void;
  onOpenBeat: (id: string) => void;
}) {
  return (
    <ol className="site00-nme-wizard__beatlist" data-testid="narrative-momentum-beats" data-nme-section="beat-map">
      {beats.map((b) => {
        const active = selectedBeatId === b.beatId;
        return (
          <li key={b.beatId} className={`site00-nme-wizard__beat${active ? ' site00-nme-wizard__beat--active' : ''}`}>
            <button
              type="button"
              className="site00-nme-wizard__beat-row"
              aria-pressed={active}
              onClick={() => (active ? onOpenBeat(b.beatId) : onSelectBeat(b.beatId))}
            >
              <Plate src={imagesFor(b.order)[0]} index={b.order} className="site00-nme-wizard__beat-thumb" />
              <span className="site00-nme-wizard__beat-num">{pad(b.order)}</span>
              <span className="site00-nme-wizard__beat-text">
                <span className="site00-nme-wizard__beat-title">{b.label}</span>
                <span className="site00-nme-wizard__beat-role">{tidy(b.whatChangesInThisBeat)}</span>
              </span>
              <Chip tone={tensionTone(b.tensionStage)}>{b.tensionStage}</Chip>
              <IconChevron className="site00-nme-wizard__beat-chev" width={14} height={14} />
            </button>
            {active ?
              <div className="site00-nme-wizard__beat-open">
                <Plate src={imagesFor(b.order)[0]} index={b.order} label={b.label} className="site00-nme-wizard__beat-hero" />
                <div className="site00-nme-wizard__beat-open-copy">
                  <p className="site00-nme-wizard__label">{b.beatRole}</p>
                  <p className="site00-nme-wizard__body-sm">
                    {tidy(b.whatAudienceKnows)}
                  </p>
                  <p className="site00-nme-wizard__meta">
                    {b.tensionBefore} → {b.tensionAfter}
                  </p>
                </div>
              </div>
            : null}
          </li>
        );
      })}
    </ol>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   03 · TENSION + PROOF
   ──────────────────────────────────────────────────────────────────────────── */

const CURVE_W = 340;
const CURVE_H = 214;
const CURVE_PAD = 26;
const CURVE_FLOOR = 168;
const CURVE_TOP = 52;

function TensionCurve({
  beats,
  activeId,
  onSelect,
}: {
  beats: readonly NarrativeBeat[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const n = beats.length;
  const pts = beats.map((b, i) => ({
    b,
    x: n > 1 ? CURVE_PAD + (i * (CURVE_W - 2 * CURVE_PAD)) / (n - 1) : CURVE_W / 2,
    y: CURVE_FLOOR - tensionLevel(b.tensionStage) * (CURVE_FLOOR - CURVE_TOP),
  }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${pts[0]?.x ?? 0},${CURVE_FLOOR} ${line} ${pts[pts.length - 1]?.x ?? 0},${CURVE_FLOOR}`;
  return (
    <svg
      className="site00-nme-wizard__curve"
      viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
      role="group"
      aria-label="Narrative tension curve"
      data-testid="narrative-momentum-tension-curve"
    >
      <line x1="10" x2={CURVE_W - 10} y1={CURVE_FLOOR} y2={CURVE_FLOOR} className="site00-nme-wizard__curve-base" />
      <polygon points={area} className="site00-nme-wizard__curve-area" />
      {pts.map((p) => (
        <line key={`g-${p.b.beatId}`} x1={p.x} x2={p.x} y1={p.y} y2={CURVE_FLOOR} className="site00-nme-wizard__curve-guide" />
      ))}
      <polyline points={line} className="site00-nme-wizard__curve-line" />
      {pts.map((p) => {
        const peak = p.b.tensionStage === 'PEAK';
        const active = p.b.beatId === activeId;
        return (
          <g
            key={p.b.beatId}
            role="button"
            tabIndex={0}
            aria-label={`Beat ${p.b.order} ${p.b.label}, ${p.b.tensionStage}`}
            aria-pressed={active}
            className={`site00-nme-wizard__curve-pt${active ? ' is-active' : ''}${peak ? ' is-peak' : ''}`}
            onClick={() => onSelect(p.b.beatId)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(p.b.beatId);
              }
            }}
          >
            <rect x={p.x - 20} y={12} width={40} height={CURVE_H - 20} fill="transparent" />
            <text x={p.x} y={peak ? p.y - 20 : 30} className="site00-nme-wizard__curve-num" textAnchor="middle">
              {pad(p.b.order)}
            </text>
            <circle cx={p.x} cy={p.y} r={peak ? 11 : 9} className="site00-nme-wizard__curve-ring" />
            <circle cx={p.x} cy={p.y} r={peak ? 5.5 : 4.5} className="site00-nme-wizard__curve-dot" />
            <text x={p.x} y={CURVE_FLOOR + 18} className="site00-nme-wizard__curve-stage" textAnchor="middle">
              {tensionAxisLabel(p.b.tensionStage)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function TensionProofStep({
  beats,
  evidence,
  activeBeat,
  imagesFor,
  onSelectBeat,
  onOpenBeat,
  onOpenProof,
}: {
  beats: readonly NarrativeBeat[];
  evidence: readonly NarrativeEvidenceObject[];
  activeBeat: NarrativeBeat | undefined;
  imagesFor: (order: number, count?: number) => string[];
  onSelectBeat: (id: string) => void;
  onOpenBeat: (id: string) => void;
  onOpenProof: (id: string) => void;
}) {
  return (
    <div className="site00-nme-wizard__stack" data-nme-section="tension-proof">
      <div className="site00-nme-wizard__curve-wrap">
        <TensionCurve beats={beats} activeId={activeBeat?.beatId ?? null} onSelect={onSelectBeat} />
        {activeBeat ?
          <button type="button" className="site00-nme-wizard__curve-caption" onClick={() => onOpenBeat(activeBeat.beatId)}>
            <span className="site00-nme-wizard__curve-caption-n">{pad(activeBeat.order)}</span>
            <span>
              <strong>{activeBeat.label}</strong>
              <em>
                {activeBeat.tensionBefore} → {activeBeat.tensionAfter}
              </em>
            </span>
            <IconChevron width={14} height={14} />
          </button>
        : null}
      </div>

      <div className="site00-nme-wizard__section-head">
        <h4>Proof architecture</h4>
        <span>{evidence.length} sources</span>
      </div>
      <ul className="site00-nme-wizard__prooflist">
        {evidence.map((e) => {
          const beat = beatForProof(beats, e);
          const need = e.status === 'SOURCE_REQUIRED';
          return (
            <li key={e.id}>
              <button
                type="button"
                className={`site00-nme-wizard__proof${need ? ' site00-nme-wizard__proof--need' : ''}`}
                onClick={() => onOpenProof(e.id)}
              >
                <Plate src={beat ? imagesFor(beat.order)[0] : undefined} index={beat?.order} className="site00-nme-wizard__proof-thumb">
                  {need ? <b>No source</b> : null}
                </Plate>
                <span className="site00-nme-wizard__proof-text">
                  <span className="site00-nme-wizard__proof-top">
                    <strong>{words(e.proofType)}</strong>
                    <Chip tone={e.strength === 'PRIMARY' ? 'primary' : 'muted'}>{e.strength}</Chip>
                    <Chip tone={proofTone(e.status)}>{proofStatusChip(e.status)}</Chip>
                  </span>
                  <span className="site00-nme-wizard__proof-obs">{clip(tidy(e.whatIsObserved), 96)}</span>
                  {beat ?
                    <span className="site00-nme-wizard__meta">
                      Beat {pad(beat.order)} · {beat.label}
                    </span>
                  : null}
                </span>
                <IconChevron width={14} height={14} className="site00-nme-wizard__beat-chev" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   04 · REFRAME + OPEN LOOP
   ──────────────────────────────────────────────────────────────────────────── */

function ReframeLoopStep({
  plan,
  imagesFor,
}: {
  plan: NarrativeMomentumPlan;
  imagesFor: (order: number, count?: number) => string[];
}) {
  const glitchBeat = plan.beats.find((b) => /GLITCH/i.test(b.label)) ?? plan.beats[1];
  const receiptBeat = plan.beats.find((b) => /CONTRADICTION|RECEIPT/i.test(b.label)) ?? plan.beats[3];
  const past = imagesFor(receiptBeat?.order ?? 4, 1);
  const present = imagesFor(glitchBeat?.order ?? 2, 1);
  const era = plan.layerMode === 'RETROACTIVE_AUTHORITY_LAYER';
  return (
    <div className="site00-nme-wizard__stack" data-nme-section="reframe-loop">
      <div className="site00-nme-wizard__section-head">
        <h4>Reframe</h4>
      </div>
      <div className="site00-nme-wizard__reframe">
        <div className="site00-nme-wizard__reframe-before">
          <p className="site00-nme-wizard__label">Before</p>
          <p>{plan.reframe.before}</p>
        </div>
        <span className="site00-nme-wizard__reframe-arrow" aria-hidden>
          <IconArrow />
        </span>
        <div className="site00-nme-wizard__reframe-after">
          <p className="site00-nme-wizard__label">After</p>
          <p>{plan.reframe.after}</p>
        </div>
      </div>

      {plan.culturalGlitch ?
        <>
          <div className="site00-nme-wizard__section-head">
            <h4>Cultural glitch</h4>
          </div>
          <div className="site00-nme-wizard__glitch-field">
            <figure className="site00-nme-wizard__glitch-side">
              <Plate src={present[0]} index={glitchBeat?.order} className="site00-nme-wizard__glitch-plate">
                {era ? <em>2026</em> : null}
              </Plate>
              <figcaption>Present reality</figcaption>
            </figure>
            <span className="site00-nme-wizard__glitch-bolt" aria-hidden>
              <IconBolt width={22} height={22} />
            </span>
            <figure className="site00-nme-wizard__glitch-side">
              <Plate src={past[0]} index={receiptBeat?.order} className="site00-nme-wizard__glitch-plate">
                {era ? <em>2016</em> : null}
              </Plate>
              <figcaption>Archived reality</figcaption>
            </figure>
          </div>
          <p className="site00-nme-wizard__glitch-line">
            <IconBolt width={12} height={12} /> {tidy(plan.culturalGlitch.glitchMoment)}
          </p>
        </>
      : null}

      <div className="site00-nme-wizard__openloop" data-testid="narrative-momentum-open-loop">
        <div className="site00-nme-wizard__openloop-top">
          <p className="site00-nme-wizard__label">Open loop</p>
          <Chip tone="primary">Residual</Chip>
        </div>
        <p className="site00-nme-wizard__openloop-q">{plan.openLoop.newQuestion}</p>
        <p className="site00-nme-wizard__openloop-next">{tidy(plan.openLoop.audienceWantsNext)}</p>
      </div>
      <div className="site00-nme-wizard__loopgrid">
        <div>
          <p className="site00-nme-wizard__label">Answered</p>
          <ul>{plan.openLoop.answered.map((a) => <li key={a}>{clip(tidy(a), 60)}</li>)}</ul>
        </div>
        <div>
          <p className="site00-nme-wizard__label">Unresolved</p>
          <ul>{plan.openLoop.unresolved.map((a) => <li key={a}>{clip(tidy(a), 60)}</li>)}</ul>
        </div>
        <div className="site00-nme-wizard__loopgrid-wide">
          <p className="site00-nme-wizard__label">Next opportunity</p>
          <p>{tidy(plan.nextNarrativeOpportunity)}</p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   05 · FORMAT ADAPTATION
   ──────────────────────────────────────────────────────────────────────────── */

function shotLabel(plan: NarrativeMomentumPlan, shot: ReelBeatAdaptation): string {
  return plan.beats.find((b) => b.beatId === shot.sourceNarrativeBeatId)?.label ?? shot.sourceNarrativeBeatId;
}

function FormatStep({
  plan,
  formatTab,
  setFormatTab,
  reelBeats,
  slides,
  reframeSlide,
  argument,
  activeShot,
  activeSlide,
  imagesFor,
  onSelectShot,
  onSelectSlide,
  onOpenShot,
  onOpenSlide,
}: {
  plan: NarrativeMomentumPlan;
  formatTab: 'REEL' | 'CAROUSEL';
  setFormatTab: (t: 'REEL' | 'CAROUSEL') => void;
  reelBeats: readonly ReelBeatAdaptation[];
  slides: readonly CarouselSlideAdaptation[];
  reframeSlide: number | undefined;
  argument: string | undefined;
  activeShot: ReelBeatAdaptation | null;
  activeSlide: CarouselSlideAdaptation | null;
  imagesFor: (order: number, count?: number) => string[];
  onSelectShot: (id: string) => void;
  onSelectSlide: (n: number) => void;
  onOpenShot: (id: string) => void;
  onOpenSlide: (n: number) => void;
}) {
  const orderOf = (id: string) => plan.beats.find((b) => b.beatId === id)?.order ?? 1;
  return (
    <div data-nme-section="formats" className="site00-nme-wizard__stack">
      <div className="site00-nme-wizard__format-switch" role="tablist" aria-label="Format">
        <button type="button" role="tab" aria-selected={formatTab === 'REEL'} aria-pressed={formatTab === 'REEL'} onClick={() => setFormatTab('REEL')}>
          Reel
        </button>
        <button type="button" role="tab" aria-selected={formatTab === 'CAROUSEL'} aria-pressed={formatTab === 'CAROUSEL'} onClick={() => setFormatTab('CAROUSEL')}>
          Carousel
        </button>
      </div>

      {formatTab === 'REEL' && reelBeats.length ?
        <div className="site00-nme-wizard__reel" data-testid="narrative-momentum-reel-tab">
          <ol className="site00-nme-wizard__reel-rail">
            {reelBeats.map((rb, idx) => {
              const active = activeShot === rb;
              const order = orderOf(rb.sourceNarrativeBeatId);
              return (
                <li key={rb.sourceNarrativeBeatId}>
                  <button
                    type="button"
                    className={`site00-nme-wizard__frame${active ? ' site00-nme-wizard__frame--active' : ''}`}
                    aria-pressed={active}
                    onClick={() => (active ? onOpenShot(rb.sourceNarrativeBeatId) : onSelectShot(rb.sourceNarrativeBeatId))}
                  >
                    <Plate src={imagesFor(order)[0]} index={idx + 1} className="site00-nme-wizard__frame-plate">
                      <span className="site00-nme-wizard__frame-n">{pad(idx + 1)}</span>
                      <span className="site00-nme-wizard__frame-t">{shotLabel(plan, rb)}</span>
                    </Plate>
                    <span className="site00-nme-wizard__frame-time">
                      {rb.estimatedDurationRange}
                      <IconChevron width={12} height={12} />
                    </span>
                    <span className="site00-nme-wizard__frame-purpose">{tidy(rb.narrativePurpose)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          {activeShot ?
            <div className="site00-nme-wizard__shotline">
              <p className="site00-nme-wizard__label">
                Shot {pad(reelBeats.indexOf(activeShot) + 1)} · {activeShot.estimatedDurationRange}
              </p>
              <p className="site00-nme-wizard__body-sm">{tidy(activeShot.screenAction)}</p>
              <p className="site00-nme-wizard__meta">→ {tidy(activeShot.transitionFunction)}</p>
            </div>
          : null}
        </div>
      : null}

      {formatTab === 'CAROUSEL' && slides.length ?
        <div className="site00-nme-wizard__reel" data-testid="narrative-momentum-carousel-tab">
          <ol className="site00-nme-wizard__reel-rail site00-nme-wizard__reel-rail--slides">
            {slides.map((s) => {
              const active = activeSlide === s;
              const order = orderOf(s.sourceBeatIds[0] ?? '');
              return (
                <li key={s.slideNumber}>
                  <button
                    type="button"
                    className={`site00-nme-wizard__frame site00-nme-wizard__frame--slide${active ? ' site00-nme-wizard__frame--active' : ''}`}
                    aria-pressed={active}
                    onClick={() => (active ? onOpenSlide(s.slideNumber) : onSelectSlide(s.slideNumber))}
                  >
                    <Plate src={imagesFor(order)[0]} index={s.slideNumber} className="site00-nme-wizard__frame-plate">
                      <span className="site00-nme-wizard__frame-n">{pad(s.slideNumber)}</span>
                      {reframeSlide === s.slideNumber ? <span className="site00-nme-wizard__frame-flag">Reframe</span> : null}
                    </Plate>
                    <span className="site00-nme-wizard__frame-time">
                      <Chip tone={tensionTone(s.tensionStage)}>{s.tensionStage}</Chip>
                    </span>
                    <span className="site00-nme-wizard__frame-purpose">{clip(tidy(s.contentRole), 54)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="site00-nme-wizard__dots" aria-hidden>
            {slides.map((s) => (
              <i key={s.slideNumber} className={activeSlide === s ? 'is-on' : reframeSlide === s.slideNumber ? 'is-reframe' : ''} />
            ))}
          </div>
          {argument ?
            <div className="site00-nme-wizard__shotline">
              <p className="site00-nme-wizard__label">Argument progression</p>
              <p className="site00-nme-wizard__body-sm">{tidy(argument)}</p>
            </div>
          : null}
        </div>
      : null}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   06 · REVIEW + JUDGMENT
   ──────────────────────────────────────────────────────────────────────────── */

type ReviewTile = {
  key: string;
  label: string;
  value: string;
  chip: string;
  tone: NmeChipTone;
  step: NmeWizardStep;
};

function ReviewStep({
  plan,
  issues,
  proofSummary,
  readiness,
  tensionOk,
  hasReel,
  hasCarousel,
  lastJudgment,
  onGoTo,
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
  hasReel: boolean;
  hasCarousel: boolean;
  lastJudgment: JudgmentAction | null;
  onGoTo: (s: NmeWizardStep) => void;
  onFlagInspect: (i: NarrativeValidationIssue) => void;
  onJudgment: (a: JudgmentAction) => Promise<void>;
  judging: boolean;
  onRecompile: () => Promise<void>;
}) {
  const proofOk = proofSummary.sourceNeeded === 0;
  const tiles: ReviewTile[] = [
    { key: 'grammar', label: 'Grammar', value: words(plan.selectedGrammarId), chip: 'Valid', tone: 'valid', step: 1 },
    {
      key: 'shift',
      label: 'Story shift',
      value: plan.audienceStartingBelief && plan.audienceDesiredShift ? 'Clear' : 'Incomplete',
      chip: plan.audienceStartingBelief && plan.audienceDesiredShift ? 'Valid' : 'Review',
      tone: plan.audienceStartingBelief && plan.audienceDesiredShift ? 'valid' : 'review',
      step: 1,
    },
    { key: 'beats', label: 'Beat map', value: `${plan.beats.length} beats`, chip: plan.beats.length === 7 ? 'Valid' : 'Review', tone: plan.beats.length === 7 ? 'valid' : 'review', step: 2 },
    { key: 'tension', label: 'Tension', value: tensionOk ? 'Valid' : 'Review', chip: tensionOk ? 'Valid' : 'Review', tone: tensionOk ? 'valid' : 'review', step: 3 },
    {
      key: 'proof',
      label: 'Proof',
      value: `${proofSummary.verified} verified / ${proofSummary.sourceNeeded} needed`,
      chip: proofOk ? 'Valid' : 'Warning',
      tone: proofOk ? 'valid' : 'warn',
      step: 3,
    },
    { key: 'reframe', label: 'Reframe', value: plan.reframe.before && plan.reframe.after ? 'Defined' : 'Missing', chip: plan.reframe.after ? 'Valid' : 'Review', tone: plan.reframe.after ? 'valid' : 'review', step: 4 },
    { key: 'loop', label: 'Open loop', value: plan.openLoop.newQuestion ? 'Defined' : 'Missing', chip: plan.openLoop.newQuestion ? 'Valid' : 'Review', tone: plan.openLoop.newQuestion ? 'valid' : 'review', step: 4 },
    { key: 'reel', label: 'Reel', value: hasReel ? 'Ready' : 'Missing', chip: hasReel ? 'Ready' : 'Review', tone: hasReel ? 'valid' : 'review', step: 5 },
    { key: 'carousel', label: 'Carousel', value: hasCarousel ? 'Ready' : 'Missing', chip: hasCarousel ? 'Ready' : 'Review', tone: hasCarousel ? 'valid' : 'review', step: 5 },
  ];
  const judgments: { action: JudgmentAction; label: string; icon: ReactNode }[] = [
    { action: 'LOVE_IT', label: 'Love it', icon: <IconHeart /> },
    { action: 'PROMISING', label: 'Promising', icon: <IconHalf /> },
    { action: 'TOO_CLOSE', label: 'Too close', icon: <IconTooClose /> },
    { action: 'NOT_NDXBOOK', label: 'Not NDXBOOK', icon: <IconReject /> },
  ];
  return (
    <div className="site00-nme-wizard__stack" data-nme-section="review" data-testid="narrative-momentum-judgment">
      <div className="site00-nme-wizard__board">
        {tiles.map((t) => (
          <button key={t.key} type="button" className="site00-nme-wizard__tile" onClick={() => onGoTo(t.step)}>
            <span className="site00-nme-wizard__label">{t.label}</span>
            <strong>{t.value}</strong>
            <Chip tone={t.tone}>{t.chip}</Chip>
          </button>
        ))}
        <div
          className={`site00-nme-wizard__tile site00-nme-wizard__tile--flags${issues.length ? ' has-flags' : ''}`}
          data-testid="narrative-momentum-flags"
        >
          <span className="site00-nme-wizard__label">Flags</span>
          <strong>{issues.length ? `${issues.length} ${issues.length === 1 ? 'warning' : 'warnings'}` : 'Clear'}</strong>
          {issues.length ?
            <span className="site00-nme-wizard__flaglist">
              {issues.map((issue, idx) => (
                <button key={`${issue.flagId}-${idx}`} type="button" onClick={() => onFlagInspect(issue)}>
                  <span>{words(issue.flagId)}</span>
                  <Chip tone={issue.blocking || issue.severity === 'BLOCKING' ? 'warn' : 'review'}>{issue.severity}</Chip>
                  <IconChevron width={12} height={12} />
                </button>
              ))}
            </span>
          : <Chip tone="valid">Valid</Chip>}
        </div>
      </div>

      {readiness.blockers.length ?
        <ul className="site00-nme-wizard__blockers">
          {readiness.blockers.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      : null}

      <div className="site00-nme-wizard__signoff-block">
        <p className="site00-nme-wizard__label">Founder judgment · editorial sign-off</p>
        <div className="site00-nme-wizard__judgment" role="group" aria-label="Founder judgment">
          {judgments.map((j) => (
            <button
              key={j.action}
              type="button"
              disabled={judging}
              aria-pressed={lastJudgment === j.action}
              className={lastJudgment === j.action ? 'is-on' : ''}
              onClick={() => void onJudgment(j.action)}
            >
              {j.icon}
              <span>{j.label}</span>
            </button>
          ))}
        </div>
        <div className="site00-nme-wizard__workflow">
          <button type="button" className="site00-nme-wizard__btn" disabled={judging} onClick={() => void onJudgment('REFINE_NARRATIVE')}>
            <IconTune /> Refine narrative
          </button>
          <button type="button" className="site00-nme-wizard__btn" disabled={judging} onClick={() => void onRecompile()}>
            Re-compile
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Inspectors
   ──────────────────────────────────────────────────────────────────────────── */

function BeatInspectorDetail({
  plan,
  beat,
  prev,
  next,
  evidence,
  imagesFor,
  onOpenProof,
}: {
  plan: NarrativeMomentumPlan;
  beat: NarrativeBeat;
  prev: NarrativeBeat | undefined;
  next: NarrativeBeat | undefined;
  evidence: readonly NarrativeEvidenceObject[];
  imagesFor: (order: number, count?: number) => string[];
  onOpenProof: (id: string) => void;
}) {
  const used = evidence.filter((e) => beat.evidenceUsed.includes(e.id) || beat.proofIds.includes(e.id));
  const pair = isEraPair(plan, beat);
  const imgs = imagesFor(beat.order, 2);
  const interps = plan.interpretations.filter((i) => beat.interpretationIntroduced.includes(i.id));
  return (
    <div className="site00-nme-wizard__inspector">
      {pair ?
        <SplitPlate a={imgs[0]} b={imgs[1]} labels={['2016', '2026']} />
      : <Plate src={imgs[0]} index={beat.order} label={beat.label} className="site00-nme-wizard__inspector-hero" />}

      <div className="site00-nme-wizard__duo">
        <div>
          <p className="site00-nme-wizard__label">Tension</p>
          <p className={`site00-nme-wizard__duo-val site00-nme-wizard__tone-${tensionTone(beat.tensionStage)}`}>{beat.tensionStage}</p>
        </div>
        <div>
          <p className="site00-nme-wizard__label">Role</p>
          <p className="site00-nme-wizard__duo-val">{beat.beatRole}</p>
        </div>
      </div>

      <dl className="site00-nme-wizard__dls">
        <DlRow label="What audience knows before">{tidy(beat.whatAudienceKnows)}</DlRow>
        <DlRow label="What changes here">{tidy(beat.whatChangesInThisBeat)}</DlRow>
        {used.length ?
          <DlRow label="Evidence used">
            {used.map((e) => {
              const b = plan.beats.find((x) => x.proofIds.includes(e.id));
              return (
                <span key={e.id} className="site00-nme-wizard__evi">
                  <Plate src={b ? imagesFor(b.order)[0] : undefined} index={b?.order} className="site00-nme-wizard__evi-thumb" />
                  <span>
                    {words(e.proofType)} — {clip(tidy(e.whatIsObserved), 80)}
                    <button type="button" className="site00-nme-wizard__link" onClick={() => onOpenProof(e.id)}>
                      View source <IconArrow width={11} height={11} />
                    </button>
                  </span>
                </span>
              );
            })}
          </DlRow>
        : null}
        {interps.length ?
          <DlRow label="Interpretation">{interps.map((i) => tidy(i.claim)).join(' ')}</DlRow>
        : null}
        <DlRow label="Tension shift">
          {beat.tensionBefore} → {beat.tensionAfter}
        </DlRow>
        <DlRow label="Transition in / out">
          <span className="site00-nme-wizard__trans">
            <span>{prev ? `← ${prev.label}` : '← Cold open'}</span>
            <span>{next ? `${next.label} →` : 'Residual →'}</span>
          </span>
        </DlRow>
        <DlRow label="Why next beat is necessary">{tidy(beat.whyNextBeatIsNecessary) || '—'}</DlRow>
      </dl>
    </div>
  );
}

function ProofInspectorDetail({
  plan,
  proof,
  imagesFor,
}: {
  plan: NarrativeMomentumPlan;
  proof: NarrativeEvidenceObject;
  imagesFor: (order: number, count?: number) => string[];
}) {
  const beat = beatForProof(plan.beats, proof);
  const strip = beat ? imagesFor(beat.order, 3) : [];
  const need = proof.status === 'SOURCE_REQUIRED';
  return (
    <div className="site00-nme-wizard__inspector">
      <div className={`site00-nme-wizard__evidence${need ? ' site00-nme-wizard__evidence--need' : ''}`}>
        {(strip.length ? strip : [undefined, undefined, undefined]).map((src, i) => (
          <Plate key={i} src={src} index={beat?.order} className="site00-nme-wizard__evidence-cell" />
        ))}
        {need ? <b>Source required — founder archive needed</b> : null}
      </div>
      <dl className="site00-nme-wizard__dls">
        <DlRow label="Source">{tidy(proof.sourceReference)}</DlRow>
        <DlRow label="What is observed">{tidy(proof.whatIsObserved)}</DlRow>
        <DlRow label="What it supports">{tidy(proof.whatItSupports)}</DlRow>
        <DlRow label="Placement">
          {beat ? `Beat ${pad(beat.order)} — ${beat.label}` : proof.placement.beatId}
        </DlRow>
        <DlRow label="Why now">{tidy(proof.placement.whyNow)}</DlRow>
        <DlRow label="Validation">
          {proofStatusChip(proof.status)} · {tidy(proof.placement.beliefBefore)} → {tidy(proof.placement.beliefAfter)}
        </DlRow>
      </dl>
    </div>
  );
}

function FlagInspectorDetail({ issue }: { issue: NarrativeValidationIssue }) {
  return (
    <div className="site00-nme-wizard__inspector">
      <div className="site00-nme-wizard__duo">
        <div>
          <p className="site00-nme-wizard__label">Severity</p>
          <p className="site00-nme-wizard__duo-val">{issue.severity}</p>
        </div>
        <div>
          <p className="site00-nme-wizard__label">Blocking</p>
          <p className="site00-nme-wizard__duo-val">{issue.blocking ? 'Yes' : 'No'}</p>
        </div>
      </div>
      <dl className="site00-nme-wizard__dls">
        <DlRow label="Trigger">{issue.trigger}</DlRow>
        <DlRow label="Explanation">{issue.explanation}</DlRow>
        <DlRow label="Affected beats">{issue.affectedBeatIds.join(', ') || '—'}</DlRow>
        <DlRow label="Suggested correction">{issue.suggestedCorrection}</DlRow>
      </dl>
    </div>
  );
}

function ReelInspectorDetail({
  plan,
  shot,
  index,
  imagesFor,
  reelDetail,
}: {
  plan: NarrativeMomentumPlan;
  shot: ReelBeatAdaptation;
  index: number;
  imagesFor: (order: number, count?: number) => string[];
  reelDetail: NarrativeMomentumPlan['formatAdaptations'][number]['reelDetail'];
}) {
  const beat = plan.beats.find((b) => b.beatId === shot.sourceNarrativeBeatId);
  const imgs = imagesFor(beat?.order ?? index + 1, 2);
  const pair = isEraPair(plan, beat);
  return (
    <div className="site00-nme-wizard__inspector">
      {pair ?
        <SplitPlate a={imgs[0]} b={imgs[1]} labels={['2016', '2026']} />
      : <Plate src={imgs[0]} index={beat?.order} label={beat?.label} className="site00-nme-wizard__inspector-hero" />}
      <div className="site00-nme-wizard__timecode">
        <span>{shot.estimatedDurationRange}</span>
        <span>{words(beat?.shotFunction ?? '')}</span>
      </div>
      <dl className="site00-nme-wizard__dls">
        <DlRow label="Source beat">
          {beat ? `Beat ${pad(beat.order)} — ${beat.label}` : shot.sourceNarrativeBeatId}
        </DlRow>
        <DlRow label="What viewer sees">{tidy(shot.screenAction)}</DlRow>
        <DlRow label="What viewer knows">{tidy(shot.viewerKnowledgeState)}</DlRow>
        <DlRow label="Why this shot exists">{tidy(shot.narrativePurpose)}</DlRow>
        <DlRow label="Camera · motion">{tidy(shot.visualPurpose)}</DlRow>
        {shot.proofUsed?.length ?
          <DlRow label="Proof used">{shot.proofUsed.join(', ')}</DlRow>
        : null}
        <div className="site00-nme-wizard__dl site00-nme-wizard__dl--duo">
          <div>
            <dt>Pacing</dt>
            <dd>{shot.estimatedDurationRange}</dd>
          </div>
          <div>
            <dt>Transition</dt>
            <dd>{tidy(shot.transitionFunction)}</dd>
          </div>
        </div>
        {reelDetail?.soundNotes ?
          <DlRow label="Audio cue">{tidy(reelDetail.soundNotes)}</DlRow>
        : null}
        {reelDetail?.visualContinuityRequirements ?
          <DlRow label="Continuity">{tidy(reelDetail.visualContinuityRequirements)}</DlRow>
        : null}
      </dl>
    </div>
  );
}

function CarouselInspectorDetail({
  plan,
  slide,
  evidence,
  imagesFor,
}: {
  plan: NarrativeMomentumPlan;
  slide: CarouselSlideAdaptation;
  evidence: readonly NarrativeEvidenceObject[];
  imagesFor: (order: number, count?: number) => string[];
}) {
  const beat = plan.beats.find((b) => b.beatId === slide.sourceBeatIds[0]);
  const imgs = imagesFor(beat?.order ?? slide.slideNumber, 2);
  const proofs = evidence.filter((e) => slide.proofIds?.includes(e.id));
  return (
    <div className="site00-nme-wizard__inspector">
      {isEraPair(plan, beat) ?
        <SplitPlate a={imgs[0]} b={imgs[1]} labels={['2016', '2026']} />
      : <Plate src={imgs[0]} index={slide.slideNumber} label={beat?.label} className="site00-nme-wizard__inspector-hero" />}
      <div className="site00-nme-wizard__duo">
        <div>
          <p className="site00-nme-wizard__label">Tension</p>
          <p className={`site00-nme-wizard__duo-val site00-nme-wizard__tone-${tensionTone(slide.tensionStage)}`}>{slide.tensionStage}</p>
        </div>
        <div>
          <p className="site00-nme-wizard__label">Slide</p>
          <p className="site00-nme-wizard__duo-val">{pad(slide.slideNumber)}</p>
        </div>
      </div>
      <dl className="site00-nme-wizard__dls">
        <DlRow label="Purpose">{tidy(slide.purpose)}</DlRow>
        <DlRow label="Content role">{tidy(slide.contentRole)}</DlRow>
        <DlRow label="Proof">{proofs.length ? proofs.map((p) => words(p.proofType)).join(', ') : '—'}</DlRow>
        <DlRow label="Transition">{tidy(slide.transition) || '—'}</DlRow>
      </dl>
    </div>
  );
}
