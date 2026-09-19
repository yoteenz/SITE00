/**
 * P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 — one overlay grammar for DESIGN.
 *
 * The sprint's failure mode is silent: a panel keeps working while it drifts
 * back into a wall of labels, or a status chip paints a hard stop green. These
 * guards fix the parts of that which are checkable without a browser; the rest
 * is covered by the capture harness in scripts/design-bench/workspace-system1.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { DESIGN_CHILD_SURFACE_PLACEMENT } from '../shared/site00-design-workspace-production/childSurfacePresentation.js';
import { overlayTone } from '../src/site00/components/designBench/production/designOverlayKit';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 status tone', () => {
  it('reads negative states as negative', () => {
    for (const value of ['BLOCKED', 'BLOCKED_NO_PAGE_CONCEPT', 'FAILED', 'REJECTED', 'MISSING']) {
      expect(overlayTone(value)).toBe('blocked');
    }
  });

  /** BLOCKED contains LOCKED; an unanchored match painted every blocker green. */
  it('does not read BLOCKED as LOCKED', () => {
    expect(overlayTone('BLOCKED')).not.toBe(overlayTone('LOCKED'));
    expect(overlayTone('LOCKED')).toBe('ok');
    expect(overlayTone('AUTHORITY PAIR LOCKED')).toBe('ok');
  });

  it('does not read a negated state as its positive', () => {
    expect(overlayTone('NOT_PROMOTED')).toBe('blocked');
    expect(overlayTone('PROMOTED')).toBe('ok');
  });

  it('separates not-applicable from blocked', () => {
    expect(overlayTone('NOT_APPLICABLE')).toBe('na');
    expect(overlayTone('NOT STARTED')).toBe('na');
    expect(overlayTone('N/A')).toBe('na');
  });

  it('maps the remaining production vocabularies', () => {
    expect(overlayTone('PASS')).toBe('ok');
    expect(overlayTone('COMPLETED')).toBe('ok');
    expect(overlayTone('ACTIVE')).toBe('active');
    expect(overlayTone('STAGED')).toBe('active');
    expect(overlayTone('PENDING')).toBe('warn');
    expect(overlayTone('OPTIONAL')).toBe('warn');
    expect(overlayTone('')).toBe('idle');
    expect(overlayTone(null)).toBe('idle');
  });
});

describe('P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 overlay inventory', () => {
  it('gives every rendered overlay a placement', () => {
    const overlays = read('src/site00/components/designBench/opusDirect/TwinOpusDirectOverlays.tsx');
    const ids = new Set(Array.from(overlays.matchAll(/overlayId="(OV-[A-Z-]+)"/g), (m) => m[1]));
    expect(ids.size).toBeGreaterThan(10);
    for (const id of ids) {
      expect(DESIGN_CHILD_SURFACE_PLACEMENT[id], `${id} has no placement`).toBeTruthy();
    }
  });

  it('gives RESOLVE BLOCKER its own surface rather than reusing the receipt', () => {
    expect(DESIGN_CHILD_SURFACE_PLACEMENT['OV-RESOLVE-BLOCKER']?.mode).toBe('DRAWER');
    const panels = read(
      'src/site00/components/designBench/production/designProductionOverlayPanels.tsx',
    );
    expect(panels).toContain('ResolveBlockerPanel');
  });

  it('builds overlay bodies from the shared kit', () => {
    const panels = read(
      'src/site00/components/designBench/production/designProductionOverlayPanels.tsx',
    );
    expect(panels).toContain("from './designOverlayKit'");
    expect(panels).toContain('OverlayBody');
    expect(panels).toContain('OverlaySection');
  });
});

describe('P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 agent surfaces', () => {
  it('keeps the agent consoles on a designed paper shell, not a black terminal', () => {
    // OPUS-AI-CONSOLES1 owns the three agent surfaces; this only guards that
    // they stay on that shell's paper palette rather than drifting back to the
    // dark console the docks used to be.
    const shell = read('src/site00/styles/site00-ai-consoles.css');
    expect(shell).toContain('background: var(--aic-paper)');

    const legacy = read('src/site00/styles/site00-design-agent.css');
    expect(legacy).not.toMatch(/background:\s*#0a0a0a/);
  });

  it('labels the agent launchers instead of using single letters', () => {
    const opus = read('src/site00/components/designBench/designAgent/DesignAgentDockContext.tsx');
    const grokButton = read(
      'src/site00/components/designBench/designAgent/DesignGrokDockContext.tsx',
    );
    expect(opus).toContain('tod-agent-iconBtn__label');
    expect(grokButton).toContain('tod-agent-iconBtn__label');
  });

  it('renders every agent surface through one shared shell', () => {
    for (const rel of [
      'src/site00/components/designBench/designAgent/DesignAgentDock.tsx',
      'src/site00/components/designBench/designAgent/DesignGrokDock.tsx',
      'src/site00/components/designBench/opusDirect/ViewportAuthorityEditor.tsx',
    ]) {
      expect(read(rel)).toContain('AiConsoleShell');
    }
  });
});

describe('P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 responsive placement', () => {
  it('widens desktop overlays after the base placements, not before', () => {
    const css = read('src/site00/styles/site00-design-child-surface.css');
    const base = css.indexOf('.tod-dcs--modal {');
    const wide = css.indexOf('@media (min-width: 1100px)');
    expect(base).toBeGreaterThan(-1);
    expect(wide).toBeGreaterThan(base);
  });

  it('turns desktop drawers into bottom sheets on a phone', () => {
    const css = read('src/site00/styles/site00-design-child-surface.css');
    expect(css).toContain('@media (max-width: 720px)');
  });
});
