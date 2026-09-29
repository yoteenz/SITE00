/**
 * P0.PRODUCTION-HUB.AUTHORITY-RECONSTRUCTION-AND-HANDOFF1 — machine core.
 */
import { describe, expect, it } from 'vitest';
import { deriveHubGraph } from '../shared/site00-production-hub/graph.js';
import { hubReducer, initialHubState } from '../shared/site00-production-hub/reducer.js';
import { buildHubAssetSlots, hubAssetUrl, hubGrokRequiredSlots, applyReceipts } from '../shared/site00-production-hub/assets.js';
import { HUB_NODE_ORDER, type HubGraphInput } from '../shared/site00-production-hub/types.js';
import { buildHubGraphInput, buildHubScenes, hubDeepLink } from '../shared/site00-production-hub/model.js';
import { buildEntry002ProductionCastState } from '../shared/site00-studio-world/acting-catalogue/index.js';
import { compileEntry002RetroactiveNarrativeMomentum } from '../shared/site00-expression-engine/narrative-momentum/entry002RetroactiveIngest.js';

const ctx = { projectId: 'ndxbook', productionId: 'entry-002' };
const base: HubGraphInput = {
  hasProduction: true,
  pipelineAvailable: true,
  narrativeStatus: 'APPROVED',
  cast: { allRequiredLocked: true, requiredCount: 2, lockedCount: 2, missingAuthorities: [] },
  looksLocked: true,
  lookCount: 2,
  performanceDefined: true,
  setDefined: true,
  storyboard: { status: 'AWAITING_FOUNDER_APPROVAL', approved: false, panelCount: 16 },
  keyframeEligibility: 'BLOCKED',
  keyframesApproved: false,
};
const g = (over: Partial<HubGraphInput> = {}) => deriveHubGraph({ ...base, ...over }, ctx);

describe('production graph', () => {
  it('has the seven-stage chain in order', () => {
    expect(g().nodes.map((n) => n.id)).toEqual([...HUB_NODE_ORDER]);
  });

  it('storyboard awaiting founder → REVIEW_REQUIRED, keyframes LOCKED, gate open and decidable', () => {
    const r = g();
    expect(r.byId.storyboard.status).toBe('REVIEW_REQUIRED');
    expect(r.byId.keyframes.status).toBe('LOCKED');
    expect(r.founderGate.open).toBe(true);
    expect(r.founderGate.nodeId).toBe('storyboard');
    expect(r.founderGate.decidableInHub).toBe(true);
    expect(r.operation.label).toBe('STORYBOARD REVIEW');
    expect(r.nextStage).toBe('keyframes');
  });

  it('approved storyboard + eligible keyframes → storyboard COMPLETE, keyframes ACTIVE, gate closed', () => {
    const r = g({ storyboard: { status: 'AWAITING_FOUNDER_APPROVAL', approved: true, panelCount: 16 }, keyframeEligibility: 'READY_FOR_GENERATION' });
    expect(r.byId.storyboard.status).toBe('COMPLETE');
    expect(r.byId.keyframes.status).toBe('ACTIVE');
    expect(r.founderGate.open).toBe(false);
  });

  it('revision-required storyboard can never leave downstream keyframes complete', () => {
    const r = g({ storyboard: { status: 'REVISION_REQUIRED', approved: false, panelCount: 16 }, keyframesApproved: true, keyframeEligibility: 'APPROVED' });
    expect(r.byId.storyboard.status).toBe('REVIEW_REQUIRED');
    expect(r.byId.keyframes.status).toBe('REVIEW_REQUIRED'); // stale, not COMPLETE
    expect(r.byId.keyframes.status).not.toBe('COMPLETE');
  });

  it('upstream change downgrades completed dependents; unstarted dependents lock', () => {
    const r = g({ narrativeStatus: 'NEEDS_REVISION', storyboard: null, pipelineAvailable: false });
    expect(r.byId.narrative.status).toBe('REVIEW_REQUIRED');
    expect(r.byId.cast.status).toBe('REVIEW_REQUIRED'); // complete cast, upstream not complete
    expect(r.byId.storyboard.status).toBe('LOCKED');
  });

  it('no production → everything NOT_STARTED, no gate, no fabricated progress', () => {
    const r = g({ hasProduction: false });
    expect(r.nodes.every((n) => n.status === 'NOT_STARTED')).toBe(true);
    expect(r.founderGate.open).toBe(false);
    expect(r.progressPercent).toBe(0);
  });

  it('is deterministic', () => {
    expect(JSON.stringify(g())).toBe(JSON.stringify(g()));
  });

  it('quick actions are contextual per node type, not universal', () => {
    const r = g();
    expect(r.byId.cast.quickActions.map((a) => a.label)).toEqual(['PROFILE', 'LOOKS', 'CONTINUITY', 'PERFORMANCE', 'OPEN CASTING']);
    expect(r.byId.set.quickActions.map((a) => a.label)).toEqual(['ZONES', 'PROPS', 'CAMERAS', 'GRAPHICS', 'OPEN SET']);
    expect(r.byId.storyboard.quickActions.map((a) => a.label)).toEqual(['FRAMES', 'SEQUENCE', 'AUTHORITIES', 'COMPARE', 'REVIEW']);
  });

  it('derives real Entry 002 state from canonical cast + narrative (set is honestly NOT_STARTED)', () => {
    const cast = buildEntry002ProductionCastState();
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const input = buildHubGraphInput({
      hasProduction: true,
      narrativeStatus: plan.founderStatus,
      cast,
      pipeline: { available: false, storyboardStatus: null, storyboardApproved: false, panelCount: 0, keyframeEligibility: null, keyframesApproved: false },
    });
    const r = deriveHubGraph(input, ctx);
    expect(r.byId.set.status === 'NOT_STARTED' || r.byId.set.status === 'LOCKED').toBe(true);
    expect(r.byId.storyboard.statusDetail).toMatch(/unavailable|Waiting/);
  });
});

