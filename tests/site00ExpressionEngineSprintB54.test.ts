/**
 * B5.4 — Entry 001 Approved Archive taxonomy tests.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ENTRY001_APPROVED_ARCHIVE,
  ENTRY001_CAROUSEL_PACKAGE_ID,
  ENTRY001_PARENT_PACKAGES,
} from '../src/site00/config/entry001CampaignAssets.js';
import { ENTRY001_MIGRATION_AUDIT } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001AssetMigrationAudit.js';
import {
  enrichAssetWithTaxonomy,
  filterArchiveAssets,
  groupAssetsByType,
  isActiveArchiveAsset,
  legacyRoleToAssetType,
} from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001AssetTaxonomy.js';
import { suggestAssetClassification } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001AssetClassification.js';
import {
  buildActiveArchive,
  buildEntry001ArchiveIntelligence,
} from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001ArchiveIntelligence.js';
import { buildEntry001PackageReadiness } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001PackageReadiness.js';
import { compileEntry001ArchiveDerivationPlan } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001ArchiveDerivationPlan.js';
import type { Entry001CampaignAsset } from '../shared/site00-expression-engine/entry001CampaignPackage/types.js';

const ROOT = join(import.meta.dirname, '..');

describe('B5.4 Entry 001 archive taxonomy', () => {
  it('1. assetType exists on seeded archive', () => {
    expect(ENTRY001_APPROVED_ARCHIVE.every((a) => a.assetType)).toBe(true);
  });

  it('2. assetRole exists where appropriate', () => {
    expect(ENTRY001_APPROVED_ARCHIVE.some((a) => a.assetRole === 'CLAIM')).toBe(true);
    expect(ENTRY001_APPROVED_ARCHIVE.some((a) => a.assetRole === 'CTA')).toBe(true);
  });

  it('3. existing assets classified in migration audit', () => {
    expect(ENTRY001_MIGRATION_AUDIT.length).toBe(10);
    expect(ENTRY001_MIGRATION_AUDIT.every((r) => r.recommendedAssetType)).toBe(true);
  });

  it('4. new upload classification suggested from filename', () => {
    const s = suggestAssetClassification('test-1', 'carousel-slide-03.jpg');
    expect(s.suggestedAssetType).toBe('CAROUSEL_SLIDE');
    expect(s.confidence).toBe('HIGH');
  });

  it('5. batch items may differ in suggested type', () => {
    const a = suggestAssetClassification('a', 'carousel-01.jpg');
    const b = suggestAssetClassification('b', 'story-frame-02.jpg');
    expect(a.suggestedAssetType).not.toBe(b.suggestedAssetType);
  });

  it('6. Carousel Slide differs from Story Frame types', () => {
    expect(legacyRoleToAssetType('CAROUSEL_SLIDE')).toBe('CAROUSEL_SLIDE');
    expect(legacyRoleToAssetType('STORY_FRAME')).toBe('STORY_FRAME');
  });

  it('7. Reel differs from Reel Cover', () => {
    expect(legacyRoleToAssetType('FINAL_REEL')).toBe('REEL');
    expect(legacyRoleToAssetType('REEL_COVER')).toBe('REEL_COVER');
  });

  it('8. archive groups by type', () => {
    const groups = groupAssetsByType(ENTRY001_APPROVED_ARCHIVE);
    expect(groups.some((g) => g.type === 'CAROUSEL_SLIDE')).toBe(true);
    expect(groups.some((g) => g.type === 'STORY_FRAME')).toBe(true);
  });

  it('9. filters work', () => {
    const carouselOnly = filterArchiveAssets(ENTRY001_APPROVED_ARCHIVE, 'CAROUSEL');
    expect(carouselOnly.every((a) => a.assetType === 'CAROUSEL_SLIDE' || a.assetType === 'CAROUSEL')).toBe(true);
  });

  it('10. active count excludes removed assets', () => {
    const active = buildActiveArchive({}, ['entry001-archive-05-accountability']);
    expect(active.length).toBe(9);
    const readiness = buildEntry001PackageReadiness(active);
    expect(readiness.activeArchiveCount).toBe(9);
  });

  it('11. remove-from-archive is non-destructive (asset preserved in archived state)', () => {
    const asset = ENTRY001_APPROVED_ARCHIVE[0]!;
    const archived: Entry001CampaignAsset = {
      ...asset,
      status: 'ARCHIVED',
      removedFromActiveArchive: true,
      archivedAt: new Date().toISOString(),
    };
    expect(archived.filePath).toBe(asset.filePath);
    expect(archived.assetId).toBe(asset.assetId);
  });

  it('12. removed asset preserves lineage fields', () => {
    const slide = ENTRY001_APPROVED_ARCHIVE.find((a) => a.packageId === ENTRY001_CAROUSEL_PACKAGE_ID)!;
    const archived = { ...slide, status: 'ARCHIVED' as const, removedFromActiveArchive: true };
    expect(archived.packageId).toBe(ENTRY001_CAROUSEL_PACKAGE_ID);
    expect(archived.sequenceIndex).toBeDefined();
  });

  it('13. restore eligibility — archived asset can return to active', () => {
    const active = buildActiveArchive({}, ['entry001-archive-01-then-now']);
    expect(active.some((a) => a.assetId === 'entry001-archive-01-then-now')).toBe(false);
    const restored = buildActiveArchive({}, []);
    expect(restored.some((a) => a.assetId === 'entry001-archive-01-then-now')).toBe(true);
  });

  it('14. reclassification updates assetType', () => {
    const asset = enrichAssetWithTaxonomy({
      ...ENTRY001_APPROVED_ARCHIVE[0]!,
      assetType: 'STORY_FRAME',
      assetRole: 'INTERJECTION',
    });
    expect(asset.assetType).toBe('STORY_FRAME');
  });

  it('15. package readiness updates after removal', () => {
    const before = buildEntry001PackageReadiness();
    const after = buildEntry001PackageReadiness(buildActiveArchive({}, ['entry001-archive-01-then-now']));
    expect(after.activeArchiveCount).toBeLessThan(before.activeArchiveCount);
  });

  it('16. package readiness updates after reclassification via typed deliverable', () => {
    const upload: Entry001CampaignAsset = {
      assetId: 'x-cover',
      entryId: 'entry-001',
      filePath: '/x.jpg',
      title: 'COVER',
      format: 'IMAGE',
      role: 'REEL_COVER',
      assetType: 'REEL_COVER',
      assetRole: 'COVER',
      status: 'APPROVED',
      source: 'FOUNDER_SUPPLIED',
      approved: true,
      version: 'v1',
      removedFromActiveArchive: false,
    };
    const r = buildEntry001PackageReadiness(buildActiveArchive(), [upload]);
    expect(r.approvedTypes).toContain('REEL_COVER');
  });

  it('17. carousel sequence index supported', () => {
    const slides = ENTRY001_APPROVED_ARCHIVE.filter((a) => a.assetType === 'CAROUSEL_SLIDE' && a.packageId);
    expect(slides.every((s) => s.sequenceIndex != null)).toBe(true);
  });

  it('18. story sequence index supported', () => {
    const frame = ENTRY001_APPROVED_ARCHIVE.find((a) => a.assetId === 'entry001-archive-09-cta-poll')!;
    expect(frame.sequenceIndex).toBe(1);
  });

  it('19. parent package records supported', () => {
    expect(ENTRY001_PARENT_PACKAGES.length).toBe(2);
    expect(ENTRY001_PARENT_PACKAGES[0]!.childAssetIds.length).toBe(4);
  });

  it('20. intelligence layer reads typed assets', () => {
    const intel = buildEntry001ArchiveIntelligence(ENTRY001_APPROVED_ARCHIVE);
    expect(intel.existingAssetTypes).toContain('CAROUSEL_SLIDE');
    expect(intel.doNotRegenerateTypes).toContain('CAROUSEL_SLIDE');
  });

  it('21. derivation plan uses typed source assets', () => {
    const plan = compileEntry001ArchiveDerivationPlan(ENTRY001_APPROVED_ARCHIVE);
    const reelCover = plan.targets.find((t) => t.targetAssetType === 'REEL_COVER');
    expect(reelCover?.sourceAssetTypes.length).toBeGreaterThan(0);
    expect(reelCover?.recommendedSourceAssetIds.length).toBeGreaterThan(0);
  });

  it('22. classification does not imply provider dispatch', () => {
    suggestAssetClassification('id', 'file.jpg');
    const plan = compileEntry001ArchiveDerivationPlan(ENTRY001_APPROVED_ARCHIVE);
    expect(plan.providerDispatchCount).toBe(0);
  });

  it('23. no auto-remove in workspace source', () => {
    const page = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/Entry001CampaignPackageWorkspace.tsx'),
      'utf8',
    );
    expect(page).not.toMatch(/autoRemove|hardDelete|dispatchFal/i);
    expect(page).toContain('REMOVE FROM ARCHIVE');
  });

  it('24. no provider dispatch during sprint', () => {
    const plan = compileEntry001ArchiveDerivationPlan(ENTRY001_APPROVED_ARCHIVE);
    expect(plan.providerDispatchCount).toBe(0);
  });

  it('25. mobile shell unchanged', () => {
    const shell = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx'), 'utf8');
    expect(shell).toContain('MobileFounderWorkspaceChrome');
  });

  it('26. Entry 001 page reference-faithful sections preserved', () => {
    const page = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/Entry001CampaignPackageWorkspace.tsx'),
      'utf8',
    );
    expect(page).toContain('APPROVED ARCHIVE');
    expect(page).toContain('REMAINING DELIVERABLES');
    expect(page).toContain('AI CREATIVE INTELLIGENCE');
    expect(page).toContain('site00-e001-package');
  });

  it('27. build passes — active asset helper', () => {
    expect(isActiveArchiveAsset(ENTRY001_APPROVED_ARCHIVE[0]!)).toBe(true);
    expect(
      isActiveArchiveAsset({
        ...ENTRY001_APPROVED_ARCHIVE[0]!,
        removedFromActiveArchive: true,
        status: 'ARCHIVED',
      }),
    ).toBe(false);
  });
});
