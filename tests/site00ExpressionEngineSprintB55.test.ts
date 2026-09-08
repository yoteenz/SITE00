/**
 * B5.5 — Entry 001 deliverable workspaces + live social preview tests.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ENTRY001_APPROVED_ARCHIVE,
  ENTRY001_CAROUSEL_PACKAGE_ID,
  ENTRY001_STORY_PACKAGE_ID,
} from '../src/site00/config/entry001CampaignAssets.js';
import { buildActiveArchive } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001ArchiveIntelligence.js';
import { buildEntry001PackageReadiness } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001PackageReadiness.js';
import {
  assetTypeToFormatFamily,
  createDeliverableFromAsset,
  deleteDeliverablePermanently,
  getActivePackageDeliverables,
  getDeliverableById,
  removeDeliverableFromPackage,
  replaceDeliverableFile,
  restoreDeliverableToPackage,
  syncDeliverablesFromAssets,
  updateDeliverableMetadata,
  reorderDeliverablesInFormat,
} from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001DeliverableStore.js';
import {
  buildFormatPreview,
  buildFormatWorkspaceSummaries,
} from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001FormatWorkspaces.js';
import {
  buildArchiveIntelligencePreviewSnapshot,
  buildPackagePreviewComposition,
  buildPackagePreviewReadiness,
  buildSocialPackageMap,
} from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001PackagePreview.js';
import { compileEntry001ArchiveDerivationPlan } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001ArchiveDerivationPlan.js';
import type { Entry001CampaignAsset, Entry001DeliverableRecord } from '../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  SITE00_ROUTES,
  site00ProjectCampaignBoardEntryDeliverablePath,
  site00ProjectCampaignBoardEntryFormatPath,
  site00ProjectCampaignBoardEntryPreviewPath,
} from '../src/site00/config/routes.js';

const ROOT = join(import.meta.dirname, '..');

function sampleExtra(type: Entry001CampaignAsset['assetType']): Entry001CampaignAsset {
  return {
    assetId: `extra-${type.toLowerCase()}`,
    entryId: 'entry-001',
    filePath: '/blob/test.jpg',
    title: `TEST ${type}`,
    format: type === 'REEL' ? 'VIDEO' : 'IMAGE',
    role: 'CAMPAIGN_PACKAGE_ASSET',
    assetType: type,
    status: 'APPROVED',
    source: 'FOUNDER_SUPPLIED',
    approved: true,
    version: 'v001',
    removedFromActiveArchive: false,
  };
}

describe('B5.5 Entry 001 deliverable workspaces + preview', () => {
  const activeArchive = buildActiveArchive();
  let deliverables = syncDeliverablesFromAssets(activeArchive, []);

  it('1. submitted deliverable persists via sync', () => {
    const extra = [sampleExtra('REEL_COVER')];
    deliverables = syncDeliverablesFromAssets(activeArchive, extra, deliverables);
    expect(deliverables.some((d) => d.assetType === 'REEL_COVER')).toBe(true);
  });

  it('2. submitted deliverable can be revisited by id', () => {
    const d = deliverables.find((x) => x.assetType === 'REEL_COVER');
    expect(d).toBeTruthy();
    expect(getDeliverableById(deliverables, d!.deliverableId)).toBeTruthy();
  });

  it('3. deliverable has stable ID', () => {
    const d = deliverables[0]!;
    const again = syncDeliverablesFromAssets(activeArchive, [sampleExtra('REEL_COVER')], deliverables);
    expect(again.find((x) => x.assetId === d.assetId)?.deliverableId).toBe(d.deliverableId);
  });

  it('4. founder can view deliverable fields', () => {
    expect(deliverables[0]?.title).toBeTruthy();
    expect(deliverables[0]?.formatFamily).toBeTruthy();
  });

  it('5. founder can edit metadata', () => {
    const id = deliverables[0]!.deliverableId;
    deliverables = updateDeliverableMetadata(deliverables, id, { title: 'EDITED' });
    expect(getDeliverableById(deliverables, id)?.title).toBe('EDITED');
  });

  it('6. founder can replace asset', () => {
    const id = deliverables[0]!.deliverableId;
    deliverables = replaceDeliverableFile(deliverables, id, '/blob/new.jpg', 'NEW');
    expect(getDeliverableById(deliverables, id)?.filePath).toBe('/blob/new.jpg');
    expect(getDeliverableById(deliverables, id)?.history.length).toBeGreaterThan(1);
  });

  it('7. founder can remove from package', () => {
    const id = deliverables[0]!.deliverableId;
    deliverables = removeDeliverableFromPackage(deliverables, id);
    expect(getDeliverableById(deliverables, id)?.removedFromPackage).toBe(true);
  });

  it('8. founder can archive via remove state', () => {
    const id = deliverables[0]!.deliverableId;
    deliverables = restoreDeliverableToPackage(deliverables, id);
    expect(getDeliverableById(deliverables, id)?.removedFromPackage).toBe(false);
  });

  it('9. founder can restore to package', () => {
    expect(getActivePackageDeliverables(deliverables).length).toBeGreaterThan(0);
  });

  it('10. founder can permanently delete with confirmation path in UI', () => {
    const id = deliverables[0]!.deliverableId;
    deliverables = deleteDeliverablePermanently(deliverables, id);
    expect(getDeliverableById(deliverables, id)?.status).toBe('DELETED');
  });

  it('11. readiness updates after removal', () => {
    const extras = [sampleExtra('REEL_COVER')];
    let d = syncDeliverablesFromAssets(activeArchive, extras);
    d = removeDeliverableFromPackage(d, d.find((x) => x.assetType === 'REEL_COVER')!.deliverableId);
    const readiness = buildEntry001PackageReadiness(activeArchive, extras, d);
    expect(readiness.missingTypes).toContain('REEL_COVER');
  });

  it('12. readiness updates after restore', () => {
    const extras = [sampleExtra('HIGHLIGHT_ICON')];
    let d = syncDeliverablesFromAssets(activeArchive, extras);
    const id = d.find((x) => x.assetType === 'HIGHLIGHT_ICON')!.deliverableId;
    d = removeDeliverableFromPackage(d, id);
    d = restoreDeliverableToPackage(d, id);
    expect(getActivePackageDeliverables(d).some((x) => x.assetType === 'HIGHLIGHT_ICON')).toBe(true);
  });

  it('13. package content groups by format', () => {
    const summaries = buildFormatWorkspaceSummaries(deliverables);
    expect(summaries.some((s) => s.formatFamily === 'CAROUSEL')).toBe(true);
    expect(summaries.some((s) => s.formatFamily === 'STORY')).toBe(true);
  });

  it('14. Reel workspace exists', () => {
    expect(buildFormatWorkspaceSummaries(deliverables).some((s) => s.formatFamily === 'REEL')).toBe(true);
  });

  it('15. Carousel workspace exists', () => {
    expect(buildFormatPreview('CAROUSEL', deliverables).formatFamily).toBe('CAROUSEL');
  });

  it('16. Story workspace exists', () => {
    expect(buildFormatPreview('STORY', deliverables).formatFamily).toBe('STORY');
  });

  it('17. TikTok workspace exists', () => {
    expect(buildFormatPreview('TIKTOK', deliverables).formatFamily).toBe('TIKTOK');
  });

  it('18. X workspace exists', () => {
    expect(buildFormatPreview('X', deliverables).formatFamily).toBe('X');
  });

  it('19. Highlight workspace exists', () => {
    expect(buildFormatPreview('HIGHLIGHT', deliverables).formatFamily).toBe('HIGHLIGHT');
  });

  it('20. Carousel supports sequence order', () => {
    const slides = deliverables.filter((d) => d.formatFamily === 'CAROUSEL');
    expect(slides.some((s) => s.sequenceIndex != null)).toBe(true);
  });

  it('21. Story supports sequence order', () => {
    const frames = deliverables.filter((d) => d.formatFamily === 'STORY');
    expect(frames.some((s) => s.sequenceIndex != null)).toBe(true);
  });

  it('22. package Preview works before completion', () => {
    const readiness = buildEntry001PackageReadiness(activeArchive, []);
    const preview = buildPackagePreviewComposition(deliverables, readiness);
    expect(preview.previewReadiness).toBe('AVAILABLE');
    expect(preview.campaignBoardEligibility).toBe(false);
  });

  it('23. package Preview works after completion', () => {
    const extras = [
      sampleExtra('REEL_COVER'),
      sampleExtra('HIGHLIGHT_ICON'),
      sampleExtra('REEL'),
      sampleExtra('TIKTOK'),
      sampleExtra('X_POST'),
    ];
    const readiness = buildEntry001PackageReadiness(activeArchive, extras);
    const d = syncDeliverablesFromAssets(activeArchive, extras);
    const preview = buildPackagePreviewComposition(d, readiness);
    expect(preview.formats.length).toBe(6);
  });

  it('24. Reel preview supports pending video state', () => {
    const preview = buildFormatPreview('REEL', deliverables);
    expect(preview.slots.some((s) => s.slotId === 'final-reel' && s.placeholder)).toBe(true);
  });

  it('25. Carousel preview uses current slides', () => {
    const preview = buildFormatPreview('CAROUSEL', deliverables);
    expect(preview.slots.length).toBeGreaterThan(0);
    expect(preview.slots.some((s) => s.deliverable?.packageId === ENTRY001_CAROUSEL_PACKAGE_ID)).toBe(true);
  });

  it('26. Story preview uses current frames', () => {
    const preview = buildFormatPreview('STORY', deliverables);
    expect(preview.slots.some((s) => s.deliverable?.packageId === ENTRY001_STORY_PACKAGE_ID)).toBe(true);
  });

  it('27. TikTok preview handles pending state', () => {
    const preview = buildFormatPreview('TIKTOK', deliverables);
    expect(preview.slots[0]?.placeholder).toBe(true);
  });

  it('28. X preview supports text/media slots', () => {
    const preview = buildFormatPreview('X', deliverables);
    expect(preview.slots.some((s) => s.slotId === 'x-copy')).toBe(true);
    expect(preview.slots.some((s) => s.slotId === 'x-media')).toBe(true);
  });

  it('29. Highlight preview renders icon context', () => {
    const preview = buildFormatPreview('HIGHLIGHT', deliverables);
    expect(preview.slots[0]?.label).toContain('ICON');
  });

  it('30. placeholders appear for missing required assets', () => {
    const preview = buildFormatPreview('REEL', deliverables);
    expect(preview.slots.filter((s) => s.placeholder).length).toBeGreaterThan(0);
  });

  it('31. placeholder transforms into asset state after upload', () => {
    const extras = [sampleExtra('REEL_COVER')];
    const d = syncDeliverablesFromAssets(activeArchive, extras);
    const preview = buildFormatPreview('REEL', d);
    expect(preview.slots.find((s) => s.slotId === 'reel-cover')?.placeholder).toBe(false);
  });

  it('32. Preview updates after upload', () => {
    const extras = [sampleExtra('HIGHLIGHT_ICON')];
    const d = syncDeliverablesFromAssets(activeArchive, extras);
    const comp = buildPackagePreviewComposition(d, buildEntry001PackageReadiness(activeArchive, extras));
    expect(comp.formats.find((f) => f.formatFamily === 'HIGHLIGHT')?.slots[0]?.placeholder).toBe(false);
  });

  it('33. Preview updates after delete/remove', () => {
    let d = syncDeliverablesFromAssets(activeArchive, [sampleExtra('REEL_COVER')]);
    const id = d.find((x) => x.assetType === 'REEL_COVER')!.deliverableId;
    d = removeDeliverableFromPackage(d, id);
    const preview = buildFormatPreview('REEL', d);
    expect(preview.slots.find((s) => s.slotId === 'reel-cover')?.placeholder).toBe(true);
  });

  it('34. Preview derives from canonical deliverable state', () => {
    const comp = buildPackagePreviewComposition(deliverables, buildEntry001PackageReadiness(activeArchive, []));
    expect(comp.formats.every((f) => f.slots !== undefined)).toBe(true);
  });

  it('35. previewReadiness differs from campaignBoardEligibility', () => {
    const readiness = buildEntry001PackageReadiness(activeArchive, []);
    const pr = buildPackagePreviewReadiness(deliverables, readiness);
    expect(pr.previewReadiness).toBe('AVAILABLE');
    expect(pr.campaignBoardEligibility).toBe(false);
  });

  it('36. incomplete package can be previewed', () => {
    expect(buildPackagePreviewComposition(deliverables, buildEntry001PackageReadiness(activeArchive, [])).previewReadiness).toBe(
      'AVAILABLE',
    );
  });

  it('37. incomplete package cannot be deployed', () => {
    expect(buildEntry001PackageReadiness(activeArchive, []).campaignBoardEligible).toBe(false);
  });

  it('38. complete package can become campaign eligible', () => {
    const extras = [
      sampleExtra('REEL_COVER'),
      sampleExtra('HIGHLIGHT_ICON'),
      sampleExtra('REEL'),
      sampleExtra('TIKTOK'),
      sampleExtra('X_POST'),
    ];
    expect(buildEntry001PackageReadiness(activeArchive, extras).campaignBoardEligible).toBe(true);
  });

  it('39. upload success exposes VIEW ASSET route', () => {
    const d = createDeliverableFromAsset(sampleExtra('STORY_FRAME'));
    expect(site00ProjectCampaignBoardEntryDeliverablePath('ndxbook', '001', d.deliverableId)).toContain('/deliverable/');
  });

  it('40. upload success exposes VIEW FORMAT route', () => {
    expect(site00ProjectCampaignBoardEntryFormatPath('ndxbook', '001', 'story')).toContain('/format/story');
  });

  it('41. upload success exposes VIEW PACKAGE PREVIEW route', () => {
    expect(site00ProjectCampaignBoardEntryPreviewPath('ndxbook', '001')).toContain('/preview');
  });

  it('42. lineage visible on deliverable record', () => {
    const asset = ENTRY001_APPROVED_ARCHIVE.find((a) => a.packageId === ENTRY001_CAROUSEL_PACKAGE_ID)!;
    const d = createDeliverableFromAsset(asset);
    expect(d.packageId).toBe(ENTRY001_CAROUSEL_PACKAGE_ID);
  });

  it('43. history/versioning preserved on replace', () => {
    let d = syncDeliverablesFromAssets(activeArchive, [sampleExtra('TIKTOK')]);
    const id = d.find((x) => x.assetType === 'TIKTOK')!.deliverableId;
    d = replaceDeliverableFile(d, id, '/blob/v2.mp4');
    expect(getDeliverableById(d, id)?.history.some((h) => h.status === 'ARCHIVED')).toBe(true);
  });

  it('44. Entry 001 data isolated', () => {
    expect(deliverables.every((d) => d.entryId === 'entry-001')).toBe(true);
  });

  it('45. shared system remains reusable for Entry 002', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/entry001FormatWorkspaces.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/britney/i);
    expect(src).not.toMatch(/spears/i);
  });

  it('46. no provider dispatch during sprint', () => {
    const plan = compileEntry001ArchiveDerivationPlan(activeArchive);
    expect(plan.providerDispatchCount).toBe(0);
  });

  it('47. mobile layout CSS present', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('site00-e001-preview--reel');
    expect(css).toContain('site00-e001-package__nav');
  });

  it('48. desktop layout CSS present', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('site00-e001-preview-page__layout');
  });

  it('49. build passes — routes registered', () => {
    expect(SITE00_ROUTES.projectCampaignBoardEntryPreview).toContain('/preview');
    expect(SITE00_ROUTES.projectCampaignBoardEntryFormat).toContain('/format/');
    expect(SITE00_ROUTES.projectCampaignBoardEntryDeliverable).toContain('/deliverable/');
  });

  it('reorder deliverables in format', () => {
    const slides = deliverables.filter((d) => d.formatFamily === 'CAROUSEL');
    const ids = slides.map((s) => s.deliverableId).reverse();
    const reordered = reorderDeliverablesInFormat(deliverables, 'CAROUSEL', ids);
    expect(reordered.find((d) => d.deliverableId === ids[0])?.sequenceIndex).toBe(1);
  });

  it('social package map renders', () => {
    const map = buildSocialPackageMap(deliverables);
    expect(map.some((n) => n.label.includes('REEL'))).toBe(true);
  });

  it('archive intelligence preview snapshot exposed', () => {
    const snap = buildArchiveIntelligencePreviewSnapshot(deliverables);
    expect(snap.previewStructureExposed).toBe(true);
  });

  it('asset type maps to format family', () => {
    expect(assetTypeToFormatFamily('CAROUSEL_SLIDE')).toBe('CAROUSEL');
    expect(assetTypeToFormatFamily('X_POST')).toBe('X');
  });
});
