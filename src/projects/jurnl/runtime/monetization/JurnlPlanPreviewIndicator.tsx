/** Visible founder-only indicator when public-plan preview simulation is active. */

import type { PlanPreviewState } from './presentationEntitlements';

export function JurnlPlanPreviewIndicator({ preview }: { preview: PlanPreviewState | null | undefined }) {
  if (!preview?.previewActive || !preview.simulatedPlanId) return null;
  return (
    <p className="jrn-plan-preview-banner" data-jrn-plan-preview={preview.simulatedPlanId} role="status">
      PREVIEW MODE · SHOWING {preview.simulatedPlanId.replace('JURNL_', '')} EXPERIENCE · YOUR ACCESS HAS NOT CHANGED
    </p>
  );
}
