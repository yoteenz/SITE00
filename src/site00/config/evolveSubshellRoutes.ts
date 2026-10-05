/**
 * B5.9R4 — Evolve internal subshell route helpers.
 */

import type { EvolveSubshellTabId } from '../../../shared/site00-projects/evolve/evolveSubshellTypes.js';
import { EVOLVE_SUBSHELL_TAB_SEGMENTS } from '../../../shared/site00-projects/evolve/evolveSubshellTypes.js';

export function site00ProjectEvolveTabPath(projectSlug: string, tabId: EvolveSubshellTabId): string {
  const segment = EVOLVE_SUBSHELL_TAB_SEGMENTS[tabId];
  return `/projects/${projectSlug}/evolve/${segment}`;
}

export function resolveEvolveTabFromPath(pathname: string, projectSlug: string): EvolveSubshellTabId {
  const base = `/projects/${projectSlug}/evolve`;
  const normalized = pathname.replace(/\/+$/, '');
  if (normalized === base) return 'CAMPAIGNS';
  if (normalized.endsWith('/campaigns')) return 'CAMPAIGNS';
  if (normalized.endsWith('/content-ops')) return 'CONTENT_OPS';
  if (normalized.endsWith('/lab')) return 'LAB';
  if (normalized.endsWith('/more')) return 'MORE';
  return 'CAMPAIGNS';
}

export function isEvolveSubshellPath(pathname: string, projectSlug: string): boolean {
  const base = `/projects/${projectSlug}/evolve`;
  const normalized = pathname.replace(/\/+$/, '');
  return normalized === base || normalized.startsWith(`${base}/`);
}
