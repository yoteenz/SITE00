/**
 * P0.VR.DESIGN-PIPELINE-READINESS2
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { buildPagePipelineControllerModel } from '../shared/site00-design-workspace-production/designPagePipelineController.js';
import { createInitialDesignProductionState } from '../shared/site00-design-workspace-production/designProductionStore.js';
import { getDesignBoundPageByScreen } from '../shared/site00-design-workspace-production/designProjectBinding/designPageRegistry.js';

describe('P0.VR.DESIGN-PIPELINE-READINESS2', () => {
  it('exposes eleven pipeline stages', () => {
    const overview = getDesignBoundPageByScreen('ndxbook', 'overview')!;
    const model = buildPagePipelineControllerModel({
      projectId: 'ndxbook',
      pageId: overview.pageId,
      production: createInitialDesignProductionState('ndxbook'),
      twinRouteReachable: null,
    });
    expect(model.stages).toHaveLength(11);
  });

  it('uses accurate receipt gate labels (not legacy mobile authority approved)', () => {
    const overview = getDesignBoundPageByScreen('ndxbook', 'overview')!;
    const model = buildPagePipelineControllerModel({
      projectId: 'ndxbook',
      pageId: overview.pageId,
      production: createInitialDesignProductionState('ndxbook'),
      twinRouteReachable: null,
    });
    const labels = model.receiptGates.map((g) => g.label);
    expect(labels).toContain('Mobile concept selected');
    expect(labels).not.toContain('Mobile authority approved or locked');
  });

  it('wires four distinct pipeline action surfaces in UI', () => {
    const panel = readFileSync(
      join(import.meta.dirname, '../src/site00/components/designBench/opusDirect/DesignPipelineReadinessPanel.tsx'),
      'utf8',
    );
    expect(panel).toContain('openViewReadiness');
    expect(panel).toContain('openViewPipeline');
    expect(panel).toContain('openTechnicalDetails');
    expect(panel).toContain('runPipelineHandler');
    expect(panel).toContain('RESOLVE BLOCKER');

    const overlays = readFileSync(
      join(import.meta.dirname, '../src/site00/components/designBench/opusDirect/TwinOpusDirectOverlays.tsx'),
      'utf8',
    );
    expect(overlays).toContain('OV-READINESS-RECEIPT');
    expect(overlays).toContain('OV-PAGE-PIPELINE');
    expect(overlays).toContain('OV-PIPELINE-TECHNICAL');
    expect(overlays).toContain('OV-PIPELINE-STAGE');
  });
});
