import { useEffect, useState } from 'react';
import { foundationReadinessApi, type FounderReadinessReport } from '../../services/foundationReadinessApi';
import { FoundationReadinessDesk } from '../../pages/foundation/FoundationReadinessPage';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { WORKSPACE_OVERLAY_IDS, OVERLAY_META } from '../overlay/overlayRegistry';

const MODULES = [
  { id: 'stack', label: 'Stack' },
  { id: 'persistence', label: 'Persistence' },
  { id: 'db', label: 'DB security' },
  { id: 'email', label: 'Email' },
  { id: 'stripe', label: 'Stripe' },
  { id: 'api', label: 'API health' },
  { id: 'e2e', label: 'E2E' },
] as const;

export function SystemPage() {
  const { openOverlay } = useFounderWorkspaceOverlay();
  const [report, setReport] = useState<FounderReadinessReport | null>(null);

  useEffect(() => {
    void foundationReadinessApi.readinessReport().then(setReport).catch(() => setReport(null));
  }, []);

  return (
    <FounderWorkspacePageFrame destination="system">
      <div className="ifw-system">
        <section className="ifw-panel">
          <h2 className="ifw-panel__title">Integration modules</h2>
          <div className="ifw-module-grid">
            {MODULES.map((m) => (
              <button
                key={m.id}
                type="button"
                className="ifw-module-card"
                onClick={() =>
                  openOverlay('OL-16', {
                    module: m.label,
                    detail: {
                      overall: report?.overall_status,
                      persistence: report?.staging_identities?.persistence_store,
                      stripe: report?.staging_identities?.stripe_key_mode,
                    },
                  })
                }
              >
                {m.label}
              </button>
            ))}
          </div>
          <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay('OL-17')}>
            Reset test data…
          </button>
        </section>
        <section className="ifw-panel">
          <h2 className="ifw-panel__title">Test lab · readiness</h2>
          <FoundationReadinessDesk embedded />
        </section>
        <details className="ifw-panel">
          <summary>Workspace overlays ({WORKSPACE_OVERLAY_IDS.length})</summary>
          <ul className="ifw-list">
            {WORKSPACE_OVERLAY_IDS.map((id) => (
              <li key={id}>
                <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay(id)}>
                  {id} · {OVERLAY_META[id].title}
                </button>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </FounderWorkspacePageFrame>
  );
}
