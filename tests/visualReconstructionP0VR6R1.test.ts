/**
 * P0.VR.6R1 — Pixel-fidelity calibration + overlay diff recovery tests.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  P0_VR_6R1_LINEAGE,
  CALIBRATION_SCREEN_IDS,
  CALIBRATION_REFERENCE_BASE,
  CALIBRATION_SCREEN_META,
  CALIBRATION_CANVAS,
  referencePathForScreen,
  normalizeCanvasDimensions,
  buildReferenceDelta,
  buildScreenCalibrationScore,
  buildOverlayCapturePair,
  detectTextCollisions,
  textCollisionPasses,
  expectedDeltasForScreen,
  REFERENCE_COMPONENT_TARGETS,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r1/index.js';
import { P0_VR_6R1_FAILURE_CODES } from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r1/types.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.6R1 pixel-fidelity calibration', () => {
  it('1. all 11 calibration screens defined', () => {
    expect(P0_VR_6R1_LINEAGE).toBe('P0.VR.6R1');
    expect(CALIBRATION_SCREEN_IDS).toHaveLength(11);
    for (const id of CALIBRATION_SCREEN_IDS) {
      expect(CALIBRATION_SCREEN_META[id].referenceFile).toMatch(/\.jpg$/);
    }
  });

  it('2–3. reference paths exist and dimensions normalize', () => {
    for (const id of CALIBRATION_SCREEN_IDS) {
      const rel = referencePathForScreen(id).replace(/^\//, 'public/');
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }
    const norm = normalizeCanvasDimensions(1170, 2532, 390, 844);
    expect(norm.width).toBe(CALIBRATION_CANVAS.width);
    expect(norm.height).toBe(CALIBRATION_CANVAS.height);
  });

  it('4–5. delta reports and shell geometry targets', () => {
    expect(REFERENCE_COMPONENT_TARGETS.SHELL_ORB?.width).toBe(88);
    const delta = buildReferenceDelta({
      screenId: '09_PAGES',
      componentId: 'PAGES_FILTER_RAIL',
      reference: { width: 390, height: 28 },
      live: { width: 348, height: 28 },
      correction: 'EXPAND FILTER RAIL',
    });
    expect(delta.deltaWidth).toBe(-42);
    expect(delta.severity).toBe('HIGH');
  });

  it('6–8. overlay pair builder and stepper screen meta', () => {
    const pair = buildOverlayCapturePair({
      screenId: '01_ASSETS_UPLOAD',
      livePath: '/tmp/live.png',
    });
    expect(pair.referencePath).toContain(CALIBRATION_REFERENCE_BASE);
    expect(CALIBRATION_SCREEN_META['03_ASSETS_DETECT'].routeQuery).toContain('DETECT');
  });

  it('9–10. generic blue leakage removed from CSS; emoji removed from More tab', () => {
    const css = read('src/site00/styles/site00-design-workspace-v3.css');
    expect(css).not.toContain('#3b82f6');
    expect(css).not.toContain('#1976d2');
    const more = read('src/site00/components/designWorkspace/DesignMoreTab.tsx');
    expect(more).not.toMatch(/[⬡🛡📄✦🗄⚙⚡🚀]/);
    expect(more).toContain('DesignDwSectionIcon');
  });

  it('11–12. pages filter scroll + featured structure preserved', () => {
    const css = read('src/site00/styles/site00-design-workspace-v3.css');
    expect(css).toContain('.site00-dw-v3-chip-row--scroll');
    expect(css).toContain('flex-shrink: 0');
    expect(css).toContain('.site00-dw-v3-pages__featured');
    expect(css).toContain('min-height: 120px');
    const pages = read('src/site00/components/designWorkspace/DesignPagesTabPanel.tsx');
    expect(pages).toContain('site00-dw-v3-pages__compare');
  });

  it('13–14. page cards aspect + history timeline geometry', () => {
    const css = read('src/site00/styles/site00-design-workspace-v3.css');
    expect(css).toContain('aspect-ratio: 9/16');
    expect(css).toContain('.site00-dw-v3-timeline__body');
    const history = read('src/site00/components/designWorkspace/DesignHistoryTab.tsx');
    expect(history).toContain('site00-dw-v3-timeline__body');
  });

  it('15–16. more provider collision fix + naming pattern overflow', () => {
    const css = read('src/site00/styles/site00-design-workspace-v3.css');
    expect(css).toContain('.site00-dw-v3-more__provider-role');
    expect(css).toContain('.site00-dw-v3-more__rule-value');
    expect(css).toContain('text-overflow: ellipsis');
  });

  it('17–18. text collision QA passes for non-colliding nodes', () => {
    const findings = detectTextCollisions([
      {
        selector: '.a',
        rect: { left: 0, top: 0, right: 50, bottom: 10, width: 50, height: 10 },
        scrollWidth: 50,
        clientWidth: 50,
        text: 'A',
      },
      {
        selector: '.b',
        rect: { left: 60, top: 0, right: 100, bottom: 10, width: 40, height: 10 },
        scrollWidth: 40,
        clientWidth: 40,
        text: 'B',
      },
    ]);
    expect(textCollisionPasses(findings)).toBe(true);
  });

  it('19. empty state geometry — reference add tile exists', () => {
    const refs = read('src/site00/components/designWorkspace/DesignReferencesTab.tsx');
    expect(refs).toContain('site00-dw-v3-ref-card--add');
  });

  it('20–21. capture script exists; failure codes registered', () => {
    expect(existsSync(join(ROOT, 'scripts/capture-design-workspace-calibration.mjs'))).toBe(true);
    expect(P0_VR_6R1_FAILURE_CODES).toContain('REFERENCE_ICON_SUBSTITUTION');
    expect(P0_VR_6R1_FAILURE_CODES).toContain('REFERENCE_FILTER_CLIPPING');
  });

  it('22. calibration score from expected deltas', () => {
    const score = buildScreenCalibrationScore({
      screenId: '11_MORE',
      deltas: [],
    });
    expect(score.overallStatus).toBe('HIGH_MATCH');
    expect(score.numericScore).toBeNull();
    const withDrift = expectedDeltasForScreen('09_PAGES', {
      PAGES_FILTER_RAIL: { width: 300, height: 28 },
    });
    expect(withDrift.length).toBeGreaterThan(0);
  });
});
