import { describe, expect, it } from 'vitest';
import {
  CHARACTER_ASSET_RECEIPTS,
  STATION_ORDER,
  buildCharacterAssetManifest,
  characterAssetUrl,
  buildCharacterAssetSlots,
  buildFabricationCharacter,
  directDownstream,
  downstreamImpact,
  fabricationReducer,
  findFabricationActor,
  initialFabricationState,
  pendingFounderDecisions,
  stationBlockers,
  stationStatus,
  stepsRemaining,
  transitiveDownstream,
  type FabricationAction,
  type FabricationState,
} from '../shared/site00-character-fabrication/index.js';

const AT = '2026-09-29T10:00:00.000Z';
const run = (s: FabricationState, ...a: FabricationAction[]) => a.reduce(fabricationReducer, s);
const upToSimulation = (): FabricationState =>
  run(
    initialFabricationState(),
    { type: 'CONFIRM_ACTOR', at: AT },
    { type: 'RUN_CALIBRATION', at: AT },
    { type: 'LOCK_BODY', at: AT },
    { type: 'FIT_GARMENT', garmentId: 'gar-sports-bra-01' },
    { type: 'LOOK_DECISION', decision: 'APPROVED', at: AT },
    { type: 'APPEARANCE_DECISION', decision: 'SELECT_CANDIDATE', at: AT },
    { type: 'APPEARANCE_DECISION', decision: 'LOCK', at: AT },
    { type: 'SAVE_COMPOSITION', at: AT },
    { type: 'LOCK_CHARACTER', at: AT },
    { type: 'SELECT_MOTION', motionId: 'SIT_V01' },
    { type: 'USE_MOTION', at: AT },
  );
const completeRun = (s: FabricationState, id: string) => run(s, { type: 'RUN_TEST', at: AT, simulationId: id }, { type: 'SIM_TICK', deltaMs: 31_000, at: AT });

describe('character fabrication — model', () => {
  it('has the eight canonical stations in order', () => {
    expect(STATION_ORDER).toEqual(['identity', 'body', 'look', 'appearance', 'character', 'performance', 'simulation', 'authority']);
  });
  it('keeps ACTOR and CHARACTER as separate canonical entities', () => {
    const actor = findFabricationActor('sw-actor-017')!;
    const character = buildFabricationCharacter()!;
    expect(actor.catalogueNumber).toBe('SW-017');
    expect(character.displayName).toBe('SUBJECT WOMAN');
    expect(character.actorId).toBe(actor.actorId);
    expect(character.characterId).not.toBe(actor.actorId);
    expect(Object.keys(actor)).not.toContain('narrativeRole');
    expect(Object.keys(character)).not.toContain('catalogueNumber');
  });
  it('dependency graph is acyclic and forward-only', () => {
    for (const s of STATION_ORDER) for (const d of transitiveDownstream(s)) expect(STATION_ORDER.indexOf(d)).toBeGreaterThan(STATION_ORDER.indexOf(s));
    expect(directDownstream('body')).toContain('look');
    expect(transitiveDownstream('body')).toEqual(expect.arrayContaining(['look', 'appearance', 'performance', 'simulation', 'authority']));
  });
});

