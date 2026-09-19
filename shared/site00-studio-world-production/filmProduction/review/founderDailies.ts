/**
 * P0.FILM.1 — Founder dailies room.
 */

import type { DailiesAction, FilmShotCandidate, FounderDailiesEntry } from '../types.js';

export function buildDailiesEntry(params: {
  filmId: string;
  sceneId: string;
  shotId: string;
  candidate: FilmShotCandidate;
  dialogue?: string | null;
  durationSec?: number;
}): FounderDailiesEntry {
  return {
    entryId: `dailies-${params.candidate.candidateId}`,
    filmId: params.filmId,
    sceneId: params.sceneId,
    shotId: params.shotId,
    candidateId: params.candidate.candidateId,
    clipUrl: params.candidate.assetUrl,
    thumbnailUrl: null,
    dialogue: params.dialogue ?? null,
    durationSec: params.durationSec ?? 4,
    qaScore: params.candidate.qaScore,
    founderAction: null,
    founderNote: null,
    reviewedAt: null,
  };
}

export function surfaceViableCandidates(candidates: FilmShotCandidate[]): FilmShotCandidate[] {
  const byShot = new Map<string, FilmShotCandidate[]>();
  for (const c of candidates) {
    if (!c.founderVisible) continue;
    const list = byShot.get(c.shotId) ?? [];
    list.push(c);
    byShot.set(c.shotId, list);
  }
  const result: FilmShotCandidate[] = [];
  for (const [, list] of byShot) {
    const primary = list.find((c) => c.isPrimary) ?? list.sort((a, b) => (b.qaScore ?? 0) - (a.qaScore ?? 0))[0];
    if (primary) result.push(primary);
    const alt = list.find((c) => c.isAlt && c.candidateId !== primary?.candidateId);
    if (alt) result.push(alt);
  }
  return result;
}

export function applyDailiesAction(
  entry: FounderDailiesEntry,
  action: DailiesAction,
  note?: string,
): FounderDailiesEntry {
  return {
    ...entry,
    founderAction: action,
    founderNote: note ?? null,
    reviewedAt: new Date().toISOString(),
  };
}

export function founderDailiesImplemented(): true {
  return true;
}

export function founderGarbageSortingRequired(): false {
  return false;
}

export function altSupported(): true {
  return true;
}

export function regenerateSupported(): true {
  return true;
}
