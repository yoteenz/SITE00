import { useEffect } from 'react';

import {
  buildDesignPageProvenancePresentation,
  buildDesignProjectIntelligence,
  compileDesignPageContext,
  getDesignBoundPage,
} from '../../../../../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { resolveDesignPageTargetForShell } from './designProductionPageTarget';
import type { AuthorityReviewDecision } from '../../../../../shared/site00-design-workspace-production/types.js';
import {
  TWIN_OPUS_DIRECT_AMENDMENT,
  LEGACY_RECONSTRUCTION_OUTPUT_COLUMNS,
} from '../opusDirect/twinOpusDirectContent';
import {
  buildPagePipelineControllerModel,
  type PagePipelineStageId,
} from '../../../../../shared/site00-design-workspace-production/designPagePipelineController.js';
import {
  buildPageSystemReviewModel,
  PAGE_SYSTEM_REVIEW_TITLE,
} from '../../../../../shared/site00-design-workspace-production/designPageSystemReview.js';
import { loadPageAuthorityWorkflow } from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { listApprovedGrokAssets, listStagedGrokAssets } from '../../../../../shared/site00-design-workspace-production/designGrokAssetModel.js';
import { twinOpusDirectCandidateArtifactView, twinOpusDirectCandidateById } from '../opusDirect/twinOpusDirectCandidateArtifacts';
import type { TwinOpusDirectProduction } from '../opusDirect/useTwinOpusDirectProduction';
import { resolveTwinOpusDirectAsset } from '../opusDirect/twinOpusDirectAssetManifest';
import { TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH } from '../opusDirect/twinOpusDirectContent';
import { DesignArtifactFullscreenViewer } from './DesignArtifactFullscreenViewer';
import { DesignGateBadge } from './DesignChildSurfaceFrame';

