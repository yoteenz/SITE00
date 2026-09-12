/**
 * P0.VR.REPLICATION.4R3 — Hero geometry convergence + inspect hero UX.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  P0_VR_REPLICATION_4R3_BUILD,
  buildTwinHeroInspectionUrl,
  stripHeroInspectionFromUrl,
  guardHeroAssetBinding,
  executeHeroGeometryConvergencePipeline,
  HERO_RENDERED_LAYOUT,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R3/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.REPLICATION.4R3 hero geometry convergence', () => {
  it('buildTwinHeroInspectionUrl applies blueprintDebug=hero', () => {
    const url = buildTwinHeroInspectionUrl('/twin/projects/ndxbook/mobile/s1', 'https://site00.com');
    expect(url).toContain('blueprintDebug=hero');
    expect(url).toContain('#hero-inspection');
    expect(stripHeroInspectionFromUrl('/twin/x?blueprintDebug=hero')).toBe('/twin/x');
  });

  it('INSPECT HERO control present in review UI', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx')).toContain('INSPECT HERO');
    expect(read('src/site00/components/designWorkspace/pageFamily/PageUpgradeReplicationExperience.tsx')).toContain('INSPECT HERO');
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx')).toContain('onInspectHero');
  });

  it('hero inspection toolbar and overlay wired', () => {
    expect(read('src/site00/components/reconstruction/HeroInspectionToolbar.tsx')).toContain('EXIT INSPECTION');
    expect(read('src/site00/components/reconstruction/ForensicBlueprintNdxOverviewTwin.tsx')).toContain('HeroInspectionToolbar');
    expect(read('src/site00/components/reconstruction/HeroBlueprintDebugOverlay.tsx')).toContain('site00-hero-debug__delta');
  });

  it('executeHeroGeometryConvergencePipeline measures 14 objects', () => {
    const { report, sessionPatch } = executeHeroGeometryConvergencePipeline({
      session: { sessionId: 's', designAuthorityAssetRef: '/assets/ndxbook-reconstruction/ndxbook-mobile-authority.jpg' } as never,
    });
    expect(report.buildRef).toBe(P0_VR_REPLICATION_4R3_BUILD);
    expect(report.authorityGeometry.length).toBe(14);
    expect(report.renderedGeometry.length).toBe(14);
    expect(report.geometryDeltas.length).toBe(14);
    expect(report.geometryDeltas.every((d) => d.status !== undefined)).toBe(true);
    expect(report.geometryDeltas.some((d) => d.status === 'NOT_MEASURED' as never)).toBe(false);
    expect(report.geometryReceipt.measuredCount).toBe(14);
    expect(report.legacyGeometryDeltas.every((d) => d.status !== 'NOT_MEASURED')).toBe(true);
    expect(sessionPatch.twinForensicCssPatch?.['--hero-h12-pos']).toContain('43%');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/executeShellFirstNdxReplication.ts')).toContain(
      'executeHeroGeometryConvergencePipeline',
    );
  });

  it('H12 asset binding guard rejects blueprint raster', () => {
    const bad = guardHeroAssetBinding({
      objectId: 'H12',
      assetUrl: '/assets/ndxbook-mobile-forensic-blueprint.jpg',
      assetRole: 'HERO_RIGHT_LOWER_MEDIA',
    });
    expect(bad.allowed).toBe(false);
    expect(bad.failureCode).toBe('H12_WRONG_ASSET_BINDING');
    const ok = guardHeroAssetBinding({
      objectId: 'H12',
      assetUrl: '/assets/ndxbook-reconstruction/ndxbook-mobile-authority.jpg',
      assetRole: 'HERO_RIGHT_LOWER_MEDIA',
    });
    expect(ok.allowed).toBe(true);
  });

  it('H07 duplicate visual audit passes with masked DOM', () => {
    const { report } = executeHeroGeometryConvergencePipeline({ session: { sessionId: 'x' } as never });
    expect(report.visualDuplicateAudit.passed).toBe(true);
    expect(report.visualDuplicateAudit.h07DomDuplicate).toBe(false);
  });

  it('headline and body line counts in layout spec', () => {
    expect(HERO_RENDERED_LAYOUT.H02.lineCount).toBe(4);
    expect(HERO_RENDERED_LAYOUT.H04.lineCount).toBe(4);
  });

  it('H12 DOM marks hero lower-right media role', () => {
    expect(read('src/site00/components/reconstruction/ForensicBlueprintNdxOverviewTwin.tsx')).toContain('HERO_RIGHT_LOWER_MEDIA');
  });
});
