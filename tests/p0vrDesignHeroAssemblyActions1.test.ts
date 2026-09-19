/**
 * P0.VR.DESIGN-HERO-ASSEMBLY-ACTIONS1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import {
  computeHeroAssemblyActions,
  type HeroAssemblyActionsInput,
} from '../shared/site00-design-workspace-production/designHeroAssemblyActions.js';
import {
  createInitialPageAuthorityWorkflow,
  savePageAuthorityWorkflow,
} from '../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { createOpusFrameworkHandoffPackage } from '../shared/site00-design-workspace-production/designOpusFrameworkHandoff.js';
import { createInitialDesignProductionState } from '../shared/site00-design-workspace-production/designProductionStore.js';

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

function baseInput(overrides: Partial<HeroAssemblyActionsInput> = {}): HeroAssemblyActionsInput {
  const production = createInitialDesignProductionState('ndxbook');
  const pageWorkflow = createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview');
  return {
    projectId: 'ndxbook',
    pageId: 'ndxbook:overview',
    viewport: 'MOBILE',
    production,
    pageWorkflow,
    twinRouteReachable: false,
    twinRoute: '/projects/ndxbook',
    hasPageConceptCandidates: true,
    grokGenerationInProgress: false,
    ...overrides,
  };
}

describe('P0.VR.DESIGN-HERO-ASSEMBLY-ACTIONS1 — gates', () => {
  it('CASE A: mobile promoted only — both downstream actions locked', () => {
    const pageWorkflow = createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview');
    pageWorkflow.promoted.mobileConceptId = 'm1';
    const production = {
      ...createInitialDesignProductionState('ndxbook'),
      promotedMobileConceptId: 'm1',
    };
    const model = computeHeroAssemblyActions(baseInput({ production, pageWorkflow }));
    expect(model.createFramework.disabled).toBe(true);
    expect(model.createFramework.disabledReason).toBe('PROMOTE DESKTOP CONCEPT FIRST');
    expect(model.generateAssets.disabled).toBe(true);
  });

  it('CASE B: both promoted — create framework ready, generate assets locked', () => {
    const pageWorkflow = createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview');
    pageWorkflow.promoted.mobileConceptId = 'm1';
    pageWorkflow.promoted.desktopConceptId = 'd1';
    const production = {
      ...createInitialDesignProductionState('ndxbook'),
      promotedMobileConceptId: 'm1',
      promotedDesktopConceptId: 'd1',
    };
    const model = computeHeroAssemblyActions(baseInput({ production, pageWorkflow }));
    expect(model.createFramework.disabled).toBe(false);
    expect(model.createFramework.state).toBe('READY');
    expect(model.generateAssets.disabled).toBe(true);
    expect(model.generateAssets.disabledReason).toBe('CREATE FRAMEWORK FIRST');
  });

  it('CASE C: framework dispatched but no capture — generate assets blocked', () => {
    let pageWorkflow = createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview');
    pageWorkflow.promoted.mobileConceptId = 'm1';
    pageWorkflow.promoted.desktopConceptId = 'd1';
    const { state, pkg } = createOpusFrameworkHandoffPackage(pageWorkflow, {
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      interactionContractVersion: 'ic-v1',
      assetManifestVersion: 'am-v1',
      pageContextVersion: 'pc-v1',
      projectContextVersion: 'proj-v1',
      tabletPolicy: 'DERIVED',
      currentImplementationRoute: '/projects/ndxbook',
      targetTwinRoute: '/projects/ndxbook',
    });
    pageWorkflow = state;
    savePageAuthorityWorkflow('ndxbook', 'ndxbook:overview', pageWorkflow);
    const production = {
      ...createInitialDesignProductionState('ndxbook'),
      promotedMobileConceptId: 'm1',
      promotedDesktopConceptId: 'd1',
      twinImplementationStatus: 'READY_FOR_REVIEW' as const,
      pairLockedAt: new Date().toISOString(),
    };
    pageWorkflow.twinRouteVerifiedAt = new Date().toISOString();
    pageWorkflow.twinReviewedAt = new Date().toISOString();
    const model = computeHeroAssemblyActions(
      baseInput({
        production,
        pageWorkflow,
        twinRouteReachable: true,
      }),
    );
    expect(pkg.workflowStage).toBe('FRAMEWORK_BUILDING');
    expect(model.createFramework.state).toBe('COMPLETE');
    expect(model.generateAssets.disabled).toBe(true);
    expect(model.generateAssets.disabledReason).toBe('CAPTURE CURRENT PAGE FIRST');
  });

  it('CASE D: twin reviewable + capture — generate assets ready', () => {
    appendPageCapture({
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      viewport: 'MOBILE',
      artifactPath: 'data:image/png;base64,aa',
      label: 'fixture',
    });
    let pageWorkflow = createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview');
    pageWorkflow.promoted.mobileConceptId = 'm1';
    pageWorkflow.promoted.desktopConceptId = 'd1';
    pageWorkflow.pairReviewOpenedAt = new Date().toISOString();
    pageWorkflow.pairLockedAt = new Date().toISOString();
    const handoff = createOpusFrameworkHandoffPackage(pageWorkflow, {
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      interactionContractVersion: 'ic-v1',
      assetManifestVersion: 'am-v1',
      pageContextVersion: 'pc-v1',
      projectContextVersion: 'proj-v1',
      tabletPolicy: 'DERIVED',
      currentImplementationRoute: '/projects/ndxbook',
      targetTwinRoute: '/projects/ndxbook',
    });
    pageWorkflow = handoff.state;
    pageWorkflow.twinRouteVerifiedAt = new Date().toISOString();
    pageWorkflow.twinReviewedAt = new Date().toISOString();
    const production = {
      ...createInitialDesignProductionState('ndxbook'),
      promotedMobileConceptId: 'm1',
      promotedDesktopConceptId: 'd1',
      pairReviewOpenedAt: pageWorkflow.pairReviewOpenedAt,
      pairLockedAt: pageWorkflow.pairLockedAt,
      twinImplementationStatus: 'READY_FOR_REVIEW' as const,
      twinPageReviewedAt: pageWorkflow.twinReviewedAt,
    };
    const model = computeHeroAssemblyActions(
      baseInput({
        production,
        pageWorkflow,
        twinRouteReachable: true,
      }),
    );
    expect(model.generateAssets.disabled).toBe(false);
    expect(model.generateAssets.state).toBe('READY');
  });
});

describe('P0.VR.DESIGN-HERO-ASSEMBLY-ACTIONS1 — UI mount', () => {
  it('hero compare panel exposes three assembly actions', () => {
    const src = readFileSync(
      join(import.meta.dirname, '../src/site00/components/designBench/opusDirect/DesignHeroComparePanel.tsx'),
      'utf8',
    );
    expect(src).toContain('assembly.capture.label');
    expect(src).toContain('assembly.createFramework.label');
    expect(src).toContain('assembly.generateAssets.label');
    expect(src).toContain('heroAssembly');
    expect(src).toContain('__actions');
  });

  it('pipeline controller routes create framework and generate assets handlers', () => {
    const src = readFileSync(
      join(import.meta.dirname, '../shared/site00-design-workspace-production/designPagePipelineController.ts'),
      'utf8',
    );
    expect(src).toContain('openCreateFramework');
    expect(src).toContain('openGenerateAssets');
  });
});
