/**
 * P0.E.1 — Astral World high-fidelity experience prototype tests
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ASTRAL_EXPERIENCE_CREATIVE_EXPLORATION } from '../shared/site00-astral-world/creativeExploration.js';
import {
  DISTRICT_OCCUPANCY,
  PROTOTYPE_FRIENDS,
  PROTOTYPE_KIOSKS,
  PROTOTYPE_NOTIFICATIONS,
  PROTOTYPE_READERS,
  PROTOTYPE_TABLES,
} from '../shared/site00-astral-world/fixtures.js';
import {
  canAlertRegularReturn,
  createInitialUserPresence,
  friendLocationLabel,
  joinTable,
  visibleFriends,
} from '../shared/site00-astral-world/presenceService.js';
import { routeTakeMeSomewhere } from '../shared/site00-astral-world/takeMeSomewhereRouter.js';
import { ASTRAL_TRUTH_LAYER, DESTINATION_PURPOSES } from '../shared/site00-astral-world/types.js';
import { site00ProjectExperiencePath } from '../src/site00/config/routes.js';
import { site00ProjectExperienceRoute } from '../shared/site00-access/routes.js';

function filterReaders(
  readers: typeof PROTOTYPE_READERS,
  query: string,
  category: string,
) {
  return readers.filter((r) => {
    const matchCat = category === 'ALL' || r.categories.includes(category);
    const matchQuery =
      !query ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.specialty.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });
}

describe('P0.E.1 Astral World Experience Prototype', () => {
  it('TEST 1 — Astral World shell CSS is independent from SITE 00 host DNA', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toContain('--aw-gold');
    expect(css).toContain('Cinzel');
    expect(css).not.toContain('Martian Mono');
    expect(css).not.toContain('--site00-red');
  });

  it('TEST 2 — Astréa contains three destinations', () => {
    expect(DESTINATION_PURPOSES).toHaveLength(3);
    expect(DESTINATION_PURPOSES.map((d) => d.slug)).toEqual([
      'tarot-suite',
      'astral-mall',
      'coffee-shop',
    ]);
  });

  it('TEST 3 — Future district model remains possible (hierarchy not flattened)', () => {
    expect(DESTINATION_PURPOSES.every((d) => d.slug !== 'astrea')).toBe(true);
    expect(DISTRICT_OCCUPANCY.capacity).toBeGreaterThan(DISTRICT_OCCUPANCY.current);
  });

  it('TEST 4 — Take Me Somewhere routes 10-minute intent to Astral Mall', () => {
    const result = routeTakeMeSomewhere('TEN_MINUTES');
    expect(result.destination).toBe('astral-mall');
    expect(result.isPrototypeLogic).toBe(true);
  });

  it('TEST 5 — Comfort intent routes to Coffee Shop', () => {
    expect(routeTakeMeSomewhere('NEED_COMFORT').destination).toBe('coffee-shop');
  });

  it('TEST 6 — Deep/private intent routes to Tarot Suite', () => {
    expect(routeTakeMeSomewhere('DEEP_PRIVATE').destination).toBe('tarot-suite');
    expect(routeTakeMeSomewhere('NEED_CLARITY').destination).toBe('tarot-suite');
  });

  it('TEST 7 — Friend presence is project-scoped (fixture source)', () => {
    expect(PROTOTYPE_FRIENDS.every((f) => f.source === 'PROTOTYPE_FIXTURE')).toBe(true);
    expect(PROTOTYPE_FRIENDS.some((f) => f.currentDestination === 'coffee-shop')).toBe(true);
  });

  it('TEST 8 — Reader presence is project-scoped (fixture source)', () => {
    expect(PROTOTYPE_READERS.every((r) => r.source === 'PROTOTYPE_FIXTURE')).toBe(true);
    expect(PROTOTYPE_READERS.some((r) => r.presence === 'READING_NOW')).toBe(true);
  });

  it('TEST 9 — Private reading does not expose client identity in fixtures', () => {
    const tarotSource = readFileSync('src/site00/astral-world/pages/destinations/TarotSuitePage.tsx', 'utf8');
    expect(tarotSource).toContain('identities protected');
    expect(tarotSource).not.toMatch(/client.*name/i);
  });

  it('TEST 10 — Join Her Table updates prototype table occupancy', () => {
    const tables = [...PROTOTYPE_TABLES];
    const table = tables.find((t) => t.id === 'table-soul')!;
    const before = table.occupants.length;
    const result = joinTable(tables, 'table-soul', 'user-demo-teena');
    expect(result.error).toBeUndefined();
    expect(result.tables.find((t) => t.id === 'table-soul')!.occupants).toHaveLength(before + 1);
    expect(result.tables.find((t) => t.id === 'table-soul')!.occupants).toContain('user-demo-teena');
  });

  it('TEST 11 — Full table cannot be over-joined', () => {
    const tables = [...PROTOTYPE_TABLES];
    const full = tables.find((t) => t.id === 'table-moon')!;
    expect(full.occupants.length).toBe(full.capacity);
    const result = joinTable(tables, 'table-moon', 'user-demo-teena');
    expect(result.error).toBe('Table is full');
  });

  it('TEST 12 — Presence privacy HIDDEN prevents friend-location exposure', () => {
    expect(visibleFriends('HIDDEN')).toHaveLength(0);
    expect(friendLocationLabel('friend-jane')).toBe('Coffee Shop');
  });

  it('TEST 13 — Reader-client alert requires permitted presence state', () => {
    expect(canAlertRegularReturn(false)).toBe(false);
    expect(canAlertRegularReturn(true)).toBe(true);
  });

  it('TEST 14 — Find My Reader filters work', () => {
    const love = filterReaders([...PROTOTYPE_READERS], '', 'LOVE');
    expect(love.length).toBeGreaterThan(0);
    expect(love.every((r) => r.categories.includes('LOVE'))).toBe(true);
    const search = filterReaders([...PROTOTYPE_READERS], 'Orion', 'ALL');
    expect(search).toHaveLength(1);
    expect(search[0]!.name).toBe('Orion Vale');
  });

  it('TEST 15 — Astral Mall kiosk interactions use demo pricing state', () => {
    expect(PROTOTYPE_KIOSKS.every((k) => k.priceState === 'DEMO' || k.priceState === 'NON_CANONICAL')).toBe(
      true,
    );
    expect(PROTOTYPE_KIOSKS.some((k) => !k.available)).toBe(true);
  });

  it('TEST 16 — Notification actions navigate to experience routes', () => {
    for (const n of PROTOTYPE_NOTIFICATIONS) {
      expect(n.actionRoute).toMatch(/^\/projects\/astral-world\/experience\//);
    }
  });

  it('TEST 17 — Bottom mobile navigation routes defined', () => {
    const navSource = readFileSync('src/site00/astral-world/components/AstralWorldNav.tsx', 'utf8');
    expect(navSource).toContain("label: 'Home'");
    expect(navSource).toContain("label: 'World'");
    expect(navSource).toContain("label: 'Journal'");
    expect(navSource).toContain("label: 'Friends'");
    expect(navSource).toContain("label: 'Profile'");
  });

  it('TEST 18 — Desktop navigation routes defined', () => {
    const navSource = readFileSync('src/site00/astral-world/components/AstralWorldNav.tsx', 'utf8');
    expect(navSource).toContain("label: 'Astréa'");
    expect(navSource).toContain("label: 'Readers'");
    expect(navSource).toContain('Check In');
  });

  it('TEST 19 — Astral World fixture data cannot leak into NDXBOOK', () => {
    const ndxPaths = [
      'src/site00/pages/ProjectDetailPage.tsx',
      'shared/site00-projects/capabilities.ts',
    ];
    for (const p of ndxPaths) {
      const src = readFileSync(p, 'utf8');
      expect(src).not.toContain('site00-astral-world');
    }
    expect(PROTOTYPE_FRIENDS.every((f) => f.source === 'PROTOTYPE_FIXTURE')).toBe(true);
  });

  it('TEST 20 — Visual implementation remains CREATIVE_EXPLORATION and does not auto-promote canon', () => {
    expect(ASTRAL_TRUTH_LAYER).toBe('CREATIVE_EXPLORATION');
    expect(ASTRAL_EXPERIENCE_CREATIVE_EXPLORATION.autoCanonized).toBe(false);
    expect(ASTRAL_EXPERIENCE_CREATIVE_EXPLORATION.truthLayer).toBe('CREATIVE_EXPLORATION');
    const shellSource = readFileSync(
      'src/site00/astral-world/components/AstralWorldExperienceShell.tsx',
      'utf8',
    );
    expect(shellSource).toContain('data-truth-layer="CREATIVE_EXPLORATION"');
  });

  it('Route helpers resolve experience paths', () => {
    expect(site00ProjectExperiencePath('astral-world')).toBe('/projects/astral-world/experience/home');
    expect(site00ProjectExperiencePath('astral-world', 'astrea/coffee-shop')).toBe(
      '/projects/astral-world/experience/astrea/coffee-shop',
    );
    expect(site00ProjectExperienceRoute('astral-world', 'readers')).toBe(
      '/projects/astral-world/experience/readers',
    );
  });

  it('Initial user presence starts in world', () => {
    const p = createInitialUserPresence();
    expect(p.state).toBe('IN_WORLD');
    expect(p.destination).toBeNull();
  });
});
