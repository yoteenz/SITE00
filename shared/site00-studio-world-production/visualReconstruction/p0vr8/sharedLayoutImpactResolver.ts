/**
 * P0.VR.8 — SharedLayoutImpactResolver — global nav vs page-local invalidation.
 */

import type { ProjectPageRecord } from './types.js';

const GLOBAL_SHELL_MARKERS = [
  'MobileFounderWorkspaceChrome',
  'Site00Shell',
  'GlobalNav',
  'AppLayout',
  'site00-shell',
];

export function resolveSharedLayoutImpact(
  changedFiles: string[],
  pages: ProjectPageRecord[],
): string[] {
  const affectsGlobalShell = changedFiles.some((f) =>
    GLOBAL_SHELL_MARKERS.some((m) => f.includes(m)),
  );
  if (affectsGlobalShell) {
    return pages.filter((p) => p.isActive).map((p) => p.pageId);
  }

  const affected = new Set<string>();
  for (const page of pages) {
    if (!page.isActive) continue;
    const paths = page.sharedComponentPaths ?? [];
    if (paths.some((p) => changedFiles.some((f) => f.includes(p) || p.includes(f)))) {
      affected.add(page.pageId);
    }
  }

  for (const file of changedFiles) {
    const page = pages.find(
      (p) =>
        p.isActive &&
        (p.sourceFile === file ||
          file.includes(p.screenId) ||
          file.includes(p.pageName.replace(/\s+/g, ''))),
    );
    if (page) affected.add(page.pageId);
  }

  return [...affected];
}
