/**
 * P0.VR.EXPERIENCE-REVIEW-PANEL-DESIGN-SYSTEM-ALIGNMENT-AND-READABILITY1
 */

import type { ExperienceExpressionVisualState } from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import type { ExperienceContentManifest } from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceContentManifest.js';
import type { ExperienceContentStateAudit } from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceContentManifest.js';
import type { ExperienceReviewPackageStatus, ExperienceReviewPanelMode } from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceReviewPresentation.js';
import { PageConceptContainedPreviewFrame } from '../PageConceptContainedPreviewFrame';

export function ExperienceReviewHeader(props: {
  projectLabel: string;
  pageLabel: string;
  conceptLabel: string | null;
  outputCount: number;
  statusLabel: string;
  providerLabel: string;
  onClose: () => void;
}) {
  return (
    <header className="s00-exp-review__head s00-pcg__head" data-testid="experience-review-header">
      <div className="s00-pcg__headRow">
        <h2 className="s00-pcg__title">EXPERIENCE REVIEW</h2>
        <button type="button" className="s00-pcg__dismiss" data-testid="experience-review-close" onClick={props.onClose}>
          CLOSE
        </button>
      </div>
      <p className="s00-pcg__target" data-testid="page-concept-experience-project-page">
        TARGET: {props.projectLabel.toUpperCase()} / {props.pageLabel.toUpperCase()}
      </p>
      <p className="s00-exp-review__headMeta" data-testid="page-concept-experience-source-line">
        SOURCE AUTHORITY: {props.conceptLabel ?? 'MOBILE AUTHORITY'} · PROVIDER: {props.providerLabel}
      </p>
      <p className="s00-exp-review__headMeta" data-testid="page-concept-experience-status-line">
        PACKAGE: {props.outputCount} OUTPUTS · STATUS: {props.statusLabel}
      </p>
    </header>
  );
}

