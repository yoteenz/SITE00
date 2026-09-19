/**
 * P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 — founder-facing overlay bodies.
 *
 * Rebuilt on `designOverlayKit`. The previous version of this file was a
 * collection of definition lists: correct data, presented the way a database
 * client presents it. Each panel here now leads with the artifact under
 * discussion, states status as a chip rather than a sentence, pairs metadata
 * on single lines, and pushes identifiers and hashes into ADVANCED.
 *
 * Nothing invented: where the page has no capture, no concept or no assets,
 * the panel says so in an explicit empty state rather than filling the space.
 */

import { useEffect, useMemo, useState } from 'react';

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
  type PagePipelineStageRow,
} from '../../../../../shared/site00-design-workspace-production/designPagePipelineController.js';
import {
  buildPageSystemReviewModel,
  PAGE_SYSTEM_REVIEW_TITLE,
} from '../../../../../shared/site00-design-workspace-production/designPageSystemReview.js';
import {
  loadPageAuthorityWorkflow,
  resolveActiveAuthorityImage,
} from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { loadPageCaptureHistory } from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import { buildFixtureGrokPageAssetPlan } from '../../../../../shared/site00-design-workspace-production/designGrokPageAssetPlan.js';
import { resolveOpusFrameworkRoutes } from '../../../../../shared/site00-design-workspace-production/designOpusFrameworkHandoff.js';
import {
  listApprovedGrokAssets,
  listStagedGrokAssets,
} from '../../../../../shared/site00-design-workspace-production/designGrokAssetModel.js';
import {
  twinOpusDirectCandidateArtifactView,
  twinOpusDirectCandidateById,
} from '../opusDirect/twinOpusDirectCandidateArtifacts';
import type { TwinOpusDirectProduction } from '../opusDirect/useTwinOpusDirectProduction';
import { resolveTwinOpusDirectAsset } from '../opusDirect/twinOpusDirectAssetManifest';
import { TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH } from '../opusDirect/twinOpusDirectContent';
import { DesignArtifactFullscreenViewer } from './DesignArtifactFullscreenViewer';
import {
  OverlayActions,
  OverlayAdvanced,
  OverlayBody,
  OverlayCallout,
  OverlayCompare,
  OverlayDial,
  OverlayEmpty,
  OverlayMeta,
  OverlayNote,
  OverlayPreview,
  OverlayRows,
  OverlaySection,
  OverlayStages,
  OverlayStatus,
  OverlayTabs,
  OverlayThumbs,
  OverlayTimeline,
  overlayTone,
  type OverlayStageState,
} from './designOverlayKit';

export { DesignGateBadge } from './DesignChildSurfaceFrame';

function stageState(row: PagePipelineStageRow): OverlayStageState {
  if (row.status === 'COMPLETE') return 'COMPLETE';
  if (row.status === 'ACTIVE') return 'ACTIVE';
  if (row.status === 'BLOCKED') return 'BLOCKED';
  if (row.status === 'NOT_REQUIRED' || row.status === 'OPTIONAL') return 'NOT_REQUIRED';
  return 'PENDING';
}

function pipelineModel(projectSlug: string, pageId: string, production: TwinOpusDirectProduction) {
  return buildPagePipelineControllerModel({
    projectId: projectSlug,
    pageId,
    production: production.state,
    twinRouteReachable: null,
  });
}

/* ---- 06 READINESS RECEIPT ------------------------------------------------ */

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
  const model = pipelineModel(projectSlug, pageId, production);
  const checks = model.receiptGates;
  const applicable = checks.filter((check) => check.result !== 'NOT_APPLICABLE');
  const passed = checks.filter((check) => check.result === 'PASS');
  const blocked = checks.filter((check) => check.result === 'BLOCKED' || check.result === 'FAIL');
  const warnings = checks.filter(
    (check) => !check.blocking && check.result !== 'PASS' && check.result !== 'NOT_APPLICABLE',
  );
  const na = checks.filter((check) => check.result === 'NOT_APPLICABLE');

  const [filter, setFilter] = useState<'ALL' | 'BLOCKED' | 'PASSED' | 'NA'>('ALL');
  const visible =
    filter === 'BLOCKED' ? blocked
    : filter === 'PASSED' ? passed
    : filter === 'NA' ? na
    : checks;

  return (
    <OverlayBody>
      <OverlaySection title="AUDIT" meta={`${passed.length} / ${applicable.length} GATES`}>
        <OverlayDial
          percent={applicable.length === 0 ? 0 : (passed.length / applicable.length) * 100}
          facts={[
            { label: 'PASSED', value: passed.length },
            { label: 'BLOCKED', value: blocked.length },
            { label: 'WARNINGS', value: warnings.length },
            { label: 'NOT APPLICABLE', value: na.length },
          ]}
        />
        <OverlayNote>
          This is the audit receipt for the page, not the workflow. PAGE PIPELINE is where you move the page forward.
        </OverlayNote>
      </OverlaySection>

      <OverlayTabs
        label="Gate filter"
        active={filter}
        onSelect={(id) => setFilter(id as typeof filter)}
        tabs={[
          { id: 'ALL', label: `ALL ${checks.length}` },
          { id: 'BLOCKED', label: `BLOCKED ${blocked.length}` },
          { id: 'PASSED', label: `PASSED ${passed.length}` },
          { id: 'NA', label: `N/A ${na.length}` },
        ]}
      />

      <OverlaySection title="GATES" flat>
        <OverlayRows
          emptyLabel="NO GATES IN THIS FILTER"
          rows={visible.map((gate) => ({
            id: gate.id,
            name: gate.label,
            sub: gate.reason ? `${gate.scope.replace(/_/g, ' ')} · ${gate.reason}` : gate.scope.replace(/_/g, ' '),
            side: <OverlayStatus label={gate.result} />,
          }))}
        />
      </OverlaySection>

      <OverlayAdvanced>
        <OverlayMeta
          entries={[
            { k: 'CONTRACT', v: state.contractFreeze.contractVersion },
            { k: 'AUTHORITY', v: state.designAuthorityVersion },
            { k: 'SESSION', v: String(state.sessionVersion) },
            { k: 'STAGE', v: model.currentStageLabel },
          ]}
        />
      </OverlayAdvanced>
    </OverlayBody>
  );
}

