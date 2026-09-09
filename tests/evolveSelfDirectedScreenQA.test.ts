/**
 * P0.VR.6R9 — Evolve + self-directed visual convergence + screenshot QA matrix tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildEvolveSelfDirectedScreenQAMatrix,
  canVerifyScreen,
  countAuthorityResults,
  createEmptyEvolveSelfDirectedScreenQAMatrix,
  finalizeEvolveSelfDirectedScreenQAMatrix,
  listRequiredQARoutes,
  applyScreenQACapture,
} from '../shared/site00-evolve-self-directed/screenQAMatrix.js';
import {
  getEvolveSelfDirectedAuthority,
  countRegisteredAuthorities,
  listEvolveSelfDirectedAuthorities,
} from '../shared/site00-evolve-self-directed/authorityRegistry.js';
import {
  DESKTOP_STRETCH_FAILURE_CODE,
  evaluateDesktopStretchGuard,
  evaluateGenericChildUiGuard,
  evaluateNoOpGuard,
  evaluatePartialOpGuard,
  GENERIC_CHILD_UI_FAILURE_CODE,
} from '../shared/site00-evolve-self-directed/guards.js';
import {
  computePixelDeltaRatio,
  VISUAL_NO_OP_FAILURE_CODE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/visualImplementationNoOpGuard.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('EvolveSelfDirectedScreenQAMatrix', () => {
  it('registers 12 screen authorities without duplicates', () => {
    const authorities = listEvolveSelfDirectedAuthorities();
    expect(authorities).toHaveLength(12);
    expect(countRegisteredAuthorities()).toBe(12);
    const ids = new Set(authorities.map((a) => a.authorityId));
    expect(ids.size).toBe(12);
  });

  it('maps evolve mobile and desktop authorities', () => {
    const mobile = getEvolveSelfDirectedAuthority('EVOLVE_SERVICE', 'MOBILE');
    const desktop = getEvolveSelfDirectedAuthority('EVOLVE_SERVICE', 'DESKTOP');
    expect(mobile?.route).toBe('/evolve');
    expect(desktop?.route).toBe('/evolve/desktop');
    expect(mobile?.fidelityMode).toBe('EXACT');
  });

  it('builds matrix with 6 rows and 12 authority results', () => {
    const matrix = buildEvolveSelfDirectedScreenQAMatrix();
    expect(matrix.rows).toHaveLength(6);
    expect(countAuthorityResults(matrix)).toBe(12);
    expect(matrix.rows.every((r) => r.mobile.reference?.url && r.desktop.reference?.url)).toBe(true);
  });

  it('requires reference live overlay diff for verify', () => {
    const cell = {
      reference: { kind: 'REFERENCE' as const, url: 'a', capturedAt: null, viewportWidth: 390, viewportHeight: 844, devicePixelRatio: 2 },
      live: { kind: 'LIVE' as const, url: 'b', capturedAt: null, viewportWidth: 390, viewportHeight: 844, devicePixelRatio: 2 },
      overlay: { kind: 'OVERLAY' as const, url: 'c', capturedAt: null, viewportWidth: 390, viewportHeight: 844, devicePixelRatio: 2 },
      diff: { kind: 'DIFF' as const, url: 'd', capturedAt: null, viewportWidth: 390, viewportHeight: 844, devicePixelRatio: 2 },
      status: 'CAPTURED' as const,
      regionDrift: [],
    };
    expect(canVerifyScreen(cell)).toBe(true);
    expect(canVerifyScreen({ ...cell, diff: null })).toBe(false);
  });

  it('lists all primary QA routes', () => {
    const routes = listRequiredQARoutes();
    expect(routes).toContain('/evolve');
    expect(routes).toContain('/evolve/desktop');
    expect(routes.some((r) => r.includes('/app/projects/:slug/reviews'))).toBe(true);
    expect(routes.some((r) => r.includes('/app/projects/:slug/inbox'))).toBe(true);
  });
});

describe('Visual convergence guards', () => {
  it('no-op guard fails when delta unchanged', () => {
    const result = evaluateNoOpGuard(0.01, 0.01);
    expect(result.materialVisualDelta).toBe(false);
    expect(result.failureCode).toBe(VISUAL_NO_OP_FAILURE_CODE);
  });

  it('no-op guard passes when material delta exists', () => {
    const result = evaluateNoOpGuard(0.35, 0.08);
    expect(result.materialVisualDelta).toBe(true);
    expect(result.failureCode).toBeNull();
  });

  it('partial-op guard fails when majority unresolved', () => {
    const result = evaluatePartialOpGuard({
      totalSignificantMismatches: 10,
      resolvedMismatches: 2,
    });
    expect(result.pass).toBe(false);
  });

  it('desktop-stretch guard detects bottom nav on desktop', () => {
    const matrix = createEmptyEvolveSelfDirectedScreenQAMatrix();
    matrix.rows[1]!.desktop.regionDrift = matrix.rows[1]!.desktop.regionDrift.map((d) =>
      d.region === 'NAV' ? { ...d, driftLevel: 'MAJOR', notes: ['BOTTOM_NAV_ON_DESKTOP'] } : d,
    );
    const guard = evaluateDesktopStretchGuard(matrix.rows);
    expect(guard.pass).toBe(false);
    expect(guard.failureCode).toBe(DESKTOP_STRETCH_FAILURE_CODE);
  });

  it('generic child UI guard fails when surfaces flagged', () => {
    const guard = evaluateGenericChildUiGuard(['sd-review-detail']);
    expect(guard.pass).toBe(false);
    expect(guard.failureCode).toBe(GENERIC_CHILD_UI_FAILURE_CODE);
  });
});

describe('Public Evolve routes', () => {
  it('evolve mobile authority loads EvolveHubPage', () => {
    expect(read('src/site00/pages/evolve/EvolveHubPage.tsx')).toContain('EvolveHubMobileExperience');
  });

  it('evolve desktop authority loads desktop experience', () => {
    expect(read('src/site00/pages/evolve/EvolveHubPage.tsx')).toContain('EvolveHubDesktopExperience');
  });

  it('mobile and desktop hub are independent components', () => {
    const hub = read('src/site00/pages/evolve/EvolveHubPage.tsx');
    expect(hub).toContain('EvolveHubMobileExperience');
    expect(hub).toContain('EvolveHubDesktopExperience');
    expect(read('src/site00/styles/site00-evolve-hub-desktop.css')).toContain('site00-evolve-hub-desktop');
  });

  it('uses EvolveServiceIcon not EvolvePathIcon on service hub', () => {
    expect(read('src/site00/components/evolve/hub-mobile/EvolveHubPathCard.tsx')).toContain('EvolveServiceIcon');
    expect(read('src/site00/components/evolve/hub-mobile/EvolveHubPathCard.tsx')).not.toContain('EvolvePathIcon');
  });
});

describe('Self-directed client shell visual rebuild', () => {
  it('home uses SelfDirectedHomeView with desktop variant', () => {
    const views = read('src/site00/components/selfDirected/SelfDirectedViews.tsx');
    expect(views).toContain('SelfDirectedHomeDesktop');
    expect(read('src/site00/pages/clientApp/AppHomePage.tsx')).toContain('SelfDirectedHomeView');
  });

  it('projects uses desktop grid variant', () => {
    expect(read('src/site00/components/selfDirected/SelfDirectedViews.tsx')).toContain('SelfDirectedProjectsDesktop');
  });

  it('reviews visual rebuild present — not legacy queue list on page', () => {
    const page = read('src/site00/pages/clientApp/AppReviewsQueuePage.tsx');
    expect(page).toContain('SelfDirectedReviewsView');
    expect(page).not.toContain('ClientAppReviewQueueList');
    expect(read('src/site00/components/selfDirected/SelfDirectedReviewsView.tsx')).toContain('site00-sd-reviews');
  });

  it('inbox visual rebuild present — not generic inbox item list', () => {
    const page = read('src/site00/pages/clientApp/AppInboxPage.tsx');
    expect(page).toContain('SelfDirectedInboxView');
    expect(page).not.toContain('site00-app-inbox-item');
    expect(read('src/site00/components/selfDirected/SelfDirectedInboxView.tsx')).toContain('SelfDirectedInboxThreadView');
  });

  it('profile has edit sheet child surface', () => {
    expect(read('src/site00/components/selfDirected/SelfDirectedViews.tsx')).toContain('SelfDirectedProfileEditSheet');
  });

  it('desktop shell uses side nav not bottom nav stretch', () => {
    const shell = read('src/site00/components/clientApp/Site00ClientAppShell.tsx');
    expect(shell).toContain('site00-app-side-nav');
    expect(read('src/site00/styles/site00-client-app.css')).toContain('site00-app-side-nav');
  });

  it('five-tab client nav preserved', () => {
    expect(read('src/site00/components/clientApp/Site00ClientAppShell.tsx')).toContain('CLIENT_APP_NAV');
    expect(read('shared/site00-self-directed/nav.ts')).toContain('REVIEWS');
    expect(read('shared/site00-self-directed/nav.ts')).toContain('INBOX');
  });

  it('review detail uses product grammar shell', () => {
    expect(read('src/site00/pages/clientApp/AppReviewsQueuePage.tsx')).toContain('SelfDirectedReviewDetailShell');
  });
});

describe('Page completion and matrix finalize', () => {
  it('page completion contracts exist for all tabs', () => {
    expect(read('shared/site00-self-directed/pageCompletionContracts.ts')).toContain('self-directed-reviews');
    expect(read('shared/site00-self-directed/pageCompletionContracts.ts')).toContain('self-directed-inbox');
  });

  it('matrix finalize attaches guard results', () => {
    let matrix = buildEvolveSelfDirectedScreenQAMatrix();
    matrix = applyScreenQACapture(matrix, {
      screenId: 'HOME',
      viewport: 'MOBILE',
      kind: 'LIVE',
      url: '/snapshots/home-mobile.png',
    });
    const finalized = finalizeEvolveSelfDirectedScreenQAMatrix({
      matrix,
      beforeDeltaRatio: 0.4,
      afterDeltaRatio: 0.12,
      totalMismatches: 8,
      resolvedMismatches: 7,
    });
    expect(finalized.guards.noOp.pass).toBe(true);
    expect(finalized.guards.partialOp.pass).toBe(true);
  });

  it('pixel delta utility works for guard evaluation', () => {
    const before = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255]);
    const after = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]);
    expect(computePixelDeltaRatio(before, after)).toBe(0.5);
  });
});
