import type { TwinOpusDirectProduction } from '../opusDirect/useTwinOpusDirectProduction';
import { resolveTwinOpusDirectAsset } from '../opusDirect/twinOpusDirectAssetManifest';
import { TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH } from '../opusDirect/twinOpusDirectContent';
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

export function CreativeContextPanel({ projectSlug }: { projectSlug: string }) {
  return (
    <dl className="tod-dcs-meta">
      <div>
        <dt>PROJECT</dt>
        <dd>{projectSlug.toUpperCase()}</dd>
      </div>
      <div>
        <dt>CREATIVE STREAM</dt>
        <dd>CULTURAL_INTELLIGENCE_EDITORIAL</dd>
      </div>
      <div>
        <dt>CONTEXT PACKAGE</dt>
        <dd>projectCreativeContextVersion · compiled (read-only)</dd>
      </div>
      <div>
        <dt>STALE GATE</dt>
        <dd>DESIGN_AUTHORITY_CONTEXT_STALE surfaces here when blocking lock</dd>
      </div>
    </dl>
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
