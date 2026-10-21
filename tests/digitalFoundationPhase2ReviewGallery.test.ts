/**
 * Phase 2 — review gallery registers every board as a real React render, with no duplicate previews and no
 * cross-product source ownership.
 */
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { parseClientDigitalFoundationPayload } from '../src/site00/foundation-client/validateClientPayload';
import { DIGITAL_FOUNDATION_REVIEW_BOARD_IDS } from './helpers/dfPhase2Boards';
import DigitalFoundationReviewPreviewHost, { portalViewForAnchor } from '../src/site00/pages/foundation/DigitalFoundationReviewPreviewHost';
import { DigitalFoundationReviewPreviewProvider, type ReviewPreviewState } from '../src/site00/pages/foundation/DigitalFoundationReviewPreviewContext';
import { FOUNDER_BOARD_FOR_REVIEW_ID } from '../src/site00/pages/foundation/DigitalFoundationReviewFounderBoardHost';
import { galleryEntriesOrdered } from '../src/site00/pages/foundation/digitalFoundationReviewGallery';
import {
  DF_REVIEW_PRODUCT,
  allReviewRegistryEntries,
  resolveReviewEntry,
} from '../src/site00/pages/foundation/digitalFoundationReviewRegistry';
import type { ReviewBootstrapBundle } from '../src/site00/pages/foundation/digitalFoundationReviewBootstrap';
import snapshots from '../src/site00/pages/foundation/generated/reviewFixtureSnapshots.json';

function previewState(): ReviewPreviewState {
  const fixtures: ReviewBootstrapBundle['fixtures'] = {};
  for (const [key, row] of Object.entries(snapshots.fixtures)) {
    fixtures[key as keyof typeof snapshots.fixtures] = { token: row.token, payload: parseClientDigitalFoundationPayload(structuredClone(row.payload)) };
  }
  const bootstrap = {
    source: 'offline_snapshots',
    catalog: snapshots.catalog.catalog,
    config: snapshots.catalog.config,
    fixtures,
  } as unknown as ReviewBootstrapBundle;
  return {
    dataSource: 'offline_snapshots',
    catalog: bootstrap.catalog,
    config: bootstrap.config,
    quotePayload: fixtures.A_BASE?.payload ?? null,
    quoteToken: fixtures.A_BASE?.token ?? '',
    paidPayload: fixtures.J_PAYMENT_SUCCESS?.payload ?? null,
    paidToken: fixtures.J_PAYMENT_SUCCESS?.token ?? '',
    postIntakePayload: fixtures.INTAKE_SUBMITTED?.payload ?? null,
    proposalReadyPayload: fixtures.PROPOSAL_READY?.payload ?? null,
    paymentFailurePayload: fixtures.K_PAYMENT_FAILURE?.payload ?? null,
    completePayload: fixtures.M_COMPLETE_CREDIT?.payload ?? null,
    completeToken: fixtures.M_COMPLETE_CREDIT?.token ?? '',
    postIntakeFetchedAt: new Date('2026-10-20T00:00:00Z'),
    draft: {} as ReviewPreviewState['draft'],
    setDraft: () => undefined,
    setQuotePayload: () => undefined,
    bootstrap,
  };
}

function renderAnchor(anchorId: string): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(DigitalFoundationReviewPreviewProvider, { value: previewState() }, createElement(DigitalFoundationReviewPreviewHost, { anchorId })),
    ),
  );
}

