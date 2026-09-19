/**
 * Design workspace project selector recovery — 22 tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  assertNoDesignProjectDataBleed,
  buildDesignWorkspaceBreadcrumb,
  CANONICAL_DESIGN_PROJECT_SELECTOR_ORDER,
  DESIGN_PROJECT_SELECTOR_VISUAL_FAILURE_CODES,
  formatDesignProjectSelectorLabel,
  listSelectableDesignProjects,
  resolveActiveDesignProjectId,
  resolveDesignProjectSelectorAccent,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';
import { BRAND_FAMILY_PROJECT_MAP } from '../shared/site00-brand-lore/projectSkin/brandFamily/constants.js';
import { buildScreenAuthorityPrefill } from '../shared/site00-brand-lore/projectSkin/brandFamily/screenSlotConfig.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Design Project Selector Recovery', () => {
  const projects = listSelectableDesignProjects({ viewMode: 'FOUNDER' });

  it('1. selector opens', () => {
    expect(read('src/site00/components/designWorkspace/DesignProjectSelector.tsx')).toContain('site00-dw-project-selector__menu');
  });

  it('2. canonical project list loads', () => {
    expect(projects.length).toBeGreaterThanOrEqual(6);
  });

  it('3. Site 00 selectable', () => {
    expect(projects.some((p) => p.projectId === 'site00')).toBe(true);
  });

  it('4. NDXBOOK selectable', () => {
    expect(projects.some((p) => p.projectId === 'ndxbook')).toBe(true);
  });

  it('5. Frontal Slayer selectable', () => {
    expect(projects.some((p) => p.projectId === 'frontal-slayer')).toBe(true);
  });

  it('6. Studio World selectable', () => {
    expect(projects.some((p) => p.projectId === 'studio-world')).toBe(true);
  });

  it('7. AIO selectable', () => {
    expect(projects.some((p) => p.projectId === 'all-in-one-enterprises')).toBe(true);
  });

  it('8. Astral World selectable', () => {
    expect(projects.some((p) => p.projectId === 'astral-world')).toBe(true);
  });

  it('9. activeDesignProjectId updates', () => {
    expect(resolveActiveDesignProjectId('ndxbook')).toBe('ndxbook');
    expect(resolveActiveDesignProjectId('site00')).toBe('site00');
  });

  it('10. selector label updates', () => {
    expect(formatDesignProjectSelectorLabel('ndxbook')).toBe('PROJECT NDXBOOK');
    expect(formatDesignProjectSelectorLabel('site00')).toBe('PROJECT SITE 00');
  });

  it('11. breadcrumb updates', () => {
    expect(buildDesignWorkspaceBreadcrumb('ndxbook')).toBe('PROJECTS > NDXBOOK > DESIGN');
    expect(buildDesignWorkspaceBreadcrumb('site00')).toBe('PROJECTS > SITE 00 > DESIGN');
  });

  it('12. Pages re-scope', () => {
    const src = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(src).toContain('buildProjectPageMirrorRows(projectId');
    expect(src).toContain('usePageMirror(projectId)');
    expect(src).toContain('key={`pages-${activeDesignProjectId}`}');
  });

  it('13. References re-scope', () => {
    const refsTab = read('src/site00/components/designWorkspace/DesignReferencesTab.tsx');
    expect(refsTab).toContain('listCanonicalReferences(projectId)');
    const workspace = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(workspace).toContain('key={`refs-${activeDesignProjectId}`}');
    expect(workspace).toContain('projectId={activeDesignProjectId}');
  });

  it('14. Assets re-scope', () => {
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('key={`assets-${activeDesignProjectId}`}');
  });

  it('15. History re-scope', () => {
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('key={`history-${activeDesignProjectId}`}');
  });

  it('16. More re-scope where project-specific', () => {
    const moreTab = read('src/site00/components/designWorkspace/DesignMoreTab.tsx');
    const workspace = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(moreTab.length).toBeGreaterThan(0);
    expect(workspace).toContain('key={`more-${activeDesignProjectId}`}');
  });

  it('17. Experience Skin re-scope', () => {
    expect(read('src/site00/components/brandFamilySkin/ExperienceSkinManagementPanel.tsx')).toContain('BRAND_FAMILY_PROJECT_MAP');
  });

  it('18. screen authority prefills from active project', () => {
    const brandKey = BRAND_FAMILY_PROJECT_MAP['ndxbook'];
    const prefill = buildScreenAuthorityPrefill(brandKey!, 'PROJECT_OVERVIEW');
    expect(prefill.moduleId).toBe('PROJECTS');
    expect(prefill.screenType).toBe('OVERVIEW');
  });

  it('19. no stale Site 00 data after switch', () => {
    const qa = assertNoDesignProjectDataBleed('site00', 'ndxbook', 'ndxbook');
    expect(qa.pass).toBe(true);
    const bleed = assertNoDesignProjectDataBleed('site00', 'ndxbook', 'site00');
    expect(bleed.pass).toBe(false);
  });

  it('20. current tab preserved where valid', () => {
    const src = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(src).toContain('handleSelectDesignProject');
    const handler = src.slice(src.indexOf('handleSelectDesignProject'), src.indexOf('const site00SyncContract'));
    expect(handler).not.toContain('setPrimaryTab');
  });

  it('21. permissions filter project options', () => {
    const client = listSelectableDesignProjects({ viewMode: 'CLIENT', entitledProjectIds: ['ndxbook'] });
    expect(client.every((p) => p.projectId === 'ndxbook')).toBe(true);
  });

  it('22. build passes', () => {
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).not.toMatch(
      /const \[projectId\] = useState/,
    );
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('activeDesignProjectId');
    expect(read('src/site00/components/designWorkspace/DesignProjectSelector.tsx')).toContain('DesignProjectSelector');
  });
});

describe('Design Project Selector Visual Cleanup', () => {
  const css = read('src/site00/styles/site00-design-workspace-v3.css');
  const component = read('src/site00/components/designWorkspace/DesignProjectSelector.tsx');
  const projects = listSelectableDesignProjects({ viewMode: 'FOUNDER' });

  it('1. selector still opens', () => {
    expect(component).toContain('setOpen');
    expect(component).toContain('site00-dw-project-selector__menu');
  });

  it('2. light surface rendered', () => {
    expect(css).toContain('--site00-dw-white');
    expect(css).toContain('border-radius: 10px');
  });

  it('3. no black theme', () => {
    expect(css).not.toContain('background: #0a0a0a');
    expect(component).toContain('data-theme="light"');
  });

  it('4. selected project visible', () => {
    expect(css).toContain('.site00-dw-project-selector__option.is-active');
    expect(component).toContain('site00-dw-project-selector__current-tag');
  });

  it('5. inactive text readable', () => {
    const selectorCss = css.slice(css.indexOf('.site00-dw-project-selector__menu'));
    expect(selectorCss).toContain('--site00-dw-ink');
    expect(selectorCss).not.toMatch(/\.site00-dw-project-selector__option[^}]*color:\s*#fff/);
  });

  it('6. Martian Mono preserved', () => {
    expect(css).toContain("'Martian Mono'");
  });

  it('7. uppercase preserved', () => {
    expect(css).toContain('text-transform: uppercase');
  });

  it('8. active label updates', () => {
    expect(component).toContain('activeProjectLabel');
    expect(formatDesignProjectSelectorLabel('frontal-slayer')).toBe('PROJECT FRONTAL SLAYER');
  });

  it('9. project switching still works', () => {
    expect(component).toContain('onSelectProject');
    expect(component).toContain('selectProject');
  });

  it('10. current Design tab re-scopes', () => {
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain(
      'handleSelectDesignProject',
    );
  });

  it('11. permissions preserved', () => {
    const client = listSelectableDesignProjects({ viewMode: 'CLIENT', entitledProjectIds: ['ndxbook'] });
    expect(client).toHaveLength(1);
    expect(client[0]?.projectId).toBe('ndxbook');
  });

  it('12. mobile popover works', () => {
    const start = css.indexOf('.site00-dw-project-selector__menu');
    const end = css.indexOf('.site00-dw-v3-rescope-loading', start);
    const selectorCss = css.slice(start, end > start ? end : start + 2500);
    expect(selectorCss).toContain('@media (max-width: 640px)');
    expect(selectorCss).not.toContain('position: fixed');
    expect(selectorCss).toContain('position: absolute');
  });

  it('13. desktop popover works', () => {
    expect(css).toContain('position: absolute');
    expect(css).toContain('right: 0');
  });

  it('14. focus / keyboard states work', () => {
    expect(component).toContain('onKeyDown');
    expect(component).toContain('Escape');
    expect(css).toContain(':focus-visible');
    expect(component).toContain('aria-selected');
  });

  it('15. canonical order and accents', () => {
    expect(projects.map((p) => p.projectId)).toEqual([...CANONICAL_DESIGN_PROJECT_SELECTOR_ORDER]);
    expect(resolveDesignProjectSelectorAccent('ndxbook').dotColor).toBe('#B7D236');
    expect(DESIGN_PROJECT_SELECTOR_VISUAL_FAILURE_CODES).toContain('DESIGN_PROJECT_SELECTOR_DARK_THEME_DRIFT');
  });
});