/* ---- 07 RESOLVE BLOCKER -------------------------------------------------- */

export function ResolveBlockerPanel({
  production,
  projectSlug,
  pageId,
}: {
  production: TwinOpusDirectProduction;
  projectSlug: string;
  pageId: string;
}) {
  const model = pipelineModel(projectSlug, pageId, production);
  const blocker = model.primaryBlocker;
  const stage = model.stages.find((row) => row.id === blocker?.stageId) ?? null;

  if (!blocker) {
    return (
      <OverlayBody>
        <OverlayEmpty
          label="NOTHING IS BLOCKED"
          hint={`The page is at ${model.currentStageLabel}. Use PAGE PIPELINE for the next step.`}
        />
        <OverlayActions
          primary={{ label: 'OPEN PAGE PIPELINE', onClick: production.actions.openViewPipeline, tone: 'dark' }}
        />
      </OverlayBody>
    );
  }

  return (
    <OverlayBody>
      <OverlayCallout title="WHAT IS BLOCKED" tone="blocked">
        {stage?.label ?? blocker.stageId.replace(/_/g, ' ').toUpperCase()}
      </OverlayCallout>
      <OverlayCallout title="WHY">{blocker.message}</OverlayCallout>

      {stage && stage.missingItems.length ?
        <OverlaySection title="WHAT IS NEEDED" flat>
          <OverlayRows
            rows={stage.missingItems.map((item, index) => ({
              id: `${stage.id}-${index}`,
              name: item,
              side: <OverlayStatus label="MISSING" />,
            }))}
          />
        </OverlaySection>
      : null}

      <OverlaySection title="STAGE CONTEXT" flat>
        <OverlayMeta
          entries={[
            { k: 'STAGE', v: stage?.label ?? '—' },
            { k: 'SEVERITY', v: <OverlayStatus label={blocker.isBlocking ? 'BLOCKING' : 'WARNING'} /> },
            { k: 'RESOLVE ON', v: blocker.resolutionSurface },
            { k: 'OTHER BLOCKERS', v: Math.max(0, model.blockers.length - 1) },
          ]}
        />
      </OverlaySection>

      <OverlayActions
        primary={{
          label: blocker.resolutionSurface ? `GO TO ${blocker.resolutionSurface.toUpperCase()}` : 'RESOLVE',
          onClick: () => production.actions.runPipelineHandler(blocker.resolutionHandler),
        }}
        secondary={[{ label: 'VIEW FULL PIPELINE', onClick: production.actions.openViewPipeline }]}
      />
    </OverlayBody>
  );
}

/* ---- 09 PAIR REVIEW ------------------------------------------------------ */

export function PairReviewPanel({ production }: { production: TwinOpusDirectProduction }) {
  const { state, projection, actions } = production;
  const mobile = state.promotedMobileConceptId ? twinOpusDirectCandidateArtifactView(state.promotedMobileConceptId) : null;
  const desktop =
    state.promotedDesktopConceptId ? twinOpusDirectCandidateArtifactView(state.promotedDesktopConceptId) : null;
  const [layout, setLayout] = useState<'SIDE' | 'STACK'>('SIDE');

  return (
    <OverlayBody>
      <OverlayTabs
        label="Comparison layout"
        active={layout}
        onSelect={(id) => setLayout(id as typeof layout)}
        tabs={[
          { id: 'SIDE', label: 'SIDE BY SIDE' },
          { id: 'STACK', label: 'STACKED' },
        ]}
      />

      <OverlayCompare stack={layout === 'STACK'}>
        <OverlayPreview
          src={mobile?.src}
          caption={`MOBILE · ${state.mobileVersion}`}
          side={<OverlayStatus label={state.promotedMobileConceptId ? 'PROMOTED' : 'MISSING'} />}
          onOpen={mobile?.src ? () => actions.openFullscreenArtifact(mobile) : undefined}
          emptyLabel="NO MOBILE PROMOTION YET"
          emptyHint="Promote a mobile concept before pair review can compare."
        />
        <OverlayPreview
          src={desktop?.src}
          caption={`DESKTOP · ${state.desktopVersion}`}
          side={<OverlayStatus label={state.promotedDesktopConceptId ? 'PROMOTED' : 'MISSING'} />}
          onOpen={desktop?.src ? () => actions.openFullscreenArtifact(desktop) : undefined}
          emptyLabel="NO DESKTOP PROMOTION YET"
          emptyHint="Promote a desktop concept before pair review can compare."
        />
      </OverlayCompare>

      <OverlaySection title="RESPONSIVE CONTRACT" flat>
        <OverlayMeta
          entries={[
            { k: 'TABLET', v: state.tabletMode === 'OVERRIDE' ? 'OVERRIDE' : 'DERIVED FROM PAIR' },
            {
              k: 'TABLET STATE',
              v: <OverlayStatus label={state.tabletDerivedOk || state.tabletOverrideApprovedAt ? 'PASS' : 'BLOCKED'} />,
            },
            { k: 'PAIR STATUS', v: projection.pairStatusLabel },
            { k: 'WORKFLOW STAGE', v: state.workflowStage.replace(/_/g, ' ') },
          ]}
        />
      </OverlaySection>

      {projection.buildEligible ?
        <OverlayCallout title="READINESS" tone="next">
          Build transition is eligible once you confirm.
        </OverlayCallout>
      : <OverlayCallout title="READINESS" tone="blocked">
          Resolve blocked gates before MOVE TO BUILD.
        </OverlayCallout>
      }

      <OverlayActions
        primary={{ label: 'REVIEW AUTHORITY', onClick: actions.openReviewAuthority }}
        secondary={[{ label: 'LOCK AUTHORITY PAIR', onClick: actions.runLockAuthorityPair }]}
      />
    </OverlayBody>
  );
}

