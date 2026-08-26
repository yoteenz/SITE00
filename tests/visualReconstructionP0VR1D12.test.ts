/**
 * P0.VR.1D.12 — Legacy shell flash removal + reference-shell-first loading tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CURRENT_VISUAL_SHELL_VERSION,
  LEGACY_VISUAL_SHELL_VERSION,
  NDX_RECONSTRUCTED_MOBILE_SCREEN_IDS,
  P0_VR_1D12_LINEAGE,
  RUNTIME_CURRENT_ROUTE_ELIGIBLE,
  SUPERSEDED_VISUAL_ONLY,
  extractProjectSlugFromPath,
  isNdxReconstructedRoute,
  isReconstructedMobileScreenId,
  resolveReconstructedScreenIdFromPath,
  shouldUseReferenceShellFirst,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d12/index.js';

const ROOT = process.cwd();

describe('P0.VR.1D.12 route shell resolution', () => {
  it('identifies reconstructed NDX routes synchronously', () => {
    expect(isNdxReconstructedRoute('/projects/ndxbook')).toBe(true);
    expect(isNdxReconstructedRoute('/projects/ndxbook/marketing-expression/experiment-01')).toBe(true);
    expect(isNdxReconstructedRoute('/projects/ndxbook/content-operations/campaign-board')).toBe(true);
    expect(isNdxReconstructedRoute('/projects/ndxbook/content-operations')).toBe(true);
    expect(isNdxReconstructedRoute('/projects/ndxbook/cultural-intelligence')).toBe(true);
    expect(isNdxReconstructedRoute('/projects/ndxbook/character/founder-discovery')).toBe(true);
    expect(isNdxReconstructedRoute('/projects/other/marketing-expression/experiment-01')).toBe(false);
  });

  it('resolves screen id from path without async fetch', () => {
    expect(resolveReconstructedScreenIdFromPath('/projects/ndxbook', 'ndxbook')).toBe('overview');
    expect(
      resolveReconstructedScreenIdFromPath('/projects/ndxbook/marketing-expression/experiment-01', 'ndxbook'),
    ).toBe('experiment-01');
    expect(
      resolveReconstructedScreenIdFromPath('/projects/ndxbook/content-operations/campaign-board', 'ndxbook'),
    ).toBe('campaign-board');
  });

  it('reference shell first is route-based not data-based', () => {
    expect(shouldUseReferenceShellFirst('/projects/ndxbook/marketing-expression/experiment-01', 'ndxbook')).toBe(true);
    expect(shouldUseReferenceShellFirst('/projects/ndxbook/marketing-expression/experiment-01', 'other')).toBe(false);
  });

  it('extracts project slug from path', () => {
    expect(extractProjectSlugFromPath('/projects/ndxbook/marketing-expression/experiment-01')).toBe('ndxbook');
  });

  it('all reconstructed mobile screens registered', () => {
    for (const id of NDX_RECONSTRUCTED_MOBILE_SCREEN_IDS) {
      expect(isReconstructedMobileScreenId(id)).toBe(true);
    }
  });
});

describe('P0.VR.1D.12 shell version instrumentation', () => {
  it('current shell version constant', () => {
    expect(CURRENT_VISUAL_SHELL_VERSION).toBe('P0.VR.1D.9+');
    expect(LEGACY_VISUAL_SHELL_VERSION).toBe('legacy');
    expect(SUPERSEDED_VISUAL_ONLY).toBe('SUPERSEDED_VISUAL_ONLY');
    expect(RUNTIME_CURRENT_ROUTE_ELIGIBLE).toBe(false);
  });

  it('FounderWorkspaceShell stamps current shell version', () => {
    const shell = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx'), 'utf8');
    expect(shell).toContain('data-visual-shell-version={CURRENT_VISUAL_SHELL_VERSION}');
  });

  it('MobileFounderWorkspaceChrome stamps current shell version', () => {
    const chrome = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'), 'utf8');
    expect(chrome).toContain('data-visual-shell-version={CURRENT_VISUAL_SHELL_VERSION}');
  });
});

describe('P0.VR.1D.12 Experiment 01 flash fix', () => {
  it('Experiment 01 page always uses FounderWorkspaceShell for ndxbook', () => {
    const page = readFileSync(
      join(ROOT, 'src/site00/pages/ProjectBrandMarketingExpressionExperiment01Page.tsx'),
      'utf8',
    );
    expect(page).not.toContain('useFounderWorkspaceShell');
    expect(page).toContain('founderWorkspaceEnabled');
    expect(page).toContain('<FounderWorkspaceShell');
    expect(page).not.toMatch(/useFounderWorkspaceShell\s*\?\s*\(/);
  });

  it('desktop loading uses ReferenceShellLoadingState not legacy page return', () => {
    const page = readFileSync(
      join(ROOT, 'src/site00/pages/ProjectBrandMarketingExpressionExperiment01Page.tsx'),
      'utf8',
    );
    expect(page).toContain('const desktopOperateContent = loading ? (');
    expect(page).toContain('<ReferenceShellLoadingState screenId="experiment-01" />');
    expect(page).not.toContain('useFounderWorkspaceShell');
  });

  it('legacy shell marked superseded and inspect-only', () => {
    const page = readFileSync(
      join(ROOT, 'src/site00/pages/ProjectBrandMarketingExpressionExperiment01Page.tsx'),
      'utf8',
    );
    expect(page).toContain('data-visual-shell-version={LEGACY_VISUAL_SHELL_VERSION}');
    expect(page).toContain('data-superseded-visual={SUPERSEDED_VISUAL_ONLY}');
    expect(page).toContain('site00-fws-legacy-inspect');
  });
});

describe('P0.VR.1D.12 Suspense fallback', () => {
  it('Site00RouteLoadingFallback uses reference shell suspense for NDX routes', () => {
    const fallback = readFileSync(join(ROOT, 'src/site00/components/loader/Site00RouteLoadingFallback.tsx'), 'utf8');
    expect(fallback).toContain('ReferenceShellSuspenseFallback');
  });

  it('ReferenceShellSuspenseFallback component exists', () => {
    expect(existsSync(join(ROOT, 'src/site00/components/loader/ReferenceShellSuspenseFallback.tsx'))).toBe(true);
  });

  it('ReferenceShellLoadingState component exists with shell version', () => {
    const loading = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/ReferenceShellLoadingState.tsx'), 'utf8');
    expect(loading).toContain('data-visual-shell-version={CURRENT_VISUAL_SHELL_VERSION}');
    expect(loading).toContain('site00-ref-shell-loading__grid');
  });
});

describe('P0.VR.1D.12 reconstructed routes audit', () => {
  it('Overview uses NdxFounderWorkspacePage shell-preserving load', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectDetailPage.tsx'), 'utf8');
    expect(page).toContain('NdxFounderWorkspacePage');
    expect(page).toContain('loading={state === \'loading\'}');
  });

  it('Campaign board always wraps FounderWorkspaceShell', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectContentOperationsCampaignBoardPage.tsx'), 'utf8');
    expect(page).toContain('<FounderWorkspaceShell');
    expect(page).not.toContain('site00-project-lore-calibration');
  });

  it('Content ops always wraps FounderWorkspaceShell', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectContentOperationsPage.tsx'), 'utf8');
    expect(page).toContain('<FounderWorkspaceShell');
  });

  it('Cultural intelligence always wraps FounderWorkspaceShell', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectCulturalIntelligencePage.tsx'), 'utf8');
    expect(page).toContain('<FounderWorkspaceShell');
  });

  it('Character lab always wraps FounderWorkspaceShell for ndxbook', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectFounderCharacterDiscoveryPage.tsx'), 'utf8');
    expect(page).toContain("projectSlug === 'ndxbook'");
    expect(page).toContain('<FounderWorkspaceShell');
  });

  it('lineage constant', () => {
    expect(P0_VR_1D12_LINEAGE).toBe('P0.VR.1D.12');
  });
});
