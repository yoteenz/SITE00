/**
 * Page Completion — interaction graph + child surfaces (Design → PAGES / Inspector).
 */

import type { PageExperienceImplementationJob } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';

type Props = {
  job: PageExperienceImplementationJob;
  compact?: boolean;
};

export function DesignPageCompletionPanel({ job, compact = false }: Props) {
  const inspector = job.completionPlan;
  const coverage = job.completionPlan.interactionContracts.length
    ? Math.round(
        (job.completionPlan.interactionContracts.filter((c) => c.status === 'IMPLEMENTED' || c.status === 'RESOLVED').length /
          job.completionPlan.interactionContracts.length) *
          100,
      )
    : 0;

  const interactionsResolved = job.completionPlan.interactionContracts.filter(
    (c) => c.status !== 'AMBIGUOUS' && c.intent !== 'UNRESOLVED',
  ).length;
  const interactionsTotal = job.completionPlan.interactionContracts.length;
  const childImplemented = job.childSurfacePlans.filter((c) => c.implementationStatus === 'IMPLEMENTED').length;
  const childTotal = job.childSurfacePlans.length;

  return (
    <section className="site00-dw-pci-panel" data-panel="page-completion" aria-label="Page completion">
      <header className="site00-dw-pci-panel__head">
        <h3>PAGE COMPLETION</h3>
        <span className={`site00-dw-pci-panel__status is-${job.implementationStatus.toLowerCase().replace(/_/g, '-')}`}>
          {job.implementationStatus.replace(/_/g, ' ')}
        </span>
      </header>

      <dl className="site00-dw-pci-panel__grid">
        <div>
          <dt>ROUTE</dt>
          <dd>{inspector.primaryRoute}</dd>
        </div>
        <div>
          <dt>INTERACTIONS</dt>
          <dd>
            {interactionsResolved} / {interactionsTotal}
          </dd>
        </div>
        <div>
          <dt>CHILD SURFACES</dt>
          <dd>
            {childImplemented} / {childTotal}
          </dd>
        </div>
        <div>
          <dt>ROUTES</dt>
          <dd>{inspector.requiredRoutes.length}</dd>
        </div>
        <div>
          <dt>COVERAGE</dt>
          <dd>{coverage}%</dd>
        </div>
        <div>
          <dt>GATE</dt>
          <dd>{job.completionGate.passed ? 'PASS' : 'BLOCKED'}</dd>
        </div>
      </dl>

      {!compact ? (
        <>
          <details className="site00-dw-pci-panel__details" open>
            <summary>INTERACTION GRAPH ({job.interactionGraph.nodes.length} nodes)</summary>
            <ul className="site00-dw-pci-panel__list">
              {job.completionPlan.interactionContracts.map((c) => (
                <li key={c.interactionId}>
                  <strong>{c.label}</strong> · {c.affordanceType} → {c.targetType} · {c.status}
                </li>
              ))}
            </ul>
          </details>

          {job.childSurfacePlans.length > 0 ? (
            <details className="site00-dw-pci-panel__details">
              <summary>CHILD SURFACES</summary>
              <ul className="site00-dw-pci-panel__list">
                {job.childSurfacePlans.map((c) => (
                  <li key={c.childSurfaceId}>
                    <strong>{c.label}</strong> · {c.route ?? '—'} · {c.implementationStatus}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          {job.assetJobs.length > 0 ? (
            <p className="site00-dw-pci-panel__assets">ASSET JOBS: {job.assetJobs.join(', ')}</p>
          ) : null}

          {job.completionGate.failureCodes.length > 0 ? (
            <ul className="site00-dw-pci-panel__failures">
              {job.completionGate.failureCodes.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
