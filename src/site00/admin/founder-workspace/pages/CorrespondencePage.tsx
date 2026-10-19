import { Link } from 'react-router-dom';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { SITE00_ROUTES } from '../../../config/routes';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';

export function CorrespondencePage() {
  const { openOverlay } = useFounderWorkspaceOverlay();

  return (
    <FounderWorkspacePageFrame destination="correspondence">
      <div className="ifw-correspondence">
        <p className="ifw-lede">
          Transactional sending stays gated on staging — statuses must match stored evidence (DRY_RUN · QUEUED · SENT · FAILED).
        </p>
        <div className="ifw-actions-row">
          <Link className="ifw-btn ifw-btn--primary" to={SITE00_ROUTES.digitalFoundationCommunications}>
            Communications command (legacy route)
          </Link>
          <Link className="ifw-btn ifw-btn--ghost" to={SITE00_ADMIN_ROUTES.correspondenceStudio}>
            Correspondence studio
          </Link>
          <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay('OL-15')}>
            Send gate overlay
          </button>
        </div>
        <section className="ifw-panel">
          <h2 className="ifw-panel__title">Delivery policy</h2>
          <ul className="ifw-list">
            <li>Live Resend send requires founder approval tick (Test Lab).</li>
            <li>No fabricated inbox — use API message timelines per client.</li>
            <li>Studio templates remain in Correspondence Studio chrome.</li>
          </ul>
        </section>
      </div>
    </FounderWorkspacePageFrame>
  );
}
