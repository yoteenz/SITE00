/**
 * B5.9R5 — Canonical project index order and display numbering.
 * DESIGN workspace is a system entry — not counted in project sequence.
 */

import type { ProjectIndexItem } from './projectIndexItem.js';
import { isSite00PlatformDesignIndexItem } from './buildProjectIndexItems.js';

export const PROJECT_INDEX_SYSTEM_ENTRY_IDS = ['site00'] as const;

/** Canonical founder portfolio order — numbering starts at 01. */
export const PROJECT_INDEX_CANONICAL_ORDER = [
  'frontal-slayer',
  'studio-world',
  'ndxbook',
  'all-in-one-enterprises',
  'astral-world',
] as const;

export type ProjectIndexCanonicalSlug = (typeof PROJECT_INDEX_CANONICAL_ORDER)[number];

export function formatProjectDisplayNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export function resolveProjectDisplayNumber(projectId: string): string | null {
  const idx = PROJECT_INDEX_CANONICAL_ORDER.indexOf(projectId as ProjectIndexCanonicalSlug);
  if (idx < 0) return null;
  return formatProjectDisplayNumber(idx);
}

export function orderProjectIndexItems(items: ProjectIndexItem[]): ProjectIndexItem[] {
  const projects = items.filter((item) => !isSite00PlatformDesignIndexItem(item));
  const orderRank = new Map<string, number>(
    PROJECT_INDEX_CANONICAL_ORDER.map((slug, index) => [slug, index]),
  );

  return [...projects].sort((a, b) => {
    const aRank = orderRank.get(a.projectId) ?? 999;
    const bRank = orderRank.get(b.projectId) ?? 999;
    if (aRank !== bRank) return aRank - bRank;
    return a.projectName.localeCompare(b.projectName);
  });
}

export function isProjectIndexSystemEntry(item: ProjectIndexItem): boolean {
  return isSite00PlatformDesignIndexItem(item);
}