/* ---- SOURCE / PROVENANCE ------------------------------------------------- */

export function ProvenancePanel({
  production,
  projectSlug,
}: {
  production: TwinOpusDirectProduction;
  projectSlug: string;
}) {
  const { state } = production;
  const pageTarget = resolveDesignPageTargetForShell(projectSlug);
  const pageRecord = getDesignBoundPage(projectSlug, pageTarget.pageId);
  const provenance =
    pageRecord ?
      buildDesignPageProvenancePresentation(projectSlug, pageTarget.pageId, pageRecord.pageName, pageRecord.pageRole)
    : null;

  return (
    <OverlayBody>
      <OverlayPreview
        src={TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH}
        caption={`PAGE DESIGN REFERENCE · ${pageTarget.pageLabel}`}
        side={<OverlayStatus label="APPROVED" />}
      />
      <OverlaySection title="LINEAGE" flat>
        <OverlayMeta
          entries={[
            { k: 'PAGE', v: provenance?.activePageLabel ?? pageTarget.pageLabel },
            { k: 'INFORMED BY', v: provenance?.informedBy.join(' · ') ?? '—' },
            { k: 'GOLDEN', v: `${state.mobileVersion} · ${state.desktopVersion}` },
            { k: 'AUTHORITY', v: state.designAuthorityVersion },
            { k: 'PROJECT', v: `${projectSlug.toUpperCase()} · CULTURAL_INTELLIGENCE_EDITORIAL` },
          ]}
        />
      </OverlaySection>
    </OverlayBody>
  );
}

/* ---- PROJECT CREATIVE CONTEXT -------------------------------------------- */

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
    return (
      <OverlayBody>
        <OverlayEmpty label="NO PROJECT INTELLIGENCE" hint="This project slug has no creative context bound yet." />
      </OverlayBody>
    );
  }

  return (
    <OverlayBody>
      <OverlaySection title="PROJECT" meta={intel.pageRegistryId}>
        <OverlayMeta
          entries={[
            { k: 'ACTIVE PROJECT', v: intel.displayName },
            { k: 'DEFINITION', v: intel.description },
            { k: 'BRAND EXPRESSION', v: intel.brandExpression },
            { k: 'PRIMARY CONTEXT', v: intel.primaryCreativeStream },
          ]}
        />
      </OverlaySection>

      <OverlaySection title="DESIGN COMPLETION" meta={`${intel.totalPages} PAGES`}>
        <OverlayRows
          rows={[
            { id: 'approved', name: 'APPROVED', side: <OverlayStatus label={`${intel.pagesApproved}`} tone="ok" /> },
            { id: 'review', name: 'IN REVIEW', side: <OverlayStatus label={`${intel.pagesInReview}`} tone="warn" /> },
            {
              id: 'needed',
              name: 'NEED DESIGN',
              side: <OverlayStatus label={`${intel.pagesNeedingDesign}`} tone="blocked" />,
            },
          ]}
        />
      </OverlaySection>

      {pageCtx ?
        <OverlaySection title="ACTIVE PAGE" flat>
          <OverlayMeta
            entries={[
              { k: 'PAGE', v: pageCtx.activePageId },
              { k: 'ROLE', v: pageCtx.pageRole },
              { k: 'ROUTE', v: pageCtx.route },
              { k: 'INHERITANCE', v: pageCtx.inheritance },
              { k: 'AUTHORITY', v: pageCtx.currentAuthority },
            ]}
          />
        </OverlaySection>
      : null}
    </OverlayBody>
  );
}

/* ---- 08 TECHNICAL: CONTRACT VERSIONS ------------------------------------- */

export function ContractVersionsPanel({ production }: { production: TwinOpusDirectProduction }) {
  const { state } = production;
  return (
    <OverlayBody>
      <OverlaySection title="CONTRACTS" meta={state.contractFreeze.COMPOSER_CONTRACT_STATUS.replace(/_/g, ' ')}>
        <OverlayMeta
          entries={[
            { k: 'INTERACTION CONTRACT', v: state.contractFreeze.contractVersion },
            { k: 'DESIGN AUTHORITY', v: state.designAuthorityVersion },
            { k: 'FROZEN AT', v: state.contractFreeze.frozenAt },
            { k: 'STATUS', v: <OverlayStatus label={state.contractFreeze.COMPOSER_CONTRACT_STATUS} /> },
          ]}
        />
      </OverlaySection>
      <OverlayAdvanced title="CONTRACT HASH">
        <p className="tod-ok-code">{state.contractFreeze.contractHash}</p>
      </OverlayAdvanced>
    </OverlayBody>
  );
}

/* ---- 12 CONCEPT INSPECTOR ------------------------------------------------ */

