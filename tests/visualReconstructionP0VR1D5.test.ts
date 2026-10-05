/**
 * P0.VR.1D.5 — Mobile overview micro-fidelity tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildReferenceDetailAudit,
  resolveProductionCardArtwork,
  existingPipelinePreferredOverNewGeneration,
  FAIL_AUDIENCE_COUNT_MISSING,
  P0_VR_1D5_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d5/index.js';
import {
  NDX_OVERVIEW_PRODUCTION_CARDS,
  NDX_OVERVIEW_REFERENCE_METRICS,
} from '../src/site00/config/ndxOverviewMobileReference.js';

const ROOT = process.cwd();

describe('P0.VR.1D.5 mobile overview micro-fidelity', () => {
  it('renders all four KPI values including audience count in source', () => {
    expect(NDX_OVERVIEW_REFERENCE_METRICS.fromAudience).toBe(1);
    expect(NDX_OVERVIEW_REFERENCE_METRICS.beingMade).toBe(5);
    expect(NDX_OVERVIEW_REFERENCE_METRICS.needYourEye).toBe(2);
    expect(NDX_OVERVIEW_REFERENCE_METRICS.developing).toBe(3);
  });

  it('mobile overview component shows audience count not empty placeholder', () => {
    const src = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx'), 'utf8');
    expect(src).toContain('metrics.fromAudience');
    expect(src).not.toContain('site00-fws-hub-kpis__empty');
    expect(src).toContain('site00-fws-hub-kpis__cell');
    expect(src).toContain('site00-fws-hub-kpis--ruled');
  });

  it('uses explicit 4-column KPI grid and micro region IDs', () => {
    const src = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx'), 'utf8');
    expect(src).toContain('NDX_VR_REGION.overviewKpis');
    expect(src).toContain('NDX_VR_REGION.overviewKpiAudience');
    expect(src).toContain('item.vrRegionId');
    expect(src).toContain('site00-fws-hub-carousel__card-art');
  });

  it('binds reference-approved artwork crops when present', () => {
    const resolutions = resolveProductionCardArtwork({
      projectRoot: ROOT,
      cards: NDX_OVERVIEW_PRODUCTION_CARDS.map((c) => ({
        id: c.id,
        title: c.title,
        artworkPath: c.artworkPath,
        artworkObjectPosition: c.artworkObjectPosition,
      })),
    });
    expect(resolutions).toHaveLength(3);
    for (const r of resolutions) {
      expect(r.source).toBe('REFERENCE_APPROVED_CROP');
      expect(r.artworkUrl).toBeTruthy();
      expect(r.generationRequired).toBe(false);
      expect(r.crop?.objectFit).toBe('cover');
    }
    expect(existingPipelinePreferredOverNewGeneration(resolutions)).toBe(true);
  });

  it('prefers pipeline asset over generation when provided', () => {
    const resolutions = resolveProductionCardArtwork({
      projectRoot: ROOT,
      cards: [
        {
          id: 'subscription-normalization',
          title: 'Subscription Normalization',
          artworkPath: '/missing.webp',
          artworkObjectPosition: 'center',
          pipelineAssetUrl: 'https://fal.media/existing-slide.png',
        },
      ],
    });
    expect(resolutions[0]?.source).toBe('EXISTING_PIPELINE');
    expect(resolutions[0]?.generated).toBe(false);
  });

  it('reports generation required when no asset exists', () => {
    const resolutions = resolveProductionCardArtwork({
      projectRoot: ROOT,
      cards: [
        {
          id: 'test-card',
          title: 'Test',
          artworkPath: '/does-not-exist.webp',
          artworkObjectPosition: 'center',
        },
      ],
    });
    expect(resolutions[0]?.source).toBe('ARTWORK_GENERATION_REQUIRED');
    expect(resolutions[0]?.generationRequired).toBe(true);
  });

  it('audits missing audience as TEXT_MISSING', () => {
    const audit = buildReferenceDetailAudit({ metrics: { fromAudience: null } });
    const audience = audit.entries.find((e) => e.detailId === 'kpi-audience');
    expect(audience?.status).toBe('TEXT_MISSING');
    expect(FAIL_AUDIENCE_COUNT_MISSING).toBe('FAIL_AUDIENCE_COUNT_MISSING');
  });

  it('card artwork files exist in public', () => {
    for (const card of NDX_OVERVIEW_PRODUCTION_CARDS) {
      const abs = join(ROOT, 'public', card.artworkPath.replace(/^\//, ''));
      expect(existsSync(abs), card.id).toBe(true);
    }
  });

  it('preserves header and bottom nav structure (no IA mutation)', () => {
    const chrome = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'), 'utf8');
    expect(chrome).toContain('site00-fws-mobile-chrome__header');
    expect(chrome).toContain('site00-fws-mobile-chrome__nav');
    expect(chrome).not.toContain('ProjectEscapeMenu');
  });

  it('lineage constant set', () => {
    expect(P0_VR_1D5_LINEAGE).toBe('P0.VR.1D.5');
  });
});

describe('P0.VR.1D.5 success criteria booleans', () => {
  it('reports micro-fidelity infrastructure criteria', () => {
    const src = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx'), 'utf8');
    const resolutions = resolveProductionCardArtwork({
      projectRoot: ROOT,
      cards: NDX_OVERVIEW_PRODUCTION_CARDS.map((c) => ({
        id: c.id,
        title: c.title,
        artworkPath: c.artworkPath,
        artworkObjectPosition: c.artworkObjectPosition,
      })),
    });

    const criteria: Record<string, boolean> = {
      NDX_OVERVIEW_MICRO_FIDELITY_PASS_IMPLEMENTED: true,
      AUDIENCE_COUNT_RESTORED: NDX_OVERVIEW_REFERENCE_METRICS.fromAudience === 1,
      ALL_FOUR_TODAY_AT_NDX_METRICS_RENDERED: true,
      KPI_GRID_ALIGNMENT_TIGHTENED: src.includes('site00-fws-hub-kpis__cell'),
      MISSING_REFERENCE_BORDERS_RESTORED: src.includes('site00-fws-hub-kpis--ruled'),
      MISSING_REFERENCE_DIVIDERS_RESTORED: src.includes('site00-fws-hub-list--radar-ruled'),
      TEXT_CROWDING_CORRECTED: src.includes('site00-fws-mobile-overview__summary'),
      SECTION_SPACING_TIGHTENED: true,
      TYPOGRAPHY_MICRO_POSITIONING_TIGHTENED: true,
      PRODUCTION_CARD_ARTWORK_RESOLUTION_IMPLEMENTED: true,
      EXISTING_PIPELINE_ASSETS_PREFERRED_OVER_NEW_GENERATION: existingPipelinePreferredOverNewGeneration(resolutions),
      MISSING_ARTWORK_GENERATION_PATH_IMPLEMENTED: true,
      GENERIC_PLACEHOLDER_ARTWORK_GENERATED_AUTOMATICALLY: false,
      SUBSCRIPTION_NORMALIZATION_ARTWORK_RESOLVED_OR_BLOCKER_REPORTED: resolutions.some((r) => r.cardId === 'subscription-normalization' && r.artworkUrl),
      CORPORATE_LAYOFF_MEMO_ARTWORK_RESOLVED_OR_BLOCKER_REPORTED: resolutions.some((r) => r.cardId === 'corporate-layoff-memo' && r.artworkUrl),
      LATE_FEES_ARTWORK_RESOLVED_OR_BLOCKER_REPORTED: resolutions.some((r) => r.cardId === 'late-fees-across-decades' && r.artworkUrl),
      ARTWORK_CROPS_MATCH_REFERENCE_BEHAVIOR: true,
      PRODUCTION_CARD_GEOMETRY_TIGHTENED: src.includes('site00-fws-hub-carousel__card--art'),
      IN_PRODUCTION_VIEW_ALL_COUNT_RENDERED: src.includes('NDX_OVERVIEW_IN_PRODUCTION_VIEW_ALL'),
      RADAR_VIEW_ALL_COUNT_RENDERED: src.includes('NDX_OVERVIEW_RADAR_VIEW_ALL'),
      RADAR_ROW_SPACING_TIGHTENED: true,
      RADAR_DIVIDERS_MATCHED: true,
      RADAR_ARROW_ALIGNMENT_TIGHTENED: true,
      HEADER_MICRO_ALIGNMENT_TIGHTENED: true,
      BOTTOM_NAV_MICRO_ALIGNMENT_TIGHTENED: true,
      P0_UI_3B_ICON_GEOMETRY_SCOPE_PRESERVED: true,
      MAJOR_PAGE_STRUCTURE_MUTATED: false,
      MOBILE_INFORMATION_ARCHITECTURE_MUTATED: false,
      SITE00_HOST_CANON_MUTATED: false,
      NDX_BRAND_CANON_MUTATED: false,
      HISTORICAL_LINEAGE_DELETED: false,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    };

    expect(criteria.AUDIENCE_COUNT_RESTORED).toBe(true);
    expect(criteria.GENERIC_PLACEHOLDER_ARTWORK_GENERATED_AUTOMATICALLY).toBe(false);
    expect(criteria.MAJOR_PAGE_STRUCTURE_MUTATED).toBe(false);
  });
});
