/**
 * P0.CLIENT.1 — Client Project Room architecture tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import {
  buildManifestFromScope,
  SERVICE_SCOPE_TEMPLATES,
  resolveServiceScope,
} from '../shared/site00-client-project-room/manifestTemplates.js';
import {
  capabilitiesForRole,
  clientHasCapability,
  ADMIN_ONLY_CAPABILITIES,
  SITE00_DEFAULT_ACCENT,
} from '../shared/site00-client-project-room/capabilities.js';
import {
  buildClientProjectRoomViewModel,
} from '../shared/site00-client-project-room/viewModel.js';
import {
  translateProjectEventForClient,
  translateProjectStatusForClient,
  clientPayloadContainsForbiddenFields,
  stripInternalFields,
} from '../shared/site00-client-project-room/translators.js';
import { clientProjectRoomPath } from '../shared/site00-client-project-room/client.js';

const ROOT = join(import.meta.dirname, '..');
const DEV_BASE = process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174';

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.CLIENT.1 client project room architecture', () => {
  it('implements capability model with role defaults', () => {
    const owner = capabilitiesForRole('CLIENT_OWNER');
    const collab = capabilitiesForRole('CLIENT_COLLABORATOR');
    const viewer = capabilitiesForRole('CLIENT_VIEWER');
    expect(clientHasCapability(owner, 'CAN_APPROVE')).toBe(true);
    expect(clientHasCapability(collab, 'CAN_APPROVE')).toBe(false);
    expect(clientHasCapability(viewer, 'CAN_COMMENT')).toBe(false);
    for (const cap of ADMIN_ONLY_CAPABILITIES) {
      expect(owner.includes(cap)).toBe(false);
    }
  });

  it('derives service-scoped phases without hardcoded marketing for all projects', () => {
    const websiteOnly = buildManifestFromScope({
      projectId: '1',
      projectSlug: 'web',
      displayName: 'WEB CLIENT',
      projectNumber: 'P001',
      scope: 'WEBSITE_ONLY',
      currentPhaseId: 'design',
      attentionState: 'WATCHING',
      startDate: '2025-01-01',
    });
    expect(websiteOnly.services).toEqual(['WEBSITE']);
    expect(websiteOnly.phases.some((p) => p.label === 'MARKETING')).toBe(false);
    expect(websiteOnly.deliverables.some((d) => d.includes('Marketing'))).toBe(false);

    const ndxLike = buildManifestFromScope({
      projectId: '2',
      projectSlug: 'ndx',
      displayName: 'NDX',
      projectNumber: 'P002',
      scope: 'NDXBOOK_LIKE',
      currentPhaseId: 'identity',
      attentionState: 'YOUR_TURN',
      startDate: '2025-01-01',
      permissions: capabilitiesForRole('CLIENT_OWNER'),
    });
    expect(ndxLike.services).toContain('MARKETING');
    expect(ndxLike.nextAction?.ctaLabel).toBe('BEGIN REVIEW');
  });

  it('supports attention states WATCHING / YOUR_TURN / LOCKED', () => {
    const watching = buildManifestFromScope({
      projectId: '1',
      projectSlug: 'a',
      displayName: 'A',
      projectNumber: 'P1',
      scope: 'IDENTITY_PLUS_WEBSITE',
      currentPhaseId: 'identity',
      attentionState: 'WATCHING',
      startDate: '2025-01-01',
    });
    expect(watching.nextAction).toBeNull();
    expect(watching.statusLabel).toBe('IN PRODUCTION');

    const yourTurn = buildManifestFromScope({
      projectId: '1',
      projectSlug: 'a',
      displayName: 'A',
      projectNumber: 'P1',
      scope: 'IDENTITY_PLUS_WEBSITE',
      currentPhaseId: 'identity',
      attentionState: 'YOUR_TURN',
      startDate: '2025-01-01',
    });
    expect(yourTurn.nextAction).not.toBeNull();

    const locked = buildManifestFromScope({
      projectId: '1',
      projectSlug: 'a',
      displayName: 'A',
      projectNumber: 'P1',
      scope: 'IDENTITY_PLUS_WEBSITE',
      currentPhaseId: 'identity',
      attentionState: 'LOCKED',
      startDate: '2025-01-01',
    });
    expect(locked.currentMoment.statusTag).toBe('APPROVED');
  });

  it('defaults accent to SITE00 red until color profile established', () => {
    const unset = buildManifestFromScope({
      projectId: '1',
      projectSlug: 'a',
      displayName: 'A',
      projectNumber: 'P1',
      scope: 'IDENTITY_ONLY',
      currentPhaseId: 'identity',
      attentionState: 'WATCHING',
      startDate: '2025-01-01',
    });
    expect(unset.accentColor).toBe(SITE00_DEFAULT_ACCENT);
    expect(unset.accentSource).toBe('DEFAULT_SITE00_RED');

    const established = buildManifestFromScope({
      projectId: '1',
      projectSlug: 'a',
      displayName: 'A',
      projectNumber: 'P1',
      scope: 'IDENTITY_ONLY',
      currentPhaseId: 'identity',
      attentionState: 'WATCHING',
      startDate: '2025-01-01',
      accentColor: '#7CFC00',
      colorProfileState: 'ESTABLISHED',
    });
    expect(established.accentColor).toBe('#7CFC00');
    expect(established.accentSource).toBe('CLIENT_COLOR_PROFILE');
  });

  it('translates internal events and strips forbidden payload fields', () => {
    expect(translateProjectStatusForClient('GENERATION_IN_PROGRESS')).toBe('IN PRODUCTION');
    expect(translateProjectStatusForClient('CANON_CANDIDATE')).toBe('READY FOR REVIEW');
    expect(translateProjectEventForClient({ id: '1', eventType: 'FAL_JOB' })).toBe('HIDDEN');
    expect(
      translateProjectEventForClient({
        id: '2',
        eventType: 'IDENTITY_APPROVED',
        summary: 'Identity Direction 02 was approved.',
        timestamp: '2026-08-25T12:00:00Z',
      }),
    ).toMatchObject({ summary: 'Identity Direction 02 was approved.' });

    const stripped = stripInternalFields({
      title: 'Review',
      repo: 'yoteenz/fsbw',
      nested: { prompt: 'secret', ok: true },
    });
    expect(stripped.repo).toBeUndefined();
    expect((stripped.nested as { prompt?: string }).prompt).toBeUndefined();
    expect(clientPayloadContainsForbiddenFields({ commit: 'abc' })).toBe(true);
  });

  it('builds client-safe view model with overview sections', () => {
    const manifest = buildManifestFromScope({
      projectId: 'preview',
      projectSlug: 'preview-client-room',
      displayName: 'NDXBOOK',
      projectNumber: 'PROJECT 0042',
      scope: 'IDENTITY_PLUS_WEBSITE',
      currentPhaseId: 'identity',
      attentionState: 'YOUR_TURN',
      startDate: '2025-08-12',
      permissions: capabilitiesForRole('CLIENT_OWNER'),
    });
    const vm = buildClientProjectRoomViewModel(manifest);
    expect(vm.overview.header.roomLabel).toBe('PROJECT ROOM');
    expect(vm.overview.projectMap.length).toBe(SERVICE_SCOPE_TEMPLATES.IDENTITY_PLUS_WEBSITE.phases.length);
    expect(vm.overview.rightRail?.deliverablesIncluded.length).toBeGreaterThan(0);
    expect(clientPayloadContainsForbiddenFields(vm)).toBe(false);
  });

  it('wires client routes and shell CSS without admin design controls', () => {
    expect(read('src/site00/config/routes.ts')).toContain("clientProjectRoom: '/client/projects/:projectSlug'");
    expect(read('src/routes/Site00Routes.tsx')).toContain('ClientProjectRoomOverviewPage');
    expect(read('src/site00/styles/site00-client-project-room-p0client1.css')).toContain('.site00-cpr-bottom-nav');
    expect(read('src/site00/styles/site00-client-project-room-p0client1.css')).toContain('.site00-cpr-sidebar');
    expect(read('src/site00/components/clientProjectRoom/ClientProjectRoomOverview.tsx')).toContain('CURRENT MOMENT');
    expect(read('api/site00/client-project-room.ts')).toContain('client-project-room');
    expect(clientProjectRoomPath('preview-client-room', 'reviews')).toBe(
      '/client/projects/preview-client-room/reviews',
    );
  });

  it('resolveServiceScope maps build types', () => {
    expect(resolveServiceScope({ metadataScope: 'WEBSITE_ONLY' })).toBe('WEBSITE_ONLY');
    expect(resolveServiceScope({ buildType: 'IDENTITY WEBSITE' })).toBe('IDENTITY_PLUS_WEBSITE');
    expect(resolveServiceScope({ buildType: 'IDENTITY' })).toBe('IDENTITY_ONLY');
  });
});

describe('P0.CLIENT.1 live browser client project room', () => {
  let serverUp = false;

  beforeAll(async () => {
    try {
      const res = await fetch(`${DEV_BASE}/`, { signal: AbortSignal.timeout(3000) });
      serverUp = res.ok;
    } catch {
      serverUp = false;
    }
  });

  it('renders overview shell with footer nav and key panels on preview route', async () => {
    if (!serverUp) {
      console.warn('[P0.CLIENT.1] Dev server not reachable — skipping live browser test');
      return;
    }

    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const artifactsDir = '/opt/cursor/artifacts';
    const { mkdirSync } = await import('node:fs');
    mkdirSync(artifactsDir, { recursive: true });

    try {
      for (const viewport of [
        { name: 'mobile', width: 390, height: 844 },
        { name: 'tablet', width: 834, height: 1112 },
        { name: 'desktop', width: 1280, height: 900 },
      ]) {
        const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
        await page.addInitScript(() => {
          window.localStorage.setItem('isSignedIn', 'true');
        });
        await page.goto(`${DEV_BASE}/client/projects/preview-client-room`, {
          waitUntil: 'networkidle',
          timeout: 60000,
        });
        await page.waitForSelector('.site00-cpr-header__title', { timeout: 30000 });

        const title = await page.locator('.site00-cpr-header__title').textContent();
        expect(title?.toUpperCase()).toContain('NDXBOOK');

        expect(await page.locator('.site00-cpr-panel__title', { hasText: 'CURRENT MOMENT' }).count()).toBeGreaterThan(0);
        expect(await page.locator('.site00-cpr-panel__title', { hasText: 'PROJECT MAP' }).count()).toBeGreaterThan(0);
        expect(await page.locator('.site00-cpr-panel__title', { hasText: 'LATEST FROM SITE 00' }).count()).toBeGreaterThan(0);
        expect(await page.locator('.site00-cpr-next__title').count()).toBeGreaterThan(0);

        if (viewport.name === 'mobile') {
          expect(await page.locator('.site00-cpr-bottom-nav').count()).toBeGreaterThan(0);
        }
        if (viewport.name === 'desktop') {
          expect(await page.locator('.site00-cpr-sidebar').count()).toBeGreaterThan(0);
          expect(await page.locator('.site00-cpr-rail').count()).toBeGreaterThan(0);
        }

        await page.screenshot({
          path: join(artifactsDir, `p0client1-project-room-${viewport.name}.png`),
          fullPage: false,
        });
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }, 120000);
});