describe('ui state machine', () => {
  const s0 = { ...initialHubState('ndxbook'), selectedSceneId: 'sc-1', selectedStoryboardFrameId: 'frame-01' };
  const frames = ['frame-01', 'frame-02', 'frame-03'];

  it('selectedSceneId and selectedStoryboardFrameId are independent', () => {
    const a = hubReducer(s0, { type: 'STEP_FRAME', delta: 1, frameIds: frames });
    expect(a.selectedStoryboardFrameId).toBe('frame-02');
    expect(a.selectedSceneId).toBe('sc-1');
    const b = hubReducer(a, { type: 'SELECT_SCENE', sceneId: 'sc-4' });
    expect(b.selectedSceneId).toBe('sc-4');
    expect(b.selectedStoryboardFrameId).toBe('frame-02');
  });

  it('frame stepping wraps and ignores empty frame lists', () => {
    const back = hubReducer(s0, { type: 'STEP_FRAME', delta: -1, frameIds: frames });
    expect(back.selectedStoryboardFrameId).toBe('frame-03');
    expect(hubReducer(s0, { type: 'STEP_FRAME', delta: 1, frameIds: [] })).toBe(s0);
  });

  it('mode switch reconfigures without losing selection', () => {
    const r = hubReducer({ ...s0, selectedNodeId: 'cast' }, { type: 'SET_MODE', mode: 'FLOW' });
    expect(r.currentMode).toBe('FLOW');
    expect(r.selectedNodeId).toBe('cast');
    expect(r.selectedSceneId).toBe('sc-1');
  });

  it('overlays never mutate the base state; closing restores it exactly', () => {
    const open = hubReducer(s0, { type: 'OPEN_OVERLAY', overlay: 'LIGHTBOX' });
    const closed = hubReducer(open, { type: 'CLOSE_OVERLAY' });
    expect(closed).toEqual(s0);
  });

  it('selecting a scene from the selector closes the selector', () => {
    const open = hubReducer(s0, { type: 'OPEN_OVERLAY', overlay: 'SCENE_SELECTOR' });
    expect(hubReducer(open, { type: 'SELECT_SCENE', sceneId: 'sc-2' }).overlay).toBe('NONE');
  });

  it('node select toggles; inspector open/close; restore never reopens an overlay', () => {
    const sel = hubReducer(s0, { type: 'SELECT_NODE', nodeId: 'cast' });
    expect(sel.selectedNodeId).toBe('cast');
    const ins = hubReducer(sel, { type: 'OPEN_INSPECTOR', nodeId: 'cast', tab: 'profile' });
    expect(ins.inspectionState).toEqual({ open: true, tab: 'profile' });
    expect(hubReducer(ins, { type: 'CLOSE_INSPECTOR' }).inspectionState.open).toBe(false);
    expect(hubReducer(s0, { type: 'RESTORE', state: { overlay: 'LIGHTBOX' as never } }).overlay).toBe('NONE');
  });

  it('hydration never overrides a restored selection and defaults when nothing valid is selected', () => {
    const restored = hubReducer(initialHubState('ndxbook'), { type: 'RESTORE', state: { selectedSceneId: 'sc-3', selectedStoryboardFrameId: 'frame-02' } });
    const scenes = ['sc-1', 'sc-2', 'sc-3'];
    expect(hubReducer(restored, { type: 'ENSURE_SCENE', sceneIds: scenes }).selectedSceneId).toBe('sc-3');
    expect(hubReducer(restored, { type: 'ENSURE_FRAME', frameIds: frames }).selectedStoryboardFrameId).toBe('frame-02');
    const fresh = initialHubState('ndxbook');
    expect(hubReducer(fresh, { type: 'ENSURE_SCENE', sceneIds: scenes }).selectedSceneId).toBe('sc-1');
    expect(hubReducer({ ...restored, selectedSceneId: 'gone' }, { type: 'ENSURE_SCENE', sceneIds: scenes }).selectedSceneId).toBe('sc-1');
    // frames disappearing clears the frame selection, empty scene list changes nothing
    expect(hubReducer(restored, { type: 'ENSURE_FRAME', frameIds: [] }).selectedStoryboardFrameId).toBeNull();
    expect(hubReducer(restored, { type: 'ENSURE_SCENE', sceneIds: [] })).toBe(restored);
  });

  it('project switch resets to a clean base', () => {
    const r = hubReducer({ ...s0, selectedNodeId: 'cast', currentMode: 'FLOW' }, { type: 'SELECT_PROJECT', projectId: 'studio-world', productionId: null, sceneId: null });
    expect(r.selectedProjectId).toBe('studio-world');
    expect(r.selectedNodeId).toBeNull();
    expect(r.currentMode).toBe('LIVE');
  });
});

