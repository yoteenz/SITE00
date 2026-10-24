import type { CastRegistry, CastAssetRef } from './castRegistry.js';
import type { ScreenplayDocument, SeasonMaster } from './types.js';

/**
 * Just-in-time cast development (sprint V2 §04). A permanent character package (face lock, voice, wardrobe) is only
 * developed when a release that needs it enters active production. Everyone else is tracked silently.
 */
export const JIT_STEPS = ['IDENTIFY', 'CHECK_EXISTING', 'FIND_GAPS', 'GENERATE_ONLY_NEEDED', 'FOUNDER_APPROVAL', 'LOCK', 'REUSE'] as const;
export type CastTier = 'REGISTERED' | 'RECURRING_UNREGISTERED' | 'SINGLE_RELEASE' | 'SCENE_SCOPED';
export type CensusPerson = { personId: string; name: string; tier: CastTier; registryId: string | null; releases: string[]; firstRelease: string; mentions: string[] };

/** Split a featured-characters line at top-level commas and semicolons; parentheticals stay with their name. */
export function splitFeatured(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of text) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if ((ch === ',' || ch === ';') && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

const bare = (s: string) => s.replace(/\([^)]*\)?/g, '').replace(/\s+/g, ' ').trim();
const isGroup = (s: string) => !s || /^[a-z]/.test(s) || /^(the|a|an|his|her|their)\b/i.test(s) || /^[A-Z][a-z]+(ers|ents|ants)$/.test(s) || s.split(' ').slice(1).some((w) => /^[a-z]/.test(w));
/** "Clementine's great-niece Dara" names Dara. */
const namedInDescriptor = (s: string) => s.match(/'s [a-z -]+ ([A-Z][a-z]+)$/)?.[1] ?? null;
const personKey = (s: string) => (/^(Dr|Mr|Mrs|Ms)\./.test(s) ? s : s.split(' ')[0]);

export function buildCastCensus(master: SeasonMaster, screenplays: ScreenplayDocument[], cast: CastRegistry): CensusPerson[] {
  const byCue = new Map(cast.characters.filter((c) => c.cue).map((c) => [String(c.cue).toUpperCase(), c.characterId]));
  const people = new Map<string, CensusPerson>();
  const add = (key: string, name: string, tier: CastTier, registryId: string | null, release: string, mention: string) => {
    const p = people.get(key) ?? { personId: key, name, tier, registryId, releases: [], firstRelease: release, mentions: [] };
    if (!p.releases.includes(release)) p.releases.push(release);
    if (!p.mentions.includes(mention)) p.mentions.push(mention);
    if (name.length > p.name.length && !registryId) p.name = name;
    people.set(key, p);
  };
  const drafted = new Set(screenplays.map((d) => d.meta.identity.releaseId));
  for (const r of master.releases) {
    for (const raw of splitFeatured(r.featuredCharacters)) {
      const name = namedInDescriptor(bare(raw)) ?? bare(raw);
      if (isGroup(name)) {
        if (drafted.has(r.id)) continue;
        add(`scene:${r.id}:${name.toLowerCase()}`, name, 'SCENE_SCOPED', null, r.id, raw);
        continue;
      }
      const key = personKey(name);
      const registryId = byCue.get(key.toUpperCase()) ?? null;
      add(registryId ?? `person:${key.toLowerCase()}`, registryId ? key : name, registryId ? 'REGISTERED' : 'SINGLE_RELEASE', registryId, r.id, raw);
    }
  }
  for (const doc of screenplays) {
    const id = doc.meta.identity.releaseId;
    for (const c of doc.meta.production.characters) {
      const registryId = byCue.get(c.toUpperCase()) ?? null;
      if (registryId) add(registryId, c, 'REGISTERED', registryId, id, `screenplay ${id}`);
      else add(`scene:${id}:${c.toLowerCase()}`, c, 'SCENE_SCOPED', null, id, `screenplay ${id}: PRODUCTION.characters`);
    }
  }
  const order = new Map(master.releases.map((r) => [r.id, r.order]));
  return [...people.values()]
    .map((p) => {
      const releases = [...p.releases].sort((a, b) => order.get(a)! - order.get(b)!);
      const tier: CastTier = p.tier === 'SINGLE_RELEASE' && releases.length > 1 ? 'RECURRING_UNREGISTERED' : p.tier;
      return { ...p, releases, firstRelease: releases[0], tier };
    })
    .sort((a, b) => order.get(a.firstRelease)! - order.get(b.firstRelease)! || a.personId.localeCompare(b.personId));
}

export type PackageRequest = { personId: string; scope: 'PERMANENT' | 'SCENE_SCOPED'; activeReleaseId: string; founderPromotion?: string };
export type PackageDecision = { allowed: boolean; code: 'OK' | 'FUTURE_CAST_NOT_JUSTIFIED' | 'SCENE_SCOPED_NO_PERMANENT_PACKAGE' | 'UNKNOWN_PERSON'; detail: string; creditsSpent: 0 };

export function requestCastPackage(req: PackageRequest, census: CensusPerson[]): PackageDecision {
  const p = census.find((x) => x.personId === req.personId);
  if (!p) return { allowed: false, code: 'UNKNOWN_PERSON', detail: `${req.personId} is not in the season census`, creditsSpent: 0 };
  if (!p.releases.includes(req.activeReleaseId)) return { allowed: false, code: 'FUTURE_CAST_NOT_JUSTIFIED', detail: `${p.name} first appears in ${p.firstRelease}; develop when that release enters production`, creditsSpent: 0 };
  if (req.scope === 'PERMANENT' && p.tier === 'SCENE_SCOPED' && !req.founderPromotion) return { allowed: false, code: 'SCENE_SCOPED_NO_PERMANENT_PACKAGE', detail: `${p.name} belongs to ${req.activeReleaseId} only; a permanent package needs a founder promotion`, creditsSpent: 0 };
  return { allowed: true, code: 'OK', detail: req.scope === 'SCENE_SCOPED' ? 'Design lives in the scene packet; nothing enters the permanent registry.' : 'Permanent package for an active-release character.', creditsSpent: 0 };
}

const refs = (c: CastRegistry['characters'][number], f: 'angleReferences' | 'wardrobeReferences' | 'facialMasters') => (c.fields[f].value as CastAssetRef[] | null) ?? [];

/** The JIT plan for the active release: who is needed now and what each is missing. Everyone else is deferred, silently. */
export function jitPlan(activeReleaseId: string, census: CensusPerson[], cast: CastRegistry) {
  const now = census.filter((p) => p.releases.includes(activeReleaseId));
  const needed = now.map((p) => {
    const c = p.registryId ? cast.characters.find((x) => x.characterId === p.registryId) ?? null : null;
    const gaps: string[] = [];
    if (c) {
      if (!refs(c, 'facialMasters').some((r) => r.status === 'APPROVED')) gaps.push('approved facial master');
      if (refs(c, 'angleReferences').some((r) => r.status === 'UNIMPORTED')) gaps.push('founder-held angle references to import');
      if (!c.voice?.voiceId) gaps.push('linked voice');
    } else gaps.push('scene-scoped look (designed inside the scene packet)');
    return { personId: p.personId, name: p.name, tier: p.tier, existing: c ? 'cast registry' : 'none', gaps, steps: JIT_STEPS };
  });
  const deferred = census.filter((p) => !p.releases.includes(activeReleaseId) && p.tier !== 'SCENE_SCOPED').map((p) => ({ personId: p.personId, name: p.name, tier: p.tier, trigger: `${p.firstRelease} enters active production`, releases: p.releases.length }));
  return { activeReleaseId, needed, deferred, deferredSceneScoped: census.filter((p) => !p.releases.includes(activeReleaseId) && p.tier === 'SCENE_SCOPED').length };
}
