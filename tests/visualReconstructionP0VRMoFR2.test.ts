/**
 * P0.VR.MOF.R2 — MORE child-page visual system + wizardized subroutes.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { P0_VR_MOF_R2_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/constants.js';
import { captureNeedsAttention } from '../src/site00/components/designWorkspace/more/moreStatus.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.MOF.R2 — MORE child tool pages', () => {
  it('1. build v266', () => {
    expect(P0_VR_MOF_R2_BUILD).toBe('v266');
  });

  it('2. MoreToolPageShell component', () => {
    expect(read('src/site00/components/designWorkspace/more/MoreToolPageShell.tsx')).toContain('MoreToolPageShell');
  });

  it('3. MoreStatusHero shared visual', () => {
    expect(read('src/site00/components/designWorkspace/more/MoreStatusHero.tsx')).toContain('site00-dw-more-tool__hero');
  });

  it('4. MoreSummaryTile system', () => {
    expect(read('src/site00/components/designWorkspace/more/MoreSummaryTile.tsx')).toContain('MoreSummaryTile');
  });

  it('5. details drawer via DesignDetailsDrawer', () => {
    expect(read('src/site00/components/designWorkspace/more/MoreToolPageShell.tsx')).toContain('DesignDetailsDrawer');
  });

  it('6. capture child uses human-first shell not raw inspector', () => {
    const tab = read('src/site00/components/designWorkspace/DesignMoreTab.tsx');
    expect(tab).toContain('DesignMoreCapturePage');
    expect(tab).not.toContain('DesignCaptureOrchestrationInspector');
  });

  it('7. capture raw data only in details content', () => {
    const capture = read('src/site00/components/designWorkspace/more/DesignMoreCapturePage.tsx');
    expect(capture).toContain('DesignCaptureDetailsContent');
    expect(capture).not.toContain('API BASE URL');
    const details = read('src/site00/components/designWorkspace/more/DesignCaptureDetailsContent.tsx');
    expect(details).toContain('API BASE URL');
    expect(details).toContain('TRANSPORT');
  });

  it('8. capture test worker flow', () => {
    expect(read('src/site00/components/designWorkspace/more/CaptureTestWorkerFlow.tsx')).toContain('TESTING CAPTURE WORKER');
    expect(read('src/site00/components/designWorkspace/more/DesignMoreCapturePage.tsx')).toContain('TEST WORKER');
  });

  it('9. system child page', () => {
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('DesignMoreSystemPage');
  });

  it('10. providers child page', () => {
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('DesignMoreProvidersPage');
  });

  it('11. route audit child not inline dump', () => {
    const tab = read('src/site00/components/designWorkspace/DesignMoreTab.tsx');
    expect(tab).toContain('DesignMoreRouteAuditPage');
    expect(tab).not.toContain('DesignRouteAuditRecoveryInspector');
    expect(read('src/site00/components/designWorkspace/more/DesignMoreRouteAuditPage.tsx')).not.toContain('PRIOR AUDIT FOUND');
  });

  it('12. storage child page', () => {
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('DesignMoreStoragePage');
  });

  it('13. automation child page', () => {
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('DesignMoreAutomationPage');
  });

  it('14. presets child page', () => {
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('DesignMorePresetsPage');
  });

  it('15. hub status consistency helper shared', () => {
    expect(read('src/site00/components/designWorkspace/DesignMoreSystemHub.tsx')).toContain("from './more/moreStatus'");
    expect(read('src/site00/components/designWorkspace/more/DesignMoreCapturePage.tsx')).toContain('captureNeedsAttention');
  });

  it('16. child back navigation', () => {
    expect(read('src/site00/components/designWorkspace/more/MoreToolPageShell.tsx')).toContain('BACK TO SYSTEM & SETTINGS');
  });

  it('17. raw diagnostics hidden by default on capture primary', () => {
    expect(read('src/site00/components/designWorkspace/more/DesignMoreCapturePage.tsx')).not.toContain('site00-dw-recovery-inspector');
  });

  it('18. no long definition-list wall on child primary views', () => {
    for (const file of [
      'DesignMoreCapturePage.tsx',
      'DesignMoreRouteAuditPage.tsx',
      'DesignMoreProvidersPage.tsx',
      'DesignMoreStoragePage.tsx',
    ]) {
      expect(read(`src/site00/components/designWorkspace/more/${file}`)).not.toContain('site00-dw-recovery-inspector__grid');
    }
  });

  it('19. one primary action per child shell', () => {
    expect(read('src/site00/components/designWorkspace/more/MoreToolPageShell.tsx')).toContain('primaryAction');
  });

  it('20. mobile-first CSS', () => {
    const css = read('src/site00/styles/site00-design-more-tool.css');
    expect(css).toContain('max-width: 520px');
    expect(css).toContain('grid-template-columns: repeat(2');
  });

  it('21. desktop visual hierarchy', () => {
    expect(read('src/site00/styles/site00-design-more-tool.css')).toContain('@media (min-width: 900px)');
  });

  it('22. test worker wired from workspace', () => {
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('onTestWorker={() => void testWorker()}');
  });

  it('23. hub child status agreement for degraded browser', () => {
    const attention = captureNeedsAttention({
      transportHealth: {
        apiReachable: true,
        workerStatus: 'HEALTHY',
        browserReady: false,
        playwrightReady: true,
        testJobPassed: false,
      } as never,
      testJobPassed: false,
    } as never);
    expect(attention).toBe(true);
  });

  it('24. tool page CSS imported', () => {
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('site00-design-more-tool.css');
  });
});