describe('phase 2 review registry', () => {
  it('registers every implemented board as an inline, reviewable entry', () => {
    for (const reviewId of DIGITAL_FOUNDATION_REVIEW_BOARD_IDS) {
      const entry = allReviewRegistryEntries().find((e) => e.reviewId === reviewId);
      expect(entry, reviewId).toBeDefined();
      expect(entry!.implementationStatus).toBe('reviewable');
      expect(['inline_df_screen', 'inline_founder_shell']).toContain(entry!.renderMode);
    }
  });

  it('12A is board-only and owned by the SITE 00 Digital Location product', () => {
    const entry = resolveReviewEntry('df-r-digital-location-live')!;
    expect(entry.productOwner).toBe(DF_REVIEW_PRODUCT.SITE00_DIGITAL_LOCATION);
    expect(entry.renderMode).toBe('registry_gap');
  });

  it('founder board entries point at the board sources and admin routes, not the legacy workspace pages', () => {
    for (const reviewId of Object.keys(FOUNDER_BOARD_FOR_REVIEW_ID)) {
      const entry = allReviewRegistryEntries().find((e) => e.reviewId === reviewId)!;
      expect(entry.componentSource).toMatch(/^admin\/pages\/foundation\/boards\/FounderBoards\.tsx#Founder/);
      expect(entry.runtimeRoute).toMatch(/^\/admin\/site00\/foundation\//);
      expect(entry.fixtureContract).toBe('FOUNDER_OPERATIONS_SNAPSHOT');
    }
  });

  it('anchors are unique across the gallery', () => {
    const anchors = galleryEntriesOrdered().map((e) => e.anchorId);
    expect(new Set(anchors).size).toBe(anchors.length);
  });
});

describe('no duplicate previews', () => {
  it('lowercase client anchors map to their own view, never to OVERVIEW', () => {
    expect(portalViewForAnchor('df-r-needs-you-approval')).toBe('NEEDS_YOU');
    expect(portalViewForAnchor('df-r-record-domain')).toBe('RECORD');
    expect(portalViewForAnchor('df-r-complete')).toBe('COMPLETE');
    expect(portalViewForAnchor('df-r-location')).toBe('LOCATION');
    expect(portalViewForAnchor('df-r-OVERVIEW')).toBe('OVERVIEW');
    expect(portalViewForAnchor('df-r-client-activity')).toBeNull();
    expect(portalViewForAnchor('df-r-P04')).toBeNull();
  });

  it('each client portal board renders its own screen', () => {
    const screens: Record<string, string> = {
      'df-r-OVERVIEW': 'data-view="OVERVIEW"',
      'df-r-needs-you-approval': 'BUSINESS SIGNATURE PREVIEW',
      'df-r-RECORDS': 'ALL IN ONE PLACE',
      'df-r-record-domain': 'RECORD DETAILS',
      'df-r-complete': 'IS COMPLETE',
      'df-r-location': 'CHOOSE YOUR BUILD PATH',
    };
    const seen = new Set<string>();
    for (const [anchor, marker] of Object.entries(screens)) {
      const out = renderAnchor(anchor);
      expect(out, anchor).toContain(marker);
      expect(out, anchor).not.toContain('SELECT A REGISTRY ENTRY');
      const body = out.replace(/id="[^"]*"|#df-r-[\w-]+|data-review-anchor="[^"]*"/g, '');
      expect(seen.has(body), `${anchor} duplicates another preview`).toBe(false);
      seen.add(body);
    }
  });

  it('each founder board entry renders its own board, not the legacy workspace page', () => {
    const seen = new Set<string>();
    for (const [reviewId, board] of Object.entries(FOUNDER_BOARD_FOR_REVIEW_ID)) {
      const entry = allReviewRegistryEntries().find((e) => e.reviewId === reviewId)!;
      const out = renderAnchor(entry.anchorId);
      expect(out).toContain(`data-founder-board="${board}"`);
      expect(out).not.toContain('df-review__founder-host');
      const body = out.replace(/id="[^"]*"|#df-r-[\w-]+|data-review-anchor="[^"]*"|<p class="df-review__label">[^<]*<\/p>/g, '');
      expect(seen.has(body)).toBe(false);
      seen.add(body);
    }
  });

  it('completed portal shell opens with the four areas and the milestone views', () => {
    const out = renderAnchor('df-r-client-portal-complete');
    for (const tab of ['OVERVIEW', 'ROADMAP', 'NEEDS YOU', 'RECORDS']) expect(out).toContain(`>${tab}</button>`);
    expect(out).toContain('M_COMPLETE_CREDIT');
    expect(out).toContain('YOUR FOUNDATION IS COMPLETE');
  });
});

describe('source ownership', () => {
  const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

  it('founder boards and review hosts import neither the public builder studio nor the legacy workspace pages', () => {
    for (const file of [
      'src/site00/admin/pages/foundation/boards/FounderBoards.tsx',
      'src/site00/admin/pages/foundation/boards/founderBoardModel.ts',
      'src/site00/pages/foundation/DigitalFoundationReviewFounderBoardHost.tsx',
      'src/site00/foundation-client/parents/FoundationMilestone.tsx',
    ]) {
      const src = read(file);
      expect(src, file).not.toMatch(/builder-studio\/|BldrSpatialStudioPage|founder-workspace\/pages\//);
    }
  });

  it('client boards never mutate from review mode and never read a credit from the URL', () => {
    for (const file of ['src/site00/foundation-client/parents/FoundationMilestone.tsx', 'src/site00/foundation-client/parents/ProjectPortal.tsx']) {
      const src = read(file);
      expect(src).toContain('useDfReviewInert');
      expect(src).not.toMatch(/URLSearchParams|location\.search|searchParams/);
    }
  });

  it('founder boards only call the start-task and complete-task operations', () => {
    const page = read('src/site00/admin/pages/foundation/FoundationFounderProjectBoardPage.tsx');
    const calls = [...page.matchAll(/foundationAdminApi\.(\w+)\(/g)].map((m) => m[1]);
    expect(new Set(calls)).toEqual(new Set(['projectCommand', 'runbook', 'startTask', 'completeTask']));
    expect(read('src/site00/admin/pages/foundation/boards/FounderBoards.tsx')).not.toMatch(/runTaskVerification|foundationAdminApi/);
  });
});
