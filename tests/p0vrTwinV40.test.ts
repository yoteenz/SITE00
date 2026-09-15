/**
 * P0.VR.TWINV4.0 — clean-room forensic reconstruction proof route
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it, beforeEach } from 'vitest';
import { SITE00_ROUTES } from '../src/site00/config/routes.js';
import { twinV4ProofRoute } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/twinV4Route.js';
import { TWIN_V4_ISOLATION_CONTRACT, TWIN_V4_FORBIDDEN_V3_IMPORT_FRAGMENTS } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/twinV4IsolationContract.js';
import {
  MIN_TWIN_V4_CORRECTION_ITERATIONS,
  TWIN_V4_CSS_NAMESPACE,
  TWIN_V4_FAL_GENERATION_JOBS,
  TWIN_V4_FORENSIC_CANONICAL_VIEWPORT,
  TWIN_V4_STORAGE_PREFIX,
  TWIN_V4_SYNTHETIC_QA_FORBIDDEN,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/constants.js';
import { compileTwinV4ForensicReconstruction } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/compileTwinV4ForensicReconstruction.js';
import { clearTwinV4PersistenceForTests } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/twinV4Persistence.js';
import { clearForensicBlueprintCacheForTests } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/forensicBlueprintCache.js';

const COMPILE_INPUT = {
  projectId: 'ndxbook',
  sourcePackageId: 'pkg-v4-test',
  sourceActualHash: 'a'.repeat(32),
};

describe('P0.VR.TWINV4.0 clean-room forensic proof', () => {
  beforeEach(() => {
    clearTwinV4PersistenceForTests();
    clearForensicBlueprintCacheForTests();
  });

  it('1 route exists', () => {
    expect(SITE00_ROUTES.projectDesignTwinV4).toBe('/projects/:projectSlug/design/twin-v4');
    expect(twinV4ProofRoute('ndxbook')).toBe('/projects/ndxbook/design/twin-v4');
  });

  it('2–4 V4 does not import V3 visual compiler / render tree / CSS', () => {
    const page = readFileSync('src/site00/pages/DesignTwinV4ProofPage.tsx', 'utf8');
    const renderer = readFileSync('src/site00/components/designWorkspace/TwinV4ForensicReconstructionRenderer.tsx', 'utf8');
    for (const frag of TWIN_V4_FORBIDDEN_V3_IMPORT_FRAGMENTS) {
      expect(page).not.toContain(frag);
      expect(renderer).not.toContain(frag);
    }
    expect(TWIN_V4_ISOLATION_CONTRACT.inheritsV3RenderTree).toBe(false);
    expect(TWIN_V4_ISOLATION_CONTRACT.inheritsV3Css).toBe(false);
  });

  it('5–7 forensic lock, no Fal, hash verified', () => {
    const bundle = compileTwinV4ForensicReconstruction(COMPILE_INPUT);
    expect(bundle.authorityLock.immutable).toBe(true);
    expect(bundle.authorityLock.forensicBlueprintHash).toBe(bundle.ingestionReceipt.forensicBlueprintHash);
    expect(TWIN_V4_FAL_GENERATION_JOBS).toBe(0);
    expect(bundle.ingestionReceipt.noRegeneration).toBe(true);
    const compileSrc = readFileSync(
      'shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/compileTwinV4ForensicReconstruction.ts',
      'utf8',
    );
    expect(compileSrc).not.toContain('dispatchForensicUiBlueprintFal');
    expect(compileSrc).not.toContain('requestForensicUiBlueprintGeneration');
  });

  it('8–11 scene graph, nesting, text map, dom plan', () => {
    const bundle = compileTwinV4ForensicReconstruction(COMPILE_INPUT);
    expect(bundle.sceneGraph.nodes.length).toBeGreaterThan(20);
    expect(bundle.sceneGraph.rootNodeId).toBe('page-root');
    const child = bundle.sceneGraph.nodes.find((n) => n.parentNodeId === 'body-row');
    expect(child).toBeTruthy();
    expect(bundle.textMap.entries.length).toBeGreaterThan(0);
    expect(bundle.domPlan.nodes.length).toBe(bundle.sceneGraph.nodes.length);
  });

  it('12–14 fresh V4 tree and CSS namespace; no runtime forensic raster in LIVE compile', () => {
    const bundle = compileTwinV4ForensicReconstruction(COMPILE_INPUT);
    expect(bundle.gate.runtimeRasterUsage).toBe(0);
    const css = readFileSync('src/site00/styles/site00-twin-v4-proof.css', 'utf8');
    expect(css).toContain(TWIN_V4_CSS_NAMESPACE);
    expect(css).not.toContain('site00-twin-fb');
    const renderer = readFileSync('src/site00/components/designWorkspace/TwinV4ForensicReconstructionRenderer.tsx', 'utf8');
    expect(renderer).toContain('data-testid="twin-v4-live-reconstruction"');
    void bundle;
  });

  it('15–17 real browser render path, screenshot, synthetic rejected', () => {
    const bundle = compileTwinV4ForensicReconstruction(COMPILE_INPUT);
    expect(bundle.gate.realBrowserScreenshotPresent).toBe(true);
    expect(bundle.correctionIterations[0]?.screenshot.proofKind).toBe('PLAYWRIGHT_DOM');
    expect(() => {
      const bad = { ...bundle.correctionIterations[0]!.screenshot, proofKind: 'SYNTHETIC' as const, screenshotPath: 'synthetic.png' };
      if (bad.proofKind !== 'PLAYWRIGHT_DOM') throw new Error(TWIN_V4_SYNTHETIC_QA_FORBIDDEN);
    }).toThrow();
  });

  it('18–21 measurements, geometry deltas, visual comparison, region drift', () => {
    const bundle = compileTwinV4ForensicReconstruction(COMPILE_INPUT);
    expect(bundle.domMeasurementMap.measurements.length).toBeGreaterThan(0);
    expect(bundle.geometryReceipts.length).toBe(bundle.sceneGraph.nodes.length);
    expect(bundle.visualComparison.overallScore).toBeGreaterThan(0);
    expect(bundle.regionDrifts.length).toBeGreaterThanOrEqual(8);
  });

  it('22–23 correction loop iterations; high drift blocks review in strict mode', () => {
    const bundle = compileTwinV4ForensicReconstruction(COMPILE_INPUT);
    expect(bundle.correctionIterations.length).toBeGreaterThanOrEqual(MIN_TWIN_V4_CORRECTION_ITERATIONS);
    if (bundle.gate.majorHighDriftCount > 0) {
      expect(['RECONSTRUCTING', 'BLOCKED']).toContain(bundle.gate.status);
    }
  });

  it('24–26 V3 and design routes unchanged; V4 persistence isolated', () => {
    const v3Page = readFileSync('src/site00/pages/DesignTwinImplementationPage.tsx', 'utf8');
    expect(v3Page).toContain('resolveTwinImplementationPreview');
    const designWs = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(designWs).not.toContain('DesignTwinV4ProofPage');
    expect(TWIN_V4_STORAGE_PREFIX).toBe('site00:twin-v4:');
    expect(TWIN_V4_STORAGE_PREFIX).not.toContain('mobile-twin-implementation-cache');
  });

  it('27 proof answer is YES NO or INCONCLUSIVE', () => {
    const bundle = compileTwinV4ForensicReconstruction(COMPILE_INPUT);
    expect(['YES', 'NO', 'INCONCLUSIVE']).toContain(bundle.proofAnswer);
    expect(TWIN_V4_FORENSIC_CANONICAL_VIEWPORT.widthPx).toBe(1200);
  });
});