export function InspectCandidatePanel({
  production,
  candidateId,
}: {
  production: TwinOpusDirectProduction;
  candidateId: string;
}) {
  const { state, actions } = production;
  const candidate = twinOpusDirectCandidateById(candidateId);
  const artifact = twinOpusDirectCandidateArtifactView(candidateId);
  const selectedMobile = state.preferredMobileConceptId === candidateId;
  const selectedDesktop = state.preferredDesktopConceptId === candidateId;

  return (
    <OverlayBody>
      <OverlayPreview
        src={artifact.src}
        caption={`${candidate.version} · ${candidate.id}`}
        side={<OverlayStatus label={state.selectedCandidateId === candidateId ? 'SELECTED' : 'CANDIDATE'} />}
        onOpen={artifact.src ? () => actions.openFullscreenArtifact(artifact) : undefined}
        emptyLabel="NO CONCEPT ARTIFACT"
      />

      <OverlaySection title="CANDIDATE" flat>
        <OverlayMeta
          entries={[
            { k: 'VERSION', v: candidate.version },
            { k: 'MOBILE SELECTION', v: <OverlayStatus label={selectedMobile ? 'SELECTED' : 'NOT SELECTED'} /> },
            { k: 'DESKTOP SELECTION', v: <OverlayStatus label={selectedDesktop ? 'SELECTED' : 'NOT SELECTED'} /> },
            { k: 'AUTHORITY', v: `${state.mobileVersion} mobile · ${state.desktopVersion} desktop` },
          ]}
        />
      </OverlaySection>

      <OverlayActions
        primary={{
          label: 'SELECT FOR MOBILE',
          onClick: () => actions.selectViewportCandidate('MOBILE', candidate.id, candidate.version),
        }}
        secondary={[
          {
            label: 'SELECT FOR DESKTOP',
            onClick: () => actions.selectViewportCandidate('DESKTOP', candidate.id, candidate.version),
          },
          {
            label: 'FULLSCREEN',
            onClick: () => artifact.src && actions.openFullscreenArtifact(artifact),
            disabled: !artifact.src,
          },
        ]}
      />
    </OverlayBody>
  );
}

/* ---- 13 COMPARE CONCEPTS ------------------------------------------------- */

export function CompareConceptsPanel({
  production,
  leftId,
  rightId,
}: {
  production: TwinOpusDirectProduction;
  leftId: string;
  rightId: string;
}) {
  const { actions, state } = production;
  return (
    <OverlayBody>
      <OverlayCompare>
        {[leftId, rightId].map((id) => {
          const candidate = twinOpusDirectCandidateById(id);
          const artifact = twinOpusDirectCandidateArtifactView(id);
          return (
            <OverlayPreview
              key={id}
              src={artifact.src}
              caption={`${candidate.version} · ${candidate.id}`}
              side={<OverlayStatus label={state.selectedCandidateId === id ? 'SELECTED' : 'CANDIDATE'} />}
              onOpen={artifact.src ? () => actions.openFullscreenArtifact(artifact) : undefined}
              emptyLabel="NO ARTIFACT"
            />
          );
        })}
      </OverlayCompare>
      <OverlayNote>
        Compare is visual. Selection stays with SELECT FOR MOBILE / SELECT FOR DESKTOP so a comparison never silently
        changes the authority pair.
      </OverlayNote>
    </OverlayBody>
  );
}

/* ---- 10 TWIN REVIEW ------------------------------------------------------ */

export function ReviewTwinPagePanel({
  projectSlug,
  production,
}: {
  projectSlug: string;
  production: TwinOpusDirectProduction;
}) {
  const pageTarget = resolveDesignPageTargetForShell(projectSlug);
  const pageRecord = getDesignBoundPage(projectSlug, pageTarget.pageId);
  const pageCtx = compileDesignPageContext(projectSlug, pageTarget.pageId);
  const route = pageCtx?.route ?? pageRecord?.route ?? '/';
  const src = typeof window !== 'undefined' ? `${window.location.origin}${route}` : route;
  const [viewport, setViewport] = useState<'MOBILE' | 'TABLET' | 'DESKTOP'>('MOBILE');

  useEffect(() => {
    production.actions.markTwinPageReviewed();
  }, [production.actions]);

  const width = viewport === 'MOBILE' ? 390 : viewport === 'TABLET' ? 834 : 1280;

  return (
    <OverlayBody>
      <OverlayTabs
        label="Twin viewport"
        active={viewport}
        onSelect={(id) => setViewport(id as typeof viewport)}
        tabs={[
          { id: 'MOBILE', label: 'MOBILE' },
          { id: 'TABLET', label: 'TABLET' },
          { id: 'DESKTOP', label: 'DESKTOP' },
        ]}
      />

      <OverlaySection title="LIVE TWIN" meta={`${width}px`}>
        <div className="tod-ok-twinStage" data-viewport={viewport}>
          <iframe title="Twin page preview" className="tod-ok-twinFrame" src={src} style={{ width }} />
        </div>
      </OverlaySection>

      <OverlaySection title="TWIN" flat>
        <OverlayMeta
          entries={[
            { k: 'ROUTE', v: route },
            { k: 'STATUS', v: <OverlayStatus label={production.state.twinImplementationStatus ?? 'NONE'} /> },
            { k: 'PAGE', v: pageTarget.pageLabel },
          ]}
        />
      </OverlaySection>

      <OverlayActions
        primary={{ label: 'APPROVE TWIN', onClick: () => production.actions.runReviewAuthority('APPROVE') }}
        secondary={[
          { label: 'REQUEST CHANGES', onClick: () => production.actions.runReviewAuthority('REQUEST_CHANGES') },
          { label: 'OPEN IN NEW TAB', onClick: () => window.open(route, '_blank', 'noreferrer') },
        ]}
      />
    </OverlayBody>
  );
}

/* ---- 17 / 18 FRAMEWORK CONFIRMATION + COMPOSER HANDOFF ------------------- */