export function ReadinessReceiptPanel({
  production,
  projectSlug,
  pageId,
}: {
  production: TwinOpusDirectProduction;
  projectSlug: string;
  pageId: string;
}) {
  const { state } = production;
  const pipeline = buildPagePipelineControllerModel({
    projectId: projectSlug,
    pageId,
    production: state,
    twinRouteReachable: null,
  });
  const checks = pipeline.receiptGates;
  const passed = checks.filter((c) => c.result === 'PASS').length;
  const blocked = checks.filter((c) => c.result === 'BLOCKED' || c.result === 'FAIL').length;
  const warnings = checks.filter((c) => !c.blocking && c.result !== 'PASS' && c.result !== 'NOT_APPLICABLE').length;
  const na = checks.filter((c) => c.result === 'NOT_APPLICABLE').length;

  return (
    <>
      <div className="tod-dcs-summary">
        <div className="tod-dcs-summary__metric">
          <span className="tod-dcs-summary__label">GATES</span>
          <strong>
            {passed} / {checks.filter((c) => c.result !== 'NOT_APPLICABLE').length}
          </strong>
        </div>
        <div className="tod-dcs-summary__metric">
          <span className="tod-dcs-summary__label">CONTRACT</span>
          <strong>{state.contractFreeze.contractVersion}</strong>
        </div>
        <div className="tod-dcs-summary__metric">
          <span className="tod-dcs-summary__label">AUTHORITY</span>
          <strong>{state.designAuthorityVersion}</strong>
        </div>
      </div>
      <div className="tod-dcs-summaryRow">
        <span>PASSED {passed}</span>
        <span>BLOCKED {blocked}</span>
        <span>WARNINGS {warnings}</span>
        <span>N/A {na}</span>
      </div>
      <ul className="tod-dcs-gates" data-testid="readiness-gate-list">
        {checks.map((gate) => (
          <li key={gate.id} className="tod-dcs-gate" data-result={gate.result}>
            <div className="tod-dcs-gate__top">
              <strong className="tod-dcs-gate__name">{gate.label}</strong>
              <DesignGateBadge result={gate.result} />
            </div>
            {gate.reason ?
              <p className="tod-dcs-gate__reason">{gate.reason}</p>
            : null}
            <span className="tod-dcs-gate__cat">{gate.scope.replace(/_/g, ' ')}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function promotedConceptPreview(conceptId: string | null) {
  if (!conceptId) return null;
  return twinOpusDirectCandidateArtifactView(conceptId);
}

export function PairReviewPanel({ production }: { production: TwinOpusDirectProduction }) {
  const { state, projection, actions } = production;
  const mobile = promotedConceptPreview(state.promotedMobileConceptId);
  const desktop = promotedConceptPreview(state.promotedDesktopConceptId);

  return (
    <>
      <p className="tod-dcs-lead">Side-by-side review of promoted mobile and desktop designs (final viewport approvals).</p>
      <div className="tod-dcs-compare tod-dcs-compare--dual">
        <article className="tod-dcs-compare__card">
          <header>PROMOTED MOBILE DESIGN</header>
          {mobile?.src ?
            <button
              type="button"
              className="tod-dcs-compare__tap"
              onClick={() => actions.openFullscreenArtifact(mobile)}
            >
              <img src={mobile.src} alt="" className="tod-dcs-compare__img" />
            </button>
          : <p>No mobile promoted design</p>}
          <span className="tod-dcs-compare__ver">{state.promotedMobileConceptId ?? '—'} · {state.mobileVersion}</span>
        </article>
        <article className="tod-dcs-compare__card">
          <header>PROMOTED DESKTOP DESIGN</header>
          {desktop?.src ?
            <button
              type="button"
              className="tod-dcs-compare__tap"
              onClick={() => actions.openFullscreenArtifact(desktop)}
            >
              <img src={desktop.src} alt="" className="tod-dcs-compare__img" />
            </button>
          : <p>No desktop promoted design</p>}
          <span className="tod-dcs-compare__ver">{state.promotedDesktopConceptId ?? '—'} · {state.desktopVersion}</span>
        </article>
        <article className="tod-dcs-compare__card">
          <header>TABLET DERIVED</header>
          <div className="tod-dcs-compare__derived">
            {state.tabletMode === 'OVERRIDE' ? 'TABLET OVERRIDE' : 'DERIVED FROM PAIR'}
          </div>
          <DesignGateBadge
            result={state.tabletDerivedOk || state.tabletOverrideApprovedAt ? 'PASS' : 'BLOCKED'}
          />
        </article>
      </div>
      <section className="tod-dcs-notes">
        <h3 className="tod-dcs-notes__title">READINESS IMPLICATIONS</h3>
        <p>{projection.pairStatusLabel}</p>
        <p>Workflow stage: {state.workflowStage}</p>
        {projection.buildEligible ?
          <p className="tod-dcs-notes__ok">Build transition eligible when founder confirms.</p>
        : <p className="tod-dcs-notes__warn">Resolve blocked gates before MOVE TO BUILD.</p>}
      </section>
    </>
  );
}

export function ProvenancePanel({
  production,
  projectSlug,
}: {
  production: TwinOpusDirectProduction;
  projectSlug: string;
}) {
  const { state } = production;
  const slug = projectSlug.toUpperCase();
  const pageTarget = resolveDesignPageTargetForShell(projectSlug);
  const pageRecord = getDesignBoundPage(projectSlug, pageTarget.pageId);
  const provenance =
    pageRecord ?
      buildDesignPageProvenancePresentation(
        projectSlug,
        pageTarget.pageId,
        pageRecord.pageName,
        pageRecord.pageRole,
      )
    : null;

  return (
    <>
      <figure className="tod-dcs-provenanceGolden">
        <img src={TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH} alt="Approved golden reference" />
        <figcaption>PAGE DESIGN REFERENCE · {pageTarget.pageLabel}</figcaption>
      </figure>
      <dl className="tod-dcs-meta">
        <div>
          <dt>PAGE</dt>
          <dd>{provenance?.activePageLabel ?? pageTarget.pageLabel}</dd>
        </div>
        <div>
          <dt>INFORMED BY</dt>
          <dd>{provenance?.informedBy.join(' · ') ?? 'campaign content · brand intelligence'}</dd>
        </div>
        <div>
          <dt>GOLDEN AUTHORITY</dt>
          <dd>
            {state.mobileVersion} mobile · {state.desktopVersion} desktop
          </dd>
        </div>
        <div>
          <dt>AUTHORITY VERSION</dt>
          <dd>{state.designAuthorityVersion}</dd>
        </div>
        <div>
          <dt>ASSET LINEAGE</dt>
          <dd>twin-opus-direct-assets-v1 · Grok-approved plates</dd>
        </div>
        <div>
          <dt>UPSTREAM PROJECT INTELLIGENCE</dt>
          <dd>{slug} · CULTURAL_INTELLIGENCE_EDITORIAL</dd>
        </div>
        <div>
          <dt>RELATED HISTORY</dt>
          <dd>Authority events persisted via design-workspace-production API</dd>
        </div>
      </dl>
    </>
  );
}

export function CreativeContextPanel({
  projectSlug,
  pageId,
}: {
  projectSlug: string;
  pageId?: string | null;
}) {
  const intel = buildDesignProjectIntelligence(projectSlug);
  const pageCtx = pageId ? compileDesignPageContext(projectSlug, pageId) : null;

  if (!intel) {
    return <p className="tod-dcs-lead">No project intelligence for this slug.</p>;
  }

  return (
    <>
      <dl className="tod-dcs-meta">
        <div>
          <dt>MODULE</dt>
          <dd>PROJECTS → DESIGN</dd>
        </div>
        <div>
          <dt>ACTIVE PROJECT</dt>
          <dd>{intel.displayName}</dd>
        </div>
        <div>
          <dt>PROJECT DEFINITION</dt>
          <dd>{intel.description}</dd>
        </div>
        <div>
          <dt>BRAND / EXPRESSION</dt>
          <dd>{intel.brandExpression}</dd>
        </div>
        <div>
          <dt>PRIMARY EXPRESSION CONTEXT</dt>
          <dd>{intel.primaryCreativeStream}</dd>
        </div>
        <div>
          <dt>PAGE REGISTRY</dt>
          <dd>
            {intel.pageRegistryId} · {intel.totalPages} pages tracked
          </dd>
        </div>
        <div>
          <dt>PROJECT DESIGN COMPLETION</dt>
          <dd>
            {intel.pagesApproved} approved · {intel.pagesNeedingDesign} need design · {intel.pagesInReview} in review
          </dd>
        </div>
      </dl>
      {pageCtx ?
        <section className="tod-dcs-notes">
          <h3 className="tod-dcs-notes__title">PAGE CONTEXT</h3>
          <dl className="tod-dcs-meta">
            <div>
              <dt>PAGE</dt>
              <dd>{pageCtx.activePageId}</dd>
            </div>
            <div>
              <dt>ROLE</dt>
              <dd>{pageCtx.pageRole}</dd>
            </div>
            <div>
              <dt>ROUTE</dt>
              <dd>{pageCtx.route}</dd>
            </div>
            <div>
              <dt>INHERITANCE</dt>
              <dd>{pageCtx.inheritance}</dd>
            </div>
            <div>
              <dt>CURRENT AUTHORITY</dt>
              <dd>{pageCtx.currentAuthority}</dd>
            </div>
          </dl>
        </section>
      : null}
    </>
  );
}

export function ContractVersionsPanel({ production }: { production: TwinOpusDirectProduction }) {
  const { state } = production;

  return (
    <dl className="tod-dcs-meta">
      <div>
        <dt>INTERACTION CONTRACT</dt>
        <dd>{state.contractFreeze.contractVersion}</dd>
      </div>
      <div>
        <dt>CONTRACT HASH</dt>
        <dd className="tod-dcs-compare__ver">{state.contractFreeze.contractHash.slice(0, 16)}…</dd>
      </div>
      <div>
        <dt>DESIGN AUTHORITY</dt>
        <dd>{state.designAuthorityVersion}</dd>
      </div>
      <div>
        <dt>FROZEN AT</dt>
        <dd>{state.contractFreeze.frozenAt}</dd>
      </div>
      <div>
        <dt>STATUS</dt>
        <dd>{state.contractFreeze.COMPOSER_CONTRACT_STATUS}</dd>
      </div>
    </dl>
  );
}

export function InspectCandidatePanel({
  production,
  candidateId,
}: {
  production: TwinOpusDirectProduction;
  candidateId: string;
}) {
  const { state } = production;
  const candidate = twinOpusDirectCandidateById(candidateId);
  const artifact = twinOpusDirectCandidateArtifactView(candidateId);

  return (
    <>
      {artifact.src ?
        <img src={artifact.src} alt="" className="tod-dcs-compare__img" />
      : null}
      <dl className="tod-dcs-meta">
        <div>
          <dt>CANDIDATE ID</dt>
          <dd>{candidate.id}</dd>
        </div>
        <div>
          <dt>VERSION</dt>
          <dd>{candidate.version}</dd>
        </div>
        <div>
          <dt>AUTHORITY ELIGIBILITY</dt>
          <dd>
            Mobile {state.mobileVersion} · Desktop {state.desktopVersion}
          </dd>
        </div>
        <div>
          <dt>LINEAGE</dt>
          <dd>ENTRY001 campaign archive · Grok-approved plate family</dd>
        </div>
        <div>
          <dt>SELECTED</dt>
          <dd>{state.selectedCandidateId === candidateId ? 'YES' : 'NO'}</dd>
        </div>
      </dl>
    </>
  );
}

export function CompareConceptsPanel({
  production,
  leftId,
  rightId,
}: {
  production: TwinOpusDirectProduction;
  leftId: string;
  rightId: string;
}) {
  const left = twinOpusDirectCandidateById(leftId);
  const right = twinOpusDirectCandidateById(rightId);

  return (
    <div className="tod-dcs-compare tod-dcs-compare--dual">
      {[left, right].map((candidate) => (
        <article key={candidate.id} className="tod-dcs-compare__card">
          <header>{candidate.version}</header>
          <img
            src={twinOpusDirectCandidateArtifactView(candidate.id).src}
            alt=""
            className="tod-dcs-compare__img"
          />
          <span className="tod-dcs-compare__ver">{candidate.id}</span>
          <DesignGateBadge
            result={production.state.selectedCandidateId === candidate.id ? 'SELECTED' : 'NOT_APPLICABLE'}
          />
        </article>
      ))}
    </div>
  );
}

export function ReviewTwinPagePanel({ projectSlug, production }: { projectSlug: string; production: TwinOpusDirectProduction }) {
  const pageTarget = resolveDesignPageTargetForShell(projectSlug);
  const pageRecord = getDesignBoundPage(projectSlug, pageTarget.pageId);
  const pageCtx = compileDesignPageContext(projectSlug, pageTarget.pageId);
  const route = pageCtx?.route ?? pageRecord?.route ?? '/';
  const src = typeof window !== 'undefined' ? `${window.location.origin}${route}` : route;

  useEffect(() => {
    production.actions.markTwinPageReviewed();
  }, [production.actions]);

  return (
    <>
      <p className="tod-dcs-lead">
        REVIEW AUTHORITY opens the actual twin / working page for {pageTarget.pageLabel} — not upstream CGPT authority
        references.
      </p>
      <dl className="tod-dcs-meta">
        <div>
          <dt>ROUTE</dt>
          <dd>{route}</dd>
        </div>
        <div>
          <dt>TWIN STATUS</dt>
          <dd>{production.state.twinImplementationStatus}</dd>
        </div>
      </dl>
      <iframe title="Twin page preview" className="tod-dcs-twinFrame" src={src} />
      <div className="tod-dcs-stackActions">
        <a className="tod-dcs__primary" href={route} target="_blank" rel="noreferrer">
          OPEN TWIN IN NEW TAB
        </a>
      </div>
    </>
  );
}

export function ComposerHandoffPanel({
  projectSlug,
  production,
  onConfirm,
  onCancel,
}: {
  projectSlug: string;
  production: TwinOpusDirectProduction;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { state } = production;
  const pageTarget = resolveDesignPageTargetForShell(projectSlug);

  return (
    <>
      <p className="tod-dcs-lead">Lock this design pair and send the page to Composer for twin implementation?</p>
      <dl className="tod-dcs-meta">
        <div>
          <dt>PAGE</dt>
          <dd>{pageTarget.pageLabel}</dd>
        </div>
        <div>
          <dt>MOBILE PROMOTED</dt>
          <dd>{state.promotedMobileConceptId ?? '—'}</dd>
        </div>
        <div>
          <dt>DESKTOP PROMOTED</dt>
          <dd>{state.promotedDesktopConceptId ?? '—'}</dd>
        </div>
        <div>
          <dt>TABLET</dt>
          <dd>{state.tabletMode === 'OVERRIDE' ? 'OVERRIDE' : 'DERIVED'}</dd>
        </div>
        <div>
          <dt>INTERACTION CONTRACT</dt>
          <dd>{state.contractFreeze.contractVersion}</dd>
        </div>
      </dl>
      <div className="tod-dcs-stackActions">
        <button type="button" className="tod-dcs__primary" onClick={onConfirm}>
          CONFIRM + SEND TO COMPOSER
        </button>
        <button type="button" className="tod-dcs__ghost" onClick={onCancel}>
          CANCEL
        </button>
      </div>
    </>
  );
}

/** Legacy formal review — retained for API compatibility; twin review is primary UX. */
export function ReviewAuthorityPanel({ production }: { production: TwinOpusDirectProduction }) {
  const { actions } = production;

  const submit = (decision: AuthorityReviewDecision) => {
    if (!decision) return;
    actions.runReviewAuthority(decision);
  };

  return (
    <>
      <p className="tod-dcs-lead">Formal founder decision — requires pair review opened first.</p>
      <div className="tod-dcs-stackActions">
        <button type="button" className="tod-dcs__primary" onClick={() => submit('APPROVE')}>
          APPROVE AUTHORITY
        </button>
        <button type="button" className="tod-dcs__ghost" onClick={() => submit('REQUEST_CHANGES')}>
          REQUEST CHANGES
        </button>
        <button type="button" className="tod-dcs__ghost" onClick={() => submit('REJECT')}>
          REJECT
        </button>
      </div>
    </>
  );
}

export function StructuredArtifactPanel({ columnId }: { columnId: string }) {
  const column =
    LEGACY_RECONSTRUCTION_OUTPUT_COLUMNS.find((c) => c.id === columnId) ?? LEGACY_RECONSTRUCTION_OUTPUT_COLUMNS[0];
  const slot =
    column.preview === 'manifest' ? 'grounding'
    : column.preview === 'blueprint' ? 'blueprint'
    : column.preview === 'overlay' ? 'overlay'
    : column.preview === 'evidence' ? 'assetPack'
    : 'grounding';
  const src = resolveTwinOpusDirectAsset(slot);

  return (
    <>
      <p className="tod-dcs-lead">{column.label} · {column.source}</p>
      {src ?
        <img src={src} alt="" className="tod-dcs-compare__img" />
      : null}
      {column.preview === 'functions' && column.functions ?
        <ul className="tod-dcs-gates">
          {column.functions.map((fn) => (
            <li key={fn} className="tod-dcs-gate">
              <strong className="tod-dcs-gate__name">{fn}</strong>
            </li>
          ))}
        </ul>
      : null}
    </>
  );
}

export function AmendmentDetailPanel() {
  const a = TWIN_OPUS_DIRECT_AMENDMENT;
  return (
    <dl className="tod-dcs-meta">
      <div>
        <dt>TYPE</dt>
        <dd>{a.fields.find((f) => f.label.includes('TYPE'))?.value ?? 'AUTHORITY SELECTION'}</dd>
      </div>
      <div>
        <dt>SCOPE</dt>
        <dd>{a.fields.find((f) => f.label.includes('SCOPE'))?.value}</dd>
      </div>
      <div>
        <dt>EFFECTIVE</dt>
        <dd>{a.fields.find((f) => f.label.includes('EFFECTIVE'))?.value}</dd>
      </div>
      <div>
        <dt>STATUS</dt>
        <dd>{a.chip}</dd>
      </div>
      <div>
        <dt>REFERENCE</dt>
        <dd>{a.title}</dd>
      </div>
    </dl>
  );
}

export function FullscreenArtifactOverlay({
  production,
}: {
  production: TwinOpusDirectProduction;
}) {
  const artifact = production.uiPayload.artifact;
  if (!artifact) return null;
  return (
    <DesignArtifactFullscreenViewer
      artifact={artifact}
      onClose={() => {
        production.actions.clearUiPayload();
        production.actions.setOverlay(null);
      }}
    />
  );
}

export function SpendConfirmPanel({
  production,
}: {
  production: TwinOpusDirectProduction;
}) {
  const { pendingSpend, actions } = production;
  if (!pendingSpend) return null;

  return (
    <>
      <dl className="tod-dcs-meta tod-dcs-meta--compact">
        <div>
          <dt>ACTION</dt>
          <dd>{pendingSpend.action}</dd>
        </div>
        <div>
          <dt>MODEL / PROVIDER</dt>
          <dd>site00-design · design-concept</dd>
        </div>
        <div>
          <dt>ESTIMATED COST</dt>
          <dd>${pendingSpend.estimatedUsd.toFixed(2)} USD</dd>
        </div>
        <div>
          <dt>PROJECT RUNNING TOTAL</dt>
          <dd>Tracked server-side per spend confirmation</dd>
        </div>
        <div>
          <dt>WHAT WILL BE CREATED</dt>
          <dd>New concept candidate branch under current gallery selection</dd>
        </div>
      </dl>
      <div className="tod-dcs-modalActions">
        <button type="button" className="tod-dcs__ghost" onClick={actions.cancelPendingSpend}>
          CANCEL
        </button>
        <button type="button" className="tod-dcs__primary" onClick={actions.confirmPendingSpend}>
          CONFIRM
        </button>
      </div>
    </>
  );
}

export function PageBatchEditConfirmPanel({
  projectSlug,
  batch,
  onCancel,
  onApply,
}: {
  projectSlug: string;
  batch: { sourcePageId: string; pageIds: string[]; scope: string };
  onCancel: () => void;
  onApply: () => void;
}) {
  const source = getDesignBoundPage(projectSlug, batch.sourcePageId);
  const targets = batch.pageIds
    .map((id) => getDesignBoundPage(projectSlug, id))
    .filter(Boolean);
  return (
    <>
      <p className="tod-dcs-lead">Composer implements batch changes — no automatic mutation.</p>
      <dl className="tod-dcs-meta">
        <div>
          <dt>SOURCE PAGE</dt>
          <dd>{source?.pageName ?? batch.sourcePageId}</dd>
        </div>
        <div>
          <dt>CHANGE TYPE</dt>
          <dd>{batch.scope}</dd>
        </div>
        <div>
          <dt>SELECTED DESCENDANTS</dt>
          <dd>{targets.map((t) => t!.pageName).join(' · ') || '—'}</dd>
        </div>
        <div>
          <dt>OVERRIDES AT RISK</dt>
          <dd>
            {targets.some((t) => t!.designStatus === 'AMENDMENT_REQUIRED') ?
              'Review pages with overrides before apply'
            : 'None flagged'}
          </dd>
        </div>
      </dl>
      <div className="tod-dcs-modalActions">
        <button type="button" className="tod-dcs__ghost" onClick={onCancel}>
          CANCEL
        </button>
        <button type="button" className="tod-dcs__primary" onClick={onApply}>
          APPLY TO SELECTED
        </button>
      </div>
    </>
  );
}

export function PageAssetInspectPanel({
  projectSlug,
  pageId,
  assetId,
}: {
  projectSlug: string;
  pageId: string;
  assetId: string;
}) {
  const assets = [...listApprovedGrokAssets(projectSlug, pageId), ...listStagedGrokAssets(projectSlug, pageId)];
  const asset = assets.find((a) => a.assetId === assetId);
  if (!asset) return <p className="tod-dcs-lead">Asset not found in active page manifest.</p>;
  return (
    <>
      <p className="tod-dcs-lead">
        {asset.slot} · {asset.origin} · {asset.status}
      </p>
      <img src={asset.previewDataUrl} alt="" className="tod-dcs-compare__img" />
      <dl className="tod-dcs-meta">
        <div>
          <dt>VERSION</dt>
          <dd>{asset.createdAt}</dd>
        </div>
        <div>
          <dt>USAGE</dt>
          <dd>Active twin / live page slot</dd>
        </div>
        <div>
          <dt>GROK LINEAGE</dt>
          <dd>{asset.runId ? `Run ${asset.runId}` : '—'}</dd>
        </div>
      </dl>
    </>
  );
}

export function PageInteractionsInspectorPanel({ projectSlug, pageId }: { projectSlug: string; pageId: string }) {
  const model = buildPageSystemReviewModel(projectSlug, pageId, 'MOBILE');
  return (
    <>
      <p className="tod-dcs-lead">
        {PAGE_SYSTEM_REVIEW_TITLE} · {model.activePageName}
      </p>
      <p className="tod-dcs-lead">
        COVERAGE {model.interactionSummary.covered}/{model.interactionSummary.total}
        {model.interactionSummary.unmapped > 0 ? ` · ${model.interactionSummary.unmapped} UNMAPPED` : ''}
      </p>
      <ul className="tod-dcs-gates">
        {model.interactions.map((row) => (
          <li key={row.id} className="tod-dcs-gate">
            <strong className="tod-dcs-gate__name">{row.label}</strong>
            <span>
              {row.category} · {row.action} · {row.inheritance} · {row.status}
            </span>
            {row.destination ?
              <span> → {row.destination}</span>
            : null}
          </li>
        ))}
      </ul>
    </>
  );
}

export function PagePipelineTimelinePanel({
  projectSlug,
  pageId,
  production,
}: {
  projectSlug: string;
  pageId: string;
  production: TwinOpusDirectProduction;
}) {
  const model = buildPagePipelineControllerModel({
    projectId: projectSlug,
    pageId,
    production: production.state,
    twinRouteReachable: null,
  });
  return (
    <ul className="tod-dcs-gates">
      {model.stages.map((stage) => (
        <li key={stage.id} className="tod-dcs-gate">
          <strong className="tod-dcs-gate__name">
            {stage.order.toString().padStart(2, '0')} {stage.label}
          </strong>
          <DesignGateBadge
            result={
              stage.status === 'COMPLETE' || stage.status === 'NOT_REQUIRED' ? 'PASS'
              : stage.status === 'ACTIVE' || stage.status === 'BLOCKED' ? 'BLOCKED'
              : 'NOT_APPLICABLE'
            }
          />
          <p className="tod-dcs-gate__reason">{stage.purpose}</p>
          {stage.missingItems.length ?
            <p className="tod-dcs-gate__reason">Missing: {stage.missingItems.join(' · ')}</p>
          : null}
        </li>
      ))}
    </ul>
  );
}

export function PipelineTechnicalDetailsPanel({
  projectSlug,
  pageId,
  production,
}: {
  projectSlug: string;
  pageId: string;
  production: TwinOpusDirectProduction;
}) {
  const wf = loadPageAuthorityWorkflow(projectSlug, pageId);
  const ctx = compileDesignPageContext(projectSlug, pageId);
  return (
    <dl className="tod-dcs-meta">
      <div>
        <dt>projectId</dt>
        <dd>{projectSlug}</dd>
      </div>
      <div>
        <dt>pageId</dt>
        <dd>{pageId}</dd>
      </div>
      <div>
        <dt>workflowStage</dt>
        <dd>{production.state.workflowStage}</dd>
      </div>
      <div>
        <dt>sessionVersion</dt>
        <dd>{production.state.sessionVersion}</dd>
      </div>
      <div>
        <dt>contractVersion</dt>
        <dd>{production.state.contractFreeze.contractVersion}</dd>
      </div>
      <div>
        <dt>twinRoute</dt>
        <dd>{ctx?.route ?? '—'}</dd>
      </div>
      <div>
        <dt>twinImplementationStatus</dt>
        <dd>{production.state.twinImplementationStatus ?? wf.twinImplementationStatus}</dd>
      </div>
      <div>
        <dt>composerHandoffPackageId</dt>
        <dd>{wf.composerHandoffPackage?.packageId ?? '—'}</dd>
      </div>
      <div>
        <dt>syncStatus</dt>
        <dd>{production.syncStatus}</dd>
      </div>
    </dl>
  );
}

export function PipelineStageDetailPanel({
  projectSlug,
  pageId,
  production,
  stageId,
}: {
  projectSlug: string;
  pageId: string;
  production: TwinOpusDirectProduction;
  stageId: PagePipelineStageId;
}) {
  const model = buildPagePipelineControllerModel({
    projectId: projectSlug,
    pageId,
    production: production.state,
    twinRouteReachable: null,
  });
  const stage = model.stages.find((s) => s.id === stageId);
  if (!stage) return <p className="tod-dcs-lead">Stage not found.</p>;
  return (
    <>
      <p className="tod-dcs-lead">{stage.label}</p>
      <p className="tod-dcs-lead">{stage.purpose}</p>
      {stage.completedItems.length ?
        <p className="tod-dcs-lead">Completed: {stage.completedItems.join(' · ')}</p>
      : null}
      {stage.missingItems.length ?
        <p className="tod-dcs-lead">Missing: {stage.missingItems.join(' · ')}</p>
      : null}
      {stage.actionLabel ?
        <p className="tod-dcs-lead">Action: {stage.actionLabel}</p>
      : null}
    </>
  );
}
