import fs from 'node:fs';
import { EXCHANGE_PATHS, repoPath } from './paths.js';
import { resolveSet, type AssetRegistry } from './registries.js';
import { elementSec, RUNTIME_MODEL } from './screenplay.js';
import type { ScreenplayDocument, ShotRecord, ShotType } from './types.js';

export const MAX_GENERATION_SEC = 10;

export type PriceQuotes = {
  retrievedAtUtc: string;
  fal: Record<string, { unitPriceUsd: number; unit: string }>;
  openart: { quotes: Array<{ model: string; mode: string; config: Record<string, unknown>; totalCredits: number }>; unquoted: string[] };
};

export const loadPriceQuotes = (root = process.cwd()): PriceQuotes =>
  JSON.parse(fs.readFileSync(repoPath(`${EXCHANGE_PATHS.season}/PRODUCTION_TEST_RECORDS/PROVIDER_PRICE_QUOTES_V1.json`, root), 'utf8')) as PriceQuotes;

const VIDEO_MODEL = 'kling-3-omni';
const KEYFRAME_MODEL = 'gpt-image-2-5-sunburst';
const FAL_I2V = 'fal-ai/kling-video/v2.1/master/image-to-video';
const FAL_LIPSYNC = 'fal-ai/sync-lipsync/v2';

const DEFAULT_FRAMING: Record<ShotType, string> = {
  ESTABLISHING: 'WIDE',
  ACTION: 'MEDIUM',
  DIALOGUE: 'MEDIUM CLOSE-UP',
  REACTION: 'CLOSE-UP',
  INSERT: 'EXTREME CLOSE-UP',
  FREEZE_FRAME: 'HOLD ON PREVIOUS FRAME',
  TRANSITION: 'N/A',
  CUTAWAY: 'MEDIUM WIDE',
};

const EDIT_ONLY: ShotType[] = ['FREEZE_FRAME', 'TRANSITION'];

export function shotCost(type: ShotType, durationSec: number, lipSync: boolean, q: PriceQuotes): ShotRecord['estimatedCost'] {
  if (EDIT_ONLY.includes(type)) return { usd: 0, credits: 0, basis: 'Edit-only: no generation.' };
  const video = q.openart.quotes.find((x) => x.model === VIDEO_MODEL && Number(x.config.duration) === 5);
  const key = q.openart.quotes.find((x) => x.model === KEYFRAME_MODEL);
  const i2v = q.fal[FAL_I2V];
  const lip = q.fal[FAL_LIPSYNC];
  const blocks = Math.ceil(durationSec / 5);
  const credits = video && key ? key.totalCredits + video.totalCredits * blocks : null;
  const billedSec = durationSec <= 5 ? 5 : 10;
  let usd = i2v ? i2v.unitPriceUsd * billedSec : null;
  if (usd !== null && lipSync) usd = lip ? usd + (lip.unitPriceUsd * durationSec) / 60 : null;
  const basis =
    `Alternatives, not a sum. OpenArt: keyframe ${KEYFRAME_MODEL} ${key?.totalCredits ?? '?'} cr + ${VIDEO_MODEL} std ${video?.totalCredits ?? '?'} cr per 5 s × ${blocks}. ` +
    `fal: ${FAL_I2V} $${i2v?.unitPriceUsd ?? '?'}/s billed ${billedSec} s${lipSync ? ` + ${FAL_LIPSYNC} $${lip?.unitPriceUsd ?? '?'}/min` : ''}. ` +
    `Quoted ${q.retrievedAtUtc}; ${q.openart.unquoted.join(', ')} unquoted.`;
  return { usd: usd === null ? null : Math.round(usd * 100) / 100, credits, basis };
}

type Draft = Omit<ShotRecord, 'shotId' | 'order' | 'startFrameRef' | 'endFrameRef' | 'estimatedCost' | 'generationProvider'> & { lipSync: boolean; vfx: boolean };

export type ShotPlan = { releaseId: string; shots: ShotRecord[]; totalSec: number; warnings: string[] };

const splitNote = (v: string) => v.split(/\s+—\s+/).map((s) => s.trim());