export function ComposerHandoffPanel(props: {
  projectSlug: string;
  production: TwinOpusDirectProduction;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return <CreatePageFrameworkPanel {...props} />;
}

export function CreatePageFrameworkPanel({
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
  const wf = loadPageAuthorityWorkflow(projectSlug, pageTarget.pageId);
  const routes = resolveOpusFrameworkRoutes(projectSlug, pageTarget.pageId);
  const mobileId = state.promotedMobileConceptId ?? wf.promoted.mobileConceptId ?? null;
  const desktopId = state.promotedDesktopConceptId ?? wf.promoted.desktopConceptId ?? null;
  const mobile = mobileId ? twinOpusDirectCandidateArtifactView(mobileId) : null;
  const desktop = desktopId ? twinOpusDirectCandidateArtifactView(desktopId) : null;
  const ready = Boolean(mobileId && desktopId);

  return (
    <OverlayBody>
      <OverlayNote>
        Locks the promoted pair and queues Opus page framework assembly. Nothing dispatches until you confirm.
      </OverlayNote>

      <OverlayCompare>
        <OverlayPreview
          src={mobile?.src}
          caption="MOBILE PROMOTED"
          side={<OverlayStatus label={mobileId ? 'PROMOTED' : 'MISSING'} />}
          emptyLabel="NO MOBILE PROMOTION"
        />
        <OverlayPreview
          src={desktop?.src}
          caption="DESKTOP PROMOTED"
          side={<OverlayStatus label={desktopId ? 'PROMOTED' : 'MISSING'} />}
          emptyLabel="NO DESKTOP PROMOTION"
        />
      </OverlayCompare>

      <OverlaySection title="HANDOFF PACKAGE" flat>
        <OverlayMeta
          entries={[
            { k: 'PROJECT', v: projectSlug.toUpperCase() },
            { k: 'PAGE', v: pageTarget.pageLabel },
            { k: 'TABLET', v: state.tabletMode === 'OVERRIDE' ? 'OVERRIDE' : 'DERIVED' },
            { k: 'INTERACTION CONTRACT', v: state.contractFreeze.contractVersion },
            { k: 'ASSET MANIFEST', v: 'twin-opus-direct-assets-v1' },
            { k: 'TARGET ROUTE', v: routes.targetTwinRoute },
          ]}
        />
      </OverlaySection>

      {ready ? null : (
        <OverlayCallout title="NOT READY" tone="blocked">
          Both viewports must be promoted before a framework can be created.
        </OverlayCallout>
      )}

      <OverlayActions
        primary={{ label: 'CREATE FRAMEWORK', onClick: onConfirm, disabled: !ready }}
        secondary={[{ label: 'CANCEL', onClick: onCancel }]}
      />
    </OverlayBody>
  );
}

/* ---- 03 GROK ASSET PRODUCTION PLAN --------------------------------------- */

export function GrokPageAssetProductionPanel({
  projectSlug,
  production,
  onConfirmPlan,
  onCancel,
}: {
  projectSlug: string;
  production: TwinOpusDirectProduction;
  onConfirmPlan: () => void;
  onCancel: () => void;
}) {
  const pageTarget = resolveDesignPageTargetForShell(projectSlug);
  const { state } = production;
  const plan = buildFixtureGrokPageAssetPlan(projectSlug, pageTarget.pageId);
  const routes = resolveOpusFrameworkRoutes(projectSlug, pageTarget.pageId);
  const capture = loadPageCaptureHistory(projectSlug, pageTarget.pageId, 'MOBILE');
  const target = state.promotedMobileConceptId ? twinOpusDirectCandidateArtifactView(state.promotedMobileConceptId) : null;

  return (
    <OverlayBody>
      <OverlayCompare>
        <OverlayPreview
          src={capture.latest?.artifactPath}
          caption="CURRENT CAPTURE"
          side={<OverlayStatus label={capture.latest ? 'ON FILE' : 'MISSING'} />}
          emptyLabel="NO CAPTURE YET"
          emptyHint="Capture the live page so Grok can see what exists."
        />
        <OverlayPreview
          src={target?.src}
          caption="APPROVED DESIGN TARGET"
          side={<OverlayStatus label={state.promotedMobileConceptId ? 'PROMOTED' : 'MISSING'} />}
          emptyLabel="NO PROMOTED DESIGN"
        />
      </OverlayCompare>

      <OverlaySection title="ASSET PLAN" meta={`${plan.slots.length} SLOTS`}>
        <OverlayNote>{plan.summary}</OverlayNote>
        <OverlayRows
          rows={plan.slots.map((slot) => ({
            id: slot.slotId,
            name: slot.label,
            sub: slot.purpose,
            side: <OverlayStatus label={slot.format} tone="idle" />,
          }))}
        />
      </OverlaySection>

      <OverlaySection title="TARGET" flat>
        <OverlayMeta
          entries={[
            { k: 'PAGE', v: pageTarget.pageLabel },
            { k: 'TWIN ROUTE', v: routes.targetTwinRoute },
            { k: 'ASSET MANIFEST', v: 'twin-opus-direct-assets-v1' },
          ]}
        />
      </OverlaySection>

      <OverlayCallout title="SPEND" tone="next">
        Grok returns a plan first. Approving the plan opens the asset desk; generation still needs its own confirmation.
      </OverlayCallout>

      <OverlayActions
        primary={{ label: 'APPROVE PLAN + OPEN GROK', onClick: onConfirmPlan }}
        secondary={[{ label: 'CANCEL', onClick: onCancel }]}
      />
    </OverlayBody>
  );
}

/* ---- REVIEW AUTHORITY DECISION ------------------------------------------- */

export function ReviewAuthorityPanel({ production }: { production: TwinOpusDirectProduction }) {
  const { actions, state } = production;
  const submit = (decision: AuthorityReviewDecision) => {
    if (!decision) return;
    actions.runReviewAuthority(decision);
  };

  return (
    <OverlayBody>
      <OverlaySection title="DECISION SCOPE" flat>
        <OverlayMeta
          entries={[
            { k: 'MOBILE', v: state.promotedMobileConceptId ?? '—' },
            { k: 'DESKTOP', v: state.promotedDesktopConceptId ?? '—' },
            { k: 'PAIR', v: <OverlayStatus label={production.projection.pairStatusLabel} /> },
          ]}
        />
      </OverlaySection>
      <OverlayNote>A decision here is the founder's formal record. It does not build or deploy anything.</OverlayNote>
      <OverlayActions
        primary={{ label: 'APPROVE AUTHORITY', onClick: () => submit('APPROVE') }}
        secondary={[
          { label: 'REQUEST CHANGES', onClick: () => submit('REQUEST_CHANGES') },
          { label: 'REJECT', onClick: () => submit('REJECT'), tone: 'danger' },
        ]}
      />
    </OverlayBody>
  );
}

/* ---- HISTORY-ONLY legacy reconstruction artifact -------------------------- */

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
    <OverlayBody>
      <OverlayCallout title="HISTORY ONLY">
        Superseded by {PAGE_SYSTEM_REVIEW_TITLE}. Kept so past reconstruction records stay readable; it is not part of
        the current workflow.
      </OverlayCallout>
      <OverlayPreview src={src} caption={`${column.label} · ${column.source}`} emptyLabel="NO ARCHIVED ARTIFACT" />
      {column.preview === 'functions' && column.functions ?
        <OverlaySection title="ARCHIVED FUNCTION MAP" flat>
          <OverlayRows rows={column.functions.map((fn) => ({ id: fn, name: fn }))} />
        </OverlaySection>
      : null}
    </OverlayBody>
  );
}

