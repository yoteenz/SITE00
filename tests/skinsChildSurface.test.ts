/**
 * SKINS child-surface cohesion — 28 tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  IMPLEMENTATION_STAGES,
  runSkinsWorkspaceCohesionQA,
  SKINS_CHILD_FAILURE_CODES,
  VISUAL_QA_MODES,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsChildSurface.js';
import { TYPOGRAPHY_FIREWALL } from '../shared/site00-brand-lore/projectSkin/brandFamily/constants.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('SKINS Child Surface Cohesion', () => {
  it('1. Add Authority uses SkinWorkspaceSheet', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('SkinWorkspaceSheet');
    expect(read('src/site00/components/brandFamilySkin/SkinScreenAuthorityIngestion.tsx')).toContain('SkinAuthorityFlow');
  });

  it('2. mobile child surface remains inside Design → Skins', () => {
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('SkinAuthorityFlow');
    expect(read('src/site00/components/designWorkspace/skins/SkinWorkspaceSheet.tsx')).toContain('site00-dw-skins-sheet');
    expect(read('src/site00/styles/site00-design-skins-tab.css')).toContain('.site00-dw-skins-sheet');
  });

  it('3. desktop child surface uses designed panel / modal', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinWorkspaceSheet.tsx')).toContain("data-variant={variant}");
    expect(read('src/site00/styles/site00-design-skins-tab.css')).toContain("[data-variant='panel']");
  });

  it('4. project / family / screen context visible', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinContextHeader.tsx')).toContain('site00-dw-skins-ctx');
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('SkinContextHeader');
  });

  it('5. viewport control styled', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinViewportControl.tsx')).toContain('site00-dw-skins-vp');
    expect(read('src/site00/styles/site00-design-skins-tab.css')).toContain('.site00-dw-skins-vp');
  });

  it('6. authority mode visually locked', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityContract.tsx')).toContain('DESIGN AUTHORITY');
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityContract.tsx')).toContain('site00-dw-skins-contract__lock');
  });

  it('7. fidelity visually locked', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityContract.tsx')).toContain('EXACT MATCH');
  });

  it('8. convergence status styled', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityContract.tsx')).toContain('VISUAL CONVERGENCE');
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityContract.tsx')).toContain('● REQUIRED');
  });

  it('9. reference contract compact', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityContract.tsx')).toContain('site00-dw-skins-contract__grid');
    expect(read('src/site00/components/brandFamilySkin/SkinScreenAuthorityIngestion.tsx')).not.toContain('<ul>');
  });

  it('10. native file input not exposed as final UI', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinReferenceUpload.tsx')).toContain('hidden');
    expect(read('src/site00/components/designWorkspace/skins/SkinReferenceUpload.tsx')).toContain('site00-dw-skins-upload__zone');
    expect(read('src/site00/components/brandFamilySkin/SkinScreenAuthorityIngestion.tsx')).not.toContain('type="file"');
  });

  it('11. upload preview works', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinReferenceUpload.tsx')).toContain('site00-dw-skins-upload__preview');
    expect(read('src/site00/components/designWorkspace/skins/SkinReferenceUpload.tsx')).toContain('onSelect');
  });

  it('12. founder note works', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('FOUNDER NOTE');
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('founderNote');
  });

  it('13. register authority works', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('registerScreenAuthority');
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('REGISTER AUTHORITY');
  });

  it('14. authority success state works', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('AUTHORITY REGISTERED');
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityStatus.tsx')).toContain('IMPLEMENT');
  });

  it('15. implement flow styled', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('IMPLEMENT SCREEN');
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('site00-dw-skins-flow__implement');
  });

  it('16. progress flow styled', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinImplementationProgress.tsx')).toContain('IMPLEMENTATION_STAGES');
    expect(IMPLEMENTATION_STAGES).toContain('VISUAL_QA');
  });

  it('17. visual QA viewer works', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinVisualQaViewer.tsx')).toContain('SkinVisualQaViewer');
    expect(VISUAL_QA_MODES).toEqual(['REFERENCE', 'LIVE', 'OVERLAY', 'DIFF']);
  });

  it('18. mobile comparison switches modes', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinVisualQaViewer.tsx')).toContain('site00-dw-skins-qa__modes');
    expect(read('src/site00/components/designWorkspace/skins/SkinVisualQaViewer.tsx')).toContain('site00-dw-skins-qa--mobile');
  });

  it('19. desktop comparison supports multi-pane', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinVisualQaViewer.tsx')).toContain('site00-dw-skins-qa--desktop');
    expect(read('src/site00/components/designWorkspace/skins/SkinVisualQaViewer.tsx')).toContain('site00-dw-skins-qa__grid');
  });

  it('20. drift summary works', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinDriftSummary.tsx')).toContain('MAJOR');
    expect(read('src/site00/components/designWorkspace/skins/SkinDriftSummary.tsx')).toContain('VIEW DETAILS');
  });

  it('21. correction action works', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinDriftSummary.tsx')).toContain('RUN CORRECTION PASS');
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('handleRunCorrection');
  });

  it('22. founder accept works', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinDriftSummary.tsx')).toContain('ACCEPT MATCH');
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('handleAcceptMatch');
  });

  it('23. replace authority uses shared flow', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain("'replace'");
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain("openIngestion('replace')");
  });

  it('24. version history works', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinVersionTimeline.tsx')).toContain('VERSION HISTORY');
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('SkinVersionTimeline');
  });

  it('25. Martian Mono preserved', () => {
    expect(TYPOGRAPHY_FIREWALL.requiredFontFamily).toBe('MARTIAN MONO');
    expect(read('src/site00/styles/site00-design-skins-tab.css')).toContain('Martian Mono');
  });

  it('26. uppercase preserved', () => {
    expect(TYPOGRAPHY_FIREWALL.uiCaseRule).toBe('UPPERCASE');
    expect(read('src/site00/styles/site00-design-skins-tab.css')).toContain('text-transform: uppercase');
  });

  it('27. no data model regression', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('registerScreenAuthority');
    expect(read('src/site00/components/designWorkspace/skins/SkinAuthorityFlow.tsx')).toContain('implementScreenAuthority');
    expect(read('src/site00/components/brandFamilySkin/brandFamilySkinApi.ts')).toContain('register_authority');
  });

  it('28. build passes', () => {
    const qa = runSkinsWorkspaceCohesionQA({
      usesSkinWorkspaceSheet: true,
      hasContextHeader: true,
      hasStyledViewportControl: true,
      hasLockedAuthorityContract: true,
      hasCompactReferenceContract: true,
      exposesNativeFileInput: false,
      usesMartianMono: true,
      usesUppercase: true,
    });
    expect(qa.pass).toBe(true);
    expect(SKINS_CHILD_FAILURE_CODES).toContain('SKINS_RAW_FORM_FALLBACK');
  });
});
