/**
 * Data-driven project brand presence registry.
 * Canonical project primary colors — not inferred from routes or CSS.
 */

import type { ProjectBrandPresenceEntry } from '../../site00-studio-world-production/projectPresenceAccent/types.js';
import { NDX_WORKSPACE_TOKENS } from '../visualReconstruction/ndxVisualReconstructionAdapter.js';
import { SITE00_HOST_ACCENT } from '../../site00-studio-world-production/projectPresenceAccent/constants.js';

export const PROJECT_BRAND_PRESENCE_REGISTRY: Record<string, ProjectBrandPresenceEntry> = {
  ndxbook: {
    projectId: 'ndxbook',
    projectName: 'NDXBOOK',
    canonicalPrimary: NDX_WORKSPACE_TOKENS.lime,
    approvedPrimary: NDX_WORKSPACE_TOKENS.lime,
    brandPrimaryStatus: 'RESOLVED',
  },
  'frontal-slayer': {
    projectId: 'frontal-slayer',
    projectName: 'Frontal Slayer',
    canonicalPrimary: SITE00_HOST_ACCENT,
    approvedPrimary: SITE00_HOST_ACCENT,
    brandPrimaryStatus: 'RESOLVED',
  },
  'studio-world': {
    projectId: 'studio-world',
    projectName: 'Studio World',
    brandPrimaryStatus: 'UNRESOLVED',
  },
  'all-in-one-enterprises': {
    projectId: 'all-in-one-enterprises',
    projectName: 'All In One Enterprises',
    brandPrimaryStatus: 'UNRESOLVED',
  },
};

/** Test / future project slots — arbitrary colors supported data-driven. */
export const PROJECT_BRAND_PRESENCE_TEST_ENTRIES: Record<string, ProjectBrandPresenceEntry> = {
  'demo-blue-co': {
    projectId: 'demo-blue-co',
    projectName: 'Demo Blue Co',
    approvedPrimary: '#2563eb',
    brandPrimaryStatus: 'RESOLVED',
  },
  'demo-gold-co': {
    projectId: 'demo-gold-co',
    projectName: 'Demo Gold Co',
    approvedPrimary: '#c9a227',
    brandPrimaryStatus: 'RESOLVED',
  },
  'demo-purple-co': {
    projectId: 'demo-purple-co',
    projectName: 'Demo Purple Co',
    approvedPrimary: '#7c3aed',
    brandPrimaryStatus: 'RESOLVED',
  },
};

export function lookupProjectBrandPresence(
  projectId: string | null | undefined,
  registry: Record<string, ProjectBrandPresenceEntry> = PROJECT_BRAND_PRESENCE_REGISTRY,
): ProjectBrandPresenceEntry | null {
  if (!projectId) return null;
  return registry[projectId] ?? null;
}
