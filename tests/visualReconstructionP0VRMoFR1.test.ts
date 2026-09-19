/**
 * P0.VR.MOF.R1 — System & Settings tab visual convergence.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { P0_VR_MOF_R1_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/client.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.MOF.R1 — System hub landing', () => {
  it('1. build v265', () => {
    expect(P0_VR_MOF_R1_BUILD).toBe('v265');
  });

  it('2. DesignMoreSystemHub component', () => {
    expect(read('src/site00/components/designWorkspace/DesignMoreSystemHub.tsx')).toContain('DesignMoreSystemHub');
  });

  it('3. hero block with ring motif', () => {
    const hub = read('src/site00/components/designWorkspace/DesignMoreSystemHub.tsx');
    expect(hub).toContain('site00-dw-more-hub__hero');
    expect(hub).toContain('SYSTEM');
    expect(hub).toContain('SETTINGS');
  });

  it('4. primary tool grid with status cues', () => {
    const hub = read('src/site00/components/designWorkspace/DesignMoreSystemHub.tsx');
    expect(hub).toContain('site00-dw-more-hub__grid');
    expect(hub).toContain('NEEDS ATTENTION');
    expect(hub).toContain('PROVIDERS');
    expect(hub).toContain('CAPTURE');
  });

  it('5. recommended capture action', () => {
    expect(read('src/site00/components/designWorkspace/DesignMoreSystemHub.tsx')).toContain('TEST CAPTURE WORKER');
    expect(read('src/site00/components/designWorkspace/DesignMoreSystemHub.tsx')).toContain('OPEN CAPTURE');
  });

  it('6. secondary summary tiles', () => {
    const hub = read('src/site00/components/designWorkspace/DesignMoreSystemHub.tsx');
    expect(hub).toContain('RECENT ACTIVITY');
    expect(hub).toContain('SYSTEM STATUS');
  });

  it('7. hub CSS matches control-room direction', () => {
    const css = read('src/site00/styles/site00-design-more-hub.css');
    expect(css).toContain('site00-dw-more-hub__recommended');
    expect(css).toContain('grid-template-columns: repeat(2');
  });

  it('8. DesignMoreTab uses hub not generic wizard shell on landing', () => {
    const tab = read('src/site00/components/designWorkspace/DesignMoreTab.tsx');
    expect(tab).toContain('DesignMoreSystemHub');
    expect(tab).not.toContain('DesignTaskWizardShell\n          stepTitle="MORE"');
  });

  it('9. capture health wired from workspace', () => {
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('captureRefresh={captureRefresh}');
  });

  it('10. module detail routes preserved', () => {
    const tab = read('src/site00/components/designWorkspace/DesignMoreTab.tsx');
    expect(tab).toContain("activeCategory === 'providers'");
    expect(tab).toContain("activeCategory === 'capture'");
    expect(tab).toContain("activeCategory === 'route-audit'");
  });

  it('11. no long stacked panels on landing', () => {
    const tab = read('src/site00/components/designWorkspace/DesignMoreTab.tsx');
    const landingSection = tab.split("activeCategory === 'landing'")[1]?.split('if (activeCategory')[0] ?? '';
    expect(landingSection).not.toContain('MasterSkinEvolveProofPanel');
    expect(landingSection).not.toContain('DesignReferenceReconstructionInspector');
  });

  it('12. footer build stamp', () => {
    expect(read('src/site00/components/designWorkspace/DesignMoreSystemHub.tsx')).toContain('SITE 00 — DESIGN RECONSTRUCTION');
  });
});
