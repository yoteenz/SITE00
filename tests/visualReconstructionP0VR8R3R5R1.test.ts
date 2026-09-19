/**
 * P0.VR.8R3R5R1 — True wizard workspace + single-screen task orchestration.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ASSETS_WIZARD_STEPS,
  MORE_CATEGORIES,
  normalizePagesWizardStep,
  P0_VR_8R3R5R1_BUILD,
  PAGES_WIZARD_STEPS,
  pagesWizardStepIndex,
  resolvePagesWizardResumeStep,
  SKINS_WIZARD_STEPS,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3r1/designWizardSteps.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const baseInput = {
  apiConnected: true,
  workerHealthy: true,
  browserReady: true,
  contractValid: true,
  testJobPassed: false,
  testingWorker: false,
  testWorkerFailed: false,
  isRefreshing: false,
  run: null,
  summary: {
    totalPages: 46,
    current: 0,
    neverCaptured: 46,
    queued: 0,
    capturing: 0,
    failed: 0,
    stale: 0,
  },
  projectName: 'NDXBOOK',
};

describe('P0.VR.8R3R5R1 — Wizard workspace', () => {
  it('1. build v264', () => {
    expect(P0_VR_8R3R5R1_BUILD).toBe('v264');
  });

  it('2. DesignTaskWizardShell exists', () => {
    expect(read('src/site00/components/designWorkspace/wizard/DesignTaskWizardShell.tsx')).toContain('DesignTaskWizardShell');
  });

  it('3. one active step shell — no stage stacking markup', () => {
    const shell = read('src/site00/components/designWorkspace/wizard/DesignTaskWizardShell.tsx');
    expect(shell).toContain('site00-dw-wizard__primary');
    expect(shell).not.toContain('site00-founder-capture__summary');
  });

  it('4. DesignDetailsDrawer overlay not inline expand', () => {
    const drawer = read('src/site00/components/designWorkspace/wizard/DesignDetailsDrawer.tsx');
    expect(drawer).toContain('createPortal');
    expect(drawer).toContain('site00-dw-wizard-drawer');
  });

  it('5. pages default to family workspace not capture landing', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain('DEFAULT_PAGES_WIZARD_STEP');
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain('PageFamilyWorkspace');
  });

  it('6. service check step', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("'service-check'");
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain('CAPTURE SYSTEM');
  });

  it('7. test worker step', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("'test-worker'");
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain('TestWorkerVisual');
  });

  it('8. capture setup step', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("'capture-setup'");
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain('START CAPTURE');
  });

  it('9. capture running step', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("'capture-running'");
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain('RUN IN BACKGROUND');
  });

  it('10. capture results step', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("'capture-results'");
  });

  it('11. page library separate screen', () => {
    const wizard = read('src/site00/components/designWorkspace/DesignPagesWizard.tsx');
    expect(wizard).toContain('PAGE LIBRARY');
    expect(wizard).not.toContain('FounderCaptureExperience');
  });

  it('12. page detail screen', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("case 'detail'");
  });

  it('13. compare screen', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("case 'compare'");
  });

  it('14. assets wizard one step', () => {
    const assets = read('src/site00/components/designWorkspace/DesignAssetsWizard.tsx');
    expect(assets).toContain('DesignTaskWizardShell');
    expect(assets).toContain('wizardStep={activeStep}');
  });

  it('15. skins wizard one step', () => {
    expect(read('src/site00/components/designWorkspace/DesignSkinsWizard.tsx')).toContain('DesignTaskWizardShell');
  });

  it('16. more category landing', () => {
    const more = read('src/site00/components/designWorkspace/DesignMoreTab.tsx');
    expect(more).toContain('DesignMoreSystemHub');
    expect(more).not.toContain('MasterSkinEvolveProofPanel');
    expect(more).not.toContain('DesignReferenceReconstructionInspector');
  });

  it('17. route audit moved to more', () => {
    const workspace = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(workspace).not.toContain('DesignRouteAuditRecoveryInspector');
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('DesignMoreRouteAuditPage');
  });

  it('18. mobile drawer', () => {
    expect(read('src/site00/styles/site00-design-wizard.css')).toContain('align-items: flex-end');
  });

  it('19. desktop drawer', () => {
    expect(read('src/site00/styles/site00-design-wizard.css')).toContain('min-width: 900px');
  });

  it('20. auto advance capture running', () => {
    const resumed = resolvePagesWizardResumeStep(undefined, {
      ...baseInput,
      isRefreshing: true,
      run: {
        status: 'CAPTURING',
        contractValid: true,
        totalTargets: 46,
        completedCount: 12,
        failedCount: 0,
        capturingCount: 1,
        queuedCount: 33,
      },
    });
    expect(resumed).toBe('capture-running');
  });

  it('21. workflow resume from URL step', () => {
    expect(normalizePagesWizardStep('test-worker')).toBe('test-worker');
    expect(resolvePagesWizardResumeStep('library', baseInput)).toBe('library');
  });

  it('22. one primary CTA in shell', () => {
    expect(read('src/site00/components/designWorkspace/wizard/DesignTaskWizardShell.tsx')).toContain('site00-dw-wizard__primary');
  });

  it('23. no raw diagnostics in pages primary', () => {
    const wizard = read('src/site00/components/designWorkspace/DesignPagesWizard.tsx');
    expect(wizard).not.toContain('workerId');
    expect(read('src/site00/components/designWorkspace/wizard/DesignTaskWizardShell.tsx')).toContain('DesignDetailsDrawer');
  });

  it('24. details drawer not inline details expand on landing', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).not.toContain('<details className="site00-founder-capture__details"');
  });

  it('25. mobile viewport wizard host', () => {
    expect(read('src/site00/styles/site00-design-wizard.css')).toContain('site00-dw-wizard-host');
  });

  it('26. desktop task focus layout', () => {
    expect(read('src/site00/styles/site00-design-wizard.css')).toContain('site00-dw-wizard__rail');
  });

  it('27. disclosure hidden on wizard tabs', () => {
    const workspace = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(workspace).toContain("primaryTab === 'REFERENCES' || primaryTab === 'HISTORY'");
  });

  it('28. pages wizard steps inventory', () => {
    expect(PAGES_WIZARD_STEPS).toContain('landing');
    expect(PAGES_WIZARD_STEPS).toContain('compare');
    expect(pagesWizardStepIndex('service-check')).toBe(1);
  });

  it('29. assets and skins step inventories', () => {
    expect(ASSETS_WIZARD_STEPS.length).toBe(7);
    expect(SKINS_WIZARD_STEPS.length).toBe(6);
  });

  it('30. more categories inventory', () => {
    expect(MORE_CATEGORIES).toContain('route-audit');
    expect(MORE_CATEGORIES).toContain('capture');
  });

  it('31. URL state pagesStep', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr6/designWorkspacePrimaryUrlState.ts')).toContain('pagesStep');
  });

  it('32. global capture pill', () => {
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('site00-dw-wizard-capture-pill');
  });
});
