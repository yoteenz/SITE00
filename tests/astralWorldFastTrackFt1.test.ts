/**
 * P0.E.FT1 — Founder Fast Track tests
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ASTRAL_FAST_TRACK_PROTOTYPE, canAutoPromoteFromFastTrack } from '../shared/site00-astral-world/fastTrackRegistry.js';
import { getAstralFixtures, filterReaders } from '../shared/site00-astral-world/fixtureService.js';
import {
  DEMO_SESSION_PROFILE,
  PLACES_POPULAR_NOW,
  PROTOTYPE_CIRCLES,
  PROTOTYPE_DAILY_CARD,
  PROTOTYPE_KIOSKS,
  PROTOTYPE_READERS,
} from '../shared/site00-astral-world/fixtures.js';
import { recommendTakeMeSomewhere } from '../shared/site00-astral-world/takeMeSomewhereContextEngine.js';
import { ASTRAL_FAST_TRACK_BASE } from '../shared/site00-astral-world/routes.js';
import { site00ProjectFastTrackWorldPath } from '../src/site00/config/routes.js';
import { site00ProjectFastTrackWorldRoute } from '../shared/site00-access/routes.js';

describe('P0.E.FT1 Founder Fast Track', () => {
  it('FAST_TRACK route resolves correctly', () => {
    expect(ASTRAL_FAST_TRACK_BASE).toBe('/projects/astral-world/debug/world');
    expect(site00ProjectFastTrackWorldPath('astral-world')).toBe('/projects/astral-world/debug/world/home');
    expect(site00ProjectFastTrackWorldRoute('astral-world', 'astrea/coffee-shop')).toBe(
      '/projects/astral-world/debug/world/astrea/coffee-shop',
    );
  });

  it('Fast track registry marks CREATIVE_EXPLORATION and blocks auto canon', () => {
    expect(ASTRAL_FAST_TRACK_PROTOTYPE.fastTrackPrototype).toBe(true);
    expect(ASTRAL_FAST_TRACK_PROTOTYPE.autoCanonized).toBe(false);
    expect(canAutoPromoteFromFastTrack()).toBe(false);
  });

  it('Shell exposes FAST_TRACK_PROTOTYPE attribute', () => {
    const shell = readFileSync('src/site00/astral-world/components/AstralWorldExperienceShell.tsx', 'utf8');
    expect(shell).toContain('data-fast-track-prototype');
    expect(shell).toContain('FOUNDER FAST TRACK');
  });

  it('Demo session seeds inhabited world (Teena)', () => {
    expect(DEMO_SESSION_PROFILE.displayName).toBe('Teena');
    expect(DEMO_SESSION_PROFILE.journalEntryCount).toBeGreaterThan(0);
    const fixtures = getAstralFixtures(ASTRAL_FAST_TRACK_BASE);
    expect(fixtures.friends.length).toBeGreaterThan(0);
    expect(fixtures.readers.length).toBeGreaterThanOrEqual(6);
    expect(fixtures.notifications.length).toBeGreaterThanOrEqual(4);
  });

  it('Fixture service remaps notification routes for fast track base', () => {
    const fixtures = getAstralFixtures(ASTRAL_FAST_TRACK_BASE);
    expect(fixtures.notifications[0]!.actionRoute.startsWith(ASTRAL_FAST_TRACK_BASE)).toBe(true);
  });

  it('Context engine routes 10 minutes to Mall with conversational output', () => {
    const rec = recommendTakeMeSomewhere({ intent: 'TEN_MINUTES', readers: PROTOTYPE_READERS });
    expect(rec.destination).toBe('astral-mall');
    expect(rec.conversationalLine).toContain('ten minutes');
    expect(rec.isPrototypeLogic).toBe(true);
  });

  it('Context engine routes comfort to Coffee Shop', () => {
    const rec = recommendTakeMeSomewhere({ intent: 'NEED_COMFORT', readers: PROTOTYPE_READERS });
    expect(rec.destination).toBe('coffee-shop');
    expect(rec.conversationalLine.toLowerCase()).toContain('coffee shop');
  });

  it('Context engine routes deep to Tarot Suite', () => {
    const rec = recommendTakeMeSomewhere({ intent: 'DEEP_PRIVATE', readers: PROTOTYPE_READERS });
    expect(rec.destination).toBe('tarot-suite');
  });

  it('Reader favorites filter works', () => {
    const favs = filterReaders([...PROTOTYPE_READERS], '', 'ALL', true, false);
    expect(favs.every((r) => r.isFavorite)).toBe(true);
    expect(favs.some((r) => r.name === 'Madame J')).toBe(true);
  });

  it('Kiosks expose prototype states', () => {
    expect(PROTOTYPE_KIOSKS.every((k) => k.kioskState)).toBe(true);
    expect(PROTOTYPE_KIOSKS.some((k) => k.kioskState === 'CLOSED')).toBe(true);
  });

  it('Places popular now covers all destinations', () => {
    expect(PLACES_POPULAR_NOW).toHaveLength(3);
  });

  it('Daily card, circles, and deck entry exist', () => {
    expect(PROTOTYPE_DAILY_CARD.cardName).toBeTruthy();
    expect(PROTOTYPE_CIRCLES.length).toBeGreaterThanOrEqual(4);
    expect(readFileSync('src/site00/astral-world/pages/AstralWorldCreateDeckPage.tsx', 'utf8')).toContain('Create a Deck');
  });

  it('Mobile notification demo marked PUSH_NOTIFICATION_DEMO', () => {
    const demo = readFileSync('src/site00/astral-world/pages/AstralWorldNotificationDemoPage.tsx', 'utf8');
    expect(demo).toContain('PUSH_NOTIFICATION_DEMO');
  });

  it('Project detail exposes OPEN LIVE PROTOTYPE', () => {
    const detail = readFileSync('src/site00/pages/ProjectDetailPage.tsx', 'utf8');
    expect(detail).toContain('OPEN LIVE PROTOTYPE');
    expect(detail).toContain('site00ProjectFastTrackWorldPath');
  });

  it('Formal governance preserved — no canon auto promotion in fast track page', () => {
    const page = readFileSync('src/site00/pages/ProjectAstralWorldFastTrackPage.tsx', 'utf8');
    expect(page).toContain('CREATIVE_EXPLORATION');
    expect(page).not.toContain('canon_promote');
  });

  it('Cross-project leakage remains zero in fixture service', () => {
    expect(getAstralFixtures().source).toBe('PROTOTYPE_FIXTURE');
  });
});
