/**
 * P0.VR.REPLICATION.4R1 — Authority-locked tightening pass.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  P0_VR_REPLICATION_4R1_BUILD,
  buildAuthorityTighteningCssPatch,
  executeAuthorityTighteningPass,
  PARENT_GEOMETRY,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R1/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.REPLICATION.4R1 authority tightening', () => {
  it('locks parent geometry tokens', () => {
    expect(PARENT_GEOMETRY.heroHeight).toBe(220);
    const patch = buildAuthorityTighteningCssPatch();
    expect(patch['--fb-hero-h']).toBe('220px');
    expect(patch['--fb-page-gutter']).toBe('24px');
  });

  it('executeAuthorityTighteningPass merges css patch and drift summary', () => {
    const result = executeAuthorityTighteningPass({
      session: { sessionId: 's', twinForensicCssPatch: { '--fb-progress-fill-w': '57%' } } as never,
      forensicReport: null,
    });
    expect(result.report.buildRef).toBe(P0_VR_REPLICATION_4R1_BUILD);
    expect(result.report.heroSubregionIsolation).toBe(true);
    expect(result.sessionPatch.twinForensicCssPatch?.['--fb-hero-h']).toBe('220px');
    expect(result.report.driftSummary.length).toBeGreaterThan(6);
  });

  it('hero DOM uses subregion grid and cropped photo layer', () => {
    const twin = read('src/site00/components/reconstruction/ForensicBlueprintNdxOverviewTwin.tsx');
    expect(twin).toContain('site00-fb__hero-left');
    expect(twin).toContain('site00-fb__hero-h06-crop');
    expect(twin).toContain('site00-fb__hero-left-scrim');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/executeShellFirstNdxReplication.ts')).toContain(
      'executeAuthorityTighteningPass',
    );
  });

  it('preview supports twinCompare and blueprint overlay hints', () => {
    expect(read('src/site00/components/reconstruction/TwinAuthorityCompareStrip.tsx')).toContain('twinCompare');
  });
});
