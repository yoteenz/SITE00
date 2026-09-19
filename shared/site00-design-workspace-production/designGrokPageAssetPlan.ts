/**
 * P0.VR.DESIGN-HERO-ASSEMBLY-ACTIONS1 — Grok asset plan (fixture) before generation spend.
 */

export type GrokPageAssetPlanSlot = {
  slotId: string;
  label: string;
  purpose: string;
  format: string;
};

export type GrokPageAssetPlan = {
  planId: string;
  projectId: string;
  pageId: string;
  createdAt: string;
  slots: readonly GrokPageAssetPlanSlot[];
  summary: string;
  founderApprovedAt: string | null;
};

const PLAN_KEY = 'site00:design-grok-page-asset-plan:v1';

function storage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis.localStorage !== 'undefined') return globalThis.localStorage;
  return null;
}

export function buildFixtureGrokPageAssetPlan(projectId: string, pageId: string): GrokPageAssetPlan {
  const now = new Date().toISOString();
  return {
    planId: `gap-${Date.now()}`,
    projectId,
    pageId,
    createdAt: now,
    founderApprovedAt: null,
    summary: 'Page-scoped Grok asset pack from promoted designs + current capture (fixture plan — no model invoke).',
    slots: [
      { slotId: 'hero', label: 'HERO PLATE', purpose: 'Primary page hero imagery', format: 'WEBP' },
      { slotId: 'texture', label: 'PAPER TEXTURE', purpose: 'Background texture continuity', format: 'WEBP' },
      { slotId: 'icon-set', label: 'ICON SYSTEM', purpose: 'Navigation + action icons', format: 'SVG' },
      { slotId: 'evidence', label: 'EVIDENCE TILES', purpose: 'Supporting editorial tiles', format: 'WEBP' },
    ],
  };
}

export function saveGrokPageAssetPlan(plan: GrokPageAssetPlan): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(`${PLAN_KEY}:${plan.projectId.toLowerCase()}::${plan.pageId}`, JSON.stringify(plan));
  } catch {
    /* quota */
  }
}

export function loadGrokPageAssetPlan(projectId: string, pageId: string): GrokPageAssetPlan | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(`${PLAN_KEY}:${projectId.toLowerCase()}::${pageId}`);
    return raw ? (JSON.parse(raw) as GrokPageAssetPlan) : null;
  } catch {
    return null;
  }
}

export function approveGrokPageAssetPlan(projectId: string, pageId: string): GrokPageAssetPlan | null {
  const plan = loadGrokPageAssetPlan(projectId, pageId) ?? buildFixtureGrokPageAssetPlan(projectId, pageId);
  const approved = { ...plan, founderApprovedAt: new Date().toISOString() };
  saveGrokPageAssetPlan(approved);
  return approved;
}