describe('scenes, deep links and asset firewall', () => {
  it('scenes are the real Entry 002 reel beats (no invented scene names)', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const scenes = buildHubScenes(plan);
    expect(scenes).toHaveLength(plan.beats.length);
    expect(scenes.map((s) => s.label)).toEqual(plan.beats.map((b) => b.label));
    expect(scenes.every((s) => s.durationRange)).toBe(true);
  });

  it('deep links carry hub context', () => {
    const l = hubDeepLink({ projectId: 'ndxbook', target: 'casting', sceneId: 'sc', frameId: 'frame-03', nodeId: 'cast' });
    expect(l.startsWith('/production/ndxbook/expression/casting?')).toBe(true);
    expect(l).toContain('from=hub');
    expect(l).toContain('scene=sc');
    expect(l).toContain('frame=frame-03');
  });

  it('every slot is declared once, has a destination, and Grok only gets real visual material', () => {
    const slots = buildHubAssetSlots();
    expect(new Set(slots.map((s) => s.slotId)).size).toBe(slots.length);
    expect(slots.every((s) => s.destinationPath.length > 0 && s.usedBy.length > 0)).toBe(true);
    const grok = hubGrokRequiredSlots(slots);
    expect(grok.length).toBeGreaterThan(10);
    expect(grok.every((s) => s.status === 'MISSING')).toBe(true);
    expect(grok.some((s) => /button|border|panel|icon|navigation/i.test(s.assetType))).toBe(false);
    // Pipeline-produced frames and authority-backed nodes are NOT Grok work.
    expect(slots.filter((s) => s.assetType === 'STORYBOARD_FRAME').every((s) => !s.grokRequired)).toBe(true);
  });

  it('ships with no fulfilled assets: Sonnet mounted nothing', () => {
    const slots = buildHubAssetSlots();
    expect(slots.some((s) => s.status === 'FULFILLED')).toBe(false);
    expect(hubAssetUrl('production.ndxbook.entry-002.node.set.primary')).toBeNull();
  });

  it('a receipt fulfils exactly its slot and nothing else', () => {
    const slots = buildHubAssetSlots();
    const target = slots.find((s) => s.grokRequired)!;
    const receipts = [{ slotId: target.slotId, canonicalAssetId: 'asset-1', url: '/x.webp', source: 'GROK' as const, receivedAt: '2026-01-01' }];
    const out = applyReceipts(slots, receipts);
    expect(out.filter((s) => s.status === 'FULFILLED').map((s) => s.slotId)).toEqual([target.slotId]);
    expect(hubAssetUrl(target.slotId, {}, receipts)).toBe('/x.webp');
  });
});

describe('hub grok manifest + firewall', () => {
  it('manifest file matches the registry', async () => {
    const { readFileSync } = await import('node:fs');
    const { buildHubGrokManifest } = await import('../shared/site00-production-hub/manifest.js');
    const onDisk = JSON.parse(readFileSync('docs/production-hub/GROK_ASSET_MANIFEST.json', 'utf8'));
    expect(onDisk).toEqual(JSON.parse(JSON.stringify(buildHubGrokManifest())));
    expect(onDisk.visualAssetsGeneratedBySonnet).toBe(0);
  });

  it('hub components never import raster files or the reference crops', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const dir = 'src/site00/components/productionHub';
    for (const f of readdirSync(dir)) {
      const src = readFileSync(`${dir}/${f}`, 'utf8');
      expect(src).not.toMatch(/\.(png|jpe?g|webp|gif)['"`]/i);
      expect(src).not.toMatch(/production-mobile/);
    }
  });
});
