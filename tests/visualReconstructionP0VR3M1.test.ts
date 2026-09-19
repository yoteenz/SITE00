/**
 * P0.VR.3M.1-SITE00 — Design workspace shell completion tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildDesignWorkspaceOverflowActions,
  designWorkspaceLegacyHostIconsReplaced,
  DESIGN_WORKSPACE_HOST_ICON_INVENTORY,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m1/client.js';
import {
  CANONICAL_SITE00_DESIGN_ROUTE,
  designWorkspaceHostUsesSite00Red,
  projectAccentRecolorsDesignHostShell,
  site00OwnsDesignWorkspace,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.3M.1 design workspace shell completion', () => {
  it('bottom panel renders in SITE00 host shell (not tab-gated)', () => {
    const shell = read('src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx');
    const workspace = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(shell).toContain('site00-dw-shell__bottom-panel');
    expect(shell).toContain('SITE00_DESIGN_WORKSPACE_SHELL');
    expect(workspace).toContain('bottomPanel={<DesignWorkspaceFooter');
    expect(workspace).not.toMatch(/tab === 'COMPARE' \? <DesignWorkspaceFooter/);
    expect(read('src/site00/styles/site00-design-workspace-p0vr2b.css')).toContain('--site00-dw-bottom-panel-height');
  });

  it('notification and overflow controls are wired with mutual exclusion', () => {
    const shell = read('src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx');
    const workspace = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(shell).toContain('aria-expanded');
    expect(shell).toContain('onToggleNotifications');
    expect(shell).toContain('onToggleOverflow');
    expect(workspace).toContain('useDesignWorkspaceHostMenus');
    expect(workspace).toContain('ActiveProjectNotificationCenter');
    expect(workspace).toContain('DesignWorkspaceOverflowMenu');
    expect(read('src/site00/components/designWorkspace/useDesignWorkspaceHostMenus.ts')).toContain("'NOTIFICATIONS'");
    expect(read('src/site00/components/designWorkspace/useDesignWorkspaceHostMenus.ts')).toContain("'OVERFLOW'");
  });

  it('overflow menu exposes real handlers only', () => {
    const actions = buildDesignWorkspaceOverflowActions({
      projectId: 'ndxbook',
      route: '/projects/ndxbook/campaign-board',
      livePreviewUrl: '/projects/ndxbook/campaign-board?designPreview=1',
      tab: 'COMPARE',
      capturing: false,
    });
    expect(actions.some((a) => a.id === 'capture_implementation' && a.enabled)).toBe(true);
    expect(actions.some((a) => a.id === 'open_review_tab' && a.enabled)).toBe(true);
    const onReview = buildDesignWorkspaceOverflowActions({
      projectId: 'ndxbook',
      route: '/x',
      livePreviewUrl: '/x',
      tab: 'REVIEW',
      capturing: false,
    }).find((a) => a.id === 'open_review_tab');
    expect(onReview?.enabled).toBe(false);
    expect(workspaceHasOverflowHandlers()).toBe(true);
  });

  it('uses current SITE00 icon system — legacy host icons replaced', () => {
    expect(designWorkspaceLegacyHostIconsReplaced()).toBe(true);
    expect(DESIGN_WORKSPACE_HOST_ICON_INVENTORY.some((i) => i.legacySource === 'emoji-bell')).toBe(true);
    const shell = read('src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx');
    expect(shell).not.toContain('🔔');
    expect(shell).not.toContain('⋯');
    expect(shell).not.toContain('⌜⌝');
    expect(shell).toContain('DesignWorkspaceBellIcon');
    expect(shell).toContain('DesignWorkspaceMoreIcon');
    expect(shell).toContain('DesignWorkspaceBrandMark');
    expect(read('src/site00/components/designWorkspace/DesignWorkspaceNavIcon.tsx')).toContain('Site00ProjectsIcon');
  });

  it('preserves P0.VR.3M ownership, route, and SITE00 red host', () => {
    expect(site00OwnsDesignWorkspace()).toBe(true);
    expect(CANONICAL_SITE00_DESIGN_ROUTE).toBe('/projects/site00/design');
    expect(designWorkspaceHostUsesSite00Red()).toBe(true);
    expect(projectAccentRecolorsDesignHostShell('ndxbook')).toBe(false);
    expect(projectAccentRecolorsDesignHostShell('studio-world')).toBe(false);
    expect(projectAccentRecolorsDesignHostShell('frontal-slayer')).toBe(false);
    expect(read('src/site00/styles/site00-design-workspace-p0vr2b.css')).toContain('--site00-dw-host-accent');
  });

  it('notification provider uses data-driven hook (no hardcoded badge)', () => {
    const workspace = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(workspace).toContain('useActiveProjectNotifications');
    expect(workspace).toContain('notificationState.unreadCount');
    expect(workspace).not.toMatch(/unreadNotificationCount=\{\d+\}/);
  });

  it('preserves review/snapshot surfaces', () => {
    const workspace = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(workspace).toContain('DesignComposerReviewQueue');
    expect(workspace).toContain('DesignMissingTargetQueue');
    expect(workspace).toContain('useImplementationSnapshots');
    expect(workspace).toContain('DesignRepoChangePanel');
  });

  it('menu z-index elevated above workspace content', () => {
    const css = read('src/site00/styles/site00-design-workspace-p0vr2b.css');
    expect(css).toContain('z-index: 1210');
    expect(css).toContain('site00-dw-shell__bottom-panel');
    expect(css).toContain('z-index: 30');
  });
});

function workspaceHasOverflowHandlers(): boolean {
  const workspace = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
  return workspace.includes('handleOverflowAction') && workspace.includes('capture_implementation');
}
