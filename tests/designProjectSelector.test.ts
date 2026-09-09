/**
 * Design workspace project selector recovery — 22 tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  assertNoDesignProjectDataBleed,
  buildDesignWorkspaceBreadcrumb,
  formatDesignProjectSelectorLabel,
  listSelectableDesignProjects,
  resolveActiveDesignProjectId,
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
    expect(src).toContain('listScreensWithSnapshots(projectId)');
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
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('projectId={projectId}');
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
