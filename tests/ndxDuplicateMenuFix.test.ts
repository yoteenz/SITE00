/**
 * Regression: mobile NDXBOOK must not render two overlapping project menus.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(process.cwd());

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('NDXBOOK duplicate menu regression', () => {
  it('mobile chrome does not embed a second project menu component', () => {
    const mobileChrome = read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx');
    expect(mobileChrome).not.toContain('ProjectEscapeMenu');
    expect(mobileChrome).not.toContain('site00-fws-project-menu');
    expect(mobileChrome).toContain('menuOpen');
    expect(mobileChrome).toContain('onToggleMenu');
    expect(mobileChrome).toContain("item.id === 'more'");
  });

  it('shell owns a single portaled FounderWorkspaceProjectMenu with vr region marker', () => {
    const shell = read('src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx');
    const projectMenu = read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx');

    expect(shell).toContain('<FounderWorkspaceProjectMenu');
    expect((shell.match(/<FounderWorkspaceProjectMenu/g) ?? []).length).toBe(1);
    expect(shell).toContain('menuOpen={menuOpen}');
    expect(shell).toContain('onToggleMenu={toggleMenu}');
    expect(shell).not.toContain('onOpenNotifications={() => setMenuOpen(true)}');
    expect(shell).toContain('ActiveProjectNotificationCenter');
    expect(shell).toContain('toggleNotifications');
    expect(projectMenu).toContain('createPortal');
    expect(projectMenu).toContain('vrRegionAttr(NDX_VR_REGION.projectMenu)');
  });

  it('legacy escape-menu CSS is removed so stale styles cannot paint a second panel', () => {
    const css = read('src/site00/styles/site00-founder-workspace.css');
    expect(css).not.toContain('.site00-fws-project-menu');
  });
});
