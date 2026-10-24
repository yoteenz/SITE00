import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as X from '../shared/site00-fiction-production/index.js';

const root = process.cwd();
const P = X.EXCHANGE_PATHS;
const readJson = <T>(rel: string) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')) as T;
const master = X.loadSeasonMaster(root);
const docs = X.loadScreenplays(root);
const assets = X.loadAssetRegistry(root);
const approvals = readJson<X.ApprovalBook>(P.approvals);
const cast = readJson<X.CastRegistry>(X.CAST_REGISTRY_PATH);
const index = X.buildSceneIndex({ master, screenplays: docs, assets, approvals, activeReleaseId: 'S1-01' });
const brief = (id: string) => index.releases.find((r) => r.releaseId === id)!;
const census = X.buildCastCensus(master, docs, cast);
const graph = X.buildDependencyGraph({ master, assets, census, activeReleaseId: 'S1-01' });

describe('THE EXCHANGE season scene index (Level A)', () => {
  it('preserves all 86 releases, canonical order and the 127:40 runtime', () => {
    expect(index.releases.map((r) => r.releaseId)).toEqual(master.releases.map((r) => r.id));
    expect(index.totals).toMatchObject({ releases: 86, runtimeSec: 7660, drafted: 5, plannedFromMaster: 81 });
    expect(X.secToDuration(index.totals.runtimeSec)).toBe('127:40');
    expect(index.releases.at(-1)!.runtime.endSec).toBe(7660);
    expect(X.validateSceneIndex(index, master, docs, approvals)).toEqual([]);
    expect(readJson<X.SceneIndex>(`${P.season}/SEASON1_SCENE_INDEX_V1.json`)).toEqual(JSON.parse(JSON.stringify(index)));
  });

  it('answers every writing-brief question for every release without inventing canon', () => {
    for (const b of index.releases) {
      expect(b.whatHappens.text, b.releaseId).toBeTruthy();
      expect(b.whyItMatters.purpose, b.releaseId).toBeTruthy();
      expect(b.scenes.length, b.releaseId).toBeGreaterThan(0);
      expect(b.opening && b.ending, b.releaseId).toBeTruthy();
      expect(b.identity.label).toBe('DIRECTORIAL INTERPRETATION');
      expect(b.status.story).toBe('FOUNDER_APPROVED');
      expect(b.status.approvalScope).toContain('does not cover any script, performance, shot or music cue');
      if (b.status.screenplay === X.PLANNED_FROM_MASTER) {
        expect(b.wants.value, b.releaseId).toBeNull();
        expect(b.scenes.every((s) => s.source === 'MASTER_SETTING' && s.objective === null)).toBe(true);
      }
    }
    expect(brief('S1-03').status.screenplay).toBe(X.DRAFT_STATUS);
    expect(brief('S1-06').wants.status).toMatch(/^AUTHORED AT DRAFTING/);
    expect(index.batches[1].status).toBe(`QUEUED: ${X.SCREENPLAY_GATE}`);
  });

  it('tracks knowledge, reveals and open questions at the right point in the season', () => {
    expect(brief('S1-03').knowledge.characters.Kai).toEqual(['KF-08']);
    expect(brief('S1-03').knowledge.withheldFromAudience).toContain('KF-07');
    expect(brief('S1-05').knowledge.audienceLearnsHere).toEqual(['KF-08']);
    expect(brief('S1-58').knowledge.audienceLearnsHere).toEqual(['KF-06']);
    expect(brief('S1-57').knowledge.withheldFromAudience).toContain('KF-06');
    expect(brief('S1-58').knowledge.withheldFromAudience).not.toContain('KF-06');
    expect(brief('S1-30').knowledge.characters.Nadine).toBeUndefined();
    expect(brief('S1-31').knowledge.characters.Nadine).toEqual(['KF-03']);
    expect(brief('S1-01').futureRevelations.paysOffIn).toContain('S1-58');
    expect(brief('S1-01').motifs.map((m) => m.motif)).toContain('Balconies');
  });

  it('links every dialogue line to exactly one scene', () => {
    for (const d of docs) {
      const b = brief(d.meta.identity.releaseId);
      expect(b.scenes.flatMap((s) => s.lineIds).sort()).toEqual(X.dialogueLines(d).map((l) => l.lineId).sort());
    }
    expect(brief('S1-01').scenes.flatMap((s) => s.lineIds)).toEqual([]);
    const moved = structuredClone(index);
    const s3 = moved.releases.find((r) => r.releaseId === 'S1-03')!;
    s3.scenes[1].lineIds.push(s3.scenes[0].lineIds[0]);
    expect(X.validateSceneIndex(moved, master, docs, approvals).map((f) => f.detail)).toContain('every dialogue line belongs to exactly one indexed scene');
  });

  it('refuses to show unreviewed material as approved and keeps one active scene', () => {
    const forged = structuredClone(index);
    forged.releases[1].status.screenplay = 'FOUNDER_APPROVED';
    forged.releases[2].status.production = 'ACTIVE_FOUNDER_REVIEW';
    const details = X.validateSceneIndex(forged, master, docs, approvals).map((f) => f.detail);
    expect(details).toContain('screenplay shown as approved without a founder record');
    expect(details).toContain('exactly one release is in active founder review');
    expect(index.releases.filter((r) => r.status.production === 'ACTIVE_FOUNDER_REVIEW').map((r) => r.releaseId)).toEqual(['S1-01']);
  });
});