export function planShots(doc: ScreenplayDocument, assets: AssetRegistry, quotes: PriceQuotes): ShotPlan {
  const releaseId = doc.meta.identity.releaseId;
  const warnings: string[] = [];
  const shots: ShotRecord[] = [];
  const wardrobe: Record<string, string> = {};
  const props: Record<string, string> = {};
  const faceRef = new Map(assets.characters.map((c) => [c.cue, c.visualRegistryRef]));
  let prevPlace = '';

  for (const scene of doc.scenes) {
    const { set, zone } = resolveSet(assets, scene.location, scene.subLocation);
    const setRef = set ? `${set.setId}${zone ? ` › ${zone}` : ''}` : null;
    const place = `${scene.location}|${scene.subLocation ?? ''}`;
    const locationChanged = place !== prevPlace;
    prevPlace = place;
    const present = new Set<string>();
    const drafts: Draft[] = [];
    let pendingFraming: string[] | null = null;
    let vfxNext = false;
    const last = () => drafts[drafts.length - 1];
    const push = (type: ShotType, purpose: string, durationSec: number, onScreen: string[], extra: Partial<Draft> = {}) => {
      const [framing, movement] = pendingFraming ?? [DEFAULT_FRAMING[type], type === 'ESTABLISHING' ? 'SLOW PUSH' : 'STATIC'];
      pendingFraming = null;
      drafts.push({
        releaseId,
        sceneId: scene.sceneId,
        type,
        purpose,
        onScreen,
        framing,
        movement: movement ?? 'STATIC',
        blocking: '',
        dialogueRefs: [],
        durationSec,
        wardrobeState: Object.fromEntries(onScreen.filter((c) => wardrobe[c]).map((c) => [c, wardrobe[c]])),
        setRef,
        propState: { ...props },
        movementConstraints: [],
        technicalComplexity: 'LOW',
        generationStatus: 'NOT_STARTED',
        approvalStatus: 'NOT_SUBMITTED',
        actualCost: null,
        lipSync: false,
        vfx: vfxNext,
        ...extra,
      });
      vfxNext = false;
    };

    scene.elements.forEach((e, i) => {
      if (e.kind === 'action') {
        const type: ShotType = drafts.length === 0 && locationChanged ? 'ESTABLISHING' : 'ACTION';
        push(type, e.text.split('\n')[0].slice(0, 140), elementSec(e), [...present].sort(), { blocking: e.text });
      } else if (e.kind === 'transition') {
        push('TRANSITION', e.text, RUNTIME_MODEL.transitionSec, []);
      } else if (e.kind === 'dialogue') {
        const sec = elementSec(e);
        const prev = last();
        if (e.extension === 'V.O.') {
          if (prev) {
            prev.dialogueRefs.push(e.lineId);
            prev.durationSec += sec;
          } else push('CUTAWAY', `Voice-over: ${e.character}`, sec, [], { dialogueRefs: [e.lineId] });
          return;
        }
        if (prev?.type === 'DIALOGUE' && (e.dual || (prev.onScreen[0] === e.character && i > 0 && scene.elements[i - 1].kind === 'dialogue'))) {
          prev.dialogueRefs.push(e.lineId);
          if (e.dual) {
            prev.onScreen = [...new Set([...prev.onScreen, e.character])];
            prev.framing = 'TWO-SHOT';
            prev.durationSec = Math.max(prev.durationSec, sec);
          } else prev.durationSec += sec;
          return;
        }
        const onScreen = e.extension === 'O.S.' || e.extension === 'O.C.' ? [] : [e.character];
        push('DIALOGUE', `${e.character}: ${e.text.slice(0, 80)}`, sec, onScreen, { dialogueRefs: [e.lineId], lipSync: onScreen.length > 0 });
        if (!present.has(e.character) && onScreen.length) warnings.push(`${e.lineId}: ${e.character} speaks on screen without an ENTER in ${scene.sceneId}`);
      } else {
        const v = e.value;
        switch (e.tag) {
          case 'SHOT':
            pendingFraming = splitNote(v);
            break;
          case 'TIME': {
            const prev = last();
            const n = Number.parseFloat(v);
            if (prev && Number.isFinite(n) && (prev.type === 'ACTION' || prev.type === 'ESTABLISHING')) prev.durationSec = n;
            break;
          }
          case 'HOLD': {
            const prev = last();
            if (prev) prev.durationSec += Number.parseFloat(v) || 0;
            break;
          }
          case 'REACTION': {
            const [who, what] = splitNote(v);
            push('REACTION', what ?? who, RUNTIME_MODEL.reactionSec, [who.toUpperCase()]);
            break;
          }
          case 'INSERT':
            push('INSERT', v, RUNTIME_MODEL.insertSec, []);
            break;
          case 'FREEZE':
            push('FREEZE_FRAME', v, RUNTIME_MODEL.freezeSec, last()?.onScreen ?? []);
            break;
          case 'ENTER':
            present.add(v.toUpperCase());
            break;
          case 'EXIT':
            present.delete(v.toUpperCase());
            break;
          case 'WARDROBE': {
            const [who, id] = v.split(':').map((s) => s.trim());
            if (who && id) wardrobe[who.toUpperCase()] = id;
            break;
          }
          case 'PROP':
          case 'HANDOFF': {
            const idx = v.indexOf(':');
            if (idx > 0) props[v.slice(0, idx).trim()] = v.slice(idx + 1).trim();
            break;
          }
          case 'VFX':
            vfxNext = true;
            break;
          default:
            break;
        }
      }
    });
    if (scene.elements.find((e) => e.kind !== 'note')?.kind !== 'action') warnings.push(`${scene.sceneId}: opens without an establishing action paragraph`);

    let n = 0;
    for (const d of drafts) {
      const parts = Math.max(1, Math.ceil(d.durationSec / MAX_GENERATION_SEC));
      const partSec = Math.round((d.durationSec / parts) * 10) / 10;
      let prevEnd: string | null = null;
      for (let p = 0; p < parts; p += 1) {
        n += 1;
        const shotId = `${scene.sceneId}-SH${String(n).padStart(2, '0')}`;
        const chained = parts > 1 && p < parts - 1;
        const constraints = [...d.movementConstraints];
        if (parts > 1) constraints.push(`Part ${p + 1} of ${parts}: generations stay ≤${MAX_GENERATION_SEC} s and chain end frame to start frame.`);
        for (const c of d.onScreen) {
          const ref = faceRef.get(c);
          if (ref === undefined) constraints.push(`${c}: not in the asset registry.`);
          else if (ref === null) constraints.push(`${c}: no approved face asset — generation blocked.`);
          else constraints.push(`${c}: face lock ${ref} (CHARACTER_VISUAL_REGISTRY_V1).`);
        }
        if (d.lipSync) constraints.push('Lip-sync pass on the approved dialogue recording only; no substitute speech.');
        const complexity: ShotRecord['technicalComplexity'] = d.vfx || d.onScreen.length >= 3 ? 'HIGH' : d.lipSync || d.onScreen.length === 2 ? 'MED' : 'LOW';
        const { lipSync, vfx, ...rest } = d;
        void vfx;
        shots.push({
          ...rest,
          shotId,
          order: shots.length + 1,
          durationSec: partSec,
          startFrameRef: prevEnd ?? `${shotId}.start`,
          endFrameRef: chained ? `${shotId}.end` : null,
          movementConstraints: constraints,
          technicalComplexity: complexity,
          generationProvider: EDIT_ONLY.includes(d.type)
            ? 'EDIT:capcut-manifest'
            : `OPENART:${VIDEO_MODEL}:image2video${lipSync ? ' + LIPSYNC:unverified' : ''}`,
          estimatedCost: shotCost(d.type, partSec, lipSync, quotes),
        });
        prevEnd = chained ? `${shotId}.end` : null;
      }
    }
  }
  const totalSec = Math.round(shots.reduce((a, s) => a + s.durationSec, 0) * 10) / 10;
  return { releaseId, shots, totalSec, warnings };
}

export function summarizeCost(plan: ShotPlan) {
  const usd = plan.shots.reduce((a, s) => (a === null || s.estimatedCost.usd === null ? null : a + s.estimatedCost.usd), 0 as number | null);
  const credits = plan.shots.reduce((a, s) => (a === null || s.estimatedCost.credits === null ? null : a + s.estimatedCost.credits), 0 as number | null);
  return { usd: usd === null ? null : Math.round(usd * 100) / 100, credits, generatedShots: plan.shots.filter((s) => !EDIT_ONLY.includes(s.type)).length };
}
