/**
 * SITE 00 host shell adapter for Visual Reconstruction Engine.
 */

import { SITE00_CANONICAL_COMPONENTS } from '../constants.js';
import type { RepositoryAuditCatalog } from '../matching/RepositoryComponentMatcher.js';

export const SITE00_HOST_ADAPTER_ID = 'site00-host-v1' as const;

export function buildSite00HostRepositoryCatalog(): RepositoryAuditCatalog {
  return {
    components: [
      ...SITE00_CANONICAL_COMPONENTS.map((id) => ({
        id,
        path: `src/site00/components/**/${id}.tsx`,
        classification: 'EXISTING_CANONICAL_COMPONENT' as const,
      })),
      {
        id: 'InspectorDrawer',
        path: 'src/site00/components/founderWorkspace/InspectorDrawer.tsx',
        classification: 'EXISTING_REUSABLE_COMPONENT' as const,
      },
    ],
    assets: [
      {
        id: 'site00-logo',
        path: 'public/site00-mark.svg',
        classification: 'LIKELY_EXISTING_ASSET' as const,
      },
    ],
  };
}

export const SITE00_SHELL_REGIONS = [
  'GLOBAL_SHELL',
  'OWNER_CONTROL',
  'BOTTOM_NAV',
] as const;

export function isSite00ShellRegion(role: string): boolean {
  return (SITE00_SHELL_REGIONS as readonly string[]).includes(role);
}

/** Host typography — repository fonts take precedence. */
export const SITE00_HOST_TYPOGRAPHY = {
  mono: 'var(--site00-font-mono, ui-monospace, monospace)',
  sans: 'var(--site00-font-sans, system-ui, sans-serif)',
  hostAccent: '#c41e3a',
} as const;
