/**
 * P0.VR.DESIGN-GROK-GATING1 — Grok downstream asset generation gates.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const memStore: Record<string, string> = {};
beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    globalThis.localStorage = {
      getItem: (k: string) => memStore[k] ?? null,
      setItem: (k: string, v: string) => {
        memStore[k] = v;
      },
      removeItem: (k: string) => {
        delete memStore[k];
      },
      clear: () => {
        Object.keys(memStore).forEach((k) => delete memStore[k]);
      },
      key: () => null,
      length: 0,
    } as Storage;
  }
});

import {
  computeGrokAssetEligibility,
  modeAllowedForEligibility,
} from '../shared/site00-design-workspace-production/designGrokAssetEligibility.js';
import { createInitialPageAuthorityWorkflow } from '../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { createInitialDesignProductionState } from '../shared/site00-design-workspace-production/designProductionStore.js';

function baseInput(overrides: Partial<Parameters<typeof computeGrokAssetEligibility>[0]> = {}) {
  const production = createInitialDesignProductionState('ndxbook');
  const pageWorkflow = createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview');
  return {
    projectId: 'ndxbook',
    pageId: 'ndxbook:overview',
    viewport: 'MOBILE' as const,
    production,
    pageWorkflow,
    twinRouteReachable: false,
    twinRoute: '/projects/ndxbook',
    hasPageConceptCandidates: true,
    ...overrides,
  };
}

describe('P0.VR.DESIGN-GROK-GATING1', () => {
  it('blocks generation pre-twin after handoff', () => {
    const wf = createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview');
    wf.promoted.mobileConceptId = 'a';
    wf.promoted.desktopConceptId = 'c';
    wf.pairReviewOpenedAt = new Date().toISOString();
    wf.pairLockedAt = new Date().toISOString();
    wf.composerHandoffPackage = {
      packageId: 'p1',
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      mobilePromotedDesignId: 'a',
      desktopPromotedDesignId: 'c',
      mobileAuthorityReferenceId: 'm',
      desktopAuthorityReferenceId: 'd',
      tabletPolicy: 'DERIVED',
      interactionContractVersion: 'v1',
      assetManifestVersion: 'v1',
      pageContextVersion: 'v1',
      references: [],
      handoffTimestamp: new Date().toISOString(),
      founderApproval: true,
    };
    const production = {
      ...createInitialDesignProductionState('ndxbook'),
      promotedMobileConceptId: 'a',
      promotedDesktopConceptId: 'c',
      pairReviewOpenedAt: wf.pairReviewOpenedAt,
      pairLockedAt: wf.pairLockedAt,
      twinImplementationStatus: 'IMPLEMENTING' as const,
    };
    const result = computeGrokAssetEligibility(
      baseInput({
        production,
        pageWorkflow: wf,
        twinRouteReachable: false,
      }),
    );
    expect(result.canGenerateProductionAssets).toBe(false);
    expect(result.eligibility).toBe('BLOCKED_TWIN_NOT_CREATED');
    expect(result.shortReason).toMatch(/TWIN/i);
  });

  it('blocks page-specific modes when twin exists but no current capture', () => {
    const result = computeGrokAssetEligibility(
      baseInput({
        production: {
          ...createInitialDesignProductionState('ndxbook'),
          promotedMobileConceptId: 'a',
          promotedDesktopConceptId: 'c',
          pairReviewOpenedAt: 't',
          pairLockedAt: 't',
          twinImplementationStatus: 'READY_FOR_REVIEW',
          twinPageReviewedAt: 't',
            },
        pageWorkflow: {
          ...createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview'),
          promoted: { mobileConceptId: 'a', mobilePromotedAt: 't', desktopConceptId: 'c', desktopPromotedAt: 't' },
          pairReviewOpenedAt: 't',
          pairLockedAt: 't',
          composerHandoffPackage: {} as never,
          grokOptOut: false,
          twinRouteVerifiedAt: 't',
        },
        twinRouteReachable: true,
      }),
    );
    expect(result.eligibility).toBe('BLOCKED_NO_CURRENT_CAPTURE');
    expect(modeAllowedForEligibility('ICON_SYSTEM', result).allowed).toBe(false);
    expect(modeAllowedForEligibility('PAGE_ASSET_PACK', result).allowed).toBe(false);
  });

  it('allows production modes when full eligibility passes', () => {
    appendPageCapture({
      captureId: 'cap-1',
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      screenId: 'overview',
      viewport: 'MOBILE',
      route: '/projects/ndxbook',
      timestamp: new Date().toISOString(),
      buildVersion: null,
      artifactPath: 'https://example.com/cap.png',
      createdBy: 'test',
      source: 'LOCAL_FALLBACK',
    });
    const result = computeGrokAssetEligibility(
      baseInput({
        production: {
          ...createInitialDesignProductionState('ndxbook'),
          promotedMobileConceptId: 'a',
          promotedDesktopConceptId: 'c',
          pairReviewOpenedAt: 't',
          pairLockedAt: 't',
          twinImplementationStatus: 'READY_FOR_REVIEW',
          twinPageReviewedAt: 't',
            },
        pageWorkflow: {
          ...createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview'),
          promoted: { mobileConceptId: 'a', mobilePromotedAt: 't', desktopConceptId: 'c', desktopPromotedAt: 't' },
          pairReviewOpenedAt: 't',
          pairLockedAt: 't',
          composerHandoffPackage: {} as never,
          grokOptOut: false,
          twinRouteVerifiedAt: 't',
          twinReviewedAt: 't',
        },
        twinRouteReachable: true,
      }),
    );
    expect(result.eligibility).toBe('ELIGIBLE');
    expect(result.canGenerateProductionAssets).toBe(true);
    expect(modeAllowedForEligibility('PAGE_ASSET_PACK', result).allowed).toBe(true);
  });

  it('respects NO GROK ASSETS NEEDED without blocking page completion semantics', () => {
    const wf = createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview');
    wf.grokOptOut = true;
    const result = computeGrokAssetEligibility(baseInput({ pageWorkflow: wf }));
    expect(result.eligibility).toBe('BLOCKED_GROK_NOT_NEEDED');
    expect(result.assetProductionStatus).toBe('NOT_REQUIRED');
  });

  it('guards Grok dock source for readiness receipt UI', () => {
    const src = readFileSync(
      join(import.meta.dirname, '../src/site00/components/designBench/designAgent/DesignGrokDock.tsx'),
      'utf8',
    );
    expect(src).toContain('GROK ASSET PRODUCTION · NOT READY');
    expect(src).toContain('modeAllowedForEligibility');
    expect(src).toContain('NO GROK ASSETS NEEDED');
  });
});