describe('character fabrication — machine', () => {
  it('blocks downstream decisions until upstream authority exists but stays inspectable', () => {
    const s = initialFabricationState();
    const r = fabricationReducer(s, { type: 'LOOK_DECISION', decision: 'APPROVED', at: AT });
    expect(r.authority.look).toBe('NONE');
    expect(r.notice?.kind).toBe('ERROR');
    expect(fabricationReducer(s, { type: 'GOTO_STATION', station: 'authority' }).activeStation).toBe('authority');
  });
  it('body cannot lock before calibration; lock is immutable and a new version invalidates downstream', () => {
    let s = run(initialFabricationState(), { type: 'CONFIRM_ACTOR', at: AT });
    expect(fabricationReducer(s, { type: 'LOCK_BODY', at: AT }).authority.body).toBe('NONE');
    s = run(s, { type: 'RUN_CALIBRATION', at: AT }, { type: 'LOCK_BODY', at: AT }, { type: 'FIT_GARMENT', garmentId: 'gar-sports-bra-01' }, { type: 'LOOK_DECISION', decision: 'APPROVED', at: AT });
    expect(s.authority.look).toBe('APPROVED');
    s = run(s, { type: 'NEW_BODY_VERSION', at: AT });
    expect(s.authority.body).toBe('NONE');
    expect(s.stale.look).toBe(true);
    expect(s.bodyVersions.at(-1)!.versionId).toBe('V2.2');
    expect(stationStatus(s, 'look')).toBe('STALE');
  });
  it('changing the actor invalidates everything built on the old identity', () => {
    let s = upToSimulation();
    s = run(s, { type: 'CHANGE_ACTOR', at: AT });
    expect(s.authority.identity).toBe('NONE');
    expect(s.stale.body && s.stale.look && s.stale.performance).toBe(true);
  });
  it('missing motion creates a structured request that blocks simulation until published', () => {
    let s = upToSimulation();
    s = run(s, { type: 'OPEN_MOTION_REQUEST', name: 'combat evasive roll left hi' });
    expect(s.motionRequestDraft.name).toBe('COMBAT_EVASIVE_ROLL_LEFT_HI');
    s = run(s, { type: 'CREATE_MOTION_REQUEST', at: AT, requestId: 'mr-1' });
    expect(s.motionRequests[0]!.stage).toBe('REQUEST_SUBMISSION');
    expect(stationBlockers(s, 'simulation').some((b) => b.blockerId.startsWith('simulation.motion'))).toBe(true);
    expect(fabricationReducer(s, { type: 'RUN_TEST', at: AT, simulationId: 'SIM-1' }).run).toBeNull();
    for (let i = 0; i < 5; i += 1) s = run(s, { type: 'ADVANCE_MOTION_REQUEST', requestId: 'mr-1', at: AT });
    expect(s.motionRequests[0]!.stage).toBe('PUBLISH_ASSET');
    expect(s.publishedMotions).toHaveLength(1);
    expect(stationBlockers(s, 'simulation').some((b) => b.blockerId.startsWith('simulation.motion'))).toBe(false);
    expect(s.outbox.some((e) => e.kind === 'REQUEST' && e.requestKind === 'CHARACTER_FABRICATION_MOTION_ASSET')).toBe(true);
  });
  it('simulation runs, completes with variance, routes back, re-approves and retests clean', () => {
    let s = completeRun(upToSimulation(), 'SIM-00421');
    expect(s.run!.status).toBe('COMPLETE');
    expect(s.results[0]!.failed).toBe(2);
    expect(s.results[0]!.checks.filter((c) => c.result === 'FAIL').map((c) => c.owner).sort()).toEqual(['look', 'performance']);
    s = run(s, { type: 'ROUTE_VARIANCE', station: 'look', at: AT });
    expect(s.activeStation).toBe('look');
    expect(s.revisionRequests[0]).toMatchObject({ station: 'look', source: 'SIMULATION', status: 'OPEN' });
    expect(stationStatus(s, 'look')).toBe('REVISION_REQUIRED');
    expect(s.stale.simulation).toBe(true);
    s = run(s, { type: 'LOOK_DECISION', decision: 'APPROVED', at: AT });
    expect(s.revisionRequests[0]!.status).toBe('RESOLVED');
    expect(s.resolvedDefects).toContain('WARDROBE_TOP');
    for (const st of ['appearance', 'character', 'performance', 'simulation'] as const) s = run(s, { type: 'REVALIDATE_STATION', station: st, at: AT });
    s = completeRun(s, 'SIM-00422');
    expect(s.results[0]!.failed).toBe(1);
    s = run(s, { type: 'ROUTE_VARIANCE', station: 'performance', at: AT }, { type: 'USE_MOTION', at: AT });
    s = run(s, { type: 'REVALIDATE_STATION', station: 'simulation', at: AT });
    s = completeRun(s, 'SIM-00423');
    expect(s.results[0]!.failed).toBe(0);
    s = run(s, { type: 'APPROVE_SIMULATION', at: AT });
    expect(s.authority.simulation).toBe('APPROVED');
  });
  it('pause/abort do not record results', () => {
    let s = run(upToSimulation(), { type: 'RUN_TEST', at: AT, simulationId: 'SIM-9' }, { type: 'SIM_TICK', deltaMs: 5000, at: AT }, { type: 'SIM_PAUSE' });
    const paused = s.run!.elapsedMs;
    s = run(s, { type: 'SIM_TICK', deltaMs: 5000, at: AT });
    expect(s.run!.elapsedMs).toBe(paused);
    s = run(s, { type: 'SIM_ABORT', at: AT });
    expect(s.run!.status).toBe('ABORTED');
    expect(s.results).toHaveLength(0);
  });
  it('authority revision routes to the selected layer and downstream impact is graph-derived', () => {
    let s = completeRun(upToSimulation(), 'SIM-1');
    s = run(s, { type: 'ACCEPT_VARIANCE', at: AT });
    s = run(s, { type: 'FINAL_SIGNOFF', at: AT });
    expect(s.finalSignedOff).toBe(true);
    const impact = downstreamImpact(s, 'identity');
    expect(impact.find((i) => i.station === 'body')!.level).toBe('HIGH');
    s = run(s, { type: 'REVISION_LAYER', station: 'performance' }, { type: 'REVISION_NOTE', note: 'Tighten the seated transition.' }, { type: 'SEND_REVISION', at: AT, revisionId: 'r1' });
    expect(s.activeStation).toBe('performance');
    expect(s.authority.performance).toBe('NONE');
    expect(s.finalSignedOff).toBe(false);
    expect(s.revisionRequests[0]).toMatchObject({ station: 'performance', source: 'AUTHORITY' });
    expect(stepsRemaining(s)).toBeGreaterThan(0);
  });
  it('behavior composition edits withdraw character lock; skins are direction metadata', () => {
    let s = upToSimulation();
    expect(s.authority.character).toBe('LOCKED');
    s = run(s, { type: 'BEHAVIOR_WEIGHT', skinId: 'bs-observant', weight: 50 });
    expect(s.authority.character).toBe('NONE');
    expect(s.stale.performance).toBe(true);
    expect(fabricationReducer(s, { type: 'LOCK_CHARACTER', at: AT }).authority.character).toBe('NONE');
  });
  it('surfaces founder decisions and side effects through the outbox', () => {
    const s = run(initialFabricationState(), { type: 'CONFIRM_ACTOR', at: AT });
    expect(s.outbox.some((e) => e.kind === 'ACTIVITY')).toBe(true);
    expect(pendingFounderDecisions(initialFabricationState()).map((d) => d.title)).toContain('LOCK IDENTITY');
  });
});

