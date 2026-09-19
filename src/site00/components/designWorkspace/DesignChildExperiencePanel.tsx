/**
 * P0.PCI.2 — Child Experience linkage matrix (Design → Child Experience).
 */

import { useMemo } from 'react';
import type {
  LinkageMatrixRow,
  NavigationLinkageAuditResult,
} from '../../../../shared/site00-studio-world-production/parentChildExperienceInheritance/navigationLinkage/index.js';
import { runIntegratedExperienceAudit } from '../../../../shared/site00-studio-world-production/parentChildExperienceInheritance/integratedExperienceAudit.js';
import { buildSite00DesignWorkspaceMoreRegistry } from '../../../../shared/site00-studio-world-production/parentChildExperienceInheritance/site00RouteFamilies.js';

type Props = {
  projectSlug: string;
  onOpenMoreCategory?: (category: string) => void;
};

function statusTone(status: LinkageMatrixRow['status']): string {
  if (status === 'WIRED' || status === 'PERMISSION_GATED') return 'is-ready';
  if (status === 'PLANNED' || status === 'PARTIAL') return 'is-attention';
  return 'is-broken';
}

function AuditSection({ audit }: { audit: NavigationLinkageAuditResult }) {
  return (
    <section className="site00-dw-child-xp__section">
      <header className="site00-dw-child-xp__section-head">
        <h3>{audit.parentFamily}</h3>
        <span className={`site00-dw-child-xp__badge${audit.passed ? ' is-ready' : ' is-attention'}`}>
          {audit.passed ? 'WIRING ✓' : 'NEEDS ATTENTION'}
        </span>
      </header>
      <div className="site00-dw-child-xp__score">
        LINKAGE SCORE {audit.qaScore.overall}/100 · ORPHANS {audit.orphanChildren.length} · DEAD{' '}
        {audit.deadParentActions.length}
      </div>
      <div className="site00-dw-child-xp__matrix-wrap">
        <table className="site00-dw-child-xp__matrix">
          <thead>
            <tr>
              <th>SOURCE</th>
              <th>CHILD</th>
              <th>MODE</th>
              <th>EXPERIENCE</th>
              <th>WIRING</th>
              <th>RETURN</th>
            </tr>
          </thead>
          <tbody>
            {audit.matrix.map((row) => (
              <tr key={`${row.sourceControl}-${row.child}`}>
                <td>{row.sourceControl}</td>
                <td className="site00-dw-child-xp__mono">{row.child.split('?').pop() ?? row.child}</td>
                <td>{row.navMode}</td>
                <td>{row.experienceStatus ?? '✓'}</td>
                <td className={`site00-dw-child-xp__wiring ${statusTone(row.status)}`}>
                  {row.wiringStatus ?? (row.wired ? '✓' : 'NEEDS ATTENTION')}
                </td>
                <td className="site00-dw-child-xp__mono">{row.returnPath.split('?').pop() ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DesignChildExperiencePanel({ projectSlug }: Props) {
  const integrated = useMemo(() => {
    const registry = buildSite00DesignWorkspaceMoreRegistry(projectSlug);
    return runIntegratedExperienceAudit({
      inheritance: { registry, dryRun: true },
      siteWideProjectSlug: projectSlug,
    });
  }, [projectSlug]);

  const audits = integrated.linkageAudits;
  const moreAudit = audits.find((a) => a.parentFamily === 'MORE');

  return (
    <section className="site00-dw-child-xp" data-design-tab="child-experience">
      <header className="site00-dw-child-xp__hero">
        <p className="site00-dw-child-xp__kicker">P0.PCI.2</p>
        <h2>CHILD EXPERIENCE</h2>
        <p className="site00-dw-child-xp__support">
          Experience inheritance + navigation wiring must both pass before a child is CURRENT.
        </p>
      </header>

      <div className="site00-dw-child-xp__summary">
        <div>
          <strong>BRANCH</strong>
          <span className={integrated.branchCurrent ? 'is-ready' : 'is-attention'}>
            {integrated.branchCurrent ? 'COHERENT' : 'PARTIAL'}
          </span>
        </div>
        <div>
          <strong>FAMILIES</strong>
          <span>{audits.length}</span>
        </div>
        <div>
          <strong>READINESS</strong>
          <span>
            {integrated.readiness.filter((r) => r.derivedStatus === 'CURRENT').length}/{integrated.readiness.length}{' '}
            CURRENT
          </span>
        </div>
      </div>

      {moreAudit ? <AuditSection audit={moreAudit} /> : null}
      {audits
        .filter((a) => a.parentFamily !== 'MORE')
        .map((audit) => (
          <AuditSection key={audit.auditId} audit={audit} />
        ))}
    </section>
  );
}
