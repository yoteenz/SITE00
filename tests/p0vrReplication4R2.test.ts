/**
 * P0.VR.REPLICATION.4R2 — Hero surgical lock + collision elimination.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  P0_VR_REPLICATION_4R2_BUILD,
  MAX_HERO_CORRECTION_PASSES,
  HERO_POS_TOLERANCE_PX,
  buildHeroObjectContracts,
  auditHeroCollisions,
  auditHeroTextSources,
  findDuplicateTextFailures,
  buildHeroZLayerMap,
  executeHeroSurgicalLockPipeline,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R2/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.REPLICATION.4R2 hero surgical lock', () => {
  it('HeroObjectContract binds H01–H14', () => {
    const contracts = buildHeroObjectContracts();
    expect(contracts.length).toBe(14);
    expect(contracts.every((c) => c.status === 'BOUND')).toBe(true);
    expect(contracts.find((c) => c.objectId === 'H02')?.typographySpec).toBe('display-l');
    expect(contracts.find((c) => c.objectId === 'H08')?.surfaceSpec).toBe('lime-fill');
  });

  it('duplicate text detection fails when renderCount > 1', () => {
    const traces = auditHeroTextSources();
    const dupes = findDuplicateTextFailures(traces);
    expect(dupes.length).toBe(0);
    for (const t of traces.filter((x) => x.source === 'DOM_LITERAL')) {
      expect(t.renderCount).toBe(1);
    }
  });

  it('headline and supporting copy line counts locked', () => {
    const traces = auditHeroTextSources();
    const h02 = traces.find((t) => t.objectId === 'H02');
    const h04 = traces.find((t) => t.objectId === 'H04');
    expect(h02?.lineCount).toBe(4);
    expect(h04?.lineCount).toBe(4);
    expect(h02?.text).toContain('SHARPER');
  });

  it('collision audit passes for contract bounds', () => {
    const contracts = buildHeroObjectContracts();
    const audit = auditHeroCollisions(contracts);
    expect(audit.pairsChecked).toBe((14 * 13) / 2);
    expect(audit.passed).toBe(true);
  });

  it('HeroZLayerMap declares overlay and CTA layers', () => {
    const map = buildHeroZLayerMap();
    expect(map.layers.some((l) => l.layer === 50 && l.objectIds.includes('H08'))).toBe(true);
    expect(map.layers.some((l) => l.layer === 60 && l.objectIds.includes('H05'))).toBe(true);
  });

  it('executeHeroSurgicalLockPipeline merges css patch and report', () => {
    const { report, sessionPatch } = executeHeroSurgicalLockPipeline({
      session: { sessionId: 's' } as never,
    });
    expect(report.buildRef).toBe(P0_VR_REPLICATION_4R2_BUILD);
    expect(report.correctionPasses.length).toBeLessThanOrEqual(MAX_HERO_CORRECTION_PASSES);
    expect(report.screenshotInScreen).toBe(false);
    expect(sessionPatch.twinForensicCssPatch?.['--hero-ndx-fill']).toBe('#b7f75f');
    expect(sessionPatch.heroSurgicalLockReport?.objectCount).toBe(14);
  });

  it('tolerance constants match sprint spec', () => {
    expect(HERO_POS_TOLERANCE_PX).toBe(3);
  });

  it('twin DOM uses surgical hero objects and no hero-stack duplication', () => {
    const twin = read('src/site00/components/reconstruction/ForensicBlueprintNdxOverviewTwin.tsx');
    expect(twin).toContain('site00-fb__hero--surgical');
    expect(twin).toContain('data-hero-object="H14"');
    expect(twin).toContain('heroObjectId="H02"');
    expect(twin).not.toContain('site00-fb__hero-stack');
    expect(twin).not.toContain('-webkit-text-stroke');
    expect(read('src/site00/components/reconstruction/HeroBlueprintDebugOverlay.tsx')).toContain('blueprintDebug');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/executeShellFirstNdxReplication.ts')).toContain(
      'executeHeroSurgicalLockPipeline',
    );
  });

  it('blueprint full-page overlay suppressed when blueprintDebug=hero', () => {
    expect(read('src/site00/components/reconstruction/BlueprintVsTwinOverlay.tsx')).toContain("mode === 'hero'");
  });
});
