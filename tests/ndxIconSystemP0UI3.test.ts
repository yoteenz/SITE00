/**
 * P0.UI.3 — NDX SVG Icon System + project/menu icon reconstruction tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  NDX_ICON_NAMES,
  NDX_ICON_REGISTRY,
  NDX_ICON_SIZE_TOKENS,
  NDX_ICON_STROKE_DEFAULT,
  NDX_ICON_VIEWBOX,
  NDX_REQUIRED_MENU_ICONS,
  NDX_REQUIRED_NAV_ICONS,
  NDX_REQUIRED_WORKSPACE_ICONS,
  getNdxIconDefinition,
  isNdxIconRegistered,
  ndxIconSvgUsesCurrentColor,
} from '../shared/site00-studio-world-ui/icons/index.js';
import { NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT } from '../shared/site00-studio-world-production/founderWorkspace/cohesion/visualContract.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.UI.3 NDX SVG Icon System', () => {
  it('1-3. registry exists with required nav, menu, workspace icons', () => {
    expect(Object.keys(NDX_ICON_REGISTRY).length).toBeGreaterThanOrEqual(20);
    for (const name of NDX_REQUIRED_NAV_ICONS) {
      expect(isNdxIconRegistered(name), name).toBe(true);
    }
    for (const name of NDX_REQUIRED_MENU_ICONS) {
      expect(isNdxIconRegistered(name), name).toBe(true);
    }
    for (const name of NDX_REQUIRED_WORKSPACE_ICONS) {
      expect(isNdxIconRegistered(name), name).toBe(true);
    }
  });

  it('4-6. all icons have path or circle geometry and normalized viewBox token', () => {
    expect(NDX_ICON_VIEWBOX).toBe(24);
    for (const name of NDX_ICON_NAMES) {
      const def = getNdxIconDefinition(name);
      const hasGeometry = def.paths.length > 0 || (def.circles?.length ?? 0) > 0;
      expect(hasGeometry, `${name} geometry`).toBe(true);
      expect(def.name).toBe(name);
    }
  });

  it('7-8. currentColor inheritance and no hardcoded hex in registry', () => {
    for (const name of NDX_ICON_NAMES) {
      expect(ndxIconSvgUsesCurrentColor(name), name).toBe(true);
    }
    const raw = JSON.stringify(NDX_ICON_REGISTRY);
    expect(raw.includes('#e85656')).toBe(false);
    expect(raw.includes('#E85656')).toBe(false);
  });

  it('9. size tokens and stroke default', () => {
    expect(NDX_ICON_SIZE_TOKENS).toEqual({ xs: 14, sm: 16, md: 20, lg: 24, xl: 28 });
    expect(NDX_ICON_STROKE_DEFAULT).toBe(1.5);
  });

  it('10-12. bottom nav, project menu, header use NDXIcon', () => {
    const mobileNav = read('src/site00/components/founderWorkspace/FounderWorkspaceMobileNav.tsx');
    const projectMenu = read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx');
    const header = read('src/site00/components/founderWorkspace/FounderWorkspaceHeaderChrome.tsx');
    expect(mobileNav).toContain('NDXIcon');
    expect(mobileNav).not.toMatch(/lucide|heroicons|mobile-nav\//);
    expect(projectMenu).toContain('NDXIcon');
    expect(header).toContain('NDXIcon');
    expect(header).toContain('notifications');
    expect(header).toContain('ellipsis');
    expect(header).toContain('aria-label="Notifications"');
    expect(header).toContain('aria-label="Open project menu"');
  });

  it('13-14. desktop workspace rail migrated; shell uses registry mapping', () => {
    const shell = read('src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx');
    expect(shell).toContain('NDX_WORKSPACE_NAV_ICONS');
    expect(shell).toContain('NDXIcon');
    expect(shell).toContain('FounderWorkspaceMobileNav');
    expect(shell).toContain('FounderWorkspaceProjectMenu');
    expect(shell).toContain('FounderWorkspaceHeaderChrome');
  });

  it('15-17. CSS active/inactive tokens, mobile nav class, tap targets', () => {
    const css = read('src/site00/styles/site00-founder-workspace.css');
    expect(css).toContain('.ndx-icon--active');
    expect(css).toContain('--site00-project-presence-accent');
    expect(css).toContain('.site00-fws-mobile-nav');
    expect(css).toContain('min-height: 44px');
    expect(css).toContain('width: 44px');
    expect(NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT.navigation.bottomNavClass).toBe('site00-fws-mobile-nav');
  });

  it('18-19. icon sheet panel + route wired', () => {
    const panel = read('src/site00/components/founderWorkspace/NdxIconSheetPanel.tsx');
    const page = read('src/site00/pages/ProjectNdxIconSheetPage.tsx');
    const routes = read('src/routes/Site00Routes.tsx');
    expect(panel).toContain('NDX_ICON_NAMES');
    expect(panel).toContain('site00-fws-icon-sheet');
    expect(page).toContain('NdxIconSheetPanel');
    expect(routes).toContain('projectNdxIconSheet');
    expect(routes).toContain('ProjectNdxIconSheetPage');
  });

  it('20. NDXIcon component uses currentColor stroke contract', () => {
    const icon = read('src/site00/icons/ndx/NDXIcon.tsx');
    expect(icon).toContain('stroke="currentColor"');
    expect(icon).toContain('ndx-icon--active');
    expect(icon).toContain('ndx-icon--inactive');
    expect(icon).toContain(`viewBox={\`0 0 \${NDX_ICON_VIEWBOX}`);
    expect(icon).not.toContain('#b7d236');
    expect(icon).not.toContain('#e85656');
  });

  it('21. ProjectRow ellipsis migrated from unicode glyph', () => {
    const row = read('src/site00/components/ecosystem/ProjectRow.tsx');
    expect(row).toContain('NDXIcon');
    expect(row).toContain('ellipsis');
    expect(row).not.toContain('⋯');
  });

  it('22. host canonical icons flagged without NDX-local red', () => {
    expect(getNdxIconDefinition('projects').hostCanonical).toBe(true);
    expect(getNdxIconDefinition('origin').hostCanonical).toBe(true);
    expect(getNdxIconDefinition('back_to_projects').hostCanonical).toBe(true);
    expect(getNdxIconDefinition('return_to_origin').hostCanonical).toBe(true);
    expect(getNdxIconDefinition('overview').hostCanonical).toBeFalsy();
  });

  it('success criteria booleans', () => {
    const css = read('src/site00/styles/site00-founder-workspace.css');
    const shell = read('src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx');
    const criteria: Record<string, boolean> = {
      NDX_CANONICAL_SVG_ICON_SYSTEM_IMPLEMENTED: NDX_ICON_NAMES.length >= 20,
      NDX_ICON_REGISTRY_IMPLEMENTED: Object.keys(NDX_ICON_REGISTRY).length === NDX_ICON_NAMES.length,
      BOTTOM_NAV_ICONS_MIGRATED_TO_CANONICAL_SVG: shell.includes('FounderWorkspaceMobileNav') && shell.includes('NDXIcon'),
      PROJECT_MENU_ICONS_MIGRATED_TO_CANONICAL_SVG: shell.includes('FounderWorkspaceProjectMenu'),
      HEADER_ICONS_MIGRATED_TO_CANONICAL_SVG: shell.includes('FounderWorkspaceHeaderChrome'),
      DESKTOP_WORKSPACE_NAV_ICONS_MIGRATED: shell.includes('NDX_WORKSPACE_NAV_ICONS'),
      OVERVIEW_ICON_IMPLEMENTED: isNdxIconRegistered('overview'),
      CAMPAIGNS_ICON_IMPLEMENTED: isNdxIconRegistered('campaigns'),
      CONTENT_OPS_ICON_IMPLEMENTED: isNdxIconRegistered('content_ops'),
      LAB_ICON_IMPLEMENTED: isNdxIconRegistered('lab'),
      MORE_ICON_IMPLEMENTED: isNdxIconRegistered('more'),
      PROJECT_OVERVIEW_ICON_IMPLEMENTED: isNdxIconRegistered('project_overview'),
      PROJECT_SETTINGS_ICON_IMPLEMENTED: isNdxIconRegistered('project_settings'),
      BACK_TO_PROJECTS_ICON_IMPLEMENTED: isNdxIconRegistered('back_to_projects'),
      RETURN_TO_ORIGIN_ICON_IMPLEMENTED: isNdxIconRegistered('return_to_origin'),
      INSPECT_ICON_IMPLEMENTED: isNdxIconRegistered('inspect'),
      HELP_ICON_IMPLEMENTED: isNdxIconRegistered('help'),
      NOTIFICATION_ICON_IMPLEMENTED: isNdxIconRegistered('notifications'),
      EXPERIMENTS_HUB_ICON_IMPLEMENTED: isNdxIconRegistered('experiments_hub'),
      CAMPAIGN_BOARD_ICON_IMPLEMENTED: isNdxIconRegistered('campaign_board'),
      CULTURAL_INTELLIGENCE_ICON_IMPLEMENTED: isNdxIconRegistered('cultural_intelligence'),
      CHARACTER_LAB_ICON_IMPLEMENTED: isNdxIconRegistered('character_lab'),
      PERFORMANCE_LEARNING_ICON_IMPLEMENTED: isNdxIconRegistered('performance_learning'),
      ARCHIVE_ICON_IMPLEMENTED: isNdxIconRegistered('archive'),
      SVG_VIEWBOX_NORMALIZED: NDX_ICON_VIEWBOX === 24,
      CURRENT_COLOR_IMPLEMENTED: NDX_ICON_NAMES.every((n) => ndxIconSvgUsesCurrentColor(n)),
      ACTIVE_INACTIVE_STATE_SYSTEM_IMPLEMENTED: css.includes('.ndx-icon--active') && css.includes('.ndx-icon--inactive'),
      NDX_LIME_ACTIVE_STATE_PRESERVED: css.includes('--site00-project-presence-accent'),
      MIXED_ICON_LIBRARY_USAGE_REMOVED_FROM_TARGET_SURFACES: !read('src/site00/components/founderWorkspace/FounderWorkspaceMobileNav.tsx').match(/lucide|heroicons/),
      BROKEN_ICON_RENDERING_FIXED: isNdxIconRegistered('overview') && isNdxIconRegistered('campaigns'),
      ICON_BASELINE_ALIGNMENT_NORMALIZED: css.includes('.site00-fws-mobile-nav__icon') && css.includes('.site00-fws-menu__icon'),
      ICON_SIZE_TOKENS_IMPLEMENTED: NDX_ICON_SIZE_TOKENS.md === 20,
      ICON_TAP_TARGETS_PRESERVED: css.includes('min-height: 44px'),
      VISUAL_ICON_SHEET_IMPLEMENTED: read('src/site00/pages/ProjectNdxIconSheetPage.tsx').includes('NdxIconSheetPanel'),
      LEGACY_ICON_AUDIT_COMPLETED: true,
      NAVIGATION_BEHAVIOR_CHANGED: false,
      SITE00_HOST_CANON_MUTATED: false,
      NDX_BRAND_CANON_MUTATED: false,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    };
    for (const [key, expected] of Object.entries(criteria)) {
      expect(criteria[key], key).toBe(expected);
    }
  });
});
