/**
 * B5.9R7 test suite — Project overview intelligence + reference-fidelity restoration.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildProjectOperatingState } from '../shared/site00-brand-lore/founderWorkspace/projectOperatingState/buildProjectOperatingState.js';
import {
  getProjectOverviewAdapter,
  NdxbookOverviewAdapter,
  FrontalSlayerOverviewAdapter,
  StudioWorldOverviewAdapter,
  AioOverviewAdapter,
  AstralWorldOverviewAdapter,
  ndxbookMustNotUseGenericOverview,
} from '../shared/site00-projects/overview/projectOverviewAdapterRegistry.js';
import { deriveNdxbookProgress } from '../shared/site00-projects/overview/adapters/ndxbookOverviewAdapter.js';
import { resolveOverviewVisual } from '../shared/site00-projects/overview/overviewHelpers.js';
import {
  runEmptyGenericProjectOverviewQA,
  runProjectOverviewStateQA,
} from '../shared/site00-projects/overview/projectOverviewStateQA.js';
import { buildProjectProgressSummary } from '../shared/site00-projects/projectProgressSummary.js';
import { getProjectOperatingAdapter } from '../shared/site00-projects/adapters/index.js';
import { getProjectEvolveAdapter } from '../shared/site00-projects/evolve/projectEvolveAdapterRegistry.js';

const ROOT = join(import.meta.dirname, '..');
const SURFACE = readFileSync(
  join(ROOT, 'src/site00/components/projectOperatingSystem/ProjectOverviewModuleSurface.tsx'),
  'utf8',
);
const SHELL = readFileSync(join(ROOT, 'src/site00/components/projectOperatingSystem/ProjectOperatingShell.tsx'), 'utf8');
const HEADER = readFileSync(join(ROOT, 'src/site00/components/projectOperatingSystem/ProjectOperatingHeader.tsx'), 'utf8');
const PAGE = readFileSync(join(ROOT, 'src/site00/pages/ProjectOperatingModulePage.tsx'), 'utf8');
const CSS = readFileSync(join(ROOT, 'src/site00/styles/site00-project-overview.css'), 'utf8');
const EVOLVE_SHELL = readFileSync(
  join(ROOT, 'src/site00/components/projectOperatingSystem/evolve/NdxbookEvolveSubshell.tsx'),
  'utf8',
);

function ndxOperatingState() {
  return buildProjectOperatingState({
    projectId: 'ndxbook',
    projectStateVersion: 1,
    contentOpsRun: null,
    campaignProduction: null,
    entry001: {
      activeArchiveCount: 0,
      archivedRemovedCount: 0,
      packageDeliverableCount: 2,
      carouselSlideCount: 4,
      storyFrameCount: 3,
      packageIncomplete: true,
      needsFounderReview: false,
    },
    expressionEngine: {
      entry002Stage: 'STORYBOARD',
      entry003NeedsReview: true,
    },
  });
}

function generalizedFor(projectId: string) {
  const adapter = getProjectOperatingAdapter(projectId);
  return adapter.buildOperatingState({ projectDetail: null, projectStateVersion: 1 });
}

describe('B5.9R7 Project Overview Intelligence', () => {
  it('1. ProjectOverviewAdapter contract exists', () => {
    expect(NdxbookOverviewAdapter.buildFounderOverview).toBeTypeOf('function');
    expect(NdxbookOverviewAdapter.buildClientOverview).toBeTypeOf('function');
  });

  it('2. ProjectOverviewAdapterRegistry exists', () => {
    expect(getProjectOverviewAdapter('ndxbook').adapterId).toBe('ndxbook');
    expect(getProjectOverviewAdapter('unknown-slug').adapterId).toBe('generic');
  });

  it('3–7. project-specific adapters registered', () => {
    expect(NdxbookOverviewAdapter.usesSpecializedOverview).toBe(true);
    expect(FrontalSlayerOverviewAdapter.projectId).toBe('frontal-slayer');
    expect(StudioWorldOverviewAdapter.projectId).toBe('studio-world');
    expect(AioOverviewAdapter.projectId).toBe('all-in-one-enterprises');
    expect(AstralWorldOverviewAdapter.projectId).toBe('astral-world');
  });

  it('8. NDXBOOK does not use generic overview', () => {
    expect(ndxbookMustNotUseGenericOverview('ndxbook')).toBe(true);
    expect(getProjectOverviewAdapter('ndxbook').adapterId).not.toBe('generic');
  });

  it('9–10. project visual resolves with project-specific fallback', () => {
    const visual = resolveOverviewVisual('ndxbook', 'NDXBOOK');
    expect(visual.visualClass).toBe('nd');
    expect(visual.initials).toBeTruthy();
    expect(visual.visualClass).not.toBe('generic');
  });

  it('11–13. progress false-zero guard — unknown does not render 0%', () => {
    const empty = deriveNdxbookProgress([]);
    expect(empty.percent).toBeNull();
    expect(empty.label).toBe('NOT YET SCORED');

    const generalized = generalizedFor('ndxbook');
    const summary = buildProjectProgressSummary(generalized);
    if (summary.percent == null) {
      expect(summary.label).toBeTruthy();
    }
    expect(HEADER).toContain('buildProjectProgressSummary');
    expect(HEADER).not.toMatch(/summary\.progressPercent\}%/);
  });

  it('14–18. NDXBOOK overview derives needs, blockers, signals, focus, milestone', () => {
    const ndx = ndxOperatingState();
    const generalized = generalizedFor('ndxbook');
    const model = NdxbookOverviewAdapter.buildFounderOverview({
      generalized,
      ndxOperatingState: ndx,
      viewMode: 'FOUNDER',
    });

    expect(model.needsYourEyeCount).toBeGreaterThan(0);
    expect(model.primarySignals).toHaveLength(4);
    expect(model.currentFocus).toBeTruthy();
    expect(model.nextMilestone).toBeTruthy();
    expect(model.progress.percent).not.toBe(0);
  });

  it('19. recent activity optional', () => {
    const model = NdxbookOverviewAdapter.buildFounderOverview({
      generalized: generalizedFor('ndxbook'),
      ndxOperatingState: ndxOperatingState(),
      viewMode: 'FOUNDER',
    });
    expect(Array.isArray(model.recentActivity)).toBe(true);
  });

  it('20–23. NDXBOOK entry states, founder gates, package, technical feed overview', () => {
    const ndx = ndxOperatingState();
    const model = NdxbookOverviewAdapter.buildFounderOverview({
      generalized: generalizedFor('ndxbook'),
      ndxOperatingState: ndx,
      viewMode: 'FOUNDER',
    });
    expect(model.primarySignals.some((s) => s.id === 'creative')).toBe(true);
    expect(model.primarySignals.some((s) => s.id === 'review')).toBe(true);
    expect(model.primarySignals.some((s) => s.id === 'package')).toBe(true);
    expect(model.currentFocus?.label).toMatch(/ENTRY 003/);
    expect(model.phase).not.toBe('EVOLVE');
  });

  it('24–25. module chips + switcher from capability manifest', () => {
    const model = NdxbookOverviewAdapter.buildFounderOverview({
      generalized: generalizedFor('ndxbook'),
      ndxOperatingState: ndxOperatingState(),
      viewMode: 'FOUNDER',
    });
    expect(model.moduleChips.length).toBeGreaterThan(0);
    expect(SHELL).toContain('ProjectModuleSwitcher');
    expect(SHELL).toContain('enabledModules={modulesForNav}');
  });

  it('26–27. EVOLVE reachable + subshell preserved', () => {
    expect(SHELL).toContain('ProjectEvolveModuleSurface');
    const evolve = getProjectEvolveAdapter('ndxbook');
    expect(evolve.ownsEvolveSubshell).toBe(true);
    const tabs = evolve.getSubnav('ndxbook').map((t) => t.label);
    expect(tabs).toContain('CAMPAIGNS');
    expect(tabs.some((t) => t.includes('CONTENT'))).toBe(true);
    expect(tabs).toContain('LAB');
    expect(EVOLVE_SHELL).toContain('EvolveSubshell');
  });

  it('28–29. client overview is client-safe', () => {
    const client = NdxbookOverviewAdapter.buildClientOverview({
      generalized: generalizedFor('ndxbook'),
      ndxOperatingState: ndxOperatingState(),
      viewMode: 'CLIENT',
    });
    expect(client.primarySignals.some((s) => s.id === 'technical')).toBe(false);
    expect(client.adapterId).toBe('ndxbook');
  });

  it('30–31. empty + stale overview QA exists', () => {
    const bad = NdxbookOverviewAdapter.buildFounderOverview({
      generalized: generalizedFor('ndxbook'),
      ndxOperatingState: null,
      viewMode: 'FOUNDER',
    });
    bad.progress = { percent: 0, label: null, confidence: 'LOW' };
    bad.phase = 'EVOLVE';
    const qa = runProjectOverviewStateQA({ model: bad, expectedNeedsYourEye: 2 });
    expect(qa.ok).toBe(false);
    expect(qa.failures.some((f) => f.class === 'OVERVIEW_PROGRESS_FALSE_ZERO')).toBe(true);
    expect(qa.failures.some((f) => f.class === 'OVERVIEW_PHASE_GENERIC_MODULE_NAME')).toBe(true);

    const emptyQa = runEmptyGenericProjectOverviewQA({
      ...bad,
      primarySignals: [],
      currentFocus: null,
      nextMilestone: null,
    });
    expect(emptyQa.failureClass).toBe('EMPTY_GENERIC_PROJECT_OVERVIEW');
  });

  it('32–33. mobile + desktop overview surface + CSS', () => {
    expect(SURFACE).toContain('site00-pov--mobile');
    expect(SURFACE).toContain('site00-pov--desktop');
    expect(SURFACE).toContain('site00-pov-signals__grid');
    expect(CSS).toContain('text-transform: uppercase');
    expect(CSS).toContain('grid-template-columns: repeat(2');
  });

  it('34. cross-project adapter differentiation', () => {
    const fs = FrontalSlayerOverviewAdapter.buildFounderOverview({
      generalized: generalizedFor('frontal-slayer'),
      viewMode: 'FOUNDER',
    });
    const ndx = NdxbookOverviewAdapter.buildFounderOverview({
      generalized: generalizedFor('ndxbook'),
      ndxOperatingState: ndxOperatingState(),
      viewMode: 'FOUNDER',
    });
    expect(fs.primarySignals[0]?.title).not.toBe(ndx.primarySignals[0]?.title);
    expect(fs.adapterId).not.toBe(ndx.adapterId);
  });

  it('35. shell mounts ProjectOverviewModuleSurface — not generic blank overview', () => {
    expect(SHELL).toContain('ProjectOverviewModuleSurface');
    expect(SHELL).not.toContain('ndxOverviewContent');
    expect(SHELL).not.toContain('ProjectTechnicalPanelRouter');
    expect(PAGE).not.toContain('OverviewFounderWorkspaceBoard');
    expect(PAGE).toContain('site00-project-overview.css');
  });

  it('NDXBOOK progress derivation documented via entry weights', () => {
    const entries = ndxOperatingState().entries;
    const progress = deriveNdxbookProgress(entries);
    expect(progress.percent).toBeGreaterThan(0);
    expect(progress.confidence).not.toBe('LOW');
  });
});