/* ---- 16 VIEW AMENDMENT ---------------------------------------------------- */

export function AmendmentDetailPanel({
  projectSlug,
  production,
}: {
  projectSlug: string;
  production: TwinOpusDirectProduction;
}) {
  const amendment = TWIN_OPUS_DIRECT_AMENDMENT;
  const field = (needle: string) => amendment.fields.find((entry) => entry.label.includes(needle))?.value ?? '—';
  const pageTarget = resolveDesignPageTargetForShell(projectSlug);
  const wf = loadPageAuthorityWorkflow(projectSlug, pageTarget.pageId);
  const mobileRef = resolveActiveAuthorityImage(wf.mobileAuthority);
  const history = wf.history.slice(-6).reverse();

  return (
    <OverlayBody>
      <OverlaySection title="AMENDMENT" meta={<OverlayStatus label={amendment.chip} />}>
        <OverlayPreview
          src={mobileRef}
          caption={amendment.title}
          side={<OverlayStatus label={field('TYPE')} tone="idle" />}
          emptyLabel="NO VISUAL REFERENCE"
          emptyHint="This amendment has no attached authority image."
        />
        <OverlayMeta
          entries={[
            { k: 'TYPE', v: field('TYPE') },
            { k: 'SCOPE', v: field('SCOPE') },
            { k: 'EFFECTIVE', v: field('EFFECTIVE') },
            { k: 'REFERENCE', v: amendment.title },
            { k: 'PAGE', v: pageTarget.pageLabel },
          ]}
        />
      </OverlaySection>

      <OverlaySection title="SUMMARY" flat>
        <OverlayNote>{field('SUMMARY') === '—' ? 'Authority selection recorded against the active page.' : field('SUMMARY')}</OverlayNote>
      </OverlaySection>

      <OverlaySection title="HISTORY" flat>
        <OverlayTimeline
          entries={history.map((entry, index) => ({
            id: `${entry.type}-${entry.at}-${index}`,
            when: entry.at.slice(0, 16).replace('T', ' '),
            what: entry.type.replace(/_/g, ' '),
            who: entry.summary,
            current: index === 0,
          }))}
        />
      </OverlaySection>

      <OverlayActions
        primary={{ label: 'OPEN RELATED PAGE ASSETS', onClick: () => production.actions.openPageAssetsPanel() }}
        secondary={[{ label: 'VIEW AUTHORITY', onClick: () => production.actions.openViewportAuthorityEditor('MOBILE') }]}
      />
    </OverlayBody>
  );
}

/* ---- 11 FULLSCREEN ARTIFACT ---------------------------------------------- */

