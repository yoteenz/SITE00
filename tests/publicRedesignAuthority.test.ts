/**
 * P0.SITE00.PUBLIC-REDESIGN.SONNET-STRUCTURE1 — authority manifest, asset slots, route preservation.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PUBLIC_REDESIGN_AUTHORITY_RECORDS,
  SUPERSEDED_AUTHORITY_IDS,
  WAITING_FOR_AUTHORITY_ROUTES,
  getAuthorityRecord,
} from '../src/site00/authority/publicRedesignAuthorityManifest';
import {
  PUBLIC_REDESIGN_ASSET_SLOTS,
  PUBLIC_REDESIGN_ASSET_URLS,
} from '../src/site00/authority/publicRedesignAssetSlots';
import { SITE00_ROUTES } from '../src/site00/config/routes';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

describe('authority manifest', () => {
  it('maps exactly the 37 ACTIVE authorities, in canonical sequence', () => {
    expect(PUBLIC_REDESIGN_AUTHORITY_RECORDS).toHaveLength(37);
    expect(PUBLIC_REDESIGN_AUTHORITY_RECORDS.map((r) => r.sequence)).toEqual(
      Array.from({ length: 37 }, (_, i) => i + 1),
    );
    expect(new Set(PUBLIC_REDESIGN_AUTHORITY_RECORDS.map((r) => r.id)).size).toBe(37);
  });

  it('per-family counts match the pack (4 / 5+5+4+4+4 / 6 / 4 / 1)', () => {
    const count = (family: string) => PUBLIC_REDESIGN_AUTHORITY_RECORDS.filter((r) => r.family === family).length;
    expect(count('ORIGIN')).toBe(4);
    expect(count('IDNTY')).toBe(5 + 5 + 4 + 4 + 4);
    expect(count('BLDR')).toBe(6);
    expect(count('EVOLVE')).toBe(4);
    expect(count('LOCATIONS')).toBe(1);
  });

  it('never implements the 3 superseded images', () => {
    expect(SUPERSEDED_AUTHORITY_IDS).toHaveLength(3);
    for (const id of SUPERSEDED_AUTHORITY_IDS) {
      expect(getAuthorityRecord(id)).toBeUndefined();
    }
    expect(PUBLIC_REDESIGN_AUTHORITY_RECORDS.some((r) => r.packPath.startsWith('99_SUPERSEDED'))).toBe(false);
    expect(PUBLIC_REDESIGN_AUTHORITY_RECORDS.some((r) => /OLD_REFINE/.test(r.id))).toBe(false);
  });

  it('uses folder path + numeric prefix, not upload chronology or local ZIP paths', () => {
    for (const r of PUBLIC_REDESIGN_AUTHORITY_RECORDS) {
      expect(r.packPath).toMatch(/^0\d_[A-Z_]+(\/[0-9_A-Z]+)*\/\d\d_[A-Z0-9_]+\.jpg$/);
      expect(r.packPath).not.toMatch(/^\/|\.zip|IMG_|[0-9A-F]{8}-[0-9A-F]{4}/);
    }
  });

  it('every record references only registered asset slots, and every slot is referenced', () => {
    const slotIds = new Set(PUBLIC_REDESIGN_ASSET_SLOTS.map((s) => s.id));
    const referenced = new Set<string>();
    for (const r of PUBLIC_REDESIGN_AUTHORITY_RECORDS) {
      for (const id of r.assetSlots) {
        expect(slotIds.has(id), `${r.id} → ${id}`).toBe(true);
        referenced.add(id);
      }
    }
    for (const id of slotIds) expect(referenced.has(id), `unreferenced slot ${id}`).toBe(true);
  });

  it('records deviations honestly for the Build Ready verification family', () => {
    const buildReady = PUBLIC_REDESIGN_AUTHORITY_RECORDS.filter((r) => r.pageFamily === 'IDNTY_BUILD_READY');
    expect(buildReady).toHaveLength(4);
    for (const r of buildReady) expect(r.status).toBe('STRUCTURE_IMPLEMENTED_WITH_DEVIATION');
  });

  it('keeps public EVOLVE to exactly three paths and gives it no IDNTY state routes', () => {
    const evolvePanels = PUBLIC_REDESIGN_AUTHORITY_RECORDS.filter((r) => r.pageFamily === 'EVOLVE_PATH_PANEL');
    expect(evolvePanels.map((r) => r.state)).toEqual(['refine', 'install', 'transform']);
    for (const r of PUBLIC_REDESIGN_AUTHORITY_RECORDS.filter((x) => x.family === 'EVOLVE')) {
      expect(r.route).not.toMatch(/starting-at-zero|some-pieces|ready-for-evolution|build-ready/);
    }
  });
});

describe('asset slots (Grok contract)', () => {
  it('has unique, stable ids with full specs', () => {
    const ids = PUBLIC_REDESIGN_ASSET_SLOTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const slot of PUBLIC_REDESIGN_ASSET_SLOTS) {
      expect(slot.id).toMatch(/^[A-Z0-9_.]+$/);
      expect(slot.dimensions.w).toBeGreaterThan(0);
      expect(slot.dimensions.h).toBeGreaterThan(0);
      expect(slot.aspect).toMatch(/^\d+:[\d.]+$/);
      expect(slot.role.length).toBeGreaterThan(10);
      expect(slot.fallback.length).toBeGreaterThan(5);
      expect(slot.routes.length).toBeGreaterThan(0);
      expect(slot.authority.length).toBeGreaterThan(0);
    }
  });

  it('ships NO final raster during the Sonnet pass', () => {
    expect(PUBLIC_REDESIGN_ASSET_URLS).toEqual({});
  });

  it('never bakes UI text into a slot description or uses authority crops', () => {
    for (const slot of PUBLIC_REDESIGN_ASSET_SLOTS) {
      expect(slot.responsive + slot.fallback).not.toMatch(/screenshot crop|authority crop/i);
    }
  });
});

describe('route + function preservation', () => {
  it('keeps the canonical public route constants', () => {
    expect(SITE00_ROUTES.origin).toBe('/');
    expect(SITE00_ROUTES.originAlias).toBe('/origin');
    expect(SITE00_ROUTES.locations).toBe('/origin/locations');
    expect(SITE00_ROUTES.idntyState).toBe('/idnty/state');
    expect(SITE00_ROUTES.bldrState).toBe('/bldr/state');
    expect(SITE00_ROUTES.evolveState).toBe('/evolve/state');
  });

  it('leaves uncovered routes registered and untouched', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    for (const needle of [
      'path="/bldr/:classSlug/*"',
      'path="/evolve/:pathSlug/*"',
      'SITE00_ROUTES.bldrStart',
      'SITE00_ROUTES.evolveMarketing',
    ]) {
      expect(routes, needle).toContain(needle);
    }
  });

  it('flags missing-authority routes as waiting, never invents checkout screens', () => {
    expect(WAITING_FOR_AUTHORITY_ROUTES.map((r) => r.route)).toContain('/checkout/*');
    for (const r of PUBLIC_REDESIGN_AUTHORITY_RECORDS) expect(r.route).not.toMatch(/checkout/);
  });

  it('routes through the redesigned components on mobile and keeps the legacy desktop branches', () => {
    expect(read('src/site00/pages/IdntyStatePage.tsx')).toContain('IdentityDiagnosticOverview');
    expect(read('src/site00/pages/BldrStatePage.tsx')).toContain('BuilderStateExperience');
    expect(read('src/site00/pages/BldrStatePage.tsx')).toContain('site00-state-page--bldr');
    expect(read('src/site00/pages/EvolveStatePage.tsx')).toContain('EvolveStateExperience');
    expect(read('src/site00/pages/EvolveStatePage.tsx')).toContain('EvolveDesktopStatePageBody');
    expect(read('src/site00/pages/LocationsPage.tsx')).toContain('PublicLocationsDirectory');
    expect(read('src/site00/pages/OriginPage.tsx')).toContain('PublicOriginMobile');
    expect(read('src/site00/pages/OriginPage.tsx')).toContain('site00-origin-page--desktop-artboard');
  });
});