export function ExperienceReviewCoverageSection(props: {
  coveredCount: number;
  totalPatterns: number;
  percent: number;
  bindings: readonly { authorityLabel: string; authorityStateId: string; pattern: string; interactionCount: number }[];
}) {
  return (
    <section className="s00-exp-review__coverage" data-testid="experience-review-expression-coverage">
      <h3 className="s00-exp-review__coverageTitle">EXPRESSION COVERAGE</h3>
      <p className="s00-exp-review__coverageSummary">
        VISUAL PATTERNS · {props.coveredCount} / {props.totalPatterns} COVERED · {props.percent}%
      </p>
      <ul className="s00-exp-review__coverageList">
        {props.bindings.map((b) => (
          <li key={b.authorityStateId}>
            <strong>{b.authorityLabel.toUpperCase()}</strong> covers {b.interactionCount} interaction(s) ·{' '}
            {b.pattern.replace(/_/g, ' ')}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ExperienceReviewStatusStrip(props: {
  packageStatus: ExperienceReviewPackageStatus;
  blockerHint: string | null;
  themeAuthority: string;
}) {
  const s = props.packageStatus;
  return (
    <section className="s00-exp-review__statusStrip" data-testid="experience-review-status-strip">
      <span className="s00-exp-review__statusStripLabel">PACKAGE STATUS</span>
      <p className="s00-exp-review__statusStripCounts" data-testid="page-concept-experience-expression-count">
        {s.planned} PLANNED · {s.inherited} INHERITED · {s.falOutputs} FAL OUTPUTS · {s.falReady} FAL READY ·{' '}
        {s.materialized} / {s.planned} MATERIALIZED
        {s.pending > 0 ? ` · ${s.pending} PENDING` : ''}
        {s.stale > 0 ? ` · ${s.stale} STALE` : ''}
      </p>
      {props.blockerHint ?
        <p className="s00-exp-review__statusStripWarn" data-testid="experience-review-blocked-hint">
          {props.blockerHint.toUpperCase()}
        </p>
      : null}
      <p className="s00-exp-review__statusStripMeta" data-testid="page-concept-experience-authority-theme">
        AUTHORITY THEME · {props.themeAuthority}
      </p>
    </section>
  );
}

function shortOutputTabLabel(state: ExperienceExpressionVisualState, stateKindLabel: (s: ExperienceExpressionVisualState) => string): string {
  const kind = stateKindLabel(state);
  if (kind.includes('BASE')) return 'BASE';
  if (kind.includes('MENU')) return 'MENU';
  if (kind.includes('ENTRY')) return 'ENTRY DETAIL';
  if (kind.includes('ACCESS') || kind.includes('PROJECT')) return 'PROJECT ACCESS';
  return state.stateId.toUpperCase().slice(0, 8);
}

export function regenActionLabelForState(state: ExperienceExpressionVisualState, stateKindLabel: (s: ExperienceExpressionVisualState) => string): string | null {
  if (state.sourceProvider !== 'FAL_EXPERIENCE') return null;
  const kind = stateKindLabel(state);
  if (state.stateId === 'menu' || kind.includes('MENU')) return 'REGENERATE MENU';
  if (kind.includes('ENTRY')) return 'REGENERATE ENTRY DETAIL';
  if (kind.includes('ACCESS') || kind.includes('PROJECT')) return 'REGENERATE PROJECT ACCESS';
  return 'REGENERATE THIS OUTPUT';
}

function statusGlyph(status: string): string {
  if (status === 'READY' || status === 'INHERITED') return '✓';
  if (status === 'STALE') return '!';
  if (status === 'MISSING') return '•';
  if (status === 'GENERATING') return '↻';
  return '•';
}

export function ExperienceReviewOutputNav(props: {
  visualStates: readonly ExperienceExpressionVisualState[];
  activeStateId: string;
  approved: boolean;
  stateKindLabel: (s: ExperienceExpressionVisualState) => string;
  cardStatus: (s: ExperienceExpressionVisualState) => string;
  onSelect: (stateId: string) => void;
  onInspect?: (stateId: string) => void;
  onRegenerateState?: (stateId: string) => void;
}) {
  return (
    <nav className="s00-exp-review__outputTabs" aria-label="Experience outputs" data-testid="experience-review-output-nav">
      {props.visualStates.map((state) => {
        const selected = state.stateId === props.activeStateId;
        const status = props.cardStatus(state);
        const tab = shortOutputTabLabel(state, props.stateKindLabel);
        return (
          <button
            key={state.stateId}
            type="button"
            className={`s00-exp-review__outputTab${selected ? ' s00-exp-review__outputTab--active' : ''}`}
            data-testid={`page-concept-experience-card-${state.stateId}`}
            aria-current={selected ? 'true' : undefined}
            onClick={() => props.onSelect(state.stateId)}
          >
            <span className="s00-exp-review__outputTabLabel" data-testid={`experience-output-tab-label-${state.stateId}`}>
              {tab}
            </span>
            <span className="s00-exp-review__outputTabStatus" data-testid={`page-concept-experience-card-status-${state.stateId}`}>
              {statusGlyph(status)} {status}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function ExperienceReviewSelectedOutputActions(props: {
  state: ExperienceExpressionVisualState;
  stateKindLabel: (s: ExperienceExpressionVisualState) => string;
  onInspect: () => void;
  onRegenerate?: () => void;
  onGenerate?: () => void;
  onRecover?: () => void;
  hasRecoverableArtifact?: boolean;
}) {
  const regenLabel = props.onRegenerate ? regenActionLabelForState(props.state, props.stateKindLabel) : null;
  const pending = !props.state.previewImageUri?.trim() && props.state.sourceProvider === 'FAL_EXPERIENCE';
  return (
    <div className="s00-exp-review__selectedActions" data-testid="experience-review-selected-output-actions">
      <button type="button" className="s00-exp-review__btn s00-exp-review__btn--white" onClick={props.onInspect}>
        INSPECT
      </button>
      {pending && props.onGenerate ?
        <button
          type="button"
          className="s00-exp-review__btn s00-exp-review__btn--lime"
          data-testid={`page-concept-generate-experience-state-${props.state.stateId}`}
          onClick={props.onGenerate}
        >
          GENERATE THIS OUTPUT
        </button>
      : null}
      {pending && props.hasRecoverableArtifact && props.onRecover ?
        <button type="button" className="s00-exp-review__btn s00-exp-review__btn--white" onClick={props.onRecover}>
          RECOVER OUTPUT
        </button>
      : null}
      {props.onRegenerate && regenLabel && !pending ?
        <button
          type="button"
          className="s00-exp-review__btn s00-exp-review__btn--black"
          data-testid={`page-concept-regenerate-experience-state-${props.state.stateId}`}
          onClick={props.onRegenerate}
        >
          {regenLabel}
        </button>
      : null}
    </div>
  );
}

export function ExperienceReviewPendingStage(props: {
  state: ExperienceExpressionVisualState;
  stateKindLabel: (s: ExperienceExpressionVisualState) => string;
  cardStatus: string;
}) {
  const label = props.stateKindLabel(props.state);
  return (
    <section className="s00-exp-review__pendingStage" data-testid="experience-review-pending-stage">
      <h3 className="s00-exp-review__emptyTitle">{label}</h3>
      <p className="s00-exp-review__emptyCopy" data-testid="experience-review-pending-status">
        STATUS: {props.cardStatus.toUpperCase()}
      </p>
      <p className="s00-exp-review__emptyCopy">This expression output has not been materialized yet.</p>
    </section>
  );
}

export function ExperienceReviewTechnicalDetails(props: {
  packageId: string;
  sourceAuthorityId: string;
  artifactIds: readonly string[];
  legacyReceipt: import('../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceLegacyFalArtifactReconciliation.js').ExperienceLegacyReconciliationReceipt | null;
}) {
  return (
    <details className="s00-exp-review__technical" data-testid="experience-review-technical-details">
      <summary>LINEAGE / TECHNICAL DETAILS</summary>
      <p data-testid="experience-review-lineage-debug">PACKAGE {props.packageId}</p>
      <p>AUTHORITY {props.sourceAuthorityId}</p>
      <p>ARTIFACTS {(props.artifactIds ?? []).join(', ') || '—'}</p>
      {props.legacyReceipt ?
        <p>
          RECOVERY · MENU {props.legacyReceipt.menu} · ENTRY {props.legacyReceipt.entryDetail} · ACCESS{' '}
          {props.legacyReceipt.projectAccess}
        </p>
      : null}
    </details>
  );
}

export function ExperienceReviewPreviewStage(props: {
  state: ExperienceExpressionVisualState | null;
  stateKindLabel: (s: ExperienceExpressionVisualState) => string;
  onFullscreen: () => void;
  cardStatus?: (s: ExperienceExpressionVisualState) => string;
}) {
  if (!props.state) return null;
  const pending =
    props.state.sourceProvider === 'FAL_EXPERIENCE' && !props.state.previewImageUri?.trim();
  if (pending) {
    return (
      <ExperienceReviewPendingStage
        state={props.state}
        stateKindLabel={props.stateKindLabel}
        cardStatus={props.cardStatus?.(props.state) ?? 'PENDING'}
      />
    );
  }
  return (
    <section className="s00-exp-review__previewStage" data-testid="experience-review-preview-stage">
      <div className="s00-exp-review__previewFrame" data-testid="page-concept-experience-visual-preview">
        <PageConceptContainedPreviewFrame
          size="mobile"
          status={props.state.previewImageUri ? 'READY' : 'PENDING'}
          imageSrc={props.state.previewImageUri}
          cacheBustArtifactId={props.state.generatedArtifactId}
          testId={`page-concept-experience-visual-${props.state.stateId}`}
        />
      </div>
      <button type="button" className="s00-exp-review__btn s00-exp-review__btn--white" onClick={props.onFullscreen}>
        FULLSCREEN / INSPECT
      </button>
    </section>
  );
}

export function ExperienceReviewDetails(props: {
  state: ExperienceExpressionVisualState;
  stateKindLabel: (s: ExperienceExpressionVisualState) => string;
  conceptLabel: string | null;
  themeLine: string;
  founderThemeLine: string;
  tabletHandoff: string;
  desktopHandoff: string;
  contentAudit: ExperienceContentStateAudit | undefined;
  manifest: ExperienceContentManifest | null | undefined;
  previousArtifactId?: string | null;
}) {
  const label = props.stateKindLabel(props.state);
  return (
    <section className="s00-exp-review__details" data-testid="experience-review-details">
      <h3 className="s00-exp-review__detailsTitle">OUTPUT DETAILS</h3>
      <p data-testid="page-concept-experience-state-meta">
        OUTPUT: {label}
      </p>
      <p>
        PURPOSE: Demonstrates {label.toLowerCase()} while preserving approved mobile authority ({props.conceptLabel ?? '—'}).
      </p>
      <p data-testid={`page-concept-experience-card-theme-${props.state.stateId}`}>
        INHERITS: APPROVED MOBILE AUTHORITY · THEME: {props.themeLine}
      </p>
      <p data-testid={`page-concept-experience-card-founder-theme-${props.state.stateId}`}>
        {props.founderThemeLine === 'THEME MATCH' ? 'THEME MATCH ✓' : 'CONTRAST · REVIEW REQUIRED'}
      </p>
      {props.state.stateId !== 'base' ?
        <>
          <p data-testid={`page-concept-experience-card-content-status-${props.state.stateId}`}>
            CONTENT:{' '}
            {props.state.contentProvenanceStatus === 'VERIFIED' ?
              'VERIFIED'
            : props.state.contentProvenanceStatus === 'BLOCKED' ?
              'BLOCKED'
            : 'REVIEW REQUIRED'}
          </p>
          <p data-testid={`page-concept-experience-content-inspector-${props.state.stateId}`}>
            CANONICAL FIELDS: {props.manifest?.canonicalFields.length ?? 0} · MISSING: {props.contentAudit?.missingRequiredCount ?? 0}{' '}
            · INVENTED: {props.contentAudit?.inventedCount ?? 0} · COVERAGE:{' '}
            {props.state.contentCoveragePercent ?? props.contentAudit?.contentCoveragePercent ?? '—'}%
          </p>
        </>
      : null}
      <p>
        USED IN: TABLET {props.tabletHandoff} · DESKTOP {props.desktopHandoff} · EXPERIENCE PACKAGE HANDOFF
      </p>
      <p className="s00-exp-review__detailsMeta">
        LINEAGE: {props.state.sourceProvider} · {props.state.falPromptVersion ?? 'v1'}
      </p>
      {props.previousArtifactId ?
        <p data-testid={`page-concept-experience-previous-artifact-${props.state.stateId}`}>
          VERSION · CURRENT {props.state.generatedArtifactId ?? '—'} · PREVIOUS {props.previousArtifactId}
        </p>
      : null}
    </section>
  );
}

export function ExperienceReviewHydratingState() {
  return (
    <div className="s00-exp-review__loading" data-testid="experience-review-hydrating-state">
      <h3 className="s00-exp-review__emptyTitle">LOADING EXPERIENCE PACKAGE</h3>
      <p className="s00-exp-review__emptyCopy">Resolving persisted FAL outputs and package index…</p>
    </div>
  );
}

export function ExperienceReviewStaleBanner(props: { onRegenerateAffected: () => void }) {
  return (
    <section className="s00-exp-review__statusStripWarn" data-testid="experience-review-stale-banner">
      <p>EXPERIENCE PACKAGE STALE · SOURCE AUTHORITY CHANGED</p>
      <button type="button" className="s00-exp-review__btn s00-exp-review__btn--black" onClick={props.onRegenerateAffected}>
        REGENERATE AFFECTED STATES
      </button>
    </section>
  );
}

export function ExperienceReviewEmptyState(props: {
  busy?: boolean;
  onGenerate: () => void;
  generateLabel?: string;
}) {
  return (
    <div className="s00-exp-review__empty" data-testid="page-concept-experience-review-empty">
      <h3 className="s00-exp-review__emptyTitle">EXPERIENCE PACKAGE NOT GENERATED YET</h3>
      <p className="s00-exp-review__emptyCopy">
        Generate or refine FAL experience outputs here — expanded navigation, entry detail panel, and project access
        overlay states. Use REGENERATE PACKAGE or REGENERATE OUTPUT after the first package completes.
      </p>
      <button
        type="button"
        className="s00-exp-review__btn s00-exp-review__btn--lime"
        disabled={props.busy}
        data-testid="experience-review-generate-package"
        onClick={props.onGenerate}
      >
        {props.generateLabel ?? 'GENERATE EXPERIENCE PACKAGE'}
      </button>
    </div>
  );
}

export function ExperienceReviewLoadingState(props: {
  packageStatus: ExperienceReviewPackageStatus;
  visualStates: readonly ExperienceExpressionVisualState[];
}) {
  return (
    <div className="s00-exp-review__loading" data-testid="experience-review-loading-state">
      <h3 className="s00-exp-review__emptyTitle">GENERATING EXPERIENCE PACKAGE</h3>
      <p>
        {props.packageStatus.planned} PLANNED · {props.packageStatus.ready} COMPLETE · {props.packageStatus.running}{' '}
        RUNNING · {props.packageStatus.failed} FAILED
      </p>
      <ul className="s00-exp-review__loadingList">
        {props.visualStates.map((v) => (
          <li key={v.stateId}>
            {v.label}: {v.previewImageUri ? 'READY' : v.materializationStatus ?? 'PENDING'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExperienceReviewErrorState(props: { message: string; onRetry: () => void; busy?: boolean }) {
  return (
    <div className="s00-exp-review__error" data-testid="experience-review-error-state">
      <h3 className="s00-exp-review__emptyTitle">EXPERIENCE GENERATION FAILED</h3>
      <p className="s00-exp-review__errorMessage">{props.message}</p>
      <button
        type="button"
        className="s00-exp-review__btn s00-exp-review__btn--black"
        disabled={props.busy}
        data-testid="experience-review-retry-package"
        onClick={props.onRetry}
      >
        REGENERATE PACKAGE
      </button>
    </div>
  );
}

export function ExperienceReviewActionBar(props: {
  mode: ExperienceReviewPanelMode;
  approved: boolean;
  busy?: boolean;
  approveDisabled: boolean;
  generatePackageLabel?: string;
  showGenerateMissingOnly?: boolean;
  disableGenerateMissing?: boolean;
  onApprove: () => void;
  onRegeneratePackage: () => void;
  onGeneratePackage?: () => void;
  onRegenerateState?: () => void;
  onRegenerateStateInheritTheme?: () => void;
  activeStateId?: string;
  regenActionLabel?: string | null;
  onReviewNext?: () => void;
  onClose: () => void;
  showRegenerateState: boolean;
}) {
  if (props.mode === 'HYDRATING') {
    return (
      <footer className="s00-exp-review__actionBar" data-testid="experience-review-action-bar">
        <button type="button" className="s00-exp-review__btn s00-exp-review__btn--white" disabled onClick={props.onClose}>
          LOADING…
        </button>
      </footer>
    );
  }

  if (props.mode === 'EMPTY') {
    return (
      <footer className="s00-exp-review__actionBar" data-testid="experience-review-action-bar">
        <button
          type="button"
          className="s00-exp-review__btn s00-exp-review__btn--lime"
          disabled={props.busy}
          data-testid="experience-review-action-bar-generate"
          onClick={props.onGeneratePackage ?? props.onRegeneratePackage}
        >
          {props.generatePackageLabel ?? 'GENERATE EXPERIENCE PACKAGE'}
        </button>
        <button type="button" className="s00-exp-review__btn s00-exp-review__btn--white" onClick={props.onClose}>
          CLOSE
        </button>
      </footer>
    );
  }

  return (
    <footer className="s00-exp-review__actionBar" data-testid="experience-review-action-bar">
      {!props.approved && props.mode !== 'FAILED' && props.mode !== 'GENERATING' ?
        <>
          <button
            type="button"
            className="s00-exp-review__btn s00-exp-review__btn--lime"
            disabled={props.approveDisabled}
            data-testid="page-concept-approve-experience-review"
            onClick={props.onApprove}
          >
            APPROVE PACKAGE
          </button>
          {!props.showGenerateMissingOnly ?
            <button
              type="button"
              className="s00-exp-review__btn s00-exp-review__btn--black"
              disabled={props.busy}
              data-testid="page-concept-regenerate-experience"
              onClick={props.onRegeneratePackage}
            >
              REGENERATE PACKAGE
            </button>
          : null}
          {props.showGenerateMissingOnly ?
            <button
              type="button"
              className="s00-exp-review__btn s00-exp-review__btn--lime"
              disabled={props.busy || props.disableGenerateMissing}
              data-testid="experience-review-generate-missing-outputs"
              onClick={props.onGeneratePackage ?? props.onRegeneratePackage}
            >
              {props.generatePackageLabel ?? 'GENERATE MISSING OUTPUTS'}
            </button>
          : null}
        </>
      : null}
      {props.showRegenerateState && props.onRegenerateState && props.regenActionLabel ?
        <button
          type="button"
          className="s00-exp-review__btn s00-exp-review__btn--white"
          disabled={props.busy}
          data-testid="page-concept-regenerate-experience-state-active"
          onClick={props.onRegenerateState}
        >
          {props.regenActionLabel}
        </button>
      : null}
      {props.onRegenerateStateInheritTheme ?
        <button
          type="button"
          className="s00-exp-review__btn s00-exp-review__btn--white"
          disabled={props.busy}
          data-testid="page-concept-regenerate-experience-state-inherit-theme-active"
          onClick={props.onRegenerateStateInheritTheme}
        >
          REGENERATE WITH AUTHORITY THEME
        </button>
      : null}
      {props.onReviewNext ?
        <button type="button" className="s00-exp-review__btn s00-exp-review__btn--white" onClick={props.onReviewNext}>
          REVIEW NEXT OUTPUT
        </button>
      : null}
      <button
        type="button"
        className="s00-exp-review__btn s00-exp-review__btn--white"
        data-testid="page-concept-close-experience-review"
        onClick={props.onClose}
      >
        {props.approved ? 'CLOSE' : 'CANCEL'}
      </button>
    </footer>
  );
}
