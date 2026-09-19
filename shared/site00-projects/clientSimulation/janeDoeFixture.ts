/**
 * B5.9R10 — Jane Doe demo client fixture (seeded memberships, not UI special-case).
 */

import type { ClientProjectMembership, ClientSimulationContext } from './types.js';
import { PROJECT_INDEX_CANONICAL_ORDER } from '../projectIndexOrder.js';

export const JANE_DOE_CLIENT_ID = 'demo-client-jane-doe';

export const JANE_DOE_PROJECT_IDS = [...PROJECT_INDEX_CANONICAL_ORDER] as string[];

const JANE_DOE_CREATED_AT = '2026-01-01T00:00:00.000Z';

export function isJaneDoeFixtureEnabled(env?: { production?: boolean; demoClientFlag?: string | boolean }): boolean {
  const production =
    env?.production ??
    (typeof import.meta !== 'undefined' && Boolean((import.meta as { env?: { PROD?: boolean } }).env?.PROD));
  const flag =
    env?.demoClientFlag ??
    (typeof import.meta !== 'undefined'
      ? (import.meta as { env?: { VITE_SITE00_DEMO_CLIENT?: string } }).env?.VITE_SITE00_DEMO_CLIENT
      : undefined);
  if (!production) return true;
  return flag === '1' || flag === 'true';
}

export function buildJaneDoeMemberships(): ClientProjectMembership[] {
  return JANE_DOE_PROJECT_IDS.map((projectId) => ({
    clientId: JANE_DOE_CLIENT_ID,
    projectId,
    role: 'CLIENT_MEMBER' as const,
    permissions: ['VIEW_PROJECT', 'VIEW_CLIENT_MODULES'],
    status: 'ACTIVE' as const,
    createdAt: JANE_DOE_CREATED_AT,
  }));
}

export function buildJaneDoeSimulationContext(): ClientSimulationContext {
  const projectIds = [...JANE_DOE_PROJECT_IDS];
  return {
    clientId: JANE_DOE_CLIENT_ID,
    userId: 'demo-user-jane-doe',
    accountId: JANE_DOE_CLIENT_ID,
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
    displayName: 'Jane Doe',
    companyName: null,
    projectIds,
    projectCount: projectIds.length,
    activeProjectCount: projectIds.length,
    lastActiveAt: JANE_DOE_CREATED_AT,
    isDemoFixture: true,
    source: 'DEMO_FIXTURE',
    status: 'ACTIVE',
  };
}

export function projectLabelForSlug(slug: string): string {
  const labels: Record<string, string> = {
    'frontal-slayer': 'FRONTAL SLAYER',
    'studio-world': 'STUDIO WORLD',
    ndxbook: 'NDXBOOK',
    'all-in-one-enterprises': 'ALL IN ONE ENTERPRISES',
    'astral-world': 'ASTRAL WORLD',
  };
  return labels[slug] ?? slug.toUpperCase();
}

export function janeDoeProjectLabels(): string[] {
  return JANE_DOE_PROJECT_IDS.map(projectLabelForSlug);
}
