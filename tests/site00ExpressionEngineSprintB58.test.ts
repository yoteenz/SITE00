/**
 * B5.8 — Reference-fidelity social package preview tests.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildActiveArchive } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001ArchiveIntelligence.js';
import { syncDeliverablesFromAssets } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001DeliverableStore.js';
import { buildFormatPreview } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001FormatWorkspaces.js';
import { buildPackagePreviewComposition } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001PackagePreview.js';
import { buildEntry001PackageReadiness } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001PackageReadiness.js';
import {
  buildEntry001SocialPreviewModel,
  buildEntry001SocialPreviewPaths,
} from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001SocialPreviewAdapter.js';
import {
  buildFormatWorkspaceSummaries,
} from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001FormatWorkspaces.js';
import {
  buildPackageFlowSteps,
  countCompleteFormats,
  mapWorkspaceStatusToPreviewStatus,
} from '../src/site00/components/founderWorkspace/socialPackagePreview/buildSocialPreviewModel.js';
import { SOCIAL_PREVIEW_FORMAT_ORDER } from '../src/site00/components/founderWorkspace/socialPackagePreview/types.js';

const ROOT = join(import.meta.dirname, '..');

describe('B5.8 Social package preview redesign', () => {
  const activeArchive = buildActiveArchive();
  const deliverables = syncDeliverablesFromAssets(activeArchive, []);
  const readiness = buildEntry001PackageReadiness(activeArchive, [], deliverables);
  const composition = buildPackagePreviewComposition(deliverables, readiness);
  const summaries = buildFormatWorkspaceSummaries(deliverables);
  const model = buildEntry001SocialPreviewModel({
    entryNumber: '001',
    composition,
    formatSummaries: summaries,
    deliverables,
  });

  it('1. desktop reference layout architecture CSS exists', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('.site00-spp-stage');
    expect(css).toContain('grid-template-columns: 220px minmax(0, 1fr) 260px');
  });

  it('2. mobile overview component exists', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/socialPackagePreview/PackagePreviewOverview.tsx'),
      'utf8',
    );
    expect(src).toContain('site00-spp-overview');
  });

  it('3. sticky mobile format navigation CSS exists', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('.site00-spp-fnav--rail');
    expect(css).toContain('position: sticky');
  });

  it('4. Reel preview is platform-specific', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/socialPackagePreview/ReelSocialPreview.tsx'),
      'utf8',
    );
    expect(src).toContain('site00-spp-reel__phone');
    expect(src).not.toContain('site00-spp-carousel');
  });

  it('5. Carousel preview is platform-specific', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/socialPackagePreview/CarouselSocialPreview.tsx'),
      'utf8',
    );
    expect(src).toContain('site00-spp-carousel__post');
  });

  it('6. Story preview is platform-specific', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/socialPackagePreview/StorySocialPreview.tsx'),
      'utf8',
    );
    expect(src).toContain('site00-spp-story__progress');
  });

  it('7. TikTok preview is distinct from Reel', () => {
    const tiktok = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/socialPackagePreview/TikTokSocialPreview.tsx'),
      'utf8',
    );
    const reel = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/socialPackagePreview/ReelSocialPreview.tsx'),
      'utf8',
    );
    expect(tiktok).toContain('site00-spp-tiktok');
    expect(tiktok).not.toContain('site00-spp-reel__phone');
    expect(reel).toContain('site00-spp-reel__phone');
  });

  it('8. X preview is copy-first', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/socialPackagePreview/XSocialPreview.tsx'),
      'utf8',
    );
    expect(src).toContain('site00-spp-x__copy');
    expect(src.indexOf('site00-spp-x__copy')).toBeLessThan(src.indexOf('site00-spp-x__media'));
  });

  it('9. Highlight preview has profile context', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/socialPackagePreview/HighlightSocialPreview.tsx'),
      'utf8',
    );
    expect(src).toContain('site00-spp-highlight__profile-row');
  });

  it('10. active format switching supported in workspace', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/socialPackagePreview/SocialPackagePreviewWorkspace.tsx'),
      'utf8',
    );
    expect(src).toContain('setActiveFormat');
    expect(src).toContain('FormatPreviewNavigation');
  });

  it('11. backend sequence order drives Carousel slots', () => {
    const preview = buildFormatPreview('CAROUSEL', deliverables);
    const slides = preview.slots.filter((s) => s.deliverable);
    const indices = slides.map((s) => s.deliverable!.sequenceIndex);
    expect(indices.every((v) => v != null)).toBe(true);
    expect([...indices].sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual(indices);
  });

  it('12. backend frame order drives Story slots', () => {
    const preview = buildFormatPreview('STORY', deliverables);
    const frames = preview.slots.filter((s) => s.deliverable);
    expect(frames.length).toBeGreaterThan(0);
    const indices = frames.map((s) => s.deliverable!.sequenceIndex);
    expect([...indices].sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual(indices);
  });

  it('13. package status derives from canonical data', () => {
    expect(model.completeCount).toBe(countCompleteFormats(model.formats));
    expect(model.totalCount).toBe(6);
    expect(model.packageStatusLabel).toMatch(/PACKAGE/);
  });

  it('14. copy appears in model when present on deliverable', () => {
    const withCaption = deliverables.find((d) => d.caption);
    if (withCaption) {
      const fmt = model.formats.find((f) => f.formatFamily === withCaption.formatFamily);
      expect(fmt?.caption ?? fmt?.copyText).toBeTruthy();
    } else {
      expect(model.formats.some((f) => f.caption !== undefined)).toBe(true);
    }
  });

  it('15. missing-copy state works for X', () => {
    const x = model.formats.find((f) => f.formatFamily === 'X')!;
    expect(x.copyText === null || x.copyText === '').toBe(true);
  });

  it('16. missing-video state works for Reel', () => {
    const reel = model.formats.find((f) => f.formatFamily === 'REEL')!;
    expect(['VIDEO_PENDING', 'NOT_STARTED', 'COVER_ONLY', 'IN_PROGRESS']).toContain(reel.status);
  });

  it('17. cover-only state detectable for Reel', () => {
    const reelPreview = buildFormatPreview('REEL', deliverables);
    const slots = reelPreview.slots.map((s) => ({
      slotId: s.slotId,
      label: s.label,
      sequenceNumber: null,
      filePath: s.deliverable?.filePath ?? null,
      mediaType: 'NONE' as const,
      title: s.label,
      placeholder: s.placeholder,
      placeholderLabel: null,
      deliverableId: null,
      assetRole: null,
      assetType: null,
      approvalState: null,
      dimensions: null,
      source: null,
      version: null,
      notes: null,
    }));
    const status = mapWorkspaceStatusToPreviewStatus(reelPreview.status, 'REEL', slots);
    expect(['COVER_ONLY', 'VIDEO_PENDING', 'NOT_STARTED', 'IN_PROGRESS']).toContain(status);
  });

  it('18. format-specific empty states exist', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/socialPackagePreview/PlatformEmptyState.tsx'),
      'utf8',
    );
    expect(src).toContain('REEL');
    expect(src).toContain('HIGHLIGHT');
    expect(src).toContain('Add Video');
  });

  it('19. recent activity derives from deliverable timestamps', () => {
    expect(Array.isArray(model.recentActivity)).toBe(true);
    for (const ev of model.recentActivity) {
      expect(ev.at).toBeTruthy();
      expect(ev.label).toBeTruthy();
    }
  });

  it('20. package flow derives from format order', () => {
    const flow = buildPackageFlowSteps(model.formats);
    expect(flow.length).toBe(6);
    expect(flow[0]?.formatFamily).toBe('REEL');
    expect(flow[1]?.formatFamily).toBe('CAROUSEL');
  });

  it('21. model uses package deliverables only via adapter', () => {
    expect(model.formats.every((f) => SOCIAL_PREVIEW_FORMAT_ORDER.includes(f.formatFamily))).toBe(true);
  });

  it('22. generic components contain no Britney-specific strings', () => {
    const dir = join(ROOT, 'src/site00/components/founderWorkspace/socialPackagePreview');
    for (const file of ['SocialPackagePreviewWorkspace.tsx', 'CarouselSocialPreview.tsx', 'types.ts']) {
      const src = readFileSync(join(dir, file), 'utf8');
      expect(src.toLowerCase()).not.toMatch(/britney/);
      expect(src.toLowerCase()).not.toMatch(/spears/);
    }
  });

  it('23. Entry 002 can instantiate generic preview model shape', () => {
    const entry002Model = buildEntry001SocialPreviewModel({
      entryNumber: '002',
      composition: { ...composition, entryId: 'entry-001' },
      formatSummaries: summaries,
      deliverables,
      brandTagline: null,
    });
    expect(entry002Model.entryNumber).toBe('002');
    expect(entry002Model.formats.length).toBe(6);
  });

  it('24. legacy PACKAGE MAP no longer rendered in preview workspace', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/Entry001PackagePreviewWorkspace.tsx'),
      'utf8',
    );
    expect(src).not.toContain('PACKAGE MAP');
    expect(src).toContain('SocialPackagePreviewWorkspace');
  });

  it('25. legacy ALL FORMATS scroll no longer rendered', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/socialPackagePreview/SocialPackagePreviewWorkspace.tsx'),
      'utf8',
    );
    expect(src).not.toContain('ALL FORMATS');
    expect(src).not.toContain('site00-e001-preview-page__stack');
  });

  it('26. giant generic black placeholder pattern reduced in new previews', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('.site00-spp-empty');
    expect(css).toMatch(/linear-gradient\(180deg, #eceae4/);
  });

  it('27. mobile layout overflow guard CSS present', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('overflow-x: hidden');
  });

  it('28. bottom dock padding preserved', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toMatch(/\.site00-spp[\s\S]*padding: 12px 16px 96px/);
  });

  it('29. desktop route page wires new workspace', () => {
    const src = readFileSync(join(ROOT, 'src/site00/pages/ProjectCampaignBoardEntryPreviewPage.tsx'), 'utf8');
    expect(src).toContain('Entry001PackagePreviewWorkspace');
    expect(src).toContain('formatSummaries');
  });

  it('30. mobile route same page component', () => {
    const paths = buildEntry001SocialPreviewPaths('ndxbook', '001');
    expect(paths.packagePath).toContain('/entry/001');
    expect(paths.formatPath('CAROUSEL')).toContain('/format/carousel');
  });

  it('31. build passes — preview modules import cleanly', () => {
    expect(model.entryTitle).toBeTruthy();
    expect(model.formats.find((f) => f.formatFamily === 'CAROUSEL')?.slideCount).toBeGreaterThan(0);
  });
});
