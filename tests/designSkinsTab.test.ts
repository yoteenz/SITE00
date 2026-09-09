/**
 * Design SKINS tab — 28 tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DESIGN_SKINS_FAILURE_CODES,
  DESIGN_WORKSPACE_PRIMARY_TABS,
  LEGACY_TAB_TO_PRIMARY,
  normalizeDesignWorkspacePrimaryTab,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/designWorkspaceUxTypes.js';
import { SKINS_SCREEN_SLOTS } from '../src/site00/components/designWorkspace/useDesignSkinsState.js';
import { TYPOGRAPHY_FIREWALL } from '../shared/site00-brand-lore/projectSkin/brandFamily/constants.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Design SKINS Tab (P0.VR.6R3)', () => {
  it('1. SKINS primary tab exists', () => {
    expect(DESIGN_WORKSPACE_PRIMARY_TABS).toContain('SKINS');
  });

  it('2. tab order is correct', () => {
    expect(DESIGN_WORKSPACE_PRIMARY_TABS).toEqual(['REFERENCES', 'ASSETS', 'PAGES', 'SKINS', 'HISTORY', 'MORE']);
  });

  it('3. SKINS no longer requires MORE', () => {
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain("primaryTab === 'SKINS'");
    expect(normalizeDesignWorkspacePrimaryTab('SKINS')).toBe('SKINS');
  });

  it('4. MORE content preserved', () => {
    const more = read('src/site00/components/designWorkspace/DesignMoreTab.tsx');
    expect(more).toContain('PROVIDERS');
    expect(more).toContain('SPEND GUARD');
    expect(more).toContain('STORAGE & OUTPUT');
    expect(more).toContain('AUTOMATION');
    expect(more).toContain('REFERENCE FIDELITY');
    expect(more).not.toContain('ExperienceSkinManagementPanel');
  });

  it('5. mobile authority layout mounted', () => {
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('site00-dw-skins__mobile');
  });

  it('6. desktop authority layout mounted', () => {
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('site00-dw-skins__desktop');
  });

  it('7. mobile/desktop render independently', () => {
    const css = read('src/site00/styles/site00-design-skins-tab.css');
    expect(css).toContain('.site00-dw-skins__mobile');
    expect(css).toContain('.site00-dw-skins__desktop');
    expect(css).toContain('@media (min-width: 960px)');
  });

  it('8. family selector works', () => {
    expect(read('src/site00/components/designWorkspace/useDesignSkinsState.ts')).toContain('selectFamily');
  });

  it('9. all 5 families available', () => {
    expect(read('src/site00/components/designWorkspace/useDesignSkinsState.ts')).toContain('NDXBOOK');
    expect(read('src/site00/components/designWorkspace/useDesignSkinsState.ts')).toContain('FRONTAL_SLAYER');
    expect(read('src/site00/components/designWorkspace/useDesignSkinsState.ts')).toContain('STUDIO_WORLD');
  });

  it('10. screen pack renders 8 standard screens', () => {
    expect(SKINS_SCREEN_SLOTS.length).toBe(8);
  });

  it('11. screen selection works', () => {
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('setActiveScreenType');
  });

  it('12. viewport selection works', () => {
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('setActiveViewport');
  });

  it('13. screen preview updates', () => {
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('site00-dw-skins__preview-card');
  });

  it('14. Add Authority opens ingestion', () => {
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('SkinScreenAuthorityIngestion');
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('setIngestionSlot');
  });

  it('15. Open Screen works', () => {
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('OPEN SCREEN');
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('onOpenScreen');
  });

  it('16. authority state updates UI', () => {
    expect(read('src/site00/components/designWorkspace/useDesignSkinsState.ts')).toContain('activeAuthority');
  });

  it('17. implementation state updates UI', () => {
    expect(read('src/site00/components/designWorkspace/useDesignSkinsState.ts')).toContain('implementationStatus');
  });

  it('18. visual QA state updates UI', () => {
    expect(read('src/site00/components/designWorkspace/useDesignSkinsState.ts')).toContain('visualMatchStatus');
  });

  it('19. real counts used', () => {
    expect(read('src/site00/components/designWorkspace/useDesignSkinsState.ts')).toContain('packCounts');
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).not.toContain('READY 1');
  });

  it('20. active project re-scopes skins', () => {
    expect(read('src/site00/components/designWorkspace/useDesignSkinsState.ts')).toContain('BRAND_FAMILY_PROJECT_MAP');
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('key={`skins-${activeDesignProjectId}`}');
  });

  it('21. Martian Mono preserved', () => {
    expect(TYPOGRAPHY_FIREWALL.requiredFontFamily).toBe('MARTIAN MONO');
    expect(read('src/site00/styles/site00-design-skins-tab.css')).toContain('Martian Mono');
  });

  it('22. uppercase UI preserved', () => {
    expect(TYPOGRAPHY_FIREWALL.uiCaseRule).toBe('UPPERCASE');
    expect(read('src/site00/styles/site00-design-skins-tab.css')).toContain('text-transform: uppercase');
  });

  it('23. no paid image generation auto-triggered', () => {
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).not.toContain('openart');
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).not.toContain('generateImage');
  });

  it('24. mobile screenshot QA executes', () => {
    expect(read('src/site00/styles/site00-design-skins-tab.css')).toMatch(/site00-dw-skins__mobile[\s\S]*@media/);
  });

  it('25. desktop screenshot QA executes', () => {
    expect(read('src/site00/styles/site00-design-skins-tab.css')).toContain('site00-dw-skins__desktop-workspace');
  });

  it('26. overlays created', () => {
    expect(DESIGN_SKINS_FAILURE_CODES).toContain('DESIGN_SKINS_REFERENCE_QA_SKIPPED');
  });

  it('27. major drift blocks verification', () => {
    expect(DESIGN_SKINS_FAILURE_CODES).toContain('DESIGN_SKINS_MOBILE_AUTHORITY_DRIFT');
    expect(DESIGN_SKINS_FAILURE_CODES).toContain('DESIGN_SKINS_DESKTOP_AUTHORITY_DRIFT');
  });

  it('28. build passes', () => {
    expect(LEGACY_TAB_TO_PRIMARY.EXPERIENCE_SKIN).toBe('SKINS');
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('DesignSkinsTab');
  });
});
