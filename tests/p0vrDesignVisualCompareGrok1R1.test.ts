/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 — hero compare, agent row, Grok fixture pipeline guards.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  DESIGN_INTERACTION_REGISTRY,
  DESIGN_INTERACTION_HANDLER_ALLOWLIST,
} from '../shared/site00-design-workspace-production/designInteractionRegistry.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1', () => {
  it('removes redundant VIEW label and places Opus + Grok in the view row', () => {
    const control = read('src/site00/components/designBench/opusDirect/TwinOpusDirectViewModeControl.tsx');
    expect(control).not.toContain('tod-viewmode__label');
    expect(control).toContain('DesignWorkspaceAgentButtons');
    const agents = read('src/site00/components/designBench/opusDirect/DesignWorkspaceAgentButtons.tsx');
    expect(agents).toContain('view-row-opus');
    expect(agents).toContain('DesignGrokOpenButton');
    expect(read('src/site00/components/designBench/designAgent/DesignGrokDockContext.tsx')).toContain(
      'data-interaction-id="view-row-grok"',
    );
    expect(agents).toContain('aria-label="Design agents"');
  });

  it('removes header OPUS launcher (single view-row entry)', () => {
    const screen = read('src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx');
    expect(screen).not.toContain('DesignAgentOpenButton');
    const header = screen.slice(screen.indexOf('<header className="tod-header">'), screen.indexOf('</header>'));
    expect(header).not.toContain('OPUS');
  });

  it('registers view-row Grok handler on allowlist', () => {
    const grok = DESIGN_INTERACTION_REGISTRY.find((e) => e.id === 'view-row-grok');
    expect(grok?.handler).toBe('openGrokDock');
    expect(DESIGN_INTERACTION_HANDLER_ALLOWLIST).toContain('openGrokDock');
    const opus = DESIGN_INTERACTION_REGISTRY.find((e) => e.id === 'view-row-opus');
    expect(opus?.handler).toBe('openOpusDock');
    expect(DESIGN_INTERACTION_REGISTRY.some((e) => e.id === 'header-opus')).toBe(false);
  });

  it('hero is CURRENT | CONCEPT in both renderers', () => {
    const panel = read('src/site00/components/designBench/opusDirect/DesignHeroComparePanel.tsx');
    expect(panel).toContain('CURRENT');
    expect(panel).toContain('CONCEPT');
    expect(panel).toContain('assembly.capture.label');
    expect(panel).toContain('assembly.createFramework.label');
    expect(panel).toContain('assembly.generateAssets.label');
    expect(panel).toContain('hero-capture-screen');
    expect(panel).toContain('hero-create-framework');
    expect(panel).toContain('hero-generate-assets');
    const assembly = read('shared/site00-design-workspace-production/designHeroAssemblyActions.ts');
    expect(assembly).toContain("'CAPTURE SCREEN'");
    for (const view of [
      'src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx',
      'src/site00/components/designBench/opusDirect/TwinOpusDirectListView.tsx',
    ]) {
      expect(read(view)).toContain('DesignHeroComparePanel');
    }
    const workspace = read('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
    expect(workspace).toContain('heroCompare');
    expect(workspace).toContain('captureScreen');
    expect(workspace).toContain('openHeroCompareFullscreen');
    expect(workspace).toContain('useDesignPageCapture');
  });

  it('mounts Grok dock with fixture model (no live spend in sprint)', () => {
    const core = read('src/site00/components/designBench/production/DesignWorkspaceCore.tsx');
    expect(core).toContain('DesignGrokDockProvider');
    const screen = read('src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx');
    expect(screen).toContain('DesignGrokDock');
    const grok = read('src/site00/components/designBench/designAgent/DesignGrokDock.tsx');
    expect(grok).toContain('createFixtureGrokStagedAsset');
    expect(grok).toContain('approveGrokStagedAsset');
    expect(grok).not.toContain('fetch(');
  });

  it('persists page capture history module', () => {
    const cap = read('shared/site00-design-workspace-production/designPageCapture.ts');
    expect(cap).toContain('PageCaptureRecord');
    expect(cap).toContain('appendPageCapture');
  });
});
