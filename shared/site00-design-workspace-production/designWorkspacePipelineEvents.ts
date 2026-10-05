/**
 * P0.VR.DESIGN-WORKSPACE-PIPELINE-REACTIVITY-AND-STALE-STATE-ELIMINATION1
 * Canonical workspace pipeline event bus (browser + test).
 */

export const DESIGN_WORKSPACE_PIPELINE_EVENTS = {
  MOBILE_CONCEPT_SELECTED: 'site00:design-workspace:mobile-concept-selected',
  MOBILE_AUTHORITY_CONFIRMED: 'site00:design-workspace:mobile-authority-confirmed',
  EXPERIENCE_PACKAGE_UPDATED: 'site00:design-workspace:experience-package-updated',
  DESKTOP_AUTHORITY_CREATED: 'site00:design-workspace:desktop-authority-created',
  DESKTOP_EXPRESSION_UPDATED: 'site00:design-workspace:desktop-expression-updated',
  TABLET_AUTHORITY_CREATED: 'site00:design-workspace:tablet-authority-created',
  TABLET_EXPRESSION_UPDATED: 'site00:design-workspace:tablet-expression-updated',
  VIEWPORT_FAMILY_CONFIRMED: 'site00:design-workspace:viewport-family-confirmed',
  PAGE_FAMILY_UPDATED: 'site00:design-workspace:page-family-updated',
  INTERACTION_MAP_UPDATED: 'site00:design-workspace:interaction-map-updated',
  FUNCTIONAL_EXPANSION_DECIDED: 'site00:design-workspace:functional-expansion-decided',
  FRAMEWORK_CREATED: 'site00:design-workspace:framework-created',
  TWIN_LIVE: 'site00:design-workspace:twin-live',
  ASSET_GENERATION_UPDATED: 'site00:design-workspace:asset-generation-updated',
  PIPELINE_STATE_CHANGED: 'site00:design-workspace:pipeline-state-changed',
} as const;

export type DesignWorkspacePipelineEventName =
  (typeof DESIGN_WORKSPACE_PIPELINE_EVENTS)[keyof typeof DESIGN_WORKSPACE_PIPELINE_EVENTS];

export type DesignWorkspacePipelineEventDetail = {
  projectId: string;
  pageId: string;
  source?: string;
  at?: string;
};

export function dispatchDesignWorkspacePipelineEvent(
  type: DesignWorkspacePipelineEventName,
  detail: DesignWorkspacePipelineEventDetail,
): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(type, {
      detail: { ...detail, at: detail.at ?? new Date().toISOString() },
    }),
  );
  window.dispatchEvent(
    new CustomEvent(DESIGN_WORKSPACE_PIPELINE_EVENTS.PIPELINE_STATE_CHANGED, {
      detail: { ...detail, at: detail.at ?? new Date().toISOString(), trigger: type },
    }),
  );
}

/** Map legacy page-concept refresh events into pipeline bus subscribers. */
export function subscribeDesignWorkspacePipelineRefresh(
  handler: (detail: DesignWorkspacePipelineEventDetail & { trigger?: string }) => void,
): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onPipeline = (event: Event) => {
    const detail = (event as CustomEvent).detail as DesignWorkspacePipelineEventDetail & { trigger?: string };
    if (detail?.projectId && detail?.pageId) handler(detail);
  };
  const onLegacy = (event: Event) => {
    const detail = (event as CustomEvent).detail as { projectId?: string; pageId?: string };
    if (!detail?.projectId || !detail?.pageId) return;
    handler({ projectId: detail.projectId, pageId: detail.pageId, trigger: 'site00:page-concept-generation-updated' });
  };
  window.addEventListener(DESIGN_WORKSPACE_PIPELINE_EVENTS.PIPELINE_STATE_CHANGED, onPipeline);
  window.addEventListener('site00:page-concept-generation-updated', onLegacy);
  window.addEventListener('site00:page-concept-captures-hydrated', onLegacy);
  return () => {
    window.removeEventListener(DESIGN_WORKSPACE_PIPELINE_EVENTS.PIPELINE_STATE_CHANGED, onPipeline);
    window.removeEventListener('site00:page-concept-generation-updated', onLegacy);
    window.removeEventListener('site00:page-concept-captures-hydrated', onLegacy);
  };
}
