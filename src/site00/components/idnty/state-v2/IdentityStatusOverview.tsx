import type { InventorySummary } from '../../../config/identity-state-v2';

type IdentityStatusOverviewProps = {
  mode: 'inventory' | 'foundation' | 'diagnostic' | 'verification';
  inventory?: InventorySummary;
  foundationPct?: number;
  foundationStatus?: string;
  diagnosticLines?: string[];
  verificationStatus?: string;
};

function RadarIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="site00-idnty-state-v2__overview-radar">
      <circle cx="24" cy="24" r="20" stroke="rgba(196,30,58,0.2)" strokeWidth="0.75" />
      <circle cx="24" cy="24" r="12" stroke="rgba(196,30,58,0.28)" strokeWidth="0.75" />
      <line x1="24" y1="6" x2="24" y2="42" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" />
      <line x1="6" y1="24" x2="42" y2="24" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" />
      <circle cx="24" cy="24" r="4" fill="var(--site-red)" />
    </svg>
  );
}

export function IdentityStatusOverview({
  mode,
  inventory,
  foundationPct = 0,
  foundationStatus = 'FOUNDATION NOT YET DEFINED',
  diagnosticLines = [],
  verificationStatus = 'UNVERIFIED',
}: IdentityStatusOverviewProps) {
  if (mode === 'inventory' && inventory) {
    return (
      <section className="site00-idnty-state-v2__overview" aria-label="IDENTITY OVERVIEW">
        <p className="site00-idnty-state-v2__overview-label">IDENTITY OVERVIEW</p>
        <div className="site00-idnty-state-v2__overview-grid">
          <RadarIcon />
          <div className="site00-idnty-state-v2__overview-stat">
            <p className="site00-idnty-state-v2__overview-pct">{inventory.completenessPct}%</p>
            <p className="site00-idnty-state-v2__overview-stat-label">INVENTORY COMPLETENESS</p>
            <p className="site00-idnty-state-v2__overview-stat-hint">
              {inventory.found} SELECTED OF {inventory.total}
            </p>
          </div>
          <div className="site00-idnty-state-v2__overview-col">
            <p className="site00-idnty-state-v2__overview-col-label">WHAT EXISTS</p>
            <p className="site00-idnty-state-v2__overview-col-value">{inventory.found} FOUND</p>
            {inventory.foundLabels.length > 0 ? (
              <ul className="site00-idnty-state-v2__overview-list">
                {inventory.foundLabels.slice(0, 4).map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            ) : (
              <p className="site00-idnty-state-v2__overview-empty">NO ITEMS MARKED YET</p>
            )}
          </div>
          <div className="site00-idnty-state-v2__overview-col">
            <p className="site00-idnty-state-v2__overview-col-label">WHAT&apos;S MISSING</p>
            <p className="site00-idnty-state-v2__overview-col-value">{inventory.gaps} GAPS</p>
            {inventory.gapLabels.length > 0 ? (
              <ul className="site00-idnty-state-v2__overview-list">
                {inventory.gapLabels.slice(0, 4).map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            ) : (
              <p className="site00-idnty-state-v2__overview-empty">ALL CATEGORIES MARKED</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (mode === 'foundation') {
    return (
      <section className="site00-idnty-state-v2__overview" aria-label="FOUNDATION STATUS">
        <p className="site00-idnty-state-v2__overview-label">FOUNDATION STATUS</p>
        <div className="site00-idnty-state-v2__overview-grid site00-idnty-state-v2__overview-grid--foundation">
          <RadarIcon />
          <div className="site00-idnty-state-v2__overview-stat">
            <p className="site00-idnty-state-v2__overview-pct">{foundationPct}%</p>
            <p className="site00-idnty-state-v2__overview-stat-label">{foundationStatus}</p>
            <p className="site00-idnty-state-v2__overview-stat-hint">SYSTEM STATUS: ORIGIN</p>
          </div>
        </div>
      </section>
    );
  }

  if (mode === 'diagnostic') {
    return (
      <section className="site00-idnty-state-v2__overview" aria-label="IDENTITY DIAGNOSTIC">
        <p className="site00-idnty-state-v2__overview-label">IDENTITY DIAGNOSTIC</p>
        <ul className="site00-idnty-state-v2__overview-meta">
          {diagnosticLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="site00-idnty-state-v2__overview" aria-label="BUILD READINESS">
      <p className="site00-idnty-state-v2__overview-label">BUILD READINESS</p>
      <div className="site00-idnty-state-v2__overview-grid site00-idnty-state-v2__overview-grid--foundation">
        <RadarIcon />
        <div className="site00-idnty-state-v2__overview-stat">
          <p className="site00-idnty-state-v2__overview-pct">{verificationStatus}</p>
          <p className="site00-idnty-state-v2__overview-stat-hint">
            {inventory ? `${inventory.found} OF ${inventory.total} ASSETS MARKED FOUND` : 'SELECT ASSETS TO VERIFY'}
          </p>
        </div>
      </div>
    </section>
  );
}
