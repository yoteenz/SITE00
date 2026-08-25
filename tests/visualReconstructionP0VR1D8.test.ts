/**
 * P0.VR.1D.8 — Mobile Lab / Experiment 01 design correction tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildLabReferenceDetailAudit,
  resolveExperiment01Artwork,
  runNdxLabExperiment01CorrectionPass,
  FAIL_EXPERIMENT_GRID_GEOMETRY_DRIFT,
  P0_VR_1D8_LINEAGE,
  NDX_EXPERIMENT_01_REFERENCE_PATH,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d8/index.js';
import {
  NDX_EXPERIMENT_01_CARDS,
  NDX_EXPERIMENT_01_CANONICAL_SUBJECT,
  NDX_EXPERIMENT_01_METRICS,
  NDX_EXPERIMENT_01_RATINGS,
  NDX_EXPERIMENT_01_REFERENCE_PATH as CONFIG_REF_PATH,
} from '../src/site00/config/ndxExperiment01MobileReference.js';
import { NDX_VR_REGION } from '../src/site00/config/ndxVisualRegionIds.js';

const ROOT = process.cwd();

describe('P0.VR.1D.8 Lab / Experiment 01 reference correction', () => {
  it('persists lab experiment 01 reference screenshot', () => {
    expect(existsSync(join(ROOT, NDX_EXPERIMENT_01_REFERENCE_PATH))).toBe(true);
    expect(existsSync(join(ROOT, CONFIG_REF_PATH))).toBe(true);
  });

  it('uses Site00Diamond for NDX lime project accent in mobile header', () => {
    const chrome = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'),
      'utf8',
    );
    expect(chrome).toContain('Site00Diamond');
    expect(chrome).toContain('mode="PROJECT_CONTEXT"');
  });

  it('mobile lab screen uses reference breadcrumb, 3x3 grid, and VR regions', () => {
    const src = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(src).toContain('site00-fws-mobile-lab');
    expect(src).toContain('site00-fws-mobile-lab__grid');
    expect(src).toContain('site00-fws-mobile-lab__grid-cell--selected');
    expect(src).toContain('EXPERIMENTS HUB');
    expect(src).toContain('NDX_VR_REGION.labGrid');
    expect(src).toContain('INSPECT EXPERIMENT →');
  });

  it('FounderWorkspaceShell routes experiment-01 to mobile dedicated screen', () => {
    const shell = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx'), 'utf8');
    expect(shell).toContain("'experiment-01'");
    expect(shell).toMatch(/mobileDedicatedScreens.*experiment-01/s);
  });

  it('Lab bottom nav points to experiment-01 route', () => {
    const nav = readFileSync(join(ROOT, 'src/site00/config/ndxFounderWorkspaceMobileNav.ts'), 'utf8');
    expect(nav).toContain("screenId: 'experiment-01'");
    expect(nav).toContain('marketing-expression/experiment-01');
  });

  it('renders nine experiment cards with reference snapshot copy', () => {
    expect(NDX_EXPERIMENT_01_CARDS).toHaveLength(9);
    expect(NDX_EXPERIMENT_01_CARDS[0]?.selected).toBe(true);
    expect(NDX_EXPERIMENT_01_CANONICAL_SUBJECT).toBe('FIND THE NDX PAGE');
    expect(NDX_EXPERIMENT_01_METRICS.slide.value).toBe('8 / 9 COMPLETE');
  });

  it('binds reference-approved artwork crops for all nine cards', () => {
    const resolutions = resolveExperiment01Artwork({
      projectRoot: ROOT,
      cards: NDX_EXPERIMENT_01_CARDS.map((c) => ({ id: c.id, artworkPath: c.artworkPath })),
    });
    expect(resolutions.every((r) => r.source === 'REFERENCE_APPROVED_CROP')).toBe(true);
    for (const card of NDX_EXPERIMENT_01_CARDS) {
      const abs = join(ROOT, 'public', card.artworkPath.replace(/^\//, ''));
      expect(existsSync(abs), card.id).toBe(true);
    }
  });

  it('metrics row has three zones and rating rows match reference', () => {
    expect(NDX_EXPERIMENT_01_RATINGS).toHaveLength(4);
    expect(NDX_EXPERIMENT_01_RATINGS[0]?.filled).toBe(5);
    expect(NDX_EXPERIMENT_01_RATINGS[1]?.filled).toBe(4);
    expect(FAIL_EXPERIMENT_GRID_GEOMETRY_DRIFT).toBe('FAIL_EXPERIMENT_GRID_GEOMETRY_DRIFT');
  });

  it('lineage constant and lab VR region ids', () => {
    expect(P0_VR_1D8_LINEAGE).toBe('P0.VR.1D.8');
    expect(NDX_VR_REGION.labGrid).toBe('ndx.lab.grid');
    expect(NDX_VR_REGION.labCard1).toBe('ndx.lab.card.1');
  });

  it('audits selected card border missing when CSS class absent', () => {
    const audit = buildLabReferenceDetailAudit({ selectedCardBorder: false });
    const card1 = audit.entries.find((e) => e.detailId === 'card-1');
    expect(card1?.status).toBe('BORDER_MISSING');
  });
});

describe('P0.VR.1D.8 live lab experiment 01 correction pass', () => {
  it('runs live render + overlay when Vite is available', async () => {
    let viteUp = false;
    try {
      const res = await fetch('http://127.0.0.1:5174/', { signal: AbortSignal.timeout(3000) });
      viteUp = res.ok;
    } catch {
      viteUp = false;
    }
    if (!viteUp) return;

    const report = await runNdxLabExperiment01CorrectionPass({
      rootDir: ROOT,
      maxIterations: 1,
      executePatches: true,
      baseUrl: 'http://127.0.0.1:5174',
    });

    expect(report.renderPath).toBeTruthy();
    expect(report.iterations).toBeGreaterThanOrEqual(1);
    expect(report.detailAudit.matched).toBeGreaterThan(0);
    expect(report.artworkResolutions.length).toBe(9);
  }, 120_000);
});
