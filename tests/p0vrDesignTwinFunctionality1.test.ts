/**
 * P0.VR.DESIGN-TWIN-FUNCTIONALITY1 — twin functional parity with production DESIGN.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  DESIGN_INTERACTION_HANDLER_ALLOWLIST,
  DESIGN_INTERACTION_REGISTRY,
} from '../shared/site00-design-workspace-production/designInteractionRegistry.js';
import {
  canPromoteTwinToProduction,
  TWIN_REVIEW_AUTHORITY_STATUS,
  twinFunctionalStatusBeforeApproval,
} from '../shared/site00-design-workspace-production/twinLifecycle.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-TWIN-FUNCTIONALITY1', () => {
  it('documents regression root cause — reference surface gated interactions', () => {
    const screen = read('src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx');
    expect(screen).not.toContain("surface === 'production'");
    expect(screen).not.toContain('surface="reference"');
    expect(screen).toContain('functionalWorkspace');
    expect(screen).toContain('twin-founder-review');
  });

  it('shares DesignWorkspaceCore between twin and production', () => {
    const twin = read('src/site00/pages/DesignTwinOpusDirectPage.tsx');
    const production = read('src/site00/pages/DesignProductionWorkspacePage.tsx');
    expect(twin).toContain('DesignWorkspaceCore');
    expect(production).toContain('DesignWorkspaceCore');
    expect(twin).toContain('twin-founder-review');
    expect(production).toContain('production-provisional');
  });

  it('exposes twin section routes for in-shell nav parity', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('DesignTwinWorkspaceLayout');
    expect(routes).toContain('path="history"');
    const paths = read('src/site00/config/routes.ts');
    expect(paths).toContain('site00ProjectDesignTwinSectionPath');
  });

  it('requires founder approval before promotion', () => {
    expect(twinFunctionalStatusBeforeApproval(TWIN_REVIEW_AUTHORITY_STATUS)).toBe('FULL');
    expect(canPromoteTwinToProduction({ twinStatus: TWIN_REVIEW_AUTHORITY_STATUS, founderApproved: false })).toBe(
      false,
    );
    expect(canPromoteTwinToProduction({ twinStatus: 'FOUNDER_APPROVED', founderApproved: true })).toBe(true);
  });

  it('parity — twin and production share the same interaction registry count', () => {
    const twinOnly = DESIGN_INTERACTION_REGISTRY.filter((e) => e.id.startsWith('twin-only-'));
    const productionOnly = DESIGN_INTERACTION_REGISTRY.filter((e) => e.id.startsWith('production-only-'));
    expect(twinOnly.length).toBe(0);
    expect(productionOnly.length).toBe(0);
    expect(DESIGN_INTERACTION_REGISTRY.length).toBeGreaterThanOrEqual(43);
    for (const entry of DESIGN_INTERACTION_REGISTRY) {
      if (entry.readonly) continue;
      expect(DESIGN_INTERACTION_HANDLER_ALLOWLIST.includes(entry.handler as never)).toBe(true);
    }
  });

  it('Opus dock mounts on twin via shared core', () => {
    const core = read('src/site00/components/designBench/production/DesignWorkspaceCore.tsx');
    expect(core).toContain('DesignAgentDock');
    expect(core).toContain('TwinOpusDirectScreen');
  });

  it('twin review banner replaces static reference copy', () => {
    const banner = read('src/site00/components/designBench/production/DesignTwinReviewBanner.tsx');
    expect(banner).toContain('TWIN REVIEW AUTHORITY');
    expect(banner).toContain('AWAITING FOUNDER APPROVAL');
    expect(banner).not.toContain('TWIN REFERENCE / QA');
  });
});
