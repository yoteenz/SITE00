/**
 * P0.VR.MOF.R2 — Route Audit child page.
 */

import { useMemo } from 'react';
import {
  buildRouteRecoveryInspectorState,
  recoverAllManagedProjectRoutes,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r2/client.js';
import { MoreToolPageShell } from './MoreToolPageShell';
import { MoreSummaryGrid, MoreSummaryTile } from './MoreSummaryTile';
import { DesignRouteAuditDetailsContent } from './DesignRouteAuditDetailsContent';

type Props = {
  projectId: string;
  onBack: () => void;
};

export function DesignMoreRouteAuditPage({ projectId, onBack }: Props) {
  const inspector = useMemo(() => {
    recoverAllManagedProjectRoutes();
    return buildRouteRecoveryInspectorState(projectId);
  }, [projectId]);

  const currentRoutes = inspector.currentRoutes;
  const hasChanges = inspector.newRoutes > 0 || inspector.removed > 0 || inspector.updated > 0;
  const needsReview = inspector.capturesStale > 0;

  const statusLabel = needsReview ? 'NEEDS REVIEW' : hasChanges ? 'CHANGES DETECTED' : 'UP TO DATE';
  const visualState = needsReview ? 'attention' : hasChanges ? 'neutral' : 'ready';
  const support = hasChanges
    ? `${inspector.newRoutes} new · ${inspector.removed} missing · ${inspector.updated} updated`
    : 'No changes detected since the last audit.';

  return (
    <MoreToolPageShell
      title="ROUTE AUDIT"
      description="Reconcile routes with capture inventory."
      visualState={visualState}
      statusBadge={`${currentRoutes} NDXBOOK ROUTES FOUND`}
      headline={statusLabel}
      support={support}
      onBack={onBack}
      transitionKey="more-route-audit"
      primaryAction={{ label: hasChanges || needsReview ? 'REVIEW CHANGES' : 'RUN AUDIT', onClick: () => {} }}
      secondaryAction={{ label: 'VIEW MANIFEST', onClick: () => {}, variant: 'outline' }}
      detailsContent={<DesignRouteAuditDetailsContent projectId={projectId} />}
      detailsTitle="AUDIT DETAILS"
      summary={
        <MoreSummaryGrid>
          <MoreSummaryTile label="CURRENT" value={String(currentRoutes)} tone="ready" />
          <MoreSummaryTile label="NEW" value={String(inspector.newRoutes)} tone={inspector.newRoutes ? 'attention' : 'neutral'} />
          <MoreSummaryTile label="MISSING" value={String(inspector.removed)} tone={inspector.removed ? 'attention' : 'neutral'} />
          <MoreSummaryTile
            label="NEEDS REVIEW"
            value={String(inspector.capturesStale)}
            tone={inspector.capturesStale ? 'attention' : 'neutral'}
          />
        </MoreSummaryGrid>
      }
    />
  );
}
