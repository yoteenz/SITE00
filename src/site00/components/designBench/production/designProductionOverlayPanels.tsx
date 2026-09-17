import {
  buildDesignProjectIntelligence,
  compileDesignPageContext,
} from '../../../../../shared/site00-design-workspace-production/designProjectBinding/index.js';
import type { AuthorityReviewDecision } from '../../../../../shared/site00-design-workspace-production/types.js';
import {
  TWIN_OPUS_DIRECT_AMENDMENT,
  TWIN_OPUS_DIRECT_OUTPUT_COLUMNS,
} from '../opusDirect/twinOpusDirectContent';
import { twinOpusDirectCandidateArtifactView, twinOpusDirectCandidateById } from '../opusDirect/twinOpusDirectCandidateArtifacts';
import type { TwinOpusDirectProduction } from '../opusDirect/useTwinOpusDirectProduction';
import { resolveTwinOpusDirectAsset } from '../opusDirect/twinOpusDirectAssetManifest';
import { TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH } from '../opusDirect/twinOpusDirectContent';
import { DesignArtifactFullscreenViewer } from './DesignArtifactFullscreenViewer';
import { DesignGateBadge } from './DesignChildSurfaceFrame';

export function ReadinessReceiptPanel({ production }: { production: TwinOpusDirectProduction }) {
  const { state, projection } = production;
  const { receipt } = projection;
  const passed = receipt.checks.filter((c) => c.result === 'PASS').length;
  const blocked = receipt.checks.filter((c) => c.result === 'BLOCKED' || c.result === 'FAIL').length;
  const warnings = receipt.warnings.length;
  const na = receipt.checks.filter((c) => c.result === 'NOT_APPLICABLE').length;

  return (
    <>
      <div className="tod-dcs-summary">
        <div className="tod-dcs-summary__metric">
          <span className="tod-dcs-summary__label">GATES</span>
          <strong>
            {receipt.passedGates} / {receipt.applicableGates}
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
        {receipt.checks.map((gate) => (
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

export function PairReviewPanel({ production }: { production: TwinOpusDirectProduction }) {
  const { state, projection } = production;
  const mobileSrc = resolveTwinOpusDirectAsset('authorityMobile');
  const desktopSrc = resolveTwinOpusDirectAsset('authorityDesktop');

  return (
    <>
      <p className="tod-dcs-lead">Visual inspection only — does not approve or lock authority.</p>
      <div className="tod-dcs-compare">
        <article className="tod-dcs-compare__card">
          <header>MOBILE MASTER</header>
          {mobileSrc ?
            <img src={mobileSrc} alt="" className="tod-dcs-compare__img" />
          : null}
          <DesignGateBadge result={state.mobileAuthority} />
          <span className="tod-dcs-compare__ver">{state.mobileVersion}</span>
        </article>
        <article className="tod-dcs-compare__card">
          <header>DESKTOP MASTER</header>
          {desktopSrc ?
            <img src={desktopSrc} alt="" className="tod-dcs-compare__img" />
          : null}
          <DesignGateBadge result={state.desktopAuthority} />
          <span className="tod-dcs-compare__ver">{state.desktopVersion}</span>
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

  return (
    <>
      <figure className="tod-dcs-provenanceGolden">
        <img src={TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH} alt="Approved golden reference" />
        <figcaption>GOLDEN AUTHORITY · founder-r5f2-ndxbook</figcaption>
      </figure>
      <dl className="tod-dcs-meta">
        <div>
          <dt>SOURCE RECORD</dt>
          <dd>ENTRY001-CAMPAIGN-ARCHIVE</dd>
        </div>
        <div>
          <dt>CREATIVE ENTRY</dt>
          <dd>ENTRY 001 · ENTRY COVER · HOMEPAGE HERO</dd>
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
  const column = TWIN_OPUS_DIRECT_OUTPUT_COLUMNS.find((c) => c.id === columnId) ?? TWIN_OPUS_DIRECT_OUTPUT_COLUMNS[0];
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
