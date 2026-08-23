/**
 * Legacy persisted visual-development proofs must hydrate without crashing the UI.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hydrateSurfaceDesignProof,
  normalizeVisualDevelopmentRun,
  refreshProjectWorkspaceVisualDevelopmentRun,
  resetVisualDevelopmentRunMemory,
} from './visualDevelopmentService.js';
import { resetVisualDevelopmentStoreModeCache } from './visualDevelopmentStoreAdapter.js';

vi.mock('../../../site00BrandLore/loreService.js', () => ({
  getBrandLoreProfileForOrg: vi.fn().mockResolvedValue({
    brandWorld: { value: 'NDXBOOK' },
    brandPersonality: { version: 1 },
    contextClassification: 'PRIMARY_EXPRESSION_CONTEXT',
    founderCreativeAppetite: {
      rawAnswers: {},
      version: 1,
      domainTolerances: [{ domain: 'creative-risk', band: 'OPEN' }],
      hardCreativeBoundaries: { value: null },
    },
  }),
}));

describe('visual development legacy proof hydration', () => {
  beforeEach(() => {
    process.env.SITE00_VISUAL_DEVELOPMENT_USE_MEMORY = '1';
    resetVisualDevelopmentStoreModeCache();
    resetVisualDevelopmentRunMemory();
  });

  it('hydrates missing P1 fields on legacy site00 proof', async () => {
    const run = await refreshProjectWorkspaceVisualDevelopmentRun();
    const legacy = {
      ...run.proofs.site00ProjectsIndex,
      surfaceGenerationMode: undefined,
      referencePipelineStatus: undefined,
      surfaceVisualAuthorityPackage: undefined,
      interfaceAssetManifest: undefined,
      executionTraces: undefined,
      proofLineage: undefined,
    } as typeof run.proofs.site00ProjectsIndex;

    const hydrated = hydrateSurfaceDesignProof(legacy);
    expect(hydrated.surfaceGenerationMode).toBe('COMPOSED_INTERFACE');
    expect(hydrated.referencePipelineStatus).toBeTruthy();
    expect(hydrated.proofLineage).toEqual([]);
    expect(hydrated.executionTraces).toEqual([]);
  });

  it('normalizeVisualDevelopmentRun hydrates both proofs', async () => {
    const run = await refreshProjectWorkspaceVisualDevelopmentRun();
    run.proofs.site00ProjectsIndex = {
      ...run.proofs.site00ProjectsIndex,
      surfaceGenerationMode: undefined,
      referencePipelineStatus: undefined,
    } as typeof run.proofs.site00ProjectsIndex;

    const normalized = normalizeVisualDevelopmentRun(run);
    expect(normalized.proofs.site00ProjectsIndex.surfaceGenerationMode).toBe('COMPOSED_INTERFACE');
    expect(normalized.proofs.ndxbookProjectHome.surfaceGenerationMode).toBe('VISUAL_PROOF');
  });
});
