/**
 * P0.VR.DESIGN-INTERACTION-COVERAGE1 — interaction registry coverage guard.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  DESIGN_INTERACTION_HANDLER_ALLOWLIST,
  DESIGN_INTERACTION_REGISTRY,
} from '../shared/site00-design-workspace-production/designInteractionRegistry.js';

const ROOT = join(import.meta.dirname, '..');
const allow = new Set<string>(DESIGN_INTERACTION_HANDLER_ALLOWLIST);

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-INTERACTION-COVERAGE1', () => {
  it('maps every registry entry to an allowed handler or readonly', () => {
    for (const entry of DESIGN_INTERACTION_REGISTRY) {
      expect(entry.id.length).toBeGreaterThan(0);
      if (entry.readonly) {
        expect(entry.handler).toBe('readonly');
        continue;
      }
      expect(allow.has(entry.handler), `${entry.id} → ${entry.handler}`).toBe(true);
    }
  });

  it('wires hero rail, gallery, and fullscreen in workspace + views', () => {
    const workspace = read('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
    expect(workspace).toContain('openCompareConcepts');
    expect(workspace).toContain('runContextualNextAction');
    expect(workspace).toContain('selectForMobile');
    const canonical = read('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
    expect(canonical).toContain('openCompareConcepts');
    expect(canonical).toContain('openStructuredArtifact');
    expect(canonical).toContain('data-interaction-id');
    const production = read('src/site00/components/designBench/opusDirect/useTwinOpusDirectProduction.ts');
    expect(production).toContain('openFullscreenArtifact');
    expect(production).toContain('OV-FULLSCREEN-ARTIFACT');
  });

  it('includes viewport authority transitions', () => {
    const transitions = read('shared/site00-design-workspace-production/designProductionTransitions.ts');
    expect(transitions).toContain('transitionSelectViewportCandidate');
    expect(transitions).toContain('transitionPromoteViewportMaster');
  });

  it('registry inventory is non-empty', () => {
    expect(DESIGN_INTERACTION_REGISTRY.length).toBeGreaterThanOrEqual(40);
  });
});