export function FullscreenArtifactOverlay({ production }: { production: TwinOpusDirectProduction }) {
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

/* ---- SPEND CONFIRMATION --------------------------------------------------- */

export function SpendConfirmPanel({ production }: { production: TwinOpusDirectProduction }) {
  const { pendingSpend, actions } = production;
  if (!pendingSpend) return null;

  return (
    <OverlayBody>
      <OverlaySection title="THIS RUN" meta={`$${pendingSpend.estimatedUsd.toFixed(2)}`}>
        <OverlayMeta
          entries={[
            { k: 'ACTION', v: pendingSpend.action.replace(/_/g, ' ') },
            { k: 'PROVIDER', v: 'site00-design · design-concept' },
            { k: 'ESTIMATE', v: `$${pendingSpend.estimatedUsd.toFixed(2)} USD` },
            { k: 'PRODUCES', v: 'A new concept candidate in the gallery' },
          ]}
        />
      </OverlaySection>
      <OverlayNote>Nothing is charged until you confirm. Cancelling leaves the gallery untouched.</OverlayNote>
      <OverlayActions
        primary={{ label: 'CONFIRM SPEND', onClick: actions.confirmPendingSpend }}
        secondary={[{ label: 'CANCEL', onClick: actions.cancelPendingSpend }]}
      />
    </OverlayBody>
  );
}

/* ---- 14 BATCH / INHERITANCE EDIT ------------------------------------------ */

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
  const review = buildPageSystemReviewModel(projectSlug, batch.sourcePageId, 'MOBILE');
  const cards = [...review.children, ...review.grandchildren];
  const targets = batch.pageIds.map((id) => ({
    id,
    page: getDesignBoundPage(projectSlug, id),
    card: cards.find((entry) => entry.pageId === id) ?? null,
  }));
  const atRisk = targets.filter((entry) => entry.page?.designStatus === 'AMENDMENT_REQUIRED');

  return (
    <OverlayBody>
      <OverlaySection title="SOURCE" meta={batch.scope.replace(/_/g, ' ')}>
        <OverlayMeta
          entries={[
            { k: 'SOURCE PAGE', v: source?.pageName ?? batch.sourcePageId },
            { k: 'CHANGE TYPE', v: batch.scope.replace(/_/g, ' ') },
            { k: 'SELECTED', v: `${targets.length} PAGES` },
          ]}
        />
      </OverlaySection>

      <OverlaySection title="AFFECTED PAGES" meta={`${targets.length}`}>
        <OverlayThumbs
          items={targets.map((entry) => ({
            id: entry.id,
            src: entry.card?.thumbnailSrc,
            label: entry.page?.pageName ?? entry.id,
            sub: entry.card?.inheritanceStatus ?? entry.page?.designStatus ?? 'INHERITED',
            selected: true,
          }))}
          emptyLabel="NO PAGES SELECTED"
          emptyHint="Select similar pages in PAGE SYSTEM REVIEW first."
        />
      </OverlaySection>

      {atRisk.length ?
        <OverlayCallout title="OVERRIDES AT RISK" tone="blocked">
          {atRisk.map((entry) => entry.page?.pageName ?? entry.id).join(' · ')}
        </OverlayCallout>
      : <OverlayCallout title="OVERRIDES AT RISK">None flagged on the selected pages.</OverlayCallout>}

      <OverlayNote>Composer implements batch changes. Applying records intent; it does not mutate pages here.</OverlayNote>

      <OverlayActions
        primary={{ label: 'APPLY TO SELECTED', onClick: onApply, disabled: targets.length === 0 }}
        secondary={[{ label: 'CANCEL', onClick: onCancel }]}
      />
    </OverlayBody>
  );
}

/* ---- 04 PAGE ASSET INSPECT ------------------------------------------------ */

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
  const asset = assets.find((entry) => entry.assetId === assetId);
  if (!asset) {
    return (
      <OverlayBody>
        <OverlayEmpty label="ASSET NOT IN MANIFEST" hint="It may have been replaced or reverted since this panel opened." />
      </OverlayBody>
    );
  }

  return (
    <OverlayBody>
      <OverlayPreview
        src={asset.previewDataUrl}
        caption={asset.slot}
        side={<OverlayStatus label={asset.status} />}
        emptyLabel="NO PREVIEW"
      />
      <OverlaySection title="ASSET" flat>
        <OverlayMeta
          entries={[
            { k: 'SLOT', v: asset.slot },
            { k: 'ORIGIN', v: asset.origin },
            { k: 'STATUS', v: <OverlayStatus label={asset.status} /> },
            { k: 'CREATED', v: asset.createdAt.slice(0, 16).replace('T', ' ') },
            { k: 'LINEAGE', v: asset.runId ? `Run ${asset.runId}` : 'Founder upload' },
          ]}
        />
      </OverlaySection>
    </OverlayBody>
  );
}

/* ---- 15 INTERACTION INSPECTOR --------------------------------------------- */

/**
 * Contract destinations are handler identifiers (`openCreativeContext`). The
 * founder reads this panel to understand where a control leads, so the id is
 * spoken as words here and kept verbatim under ADVANCED.
 */
function humanizeDestination(destination: string): string {
  if (destination.startsWith('/')) return destination;
  return destination
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toUpperCase();
}

export function PageInteractionsInspectorPanel({ projectSlug, pageId }: { projectSlug: string; pageId: string }) {
  const model = buildPageSystemReviewModel(projectSlug, pageId, 'MOBILE');
  const categories = useMemo(() => {
    const seen = new Map<string, number>();
    for (const row of model.interactions) {
      seen.set(row.category, (seen.get(row.category) ?? 0) + 1);
    }
    return [...seen.entries()].map(([id, count]) => ({ id, label: `${id} ${count}` }));
  }, [model.interactions]);
  const [tab, setTab] = useState<string>('ALL');
  const rows = tab === 'ALL' ? model.interactions : model.interactions.filter((row) => row.category === tab);

  return (
    <OverlayBody>
      <OverlaySection title="COVERAGE" meta={`${model.interactionSummary.covered} / ${model.interactionSummary.total}`}>
        <OverlayDial
          percent={
            model.interactionSummary.total === 0 ?
              0
            : (model.interactionSummary.covered / model.interactionSummary.total) * 100
          }
          facts={[
            { label: 'ACTIVE', value: model.interactionSummary.active },
            { label: 'INHERITED', value: model.interactionSummary.inherited },
            { label: 'OVERRIDDEN', value: model.interactionSummary.overridden },
            { label: 'UNMAPPED', value: model.interactionSummary.unmapped },
          ]}
        />
      </OverlaySection>

      <OverlayTabs
        label="Interaction category"
        active={tab}
        onSelect={setTab}
        tabs={[{ id: 'ALL', label: `ALL ${model.interactions.length}` }, ...categories]}
      />

      <OverlaySection title={tab === 'ALL' ? 'ALL INTERACTIONS' : tab} flat>
        <OverlayRows
          emptyLabel="NO INTERACTIONS IN THIS CATEGORY"
          rows={rows.map((row) => ({
            id: row.id,
            name: row.label,
            sub: `${row.element} → ${row.action}${row.destination ? ` · ${humanizeDestination(row.destination)}` : ''}`,
            side: (
              <>
                <OverlayStatus label={row.inheritance} tone={row.inheritance === 'MISSING' ? 'blocked' : 'idle'} />
                <OverlayStatus label={row.status} />
              </>
            ),
          }))}
        />
      </OverlaySection>

      <OverlayAdvanced title="CONTRACT DETAIL">
        <OverlayRows
          rows={rows.map((row) => ({
            id: `${row.id}-adv`,
            name: row.id,
            sub: `${row.stateEffect} · ${row.permission}`,
          }))}
        />
      </OverlayAdvanced>
    </OverlayBody>
  );
}

