/**
 * P0.VR.DESIGN-INHERITANCE1 — child surface shell inheritance.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  DESIGN_CHILD_SURFACE_PLACEMENT,
  childSurfaceInheritance,
} from '../shared/site00-design-workspace-production/childSurfacePresentation.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-INHERITANCE1', () => {
  it('defaults child inheritance flags to true', () => {
    const contract = childSurfaceInheritance('DRAWER');
    expect(contract.inheritsShell).toBe(true);
    expect(contract.inheritsTypography).toBe(true);
    expect(contract.inheritsProjectContext).toBe(true);
    expect(contract.parentSurface).toBe('design-production-workspace');
  });

  it('maps overlay placement per sprint audit', () => {
    expect(DESIGN_CHILD_SURFACE_PLACEMENT['OV-READINESS-RECEIPT']?.mode).toBe('DRAWER');
    expect(DESIGN_CHILD_SURFACE_PLACEMENT['OV-PAIR-REVIEW']?.mode).toBe('WORKSPACE');
    expect(DESIGN_CHILD_SURFACE_PLACEMENT['OV-SPEND-CONFIRM']?.mode).toBe('MODAL');
    expect(DESIGN_CHILD_SURFACE_PLACEMENT['OV-PROVENANCE']?.mode).toBe('DRAWER');
  });

  it('renders overlays inside design root not document body portal', () => {
    const screen = read('src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx');
    expect(screen).not.toContain('createPortal');
    expect(screen).toContain('TwinOpusDirectOverlays');
    expect(screen).toContain('DesignChildSurfaceFrame');
    expect(screen).toContain('DesignProductionSectionInShell');
  });

  it('uses shared child surface frame in overlays', () => {
    const overlays = read('src/site00/components/designBench/opusDirect/TwinOpusDirectOverlays.tsx');
    expect(overlays).toContain('DesignChildSurfaceFrame');
    expect(overlays).toContain('ReadinessReceiptPanel');
    expect(overlays).toContain('tod-dcs-layer');
    expect(overlays).not.toContain('tod-ov--sheet');
  });

  it('keeps production workspace shell mounted for section routes', () => {
    const layout = read('src/site00/pages/DesignProductionWorkspacePage.tsx');
    expect(layout).toContain('DesignWorkspaceCore');
    expect(layout).not.toMatch(/activeSection\s*\?\s*\n\s*<Outlet/);
  });

  it('embeds section content without standalone child root', () => {
    const shell = read('src/site00/components/designBench/production/DesignProductionChildShell.tsx');
    expect(shell).toContain('useDesignProductionEmbedded');
    expect(shell).toContain('design-production-child-embedded');
  });
});
