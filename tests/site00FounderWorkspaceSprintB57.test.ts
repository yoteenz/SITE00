/**
 * B5.7 — Project module sync + context-aware asset ingestion tests.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildProjectOperatingState,
  auditEntry001State,
  runStaleProjectDataQA,
  assertNoDemoFixturesInActiveUi,
} from '../shared/site00-brand-lore/founderWorkspace/projectOperatingState/index.js';
import {
  classifyAspectRatio,
  buildMediaMetadata,
} from '../shared/site00-campaign-package/assetIngestion/aspectRatioClassification.js';
import {
  classifyAssetWithContext,
  summarizeBatchClassification,
  ingestionContextFromFormatFamily,
} from '../shared/site00-campaign-package/assetIngestion/assetClassificationEngine.js';
import {
  buildAssetUsageGraph,
  packageUsageWarning,
} from '../shared/site00-campaign-package/assetIngestion/assetUsageGraph.js';
import {
  isStaleDemoFixtureLabel,
  STALE_DEMO_FIXTURE_LABELS,
} from '../shared/site00-campaign-package/assetIngestion/staleDemoFixtures.js';
import {
  bumpProjectStateVersion,
  getProjectStateVersion,
} from '../src/site00/services/projectModuleSyncService.js';

const ROOT = join(import.meta.dirname, '..');

describe('B5.7 Project module sync + asset ingestion', () => {
  it('1–9. ProjectOperatingState exists and derives canonical entries', () => {
    const state = buildProjectOperatingState({
      projectId: 'ndxbook',
      projectStateVersion: 1,
      contentOpsRun: null,
      campaignProduction: null,
      entry001: {
        activeArchiveCount: 0,
        archivedRemovedCount: 10,
        packageDeliverableCount: 5,
        carouselSlideCount: 4,
        storyFrameCount: 1,
        packageIncomplete: false,
        needsFounderReview: false,
      },
      expressionEngine: { entry002Stage: 'STORYBOARD', entry003NeedsReview: true },
    });

    expect(state.projectId).toBe('ndxbook');
    expect(state.projectStateVersion).toBe(1);
    expect(state.entries.length).toBe(3);
    expect(state.entries[0]?.title).toContain('WHO TF IS WE');
    expect(state.entries[1]?.entryNumber).toBe(2);
    expect(state.entries[2]?.needsFounderReview).toBe(true);
    expect(state.chapterTitle).toBe('WHICH ONE IS IT?');
    expect(state.inProduction.length).toBeGreaterThan(0);
    expect(state.currentWork.some((w) => w.includes('ENTRY 001'))).toBe(true);
  });

  it('10–14. UI sources derive from shared state — no private mock in active screens', () => {
    const overview = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx'),
      'utf8',
    );
    const contentOps = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'),
      'utf8',
    );
    const lab = readFileSync(join(ROOT, 'src/site00/pages/ProjectLabHubPage.tsx'), 'utf8');

    expect(overview).toContain('useProjectOperatingState');
    expect(overview).not.toContain('NDX_OVERVIEW_PRODUCTION_CARDS.map');
    expect(contentOps).toContain('useProjectOperatingState');
    expect(contentOps).not.toContain('NDX_CONTENT_OPS_CURRENT_WORK.map');
    expect(lab).toContain('operatingState?.labSystems');
  });

  it('15–16. stale demo fixtures excluded from active UI detection', () => {
    for (const label of STALE_DEMO_FIXTURE_LABELS) {
      expect(isStaleDemoFixtureLabel(label)).toBe(true);
    }
    expect(() => assertNoDemoFixturesInActiveUi(['Corporate Layoff Memo'])).toThrow(/DEMO_FIXTURE/);
  });

  it('17–18. projectStateVersion bumps on mutation service', () => {
    const before = getProjectStateVersion();
    const after = bumpProjectStateVersion();
    expect(after).toBe(before + 1);
  });

  it('19–24. AssetIngestionContext + tab defaults + destination slot', () => {
    const carouselCtx = ingestionContextFromFormatFamily('CAROUSEL', {
      projectId: 'ndxbook',
      entryId: 'entry-001',
      existingSequenceCount: 4,
    });
    expect(carouselCtx.formatFamily).toBe('CAROUSEL');

    const reelCover = classifyAssetWithContext({
      assetId: 'a1',
      fileName: 'cover.jpg',
      context: ingestionContextFromFormatFamily('REEL', {
        destinationSlot: 'REEL_COVER',
        expectedAssetType: 'REEL_COVER',
      }),
      media: buildMediaMetadata({
        width: 1080,
        height: 1920,
        mimeType: 'image/jpeg',
        fileSize: 1000,
      }),
    });
    expect(reelCover.suggestedType).toBe('REEL_COVER');
    expect(reelCover.confidence).toBe('HIGH');
  });

  it('25–30. aspect ratio families + tolerance + media type', () => {
    expect(classifyAspectRatio(1080, 1920).matchedFamily).toBe('9:16');
    expect(classifyAspectRatio(1080, 1350).matchedFamily).toBe('4:5');
    expect(classifyAspectRatio(1080, 1080).matchedFamily).toBe('1:1');
    expect(classifyAspectRatio(1920, 1080).matchedFamily).toBe('16:9');
    expect(classifyAspectRatio(720, 1280).matchedFamily).toBe('9:16');

    const videoMeta = buildMediaMetadata({
      width: 1080,
      height: 1920,
      mimeType: 'video/mp4',
      fileSize: 5000,
      duration: 12,
    });
    expect(videoMeta.mediaType).toBe('VIDEO');
  });

  it('31–35. context + ratio fusion for Story and Carousel', () => {
    const story = classifyAssetWithContext({
      assetId: 's1',
      fileName: 'frame.jpg',
      context: ingestionContextFromFormatFamily('STORY'),
      media: buildMediaMetadata({
        width: 1080,
        height: 1920,
        mimeType: 'image/jpeg',
        fileSize: 1000,
      }),
    });
    expect(story.suggestedType).toBe('STORY_FRAME');
    expect(story.confidence).toBe('HIGH');

    const carousel = classifyAssetWithContext({
      assetId: 'c1',
      fileName: 'slide.jpg',
      context: ingestionContextFromFormatFamily('CAROUSEL'),
      media: buildMediaMetadata({
        width: 1080,
        height: 1350,
        mimeType: 'image/jpeg',
        fileSize: 1000,
      }),
    });
    expect(carousel.suggestedType).toBe('CAROUSEL_SLIDE');
    expect(carousel.confidence).toBe('HIGH');
  });

  it('36–40. batch inference — homogeneous and mixed carousel batch', () => {
    const homogeneous = Array.from({ length: 6 }, (_, i) =>
      classifyAssetWithContext({
        assetId: `c${i}`,
        fileName: `slide-${i}.jpg`,
        context: ingestionContextFromFormatFamily('CAROUSEL'),
        media: buildMediaMetadata({
          width: 1080,
          height: 1350,
          mimeType: 'image/jpeg',
          fileSize: 1000,
        }),
        sequenceIndex: i,
      }),
    );
    const homSummary = summarizeBatchClassification(homogeneous);
    expect(homSummary.homogeneous).toBe(true);
    expect(homSummary.primaryType).toBe('CAROUSEL_SLIDE');
    expect(homSummary.confidence).toBe('HIGH');
    expect(homSummary.headline).toContain('6 CAROUSEL SLIDE');

    const mixed = [
      ...homogeneous.slice(0, 5),
      classifyAssetWithContext({
        assetId: 'anomaly',
        fileName: 'vertical.jpg',
        context: ingestionContextFromFormatFamily('CAROUSEL'),
        media: buildMediaMetadata({
          width: 1080,
          height: 1920,
          mimeType: 'image/jpeg',
          fileSize: 1000,
        }),
        sequenceIndex: 5,
      }),
    ];
    const mixedSummary = summarizeBatchClassification(mixed);
    expect(mixedSummary.anomalies.length).toBe(1);
    expect(mixedSummary.autoAcceptCount).toBeGreaterThanOrEqual(5);
  });

  it('41–45. role inference + confidence model + high-confidence UX hook', () => {
    const firstSlide = classifyAssetWithContext({
      assetId: 'c0',
      fileName: 'slide.jpg',
      context: ingestionContextFromFormatFamily('CAROUSEL'),
      media: buildMediaMetadata({
        width: 1080,
        height: 1350,
        mimeType: 'image/jpeg',
        fileSize: 1000,
      }),
      sequenceIndex: 0,
    });
    expect(firstSlide.suggestedRole).toBe('COVER');

    const sheet = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/Entry001ClassificationSheet.tsx'),
      'utf8',
    );
    expect(sheet).toContain('ADD ALL');
    expect(sheet).toContain('highConfidenceBatch');
  });

  it('46–50. AssetUsageGraph + archive/package audit + Entry 001 state', () => {
    const graph = buildAssetUsageGraph({
      activeArchive: [],
      archivedAssets: [{ assetId: 'a1' } as never],
      removedIds: ['a1'],
      deliverables: [
        {
          assetId: 'a1',
          deliverableId: 'd1',
          formatFamily: 'CAROUSEL',
          sequenceIndex: 3,
          removedFromPackage: false,
          approved: true,
          filePath: '/x',
          status: 'APPROVED',
        } as never,
      ],
    });
    expect(graph.length).toBeGreaterThan(0);
    const warn = packageUsageWarning(graph, 'a1');
    expect(warn.usedInPackage).toBe(true);

    const audit = auditEntry001State({
      activeArchiveCount: 0,
      archivedRemovedCount: 10,
      packageDeliverableCount: 5,
      carouselSlideCount: 4,
      storyFrameCount: 1,
    });
    expect(audit.archivePackageConsistent).toBe(true);
    expect(audit.explanation).toContain('package');
  });

  it('51–55. StaleProjectDataQA failure classes', () => {
    const state = buildProjectOperatingState({
      projectId: 'ndxbook',
      projectStateVersion: 1,
      contentOpsRun: null,
      campaignProduction: null,
    });
    const qa = runStaleProjectDataQA({
      operatingState: state,
      uiLabels: ['Corporate Layoff Memo'],
    });
    expect(qa.passed).toBe(false);
    expect(qa.failureClasses).toContain('DEMO_FIXTURE_IN_ACTIVE_UI');

    const mismatch = runStaleProjectDataQA({
      operatingState: state,
      uiLabels: [],
      tabCounts: { overviewProduction: 5, canonicalProduction: state.inProduction.length },
    });
    if (state.inProduction.length !== 5) {
      expect(mismatch.failureClasses).toContain('CROSS_TAB_STATE_MISMATCH');
    }
  });

  it('56–60. route-aware classification pages pass format context', () => {
    const carouselPage = readFileSync(
      join(ROOT, 'src/site00/pages/ProjectCampaignBoardEntryCarouselPage.tsx'),
      'utf8',
    );
    const storyPage = readFileSync(
      join(ROOT, 'src/site00/pages/ProjectCampaignBoardEntryStoryPage.tsx'),
      'utf8',
    );
    expect(carouselPage).toContain("ingestionContextFromFormatFamily('CAROUSEL'");
    expect(storyPage).toContain("ingestionContextFromFormatFamily('STORY'");
  });

  it('61–65. no false founder approval — Entry 003 not canon by default', () => {
    const state = buildProjectOperatingState({
      projectId: 'ndxbook',
      projectStateVersion: 1,
      contentOpsRun: null,
      campaignProduction: null,
      expressionEngine: { entry002Stage: 'STORYBOARD', entry003NeedsReview: true },
    });
    const entry003 = state.entries.find((e) => e.entryNumber === 3);
    expect(entry003?.isCanon).toBe(false);
    expect(entry003?.needsFounderReview).toBe(true);
  });

  it('66–70. Overview counts and Content Ops approvals derive from state', () => {
    const state = buildProjectOperatingState({
      projectId: 'ndxbook',
      projectStateVersion: 2,
      contentOpsRun: null,
      campaignProduction: null,
      expressionEngine: { entry002Stage: 'PRODUCTION', entry003NeedsReview: true },
    });
    expect(typeof state.pulse.counts.beingMade).toBe('number');
    expect(state.approvalsNeeded.some((a) => a.label.includes('Entry 003'))).toBe(true);
    expect(state.labSystems.some((s) => s.label.includes('CREATIVE INTELLIGENCE'))).toBe(true);
  });
});