describe('character fabrication — asset boundary', () => {
  it('every slot is semantic, the manifest counts match, and authority receipts resolve', () => {
    const slots = buildCharacterAssetSlots();
    expect(new Set(slots.map((x) => x.slotId)).size).toBe(slots.length);
    for (const id of ['actor.sw017.portrait.primary', 'actor.sw017.angle.front', 'actor.sw017.body.neutral.side', 'look.sw017.candidate.a', 'appearance.sw017.reference.hair.01', 'motion.sw017.sit-v01.preview', 'simulation.sw017.current.preview']) expect(slots.map((x) => x.slotId)).toContain(id);
    const m = buildCharacterAssetManifest();
    expect(m.visualAssetsGeneratedBySonnet).toBe(0);
    const fulfilledGrok = CHARACTER_ASSET_RECEIPTS.filter((r) => slots.find((s) => s.slotId === r.slotId)?.grokRequired).length;
    expect(m.grokRequiredCount + m.runtimeCanonicalSlots + fulfilledGrok).toBe(m.totalSlots);
    expect(characterAssetUrl('actor.sw017.angle.front')).toMatch(/angle\/front\.webp$/);
  });
});

describe('character fabrication — screenshot dependence audit', () => {
  it('every rendered slot id used by the live views is declared in the registry', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const ids = new Set(buildCharacterAssetSlots().map((x) => x.slotId));
    const dir = 'src/site00/components/characterFabrication';
    const literal = /slotId=\{?["'`]([a-z0-9.\-]+)["'`]\}?/g;
    for (const f of readdirSync(dir)) {
      for (const m of readFileSync(`${dir}/${f}`, 'utf8').matchAll(literal)) expect(ids.has(m[1]!), `${f}: ${m[1]}`).toBe(true);
    }
  });
  it('asset manifest file matches the registry', async () => {
    const { readFileSync } = await import('node:fs');
    const onDisk = JSON.parse(readFileSync('docs/character-fabrication/CHARACTER_FABRICATION_ASSET_MANIFEST.json', 'utf8'));
    expect(onDisk).toEqual(JSON.parse(JSON.stringify(buildCharacterAssetManifest())));
  });
  it('components import no raster files, reference screenshots or legacy stand-in crops', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const dir = 'src/site00/components/characterFabrication';
    for (const f of readdirSync(dir)) {
      const src = readFileSync(`${dir}/${f}`, 'utf8');
      expect(src, f).not.toMatch(/\.(png|jpe?g|webp|gif)['"`]/i);
      expect(src, f).not.toMatch(/IMG_54\d\d|production-mobile|backgroundImage|url\(['"]?(\/|\.\/|\.\.\/|https?:|data:)/);
      if (f !== 'CfImage.tsx') expect(src, f).not.toMatch(/<img\b/);
    }
    const css = readFileSync('src/site00/styles/site00-character-fabrication.css', 'utf8');
    expect(css).not.toMatch(/url\((?!#)|background-image/);
    // authority stylesheet: the only external resources allowed are the vendored OFL fonts
    const auth = readFileSync('src/site00/styles/site00-character-fabrication-authority.css', 'utf8');
    const urls = [...auth.matchAll(/url\(([^)]*)\)/g)].map((m) => m[1]!.replace(/['"]/g, ''));
    for (const u of urls) expect(u, u).toMatch(/^(#|\/site00\/fonts\/[a-z-]+\/[a-z0-9-]+\.woff2$)/);
    expect(auth).not.toMatch(/background-image|IMG_54\d\d/);
  });
  it('request kinds route Character Fabrication into the Expression sub-workspace', async () => {
    const { createProductionWorkspaceRequest } = await import('../shared/site00-production-workspace/projectProductionSummary.js');
    const r = createProductionWorkspaceRequest({ projectSlug: 'ndxbook', kind: 'CHARACTER_FABRICATION_REVISION' });
    expect(r.targetWorkspace).toBe('EXPRESSION');
    expect(r.targetSubWorkspace).toBe('character-fabrication');
  });
});

describe('character fabrication — screenshot dependence audit', () => {
  it('every rendered slot id used by the live views is declared in the registry', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const ids = new Set(buildCharacterAssetSlots().map((x) => x.slotId));
    const dir = 'src/site00/components/characterFabrication';
    const literal = /slotId=\{?["'`]([a-z0-9.\-]+)["'`]\}?/g;
    for (const f of readdirSync(dir)) {
      for (const m of readFileSync(`${dir}/${f}`, 'utf8').matchAll(literal)) expect(ids.has(m[1]!), `${f}: ${m[1]}`).toBe(true);
    }
  });
  it('asset manifest file matches the registry', async () => {
    const { readFileSync } = await import('node:fs');
    const onDisk = JSON.parse(readFileSync('docs/character-fabrication/CHARACTER_FABRICATION_ASSET_MANIFEST.json', 'utf8'));
    expect(onDisk).toEqual(JSON.parse(JSON.stringify(buildCharacterAssetManifest())));
  });
  it('components import no raster files, reference screenshots or legacy stand-in crops', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const dir = 'src/site00/components/characterFabrication';
    for (const f of readdirSync(dir)) {
      const src = readFileSync(`${dir}/${f}`, 'utf8');
      expect(src, f).not.toMatch(/\.(png|jpe?g|webp|gif)['"`]/i);
      expect(src, f).not.toMatch(/IMG_54\d\d|production-mobile|backgroundImage|url\(['"]?(\/|\.\/|\.\.\/|https?:|data:)/);
      if (f !== 'CfImage.tsx') expect(src, f).not.toMatch(/<img\b/);
    }
    const css = readFileSync('src/site00/styles/site00-character-fabrication.css', 'utf8');
    expect(css).not.toMatch(/url\((?!#)|background-image/);
    // authority stylesheet: the only external resources allowed are the vendored OFL fonts
    const auth = readFileSync('src/site00/styles/site00-character-fabrication-authority.css', 'utf8');
    const urls = [...auth.matchAll(/url\(([^)]*)\)/g)].map((m) => m[1]!.replace(/['"]/g, ''));
    for (const u of urls) expect(u, u).toMatch(/^(#|\/site00\/fonts\/[a-z-]+\/[a-z0-9-]+\.woff2$)/);
    expect(auth).not.toMatch(/background-image|IMG_54\d\d/);
  });
  it('request kinds route Character Fabrication into the Expression sub-workspace', async () => {
    const { createProductionWorkspaceRequest } = await import('../shared/site00-production-workspace/projectProductionSummary.js');
    const r = createProductionWorkspaceRequest({ projectSlug: 'ndxbook', kind: 'CHARACTER_FABRICATION_REVISION' });
    expect(r.targetWorkspace).toBe('EXPRESSION');
    expect(r.targetSubWorkspace).toBe('character-fabrication');
  });
});
