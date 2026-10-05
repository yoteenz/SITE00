import type { ProductionWorkspaceContextState, ProductionWorkspaceType } from './types.js';

const STORAGE_KEY = 'site00-production-workspace-context-v1';

export function readProductionWorkspaceContext(): ProductionWorkspaceContextState | null {
  if (typeof globalThis.localStorage === 'undefined') return null;
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProductionWorkspaceContextState;
  } catch {
    return null;
  }
}

export function writeProductionWorkspaceContext(partial: Partial<ProductionWorkspaceContextState>): ProductionWorkspaceContextState {
  const prev = readProductionWorkspaceContext();
  const next: ProductionWorkspaceContextState = {
    projectSlug: partial.projectSlug ?? prev?.projectSlug ?? 'ndxbook',
    brandLabel: partial.brandLabel ?? prev?.brandLabel ?? null,
    projectType: partial.projectType ?? prev?.projectType ?? null,
    activeWorkspace: partial.activeWorkspace ?? prev?.activeWorkspace ?? 'DESIGN',
    campaignId: partial.campaignId ?? prev?.campaignId ?? null,
    entryId: partial.entryId ?? prev?.entryId ?? null,
    entryLabel: partial.entryLabel ?? prev?.entryLabel ?? null,
  };
  if (typeof globalThis.localStorage !== 'undefined') {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function mergeProductionContextOnWorkspaceSwitch(
  projectSlug: string,
  workspace: ProductionWorkspaceType,
): ProductionWorkspaceContextState {
  return writeProductionWorkspaceContext({ projectSlug, activeWorkspace: workspace });
}
