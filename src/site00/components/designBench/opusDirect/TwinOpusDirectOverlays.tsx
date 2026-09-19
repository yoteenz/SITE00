import { DESIGN_CHILD_SURFACE_PLACEMENT } from '../../../../../shared/site00-design-workspace-production/childSurfacePresentation.js';
import { DesignChildSurfaceFrame } from '../production/DesignChildSurfaceFrame';
import {
  AmendmentDetailPanel,
  CompareConceptsPanel,
  ContractVersionsPanel,
  CreativeContextPanel,
  FullscreenArtifactOverlay,
  InspectCandidatePanel,
  CreatePageFrameworkPanel,
  GrokPageAssetProductionPanel,
  PairReviewPanel,
  ProvenancePanel,
  ReadinessReceiptPanel,
  ReviewAuthorityPanel,
  ReviewTwinPagePanel,
  SpendConfirmPanel,
  StructuredArtifactPanel,
  PageAssetInspectPanel,
  PageBatchEditConfirmPanel,
  PageInteractionsInspectorPanel,
  PagePipelineTimelinePanel,
  PipelineStageDetailPanel,
  PipelineTechnicalDetailsPanel,
} from '../production/designProductionOverlayPanels';
import { DesignProjectModuleNavPanel } from '../production/DesignProjectModuleNavPanel';
import type { PagePipelineStageId } from '../../../../../shared/site00-design-workspace-production/designPagePipelineController.js';
import { readDesignPageTarget } from '../production/designProductionPageTarget';
import { DesignViewportAuthorityEditorOverlay } from './DesignViewportAuthorityEditorOverlay';
import { PageAssetsManagementPanel } from './PageAssetsManagementPanel';
import type { TwinOpusDirectProduction } from './useTwinOpusDirectProduction';

type Props = {
  projectSlug: string;
  production: TwinOpusDirectProduction;
};

function placementMode(overlayId: string) {
  return DESIGN_CHILD_SURFACE_PLACEMENT[overlayId]?.mode ?? 'DRAWER';
}

function ProductionErrorToast({
  message,
  onDismiss,
  onRetry,
}: {
  message: string;
  onDismiss: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="tod-dcs-toast tod-dcs-toast--compact" role="status" data-testid="tod-production-error">
      <span>{message}</span>
      <span className="tod-dcs-toast__actions">
        <button type="button" className="tod-dcs__ghost" onClick={onRetry}>
          RETRY
        </button>
        <button type="button" className="tod-dcs__ghost" onClick={onDismiss}>
          DISMISS
        </button>
      </span>
    </div>
  );
}