describe('THE EXCHANGE dependency graph and just-in-time cast', () => {
  it('builds a temporally valid graph', () => {
    expect(X.validateDependencyGraph(graph, master)).toEqual([]);
    const bad = structuredClone(graph);
    bad.edges.push({ type: 'DEPENDS_ON', from: 'S1-03', to: 'S1-09', source: 'test' }, { type: 'PAYS_OFF', from: 'S1-09', to: 'S1-03', source: 'test' }, { type: 'ASSET_NEEDED', from: 'kai-fontaine', to: 'S1-03', source: 'test' });
    expect(X.validateDependencyGraph(bad, master).filter((f) => f.severity === 'HARD_CONFLICT').map((f) => f.detail)).toEqual(['a release can only depend on an earlier one', 'a payoff must come later', 'every asset need names its just-in-time trigger']);
    expect(graph.edges.find((e) => e.type === 'FIRST_APPEARANCE' && e.from === 'kai-fontaine')!.to).toBe('S1-03');
    expect(graph.edges.some((e) => e.type === 'CONTINUITY_CARRY' && e.source.startsWith('WD-GIDEON-SUIT'))).toBe(true);
  });

  it('tracks future needs silently, grouped by their trigger release', () => {
    const future = X.futureDependencies(graph, master);
    expect(future.every((f) => f.founderAttention === 'NOT REQUESTED')).toBe(true);
    expect(future.some((f) => f.releaseId === 'S1-01')).toBe(false);
    expect(future.find((f) => f.releaseId === 'S1-03')!.needs.join(' ')).toContain('kai-fontaine');
    const file = readJson<{ byRelease: unknown; activeReleaseId: string }>(`${P.season}/FUTURE_PRODUCTION_DEPENDENCIES_V1.json`);
    expect(file.activeReleaseId).toBe('S1-01');
    expect(file.byRelease).toEqual(JSON.parse(JSON.stringify(future)));
  });

  it('develops only the cast the active scene needs', () => {
    const plan = X.jitPlan('S1-01', census, cast);
    expect(plan.needed.map((n) => n.personId).sort()).toEqual(['scene:S1-01:grandmother', 'scene:S1-01:neighbour', 'scene:S1-01:tailor', 'scene:S1-01:teenager', 'scene:S1-01:woman on the balcony']);
    expect(plan.needed.every((n) => n.tier === 'SCENE_SCOPED')).toBe(true);
    expect(plan.deferred.find((d) => d.personId === 'kai-fontaine')!.trigger).toBe('S1-03 enters active production');
    const ask = (personId: string, scope: X.PackageRequest['scope'], founderPromotion?: string) => X.requestCastPackage({ personId, scope, activeReleaseId: 'S1-01', founderPromotion }, census);
    expect(ask('kai-fontaine', 'PERMANENT')).toMatchObject({ allowed: false, code: 'FUTURE_CAST_NOT_JUSTIFIED', creditsSpent: 0 });
    expect(ask('person:ada', 'PERMANENT').code).toBe('FUTURE_CAST_NOT_JUSTIFIED');
    expect(ask('scene:S1-01:tailor', 'PERMANENT').code).toBe('SCENE_SCOPED_NO_PERMANENT_PACKAGE');
    expect(ask('scene:S1-01:tailor', 'PERMANENT', 'FD-S101-07').allowed).toBe(true);
    expect(ask('scene:S1-01:tailor', 'SCENE_SCOPED').allowed).toBe(true);
    expect(ask('nobody', 'SCENE_SCOPED').code).toBe('UNKNOWN_PERSON');
    expect(X.requestCastPackage({ personId: 'kai-fontaine', scope: 'PERMANENT', activeReleaseId: 'S1-03' }, census)).toMatchObject({ allowed: true });
  });

  it('parses the featured-character lines into people and groups', () => {
    expect(X.splitFeatured('Noelle Baptiste (16, glimpsed), Kai (at the bar); guests')).toEqual(['Noelle Baptiste (16, glimpsed)', 'Kai (at the bar)', 'guests']);
    const p = (id: string) => census.find((c) => c.personId === id);
    expect(p('royce-bell')!.releases.length).toBeGreaterThan(1);
    expect(p('person:clarence')!.tier).toBe('RECURRING_UNREGISTERED');
    expect(p('person:dara')!.firstRelease).toBe('S1-16');
    expect(census.some((c) => c.personId === 'person:couriers' || c.personId === 'person:riggers')).toBe(false);
  });
});