/* ---- 05 PAGE PIPELINE ----------------------------------------------------- */

export function PagePipelineTimelinePanel({
  projectSlug,
  pageId,
  production,
}: {
  projectSlug: string;
  pageId: string;
  production: TwinOpusDirectProduction;
}) {
  const model = pipelineModel(projectSlug, pageId, production);

  return (
    <OverlayBody>
      <OverlaySection title="PAGE PROGRESS" meta={model.readyLabel}>
        <OverlayDial
          percent={model.readinessPercent}
          facts={[
            { label: 'STAGE', value: model.currentStageLabel },
            { label: 'GATES', value: `${model.passedGateCount} / ${model.applicableGateCount}` },
            { label: 'BLOCKERS', value: model.blockerCount },
          ]}
        />
      </OverlaySection>

      <OverlayStages
        stages={model.stages.map((row) => ({
          id: row.id,
          order: row.order,
          name: row.shortLabel || row.label,
          state: stageState(row),
          statusLabel: row.status,
          purpose: row.purpose,
          missing: [...row.missingItems],
          action:
            row.actionLabel && row.actionHandler ?
              {
                label: row.actionLabel,
                onClick: () => production.actions.runPipelineHandler(row.actionHandler!),
              }
            : undefined,
        }))}
      />

      <OverlayCallout title={model.nextAction.label} tone="next">
        {model.nextAction.lines.join(' · ')}
      </OverlayCallout>

      <OverlayActions
        primary={{
          label: model.nextAction.buttonLabel,
          onClick: () => production.actions.runPipelineHandler(model.nextAction.handler),
          disabled: Boolean(model.nextAction.disabledReason),
        }}
        secondary={[{ label: 'READINESS RECEIPT', onClick: production.actions.openViewReadiness }]}
      />
    </OverlayBody>
  );
}

/* ---- 08 TECHNICAL DETAILS -------------------------------------------------- */

function CopyableRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <li className="tod-ok-row">
      <div className="tod-ok-row__main">
        <span className="tod-ok-row__name">{label}</span>
        <span className="tod-ok-row__sub">{value}</span>
      </div>
      <div className="tod-ok-row__side">
        <button
          type="button"
          className="tod-ok-copy"
          onClick={() => {
            void navigator.clipboard?.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
    </li>
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
  const groups: Array<{ title: string; rows: Array<[string, string]> }> = [
    {
      title: 'IDENTITY',
      rows: [
        ['projectId', projectSlug],
        ['pageId', pageId],
        ['route', ctx?.route ?? '—'],
      ],
    },
    {
      title: 'STATE',
      rows: [
        ['workflowStage', production.state.workflowStage],
        ['twinImplementationStatus', production.state.twinImplementationStatus ?? wf.twinImplementationStatus],
        ['syncStatus', production.syncStatus],
      ],
    },
    {
      title: 'VERSIONS',
      rows: [
        ['sessionVersion', String(production.state.sessionVersion)],
        ['contractVersion', production.state.contractFreeze.contractVersion],
        ['designAuthorityVersion', production.state.designAuthorityVersion],
      ],
    },
    {
      title: 'HANDOFF',
      rows: [
        ['composerHandoffPackageId', wf.composerHandoffPackage?.packageId ?? '—'],
        ['pairLockedAt', wf.pairLockedAt ?? '—'],
        ['twinRouteVerifiedAt', wf.twinRouteVerifiedAt ?? '—'],
      ],
    },
  ];

  return (
    <OverlayBody>
      <OverlayNote>
        Diagnostics for support and handoff. Founder-facing state lives in PAGE PIPELINE and READINESS RECEIPT.
      </OverlayNote>
      {groups.map((group) => (
        <OverlaySection key={group.title} title={group.title} flat>
          <ul className="tod-ok-rows">
            {group.rows.map(([label, value]) => (
              <CopyableRow key={label} label={label} value={value} />
            ))}
          </ul>
        </OverlaySection>
      ))}
    </OverlayBody>
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
  const model = pipelineModel(projectSlug, pageId, production);
  const stage = model.stages.find((row) => row.id === stageId);
  if (!stage) {
    return (
      <OverlayBody>
        <OverlayEmpty label="STAGE NOT FOUND" />
      </OverlayBody>
    );
  }

  return (
    <OverlayBody>
      <OverlaySection
        title={`${stage.order.toString().padStart(2, '0')} ${stage.label}`}
        meta={<OverlayStatus label={stage.status} tone={overlayTone(stage.status)} />}
      >
        <OverlayNote>{stage.purpose}</OverlayNote>
      </OverlaySection>

      <OverlaySection title="DONE" flat>
        <OverlayRows
          emptyLabel="NOTHING COMPLETED YET"
          rows={stage.completedItems.map((item, index) => ({
            id: `done-${index}`,
            name: item,
            side: <OverlayStatus label="PASS" />,
          }))}
        />
      </OverlaySection>

      <OverlaySection title="OUTSTANDING" flat>
        <OverlayRows
          emptyLabel="NOTHING OUTSTANDING"
          rows={stage.missingItems.map((item, index) => ({
            id: `missing-${index}`,
            name: item,
            side: <OverlayStatus label="MISSING" />,
          }))}
        />
      </OverlaySection>

      {stage.actionLabel && stage.actionHandler ?
        <OverlayActions
          primary={{
            label: stage.actionLabel,
            onClick: () => production.actions.runPipelineHandler(stage.actionHandler!),
          }}
        />
      : null}
    </OverlayBody>
  );
}
