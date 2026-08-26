/**
 * Centralized Astral World fixture service — single replaceable layer.
 */

import {
  DEMO_SESSION_PROFILE,
  DISTRICT_OCCUPANCY,
  PLACES_POPULAR_NOW,
  PROTOTYPE_CIRCLES,
  PROTOTYPE_CURRENT_USER,
  PROTOTYPE_DAILY_CARD,
  PROTOTYPE_FRIENDS,
  PROTOTYPE_JOURNEY,
  PROTOTYPE_KIOSKS,
  PROTOTYPE_NOTIFICATIONS,
  PROTOTYPE_READER_RELATIONSHIPS,
  PROTOTYPE_READERS,
  PROTOTYPE_TABLES,
} from './fixtures.js';
import type { AstralNotification, AstralReader } from './types.js';
import { ASTRAL_EXPERIENCE_BASE } from './routes.js';

export const ASTRAL_FIXTURE_DOMAINS = [
  'users',
  'avatars',
  'friends',
  'readers',
  'readerRelationships',
  'presence',
  'tables',
  'kiosks',
  'notifications',
  'journey',
  'readings',
  'journals',
  'circles',
  'destinations',
] as const;

function remapRoute(route: string, basePath: string): string {
  return route.replace(ASTRAL_EXPERIENCE_BASE, basePath);
}

export function getAstralFixtures(basePath: string = ASTRAL_EXPERIENCE_BASE) {
  const notifications: AstralNotification[] = PROTOTYPE_NOTIFICATIONS.map((n) => ({
    ...n,
    actionRoute: remapRoute(n.actionRoute, basePath),
  }));

  return {
    currentUser: PROTOTYPE_CURRENT_USER,
    demoSession: DEMO_SESSION_PROFILE,
    friends: PROTOTYPE_FRIENDS,
    readers: PROTOTYPE_READERS,
    readerRelationships: PROTOTYPE_READER_RELATIONSHIPS,
    tables: PROTOTYPE_TABLES,
    kiosks: PROTOTYPE_KIOSKS,
    notifications,
    journey: PROTOTYPE_JOURNEY,
    circles: PROTOTYPE_CIRCLES,
    dailyCard: PROTOTYPE_DAILY_CARD,
    placesPopular: PLACES_POPULAR_NOW,
    occupancy: DISTRICT_OCCUPANCY,
    source: 'PROTOTYPE_FIXTURE' as const,
  };
}

export function filterReaders(
  readers: readonly AstralReader[],
  query: string,
  category: string,
  favoritesOnly = false,
  availableOnly = false,
): AstralReader[] {
  return readers.filter((r) => {
    const matchCat = category === 'ALL' || r.categories.includes(category);
    const matchQuery =
      !query ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.specialty.toLowerCase().includes(query.toLowerCase());
    const matchFav = !favoritesOnly || r.isFavorite;
    const matchAvail = !availableOnly || r.presence === 'AVAILABLE' || r.presence === 'JOINABLE';
    return matchCat && matchQuery && matchFav && matchAvail;
  });
}

export function sortReadersWithFavoritesFirst(readers: AstralReader[]): AstralReader[] {
  return [...readers].sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
}
