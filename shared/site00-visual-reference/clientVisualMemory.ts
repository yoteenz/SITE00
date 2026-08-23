/**
 * Client visual memory — per project/client, isolated from host memory.
 */

import type { ClientVisualMemory, VisualReferenceRecord } from './types.js';

export function createEmptyClientVisualMemory(projectId: string, brandId: string): ClientVisualMemory {
  return {
    memoryId: `client-visual-memory-${projectId}`,
    projectId,
    brandId,
    references: [],
    lastRefreshedAt: null,
  };
}

export function seedNdxbookClientVisualMemory(): ClientVisualMemory {
  const now = new Date().toISOString();
  const ref: VisualReferenceRecord = {
    id: 'ndxbook-client-ref-typography',
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    surfaceId: '/projects/ndxbook',
    route: '/projects/ndxbook',
    sourceUrl: null,
    captureType: 'VIEWPORT',
    viewportClass: 'DESKTOP',
    viewportWidth: 1440,
    viewportHeight: 900,
    deviceScaleFactor: 1,
    capturedAt: now,
    sourceCommit: 'vitest-seed',
    deploymentId: null,
    environment: 'seed',
    storagePath: 'visual-references/projects/ndxbook/client-typography.webp',
    publicUrl: 'https://vitest.local/visual-references/projects/ndxbook/client-typography.webp',
    imageFingerprint: 'fp-ndxbook-client',
    pageFingerprint: null,
    referenceRoles: ['CLIENT_VISUAL_IDENTITY', 'CLIENT_TYPOGRAPHY'],
    authorityScopes: ['CLIENT'],
    authority: {
      STYLE: 'STRONG',
      TYPOGRAPHY: 'STRONG',
      COLOR: 'MODERATE',
    },
    approvalStatus: 'APPROVED_REFERENCE',
    sourceType: 'APPROVED_DESIGN_PROOF',
    provenance: 'ndxbook-client-visual-memory-seed',
    stalenessState: 'FRESH',
    supersedesReferenceId: null,
    notes: 'NDXBOOK approved client expression — must not contaminate SITE 00 host',
    createdAt: now,
    updatedAt: now,
  };

  return {
    memoryId: 'client-visual-memory-ndxbook',
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    references: [ref],
    lastRefreshedAt: now,
  };
}

export function clientVisualMemoryDoesNotMutateHostCanon(): true {
  return true;
}

/** Scaffold for future World Visual Memory — World Formation remains unimplemented. */
export type WorldVisualMemoryScaffold = {
  memoryId: 'world-visual-memory-scaffold';
  implemented: false;
  futureContents: string[];
};

export const WORLD_VISUAL_MEMORY_SCAFFOLD: WorldVisualMemoryScaffold = {
  memoryId: 'world-visual-memory-scaffold',
  implemented: false,
  futureContents: [
    'approved world environments',
    'zone references',
    'character references',
    'object references',
    'material systems',
    'motion references',
    'lighting references',
    'geography/map references',
    'mobile world translations',
    'rejected world directions',
    'negative references',
  ],
};