export function TwinOpusDirectOverlays({ projectSlug, production }: Props) {
  const { overlay, actions, pendingSpend, productionError } = production;
  const toast =
    productionError ?
      <ProductionErrorToast
        message={productionError}
        onDismiss={() => actions.dismissProductionError()}
        onRetry={() => production.refresh()}
      />
    : null;

  if (!overlay) {
    return toast;
  }

  const slug = projectSlug.toLowerCase();
  const close = () => {
    actions.clearUiPayload();
    actions.setOverlay(null);
  };

  return (
    <>
      {toast}
      <div className="tod-dcs-layer" data-testid="design-child-surface-layer">
        {overlay === 'OV-OVERFLOW-MENU' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-OVERFLOW-MENU')}
            title="WORKSPACE"
            overlayId="OV-OVERFLOW-MENU"
            onClose={close}
          >
            <div className="tod-dcs-stackActions">
              <button type="button" className="tod-dcs__primary" onClick={actions.openCreativeContext}>
                PROJECT CREATIVE CONTEXT
              </button>
              <button type="button" className="tod-dcs__primary" onClick={actions.openReadinessReceipt}>
                READINESS RECEIPT
              </button>
              <button type="button" className="tod-dcs__ghost" onClick={actions.openContractVersions}>
                CONTRACT VERSIONS
              </button>
            </div>
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-READINESS-RECEIPT' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-READINESS-RECEIPT')}
            title="READINESS RECEIPT"
            subtitle="Page workflow gate audit"
            overlayId="OV-READINESS-RECEIPT"
            onClose={close}
          >
            <ReadinessReceiptPanel
              production={production}
              projectSlug={slug}
              pageId={readDesignPageTarget(slug)?.pageId ?? `${slug}:overview`}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-PAGE-PIPELINE' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-PAGE-PIPELINE')}
            title="PAGE PIPELINE"
            overlayId="OV-PAGE-PIPELINE"
            onClose={close}
          >
            <PagePipelineTimelinePanel
              projectSlug={slug}
              pageId={readDesignPageTarget(slug)?.pageId ?? `${slug}:overview`}
              production={production}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-PIPELINE-TECHNICAL' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-PIPELINE-TECHNICAL')}
            title="TECHNICAL DETAILS"
            overlayId="OV-PIPELINE-TECHNICAL"
            onClose={close}
          >
            <PipelineTechnicalDetailsPanel
              projectSlug={slug}
              pageId={readDesignPageTarget(slug)?.pageId ?? `${slug}:overview`}
              production={production}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-PIPELINE-STAGE' && production.uiPayload.pipelineStageId ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-PIPELINE-STAGE')}
            title="PIPELINE STAGE"
            overlayId="OV-PIPELINE-STAGE"
            onClose={close}
          >
            <PipelineStageDetailPanel
              projectSlug={slug}
              pageId={readDesignPageTarget(slug)?.pageId ?? `${slug}:overview`}
              production={production}
              stageId={production.uiPayload.pipelineStageId as PagePipelineStageId}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-CONTRACT-VERSIONS' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-CONTRACT-VERSIONS')}
            title="CONTRACT VERSIONS"
            overlayId="OV-CONTRACT-VERSIONS"
            onClose={close}
          >
            <ContractVersionsPanel production={production} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-CREATIVE-CONTEXT' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-CREATIVE-CONTEXT')}
            title="PROJECT CREATIVE CONTEXT"
            subtitle="Read-only project intelligence for this design target."
            overlayId="OV-CREATIVE-CONTEXT"
            onClose={close}
          >
            <CreativeContextPanel projectSlug={slug} pageId={readDesignPageTarget(slug)?.pageId ?? null} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-PROVENANCE' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-PROVENANCE')}
            title="SOURCE / PROVENANCE"
            subtitle="Where this design target came from."
            overlayId="OV-PROVENANCE"
            onClose={close}
          >
            <ProvenancePanel production={production} projectSlug={slug} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-HOST-MODULE-NAV' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-HOST-MODULE-NAV')}
            title="PROJECTS MODULE NAV"
            subtitle="DESIGN is a module inside PROJECTS — switch module or active project."
            overlayId="OV-HOST-MODULE-NAV"
            onClose={close}
          >
            <DesignProjectModuleNavPanel activeProjectSlug={slug} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-PAIR-REVIEW' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-PAIR-REVIEW')}
            title="PAIR REVIEW"
            overlayId="OV-PAIR-REVIEW"
            onClose={close}
          >
            <PairReviewPanel production={production} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-SPEND-CONFIRM' && pendingSpend ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-SPEND-CONFIRM')}
            title="CONFIRM SPEND"
            overlayId="OV-SPEND-CONFIRM"
            onClose={actions.cancelPendingSpend}
          >
            <SpendConfirmPanel production={production} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-REVIEW-TWIN-PAGE' ?
          <DesignChildSurfaceFrame
            mode="MODAL"
            title="REVIEW TWIN PAGE"
            overlayId="OV-REVIEW-TWIN-PAGE"
            onClose={close}
          >
            <ReviewTwinPagePanel projectSlug={slug} production={production} />
          </DesignChildSurfaceFrame>
        : null}

        {/* The authority console carries its own console shell (header, tabs,
            close, sticky action row), so it is not wrapped in the generic child
            surface modal — that wrapper produced the plain white modal with a
            duplicated title this sprint replaced. */}
        {overlay === 'OV-VIEWPORT-AUTHORITY-EDITOR' && production.uiPayload.authorityEditorViewport ?
          <DesignViewportAuthorityEditorOverlay
            projectSlug={slug}
            production={production}
            viewport={production.uiPayload.authorityEditorViewport}
            onClose={close}
          />
        : null}

        {overlay === 'OV-COMPOSER-HANDOFF' || overlay === 'OV-CREATE-PAGE-FRAMEWORK' ?
          <DesignChildSurfaceFrame
            mode="MODAL"
            title="CREATE PAGE FRAMEWORK"
            overlayId={overlay === 'OV-COMPOSER-HANDOFF' ? 'OV-COMPOSER-HANDOFF' : 'OV-CREATE-PAGE-FRAMEWORK'}
            onClose={close}
          >
            <CreatePageFrameworkPanel
              projectSlug={slug}
              production={production}
              onConfirm={() => {
                actions.confirmCreatePageFramework();
              }}
              onCancel={close}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-GROK-PAGE-ASSET-PRODUCTION' ?
          <DesignChildSurfaceFrame
            mode="MODAL"
            title="GROK PAGE ASSET PRODUCTION"
            overlayId="OV-GROK-PAGE-ASSET-PRODUCTION"
            onClose={close}
          >
            <GrokPageAssetProductionPanel
              projectSlug={slug}
              production={production}
              onConfirmPlan={() => {
                actions.confirmGrokAssetPlanAndOpenDock();
              }}
              onCancel={close}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-REVIEW-AUTHORITY' ?
          <DesignChildSurfaceFrame
            mode="MODAL"
            title="REVIEW AUTHORITY"
            overlayId="OV-REVIEW-AUTHORITY"
            onClose={close}
          >
            <ReviewAuthorityPanel production={production} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-INSPECT-CANDIDATE' && production.uiPayload.inspectCandidateId ?
          <DesignChildSurfaceFrame
            mode="INSPECTOR"
            title="INSPECT CANDIDATE"
            overlayId="OV-INSPECT-CANDIDATE"
            onClose={close}
          >
            <InspectCandidatePanel
              production={production}
              candidateId={production.uiPayload.inspectCandidateId}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-COMPARE-CONCEPTS' && production.uiPayload.compareCandidateIds ?
          <DesignChildSurfaceFrame
            mode="WORKSPACE"
            title="COMPARE CONCEPTS"
            overlayId="OV-COMPARE-CONCEPTS"
            onClose={close}
          >
            <CompareConceptsPanel
              production={production}
              leftId={production.uiPayload.compareCandidateIds[0]}
              rightId={production.uiPayload.compareCandidateIds[1]}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-STRUCTURED-ARTIFACT' && production.uiPayload.structuredColumnId ?
          <DesignChildSurfaceFrame
            mode="DRAWER"
            title="LEGACY RECONSTRUCTION ARTIFACT"
            overlayId="OV-STRUCTURED-ARTIFACT"
            onClose={close}
          >
            <StructuredArtifactPanel columnId={production.uiPayload.structuredColumnId} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-PAGE-BATCH-EDIT' && production.uiPayload.pageBatchEdit ?
          <DesignChildSurfaceFrame
            mode="DRAWER"
            title="BATCH EDIT SELECTED"
            overlayId="OV-PAGE-BATCH-EDIT"
            onClose={close}
          >
            <PageBatchEditConfirmPanel
              projectSlug={slug}
              batch={production.uiPayload.pageBatchEdit}
              onCancel={close}
              onApply={close}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-PAGE-ASSET-INSPECT' && production.uiPayload.pageAssetId ?
          <DesignChildSurfaceFrame
            mode="DRAWER"
            title="PAGE ASSET"
            overlayId="OV-PAGE-ASSET-INSPECT"
            onClose={close}
          >
            <PageAssetInspectPanel
              projectSlug={slug}
              pageId={readDesignPageTarget(slug)?.pageId ?? `${slug}:overview`}
              assetId={production.uiPayload.pageAssetId}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-PAGE-ASSETS' ?
          <DesignChildSurfaceFrame
            mode="DRAWER"
            title="PAGE ASSETS"
            overlayId="OV-PAGE-ASSETS"
            onClose={close}
          >
            <PageAssetsManagementPanel
              projectSlug={slug}
              pageId={readDesignPageTarget(slug)?.pageId ?? `${slug}:overview`}
              viewport="MOBILE"
              initialSelectedAssetId={production.uiPayload.pageAssetsSelectedId}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-PAGE-INTERACTIONS' ?
          <DesignChildSurfaceFrame
            mode="DRAWER"
            title="INTERACTION INSPECTOR"
            overlayId="OV-PAGE-INTERACTIONS"
            onClose={close}
          >
            <PageInteractionsInspectorPanel
              projectSlug={slug}
              pageId={readDesignPageTarget(slug)?.pageId ?? `${slug}:overview`}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-AMENDMENT-DETAIL' ?
          <DesignChildSurfaceFrame
            mode="DRAWER"
            title="VIEW AMENDMENT"
            overlayId="OV-AMENDMENT-DETAIL"
            onClose={close}
          >
            <AmendmentDetailPanel />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-FULLSCREEN-ARTIFACT' && production.uiPayload.artifact ?
          <>
            <button type="button" className="tod-dcs-backdrop" aria-label="Close fullscreen" onClick={close} />
            <FullscreenArtifactOverlay production={production} />
          </>
        : null}
      </div>
    </>
  );
}
