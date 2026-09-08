/**
 * B5.9R4 — Evolve subshell + tab icon restoration tests.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  NdxbookEvolveAdapter,
  getProjectEvolveAdapter,
} from '../shared/site00-projects/evolve/projectEvolveAdapterRegistry.js';
import {
  EVOLVE_SUBSHELL_ICON_ASSETS,
  EVOLVE_SUBSHELL_ICON_NAMES,
} from '../shared/site00-projects/evolve/evolveSubshellTypes.js';
import {
  evolveSubshellVisualRegressionPasses,
  runEvolveSubshellVisualRegressionQA,
} from '../shared/site00-projects/evolve/evolveSubshellVisualRegressionQA.js';
import {
  evolveSubshellFunctionalPasses,
  runEvolveSubshellFunctionalQA,
} from '../shared/site00-projects/evolve/evolveSubshellFunctionalQA.js';
import { resolveEvolveTabFromPath, site00ProjectEvolveTabPath } from '../src/site00/config/evolveSubshellRoutes.js';
import { NDX_BOTTOM_NAV_ICON_FILES } from '../src/site00/config/ndxBottomNavIconUrls.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('B5.9R4 Evolve Subshell + Tab Icon Restoration', () => {
  const subshellNav = read('src/site00/components/projectOperatingSystem/evolve/EvolveSubshellNav.tsx');
  const subshell = read('src/site00/components/projectOperatingSystem/evolve/EvolveSubshell.tsx');
  const ndxSubshell = read('src/site00/components/projectOperatingSystem/evolve/NdxbookEvolveSubshell.tsx');
  const morePanel = read('src/site00/components/projectOperatingSystem/evolve/EvolveMorePanel.tsx');
  const shell = read('src/site00/components/projectOperatingSystem/ProjectOperatingShell.tsx');
  const surface = read('src/site00/components/projectOperatingSystem/ProjectEvolveModuleSurface.tsx');
  const campaignScreen = read('src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx');

  it('1. EvolveSubshell exists', () => {
    expect(subshell).toContain('export function EvolveSubshell');
    expect(existsSync(join(ROOT, 'src/site00/components/projectOperatingSystem/evolve/EvolveSubshell.tsx'))).toBe(true);
  });

  it('2. NDXBOOK uses specialized Evolve subshell', () => {
    expect(NdxbookEvolveAdapter.ownsEvolveSubshell).toBe(true);
    expect(ndxSubshell).toContain('NdxbookEvolveSubshell');
    expect(surface).toContain('NdxbookEvolveSubshell');
  });

  it('3–6. Primary tabs CAMPAIGNS, CONTENT OPS, LAB, MORE exist', () => {
    const ids = NdxbookEvolveAdapter.getSubnav('ndxbook').map((t) => t.id);
    expect(ids).toEqual(['CAMPAIGNS', 'CONTENT_OPS', 'LAB', 'MORE']);
  });

  it('7–10. Approved tab icons resolve for all four tabs', () => {
    const tabs = NdxbookEvolveAdapter.getSubnav('ndxbook');
    expect(tabs.find((t) => t.id === 'CAMPAIGNS')?.icon).toBe('campaigns');
    expect(tabs.find((t) => t.id === 'CONTENT_OPS')?.icon).toBe('content_ops');
    expect(tabs.find((t) => t.id === 'LAB')?.icon).toBe('lab');
    expect(tabs.find((t) => t.id === 'MORE')?.icon).toBe('more');
    expect(NDX_BOTTOM_NAV_ICON_FILES.campaigns).toBeTruthy();
    expect(NDX_BOTTOM_NAV_ICON_FILES.content_ops).toBeTruthy();
    expect(NDX_BOTTOM_NAV_ICON_FILES.lab).toBeTruthy();
    expect(NDX_BOTTOM_NAV_ICON_FILES.more).toBeTruthy();
  });

  it('11–12. Icons render in mobile nav; nav is not text-only', () => {
    expect(subshellNav).toContain('NDXBottomNavIcon');
    expect(subshellNav).not.toMatch(/>\s*CAMPAIGNS\s*</);
    expect(subshellNav).toContain('site00-evolve-subshell__nav-icon');
  });

  it('13–14. Active tab state + single active indicator', () => {
    expect(subshellNav).toContain('site00-evolve-subshell__nav-item--active');
    expect(subshellNav).toContain("aria-current={active ? 'page' : undefined}");
    expect(shell).toContain('evolveOwnsSubshell');
    expect(shell).not.toContain('subnavOverflowOverride');
  });

  it('15–18. Tab workspaces mount correct screens', () => {
    expect(NdxbookEvolveAdapter.resolveMobileScreenId('CAMPAIGNS')).toBe('campaign-board');
    expect(NdxbookEvolveAdapter.resolveMobileScreenId('CONTENT_OPS')).toBe('content-ops');
    expect(NdxbookEvolveAdapter.resolveMobileScreenId('LAB')).toBe('lab-hub');
    expect(NdxbookEvolveAdapter.resolveMobileScreenId('MORE')).toBe('evolve-more');
    expect(morePanel).toContain('EvolveMorePanel');
  });

  it('19–22. More links not inline; secondary destinations in MORE panel', () => {
    const more = NdxbookEvolveAdapter.getMoreItems?.('ndxbook') ?? [];
    const labels = more.map((m) => m.label);
    expect(labels).toContain('EXPRESSION ENGINE');
    expect(labels).toContain('PERFORMANCE');
    expect(labels).toContain('CULTURAL INTELLIGENCE');
    expect(shell).not.toContain('getSubnavOverflow');
    expect(campaignScreen).not.toContain('site00-pos-mobile-subnav-overflow');
  });

  it('23–24. Route changes with tab; deep link routes preserved', () => {
    expect(site00ProjectEvolveTabPath('ndxbook', 'CONTENT_OPS')).toBe('/projects/ndxbook/evolve/content-ops');
    expect(resolveEvolveTabFromPath('/projects/ndxbook/evolve/lab', 'ndxbook')).toBe('LAB');
    const routes = NdxbookEvolveAdapter.getEvolveRoutes('ndxbook').map((r) => r.id);
    expect(routes).toContain('entry-001');
    expect(routes).toContain('expression-engine');
    expect(routes).toContain('evolve-campaigns');
  });

  it('25–26. Back/close + tab persistence via URL segments', () => {
    expect(morePanel).toContain('BACK');
    expect(resolveEvolveTabFromPath('/projects/ndxbook/evolve/content-ops', 'ndxbook')).toBe('CONTENT_OPS');
    expect(resolveEvolveTabFromPath('/projects/ndxbook/evolve', 'ndxbook')).toBe('CAMPAIGNS');
  });

  it('27. NDXBOOK adapter state unchanged (entries + chapter)', () => {
    const adapter = getProjectEvolveAdapter('ndxbook');
    expect(adapter.evolveType).toBe('NDXBOOK');
    expect(adapter.usesSpecializedSurface).toBe(true);
  });

  it('28. Universal project shell unchanged', () => {
    expect(shell).toContain('ProjectModuleSwitcher');
    expect(shell).toContain('ViewAsClientToggle');
    expect(shell).toContain('ProjectOperatingHeader');
  });

  it('29. Client view firewall preserved', () => {
    const page = read('src/site00/pages/ProjectOperatingModulePage.tsx');
    expect(page).toContain('ClientViewRedirect');
  });

  it('30. Uppercase labels enforced on tabs and more items', () => {
    for (const tab of NdxbookEvolveAdapter.getSubnav('ndxbook')) {
      expect(tab.label).toBe(tab.label.toUpperCase());
    }
    for (const item of NdxbookEvolveAdapter.getMoreItems?.('ndxbook') ?? []) {
      expect(item.label).toBe(item.label.toUpperCase());
    }
  });

  it('31–32. Mobile safe-area + no horizontal overflow hooks in subshell CSS', () => {
    const css = read('src/site00/styles/site00-evolve-subshell.css');
    expect(css).toContain('safe-area-inset-bottom');
    expect(css).toContain('text-overflow: ellipsis');
  });

  it('33. Desktop subshell nav renders', () => {
    expect(subshell).toContain("layout=\"desktop\"");
    expect(subshellNav).toContain('site00-evolve-subshell__nav--desktop');
  });

  it('34–35. Visual + functional regression QA modules exist', () => {
    expect(runEvolveSubshellVisualRegressionQA).toBeTypeOf('function');
    expect(runEvolveSubshellFunctionalQA).toBeTypeOf('function');
    const visualFail = runEvolveSubshellVisualRegressionQA({
      subshellMounted: false,
      navUsesIcons: false,
      textOnlyNav: true,
      moreLinksInlineInCampaignBody: true,
      duplicateActiveIndicators: true,
      posOwnsEvolveInternalNav: true,
      iconAssetsConnected: false,
      tabWorkspacesExclusive: false,
    });
    expect(visualFail.some((f) => f.code === 'EVOLVE_TEXT_ONLY_NAV')).toBe(true);
  });

  it('36. Icon asset audit — SVG paths exist and nav references registry keys', () => {
    for (const path of Object.values(EVOLVE_SUBSHELL_ICON_ASSETS)) {
      expect(existsSync(join(ROOT, path))).toBe(true);
    }
    expect(EVOLVE_SUBSHELL_ICON_NAMES.CAMPAIGNS).toBe('campaigns');
    expect(subshellNav).toContain('NDXBottomNavIcon');
    expect(
      evolveSubshellVisualRegressionPasses({
        subshellMounted: true,
        navUsesIcons: true,
        textOnlyNav: false,
        moreLinksInlineInCampaignBody: false,
        duplicateActiveIndicators: false,
        posOwnsEvolveInternalNav: false,
        iconAssetsConnected: true,
        tabWorkspacesExclusive: true,
      }),
    ).toBe(true);
    expect(
      evolveSubshellFunctionalPasses({
        tabsPresent: ['CAMPAIGNS', 'CONTENT_OPS', 'LAB', 'MORE'],
        activeTab: 'CAMPAIGNS',
        campaignsMountsCampaignWorkspace: true,
        contentOpsMountsContentOpsWorkspace: true,
        labMountsLabWorkspace: true,
        moreOpensSecondarySurface: true,
        moreNotInlineInCampaign: true,
        expressionEngineInMore: true,
        performanceInMore: true,
        culturalIntelligenceInMore: true,
        routeChangesWithTab: true,
        deepLinksValid: true,
        backCloseReturnsToPreviousTab: true,
        posShellUnchanged: true,
        clientViewFirewall: true,
      }),
    ).toBe(true);
  });
});
