import type { TwinOpusDirectProduction } from './useTwinOpusDirectProduction';

type Props = {
  projectSlug: string;
  production: TwinOpusDirectProduction;
};

export function TwinOpusDirectOverlays({ projectSlug, production }: Props) {
  const { overlay, actions, state, projection, pendingSpend, productionError } = production;
  if (!overlay && !productionError) return null;

  const slug = projectSlug.toLowerCase();
  const close = () => actions.setOverlay(null);

  return (
    <>
      {productionError ? (
        <div className="tod-ov tod-ov--toast" role="status" data-testid="tod-production-error">
          {productionError}
          <button type="button" className="tod-ov__close" onClick={() => production.refresh()}>
            DISMISS
          </button>
        </div>
      ) : null}

      {overlay ? (
        <div className="tod-ov-backdrop" data-testid="tod-overlay-backdrop" onClick={close} aria-hidden="true" />
      ) : null}

      {overlay === 'OV-OVERFLOW-MENU' ? (
        <aside className="tod-ov tod-ov--sheet" data-overlay="OV-OVERFLOW-MENU" aria-label="Workspace overflow menu">
          <header className="tod-ov__head">
            <h2>WORKSPACE</h2>
            <button type="button" className="tod-ov__close" onClick={close}>
              CLOSE
            </button>
          </header>
          <div className="tod-ov__actions tod-ov__actions--stack">
            <button type="button" className="tod-ov__primary" onClick={actions.openReadinessReceipt}>
              READINESS RECEIPT
            </button>
            <button type="button" className="tod-ov__ghost" onClick={actions.openContractVersions}>
              CONTRACT VERSIONS
            </button>
          </div>
        </aside>
      ) : null}

      {overlay === 'OV-READINESS-RECEIPT' ? (
        <aside className="tod-ov tod-ov--sheet" data-overlay="OV-READINESS-RECEIPT" aria-label="Readiness receipt">
          <header className="tod-ov__head">
            <h2>READINESS RECEIPT</h2>
            <button type="button" className="tod-ov__close" onClick={close}>
              CLOSE
            </button>
          </header>
          <p className="tod-ov__meta">
            {projection.receipt.passedGates}/{projection.receipt.applicableGates} gates · contract{' '}
            {state.contractFreeze.contractVersion} · authority {state.designAuthorityVersion}
          </p>
          <ul className="tod-ov__list">
            {projection.receipt.checks.map((gate) => (
              <li key={gate.id} data-result={gate.result}>
                <strong>{gate.label}</strong>
                <span>{gate.result}</span>
                <small>{gate.reason}</small>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      {overlay === 'OV-CONTRACT-VERSIONS' ? (
        <aside className="tod-ov tod-ov--sheet" data-overlay="OV-CONTRACT-VERSIONS" aria-label="Contract versions">
          <header className="tod-ov__head">
            <h2>CONTRACT VERSIONS</h2>
            <button type="button" className="tod-ov__close" onClick={close}>
              CLOSE
            </button>
          </header>
          <dl className="tod-ov__dl">
            <div>
              <dt>Interaction contract</dt>
              <dd>{state.contractFreeze.contractVersion}</dd>
            </div>
            <div>
              <dt>Contract hash</dt>
              <dd className="tod-ov__mono">{state.contractFreeze.contractHash.slice(0, 16)}…</dd>
            </div>
            <div>
              <dt>Design authority</dt>
              <dd>{state.designAuthorityVersion}</dd>
            </div>
            <div>
              <dt>Frozen at</dt>
              <dd>{state.contractFreeze.frozenAt}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{state.contractFreeze.COMPOSER_CONTRACT_STATUS}</dd>
            </div>
          </dl>
        </aside>
      ) : null}

      {overlay === 'OV-CREATIVE-CONTEXT' ? (
        <aside className="tod-ov tod-ov--sheet" data-overlay="OV-CREATIVE-CONTEXT" aria-label="Project creative context">
          <header className="tod-ov__head">
            <h2>PROJECT CREATIVE CONTEXT</h2>
            <button type="button" className="tod-ov__close" onClick={close}>
              CLOSE
            </button>
          </header>
          <p className="tod-ov__lead">Read-only project intelligence for this design target.</p>
          <dl className="tod-ov__dl">
            <div>
              <dt>Project</dt>
              <dd>{slug.toUpperCase()}</dd>
            </div>
            <div>
              <dt>Creative stream</dt>
              <dd>CULTURAL_INTELLIGENCE_EDITORIAL</dd>
            </div>
            <div>
              <dt>Context package</dt>
              <dd>projectCreativeContextVersion · compiled (read-only)</dd>
            </div>
            <div>
              <dt>Stale gate</dt>
              <dd>DESIGN_AUTHORITY_CONTEXT_STALE surfaces here when blocking lock</dd>
            </div>
          </dl>
        </aside>
      ) : null}

      {overlay === 'OV-PROVENANCE' ? (
        <aside className="tod-ov tod-ov--sheet" data-overlay="OV-PROVENANCE" aria-label="Design provenance">
          <header className="tod-ov__head">
            <h2>SOURCE / PROVENANCE</h2>
            <button type="button" className="tod-ov__close" onClick={close}>
              CLOSE
            </button>
          </header>
          <p className="tod-ov__lead">Where this design target came from.</p>
          <dl className="tod-ov__dl">
            <div>
              <dt>Source record</dt>
              <dd>ENTRY001-CAMPAIGN-ARCHIVE</dd>
            </div>
            <div>
              <dt>Creative entry</dt>
              <dd>ENTRY 001 · ENTRY COVER · HOMEPAGE HERO</dd>
            </div>
            <div>
              <dt>Golden authority</dt>
              <dd>{state.mobileVersion} mobile · {state.desktopVersion} desktop</dd>
            </div>
            <div>
              <dt>Authority version</dt>
              <dd>{state.designAuthorityVersion}</dd>
            </div>
          </dl>
        </aside>
      ) : null}

      {overlay === 'OV-HOST-MODULE-NAV' ? (
        <aside className="tod-ov tod-ov--sheet" data-overlay="OV-HOST-MODULE-NAV" aria-label="Project module navigation">
          <header className="tod-ov__head">
            <h2>PROJECT MODULES</h2>
            <button type="button" className="tod-ov__close" onClick={close}>
              CLOSE
            </button>
          </header>
          <nav className="tod-ov__nav">
            <a href={`/projects/${slug}`}>PROJECT HUB</a>
            <a href={`/projects/${slug}/design`}>DESIGN (parent)</a>
            <a href={`/projects/${slug}/design`}>DESIGN · PRODUCTION WORKSPACE</a>
          </nav>
          <p className="tod-ov__note">Host-level navigation — not DESIGN section tabs.</p>
        </aside>
      ) : null}

      {overlay === 'OV-PAIR-REVIEW' ? (
        <aside className="tod-ov tod-ov--sheet" data-overlay="OV-PAIR-REVIEW" aria-label="Pair review">
          <header className="tod-ov__head">
            <h2>PAIR REVIEW</h2>
            <button type="button" className="tod-ov__close" onClick={close}>
              CLOSE
            </button>
          </header>
          <p className="tod-ov__lead">Inspection only — does not approve or lock.</p>
          <dl className="tod-ov__dl">
            <div>
              <dt>Mobile</dt>
              <dd>
                {state.mobileAuthority} · {state.mobileVersion}
              </dd>
            </div>
            <div>
              <dt>Desktop</dt>
              <dd>
                {state.desktopAuthority} · {state.desktopVersion}
              </dd>
            </div>
            <div>
              <dt>Tablet</dt>
              <dd>
                {state.tabletMode === 'OVERRIDE' ? 'TABLET_OVERRIDE' : 'DERIVED'} ·{' '}
                {state.tabletDerivedOk || state.tabletOverrideApprovedAt ? 'OK' : 'NEEDS ATTENTION'}
              </dd>
            </div>
          </dl>
        </aside>
      ) : null}

      {overlay === 'OV-SPEND-CONFIRM' && pendingSpend ? (
        <aside className="tod-ov tod-ov--sheet" data-overlay="OV-SPEND-CONFIRM" aria-label="Confirm generation spend">
          <header className="tod-ov__head">
            <h2>CONFIRM SPEND</h2>
            <button type="button" className="tod-ov__close" onClick={actions.cancelPendingSpend}>
              CANCEL
            </button>
          </header>
          <dl className="tod-ov__dl">
            <div>
              <dt>Action</dt>
              <dd>{pendingSpend.action}</dd>
            </div>
            <div>
              <dt>Estimated cost</dt>
              <dd>${pendingSpend.estimatedUsd.toFixed(2)} USD</dd>
            </div>
            <div>
              <dt>Provider</dt>
              <dd>site00-design · design-concept</dd>
            </div>
          </dl>
          <div className="tod-ov__actions">
            <button type="button" className="tod-ov__primary" onClick={actions.confirmPendingSpend}>
              CONFIRM
            </button>
            <button type="button" className="tod-ov__ghost" onClick={actions.cancelPendingSpend}>
              CANCEL
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
