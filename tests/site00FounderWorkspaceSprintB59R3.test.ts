/**
 * B5.9R3 test suite — Evolve module regression recovery.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildProjectOperatingState } from '../shared/site00-brand-lore/founderWorkspace/projectOperatingState/buildProjectOperatingState.js';
import {
  getProjectEvolveAdapter,
  NdxbookEvolveAdapter,
  FrontalSlayerEvolveAdapter,
  AioEvolveAdapter,
  createGenericEvolveAdapter,
  ndxbookMustNotUseGenericEvolve,
} from '../shared/site00-projects/evolve/projectEvolveAdapterRegistry.js';
import {
  evolveModuleRegressionPasses,
  runEvolveModuleRegressionQA,
} from '../shared/site00-projects/evolve/evolveModuleRegressionQA.js';
import { buildGeneralizedProjectOperatingState } from '../shared/site00-projects/generalizedProjectOperatingState.js';
import { buildProjectCapabilityManifest } from '../shared/site00-projects/projectCapabilityManifest.js';
import { AstralWorldProjectAdapter } from '../shared/site00-projects/adapters/index.js';

const ROOT = join(import.meta.dirname, '..');

function ndxOperatingState() {
  return buildProjectOperatingState({
    projectId: 'ndxbook',
    projectStateVersion: 1,
    contentOpsRun: null,
    campaignProduction: null,
    entry001: {
      activeArchiveCount: 1,
      archivedRemovedCount: 0,
      packageDeliverableCount: 4,
      carouselSlideCount: 4,
      storyFrameCount: 2,
      packageIncomplete: true,
      needsFounderReview: false,
    },
    expressionEngine: { entry002Stage: 'STORYBOARD', entry003NeedsReview: true },
  });
}

describe('B5.9R3 Evolve Module Regression Recovery', () => {
  it('1–6. ProjectEvolveAdapter registry + specialized adapters exist', () => {
    expect(getProjectEvolveAdapter('ndxbook').evolveType).toBe('NDXBOOK');
    expect(getProjectEvolveAdapter('frontal-slayer').evolveType).toBe('FRONTAL_SLAYER');
    expect(getProjectEvolveAdapter('all-in-one-enterprises').evolveType).toBe('AIO');
    expect(createGenericEvolveAdapter('studio-world').evolveType).toBe('GENERIC');
    expect(NdxbookEvolveAdapter.usesSpecializedSurface).toBe(true);
    expect(FrontalSlayerEvolveAdapter.usesSpecializedSurface).toBe(true);
    expect(AioEvolveAdapter.usesSpecializedSurface).toBe(true);
  });

  it('7. NDXBOOK never resolves generic adapter', () => {
    expect(ndxbookMustNotUseGenericEvolve('ndxbook')).toBe(true);
    expect(getProjectEvolveAdapter('ndxbook').evolveType).not.toBe('GENERIC');
  });

  it('8–10. NDXBOOK ProjectOperatingState canonical — entries + chapter', () => {
    const state = ndxOperatingState();
    expect(state.entries.length).toBe(3);
    expect(state.chapterTitle).toBe('WHICH ONE IS IT?');
    expect(state.entries[0]?.title).toBe('WHO TF IS WE?');
    expect(state.entries[1]?.title).toBe('OH, NOW IT WAS FUN?');
    expect(state.entries[2]?.title).toBe('EMPLOYEES ONLY');
  });

  it('11–13. NDXBOOK campaigns, content ops, lab subnav restored', () => {
    const subnav = NdxbookEvolveAdapter.getSubnav('ndxbook').map((s) => s.id);
    expect(subnav).toContain('CAMPAIGNS');
    expect(subnav).toContain('CONTENT_OPS');
    expect(subnav).toContain('LAB');
  });

  it('14–17. Entry routes + expression engine paths intact', () => {
    const state = ndxOperatingState();
    expect(state.entries[0]?.href).toContain('/content-operations/campaign-board/entry/001');
    expect(state.entries[1]?.href).toContain('/content-operations/expression-engine');
    expect(state.entries[2]?.href).toContain('/content-operations/expression-engine');
    const routes = NdxbookEvolveAdapter.getEvolveRoutes('ndxbook').map((r) => r.id);
    expect(routes).toContain('entry-001');
    expect(routes).toContain('expression-engine');
    expect(routes).toContain('lab');
  });

  it('18–20. NDXBOOK progress, phase, needs-your-eye derived from real state', () => {
    const ndx = ndxOperatingState();
    const derived = NdxbookEvolveAdapter.deriveEvolveState({
      generalized: buildGeneralizedProjectOperatingState({
        projectId: 'ndxbook',
        displayName: 'NDXBOOK',
        manifest: buildProjectCapabilityManifest({
          projectId: 'ndxbook',
          organizationId: 'ndxbook',
          enabledCapabilities: ['EVOLVE'],
        }),
      }),
      ndxOperatingState: ndx,
    });
    expect(derived.activeCampaigns).toBeGreaterThan(0);
    expect(derived.contentInProduction).toBeGreaterThan(0);
    expect(derived.chapterTitle).toBe('WHICH ONE IS IT?');
    expect(derived.needsYourEyeCount).toBeGreaterThanOrEqual(0);
    expect(derived.entriesAvailable.length).toBe(3);
  });

  it('21–23. Universal shell preserved — module switcher + founder/client toggle', () => {
    const shell = readFileSync(join(ROOT, 'src/site00/components/projectOperatingSystem/ProjectOperatingShell.tsx'), 'utf8');
    expect(shell).toContain('ProjectModuleSwitcher');
    expect(shell).toContain('ViewAsClientToggle');
    expect(shell).toContain('ProjectEvolveModuleSurface');
    expect(shell).not.toContain('ndxEvolveContent');
  });

  it('24. Client view redirects — does not mount founder evolve internals', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectOperatingModulePage.tsx'), 'utf8');
    expect(page).toContain('ClientViewRedirect');
    expect(page).toContain("viewMode === 'CLIENT'");
  });

  it('25–27. No NDXBOOK entry leak to Frontal Slayer or AIO', () => {
    const fsManifest = buildProjectCapabilityManifest({
      projectId: 'frontal-slayer',
      organizationId: 'frontal-slayer',
      enabledCapabilities: ['EVOLVE'],
    });
    const fsState = buildGeneralizedProjectOperatingState({
      projectId: 'frontal-slayer',
      displayName: 'FRONTAL SLAYER',
      manifest: fsManifest,
    });
    const fsDerived = FrontalSlayerEvolveAdapter.deriveEvolveState({ generalized: fsState });
    expect(fsDerived.entriesAvailable).toEqual([]);
    expect(fsDerived.chapterTitle).toBeNull();

    const aioDerived = AioEvolveAdapter.deriveEvolveState({
      generalized: buildGeneralizedProjectOperatingState({
        projectId: 'all-in-one-enterprises',
        displayName: 'AIO',
        manifest: buildProjectCapabilityManifest({
          projectId: 'all-in-one-enterprises',
          organizationId: 'aio',
          enabledCapabilities: ['EVOLVE'],
        }),
      }),
    });
    expect(aioDerived.entriesAvailable).toEqual([]);
  });

  it('28–29. Specialized evolve subnav for NDXBOOK; generic only fallback', () => {
    expect(NdxbookEvolveAdapter.getSubnav('ndxbook')[0]?.label).toBe('CAMPAIGNS');
    expect(createGenericEvolveAdapter('x').getSubnav('x')[0]?.label).toBe('CAMPAIGNS');
    expect(NdxbookEvolveAdapter.resolveMobileScreenId('LAB')).toBe('lab-hub');
  });

  it('30–34. EvolveModuleRegressionQA exists and catches flattening', () => {
    const ndx = ndxOperatingState();
    const derived = NdxbookEvolveAdapter.deriveEvolveState({
      generalized: buildGeneralizedProjectOperatingState({
        projectId: 'ndxbook',
        displayName: 'NDXBOOK',
        manifest: buildProjectCapabilityManifest({
          projectId: 'ndxbook',
          organizationId: 'ndxbook',
          enabledCapabilities: ['EVOLVE'],
        }),
      }),
      ndxOperatingState: ndx,
    });
    const pass = evolveModuleRegressionPasses({
      projectId: 'ndxbook',
      adapterMounted: true,
      evolveState: derived,
      routesPresent: NdxbookEvolveAdapter.getEvolveRoutes('ndxbook').map((r) => r.id),
      subnavIds: NdxbookEvolveAdapter.getSubnav('ndxbook').map((s) => s.id),
      sourceFiles: {
        evolveModuleSurface: readFileSync(
          join(ROOT, 'src/site00/components/projectOperatingSystem/ProjectEvolveModuleSurface.tsx'),
          'utf8',
        ),
      },
    });
    expect(pass).toBe(true);

    const fail = runEvolveModuleRegressionQA({
      projectId: 'ndxbook',
      adapterMounted: false,
      evolveState: { ...derived, entriesAvailable: [] },
      routesPresent: [],
      subnavIds: [],
    });
    expect(fail.some((f) => f.code === 'NDXBOOK_ENTRIES_MISSING')).toBe(true);
    expect(fail.some((f) => f.code === 'GENERIC_EVOLVE_FLATTENING' || f.code === 'SPECIALIZED_EVOLVE_NOT_MOUNTED')).toBe(
      true,
    );
  });

  it('35–36. Evolve surfaces + mobile lab screen wired', () => {
    const evolveBoard = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/EvolveFounderWorkspaceBoard.tsx'),
      'utf8',
    );
    expect(evolveBoard).toContain('EvolveFounderWorkspaceBoard');
    expect(evolveBoard).toContain('renderMobileFounderWorkspaceScreen');
    const mobile = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(mobile).toContain('MobileLabHubScreen');
    expect(mobile).toContain("case 'lab-hub'");
  });

  it('37. Astral World does not force Evolve without capability', () => {
    const manifest = AstralWorldProjectAdapter.buildManifest({ projectDetail: null });
    expect(manifest.enabledModules.includes('EVOLVE')).toBe(false);
  });
});
