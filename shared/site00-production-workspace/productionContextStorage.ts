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
  // No default project (P0 project isolation): an unset project stays unset.
  const projectSlug = (partial.projectSlug ?? prev?.projectSlug ?? '').toLowerCase();
  // Brand, campaign and entry belong to the project they were chosen in — a project change never carries them over.
  const own = prev && prev.projectSlug === projectSlug ? prev : null;
  const next: ProductionWorkspaceContextState = {
    projectSlug,
    brandLabel: partial.brandLabel ?? own?.brandLabel ?? null,
    projectType: partial.projectType ?? own?.projectType ?? null,
    activeWorkspace: partial.activeWorkspace ?? prev?.activeWorkspace ?? 'DESIGN',
    campaignId: partial.campaignId ?? own?.campaignId ?? null,
    entryId: partial.entryId ?? own?.entryId ?? null,
    entryLabel: partial.entryLabel ?? own?.entryLabel ?? null,
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
