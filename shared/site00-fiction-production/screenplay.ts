import fs from 'node:fs';
import path from 'node:path';
import { parseExchangeScreenplay } from './fountain.js';
import { EXCHANGE_PATHS, repoPath } from './paths.js';
import { cueIndex, resolveSet, type AssetRegistry, type DialogueRegistry } from './registries.js';
import { durationToSec } from './seasonMaster.js';
import type { ScreenplayDocument, ScreenplayElement, SeasonMaster } from './types.js';

export const DRAFT_STATUS = 'DRAFT — FOUNDER REVIEW REQUIRED';
export const NOTE_TAGS = ['SHOT', 'INSERT', 'REACTION', 'FREEZE', 'PROP', 'HANDOFF', 'WARDROBE', 'ENTER', 'EXIT', 'CONTINUITY', 'MUSIC', 'SFX', 'VFX', 'TIME', 'HOLD'] as const;

export const RUNTIME_MODEL = {
  dialogueWordsPerSec: 2.5,
  actionWordsPerSec: 3.5,
  minActionSec: 1.5,
  beatSec: 1.0,
  pauseSec: 2.0,
  longPauseSec: 3.0,
  freezeSec: 2.5,
  insertSec: 1.5,
  reactionSec: 1.5,
  transitionSec: 0.5,
  pacing: { under: 0.85, over: 1.15, high: 1.3 },
} as const;

const words = (s: string) => (s.match(/[A-Za-z0-9'’-]+/g) ?? []).length;

export function parentheticalSec(p: string | null): number {
  if (!p) return 0;
  const t = p.toLowerCase();
  if (/long pause|silence/.test(t)) return RUNTIME_MODEL.longPauseSec;
  if (/pause/.test(t)) return RUNTIME_MODEL.pauseSec;
  if (/beat/.test(t)) return RUNTIME_MODEL.beatSec;
  return 0;
}

export function elementSec(e: ScreenplayElement): number {
  switch (e.kind) {
    case 'dialogue':
      return words(e.text) / RUNTIME_MODEL.dialogueWordsPerSec + parentheticalSec(e.parenthetical);
    case 'action':
      return Math.max(RUNTIME_MODEL.minActionSec, words(e.text) / RUNTIME_MODEL.actionWordsPerSec);
    case 'transition':
      return RUNTIME_MODEL.transitionSec;
    case 'note':
      if (e.tag === 'FREEZE') return RUNTIME_MODEL.freezeSec;
      if (e.tag === 'INSERT') return RUNTIME_MODEL.insertSec;
      if (e.tag === 'REACTION') return RUNTIME_MODEL.reactionSec;
      if (e.tag === 'HOLD') return Number.parseFloat(e.value) || 0;
      return 0;
  }
}

export type PacingBand = 'UNDER' | 'ON_TARGET' | 'OVER' | 'HIGH_RISK';
export type RuntimeEstimate = {
  releaseId: string;
  targetSec: number;
  estimatedSec: number;
  ratio: number;
  band: PacingBand;
  scenes: Array<{ sceneId: string; estimatedSec: number }>;
  model: typeof RUNTIME_MODEL;
};

export function pacingBand(ratio: number): PacingBand {
  const p = RUNTIME_MODEL.pacing;
  if (ratio > p.high) return 'HIGH_RISK';
  if (ratio > p.over) return 'OVER';
  if (ratio < p.under) return 'UNDER';
  return 'ON_TARGET';
}

/** Scene seconds. `[[TIME: n]]` replaces the estimate of the action paragraph before it; dual dialogue counts once (the longer side). */
export function sceneSec(elements: ScreenplayElement[]): number {
  let total = 0;
  let lastAction = 0;
  let lastDialogue = 0;
  for (const e of elements) {
    if (e.kind === 'note' && e.tag === 'TIME') {
      const v = Number.parseFloat(e.value);
      if (Number.isFinite(v)) {
        total += v - lastAction;
        lastAction = v;
      }
      continue;
    }
    const s = elementSec(e);
    if (e.kind === 'dialogue' && e.dual) {
      total += Math.max(0, s - lastDialogue);
      lastDialogue = Math.max(s, lastDialogue);
      continue;
    }
    total += s;
    if (e.kind === 'action') lastAction = s;
    else if (e.kind !== 'note') lastAction = 0;
    if (e.kind === 'dialogue') lastDialogue = s;
  }
  return total;
}

export function estimateRuntime(doc: ScreenplayDocument): RuntimeEstimate {
  const scenes = doc.scenes.map((s) => ({ sceneId: s.sceneId, estimatedSec: Math.round(sceneSec(s.elements) * 10) / 10 }));
  const estimatedSec = Math.round(scenes.reduce((a, s) => a + s.estimatedSec, 0) * 10) / 10;
  const targetSec = durationToSec(doc.meta.identity.runtimeTarget);
  const ratio = Math.round((estimatedSec / targetSec) * 100) / 100;
  return { releaseId: doc.meta.identity.releaseId, targetSec, estimatedSec, ratio, band: pacingBand(ratio), scenes, model: RUNTIME_MODEL };
}

export type ScreenplayFinding = { severity: 'HARD_CONFLICT' | 'WARNING'; check: string; detail: string };

const REQUIRED_META: Record<string, string[]> = {
  identity: ['releaseId', 'title', 'arc', 'version', 'approvalStatus', 'runtimeTarget'],
  story: ['narrativePurpose', 'previousContinuity', 'openingHook', 'sceneObjectives', 'characterMotivations', 'conflict', 'revelations', 'emotionalTurningPoint', 'endingHook'],
  performance: ['speechNotes', 'subtext', 'pacing', 'silence'],
  visual: ['intention', 'keyImages', 'requiredReveals', 'continuityRules'],
  production: ['characters', 'locations', 'wardrobe', 'props', 'effects', 'crowd', 'shotComplexity', 'technical'],
  continuity: ['factsIntroduced', 'factsCarried', 'openQuestions', 'payoffDependencies', 'canonReferences'],
  editorial: ['pacingRisk', 'retentionHook', 'endingTransition'],
};

export const PROSE_PARAGRAPH_WORDS = 70;
export const LONG_SPEECH_WORDS = 45;

export type ScreenplayContext = { master: SeasonMaster; dialogue: DialogueRegistry; assets: AssetRegistry; silentReleases?: string[] };

export function validateScreenplay(doc: ScreenplayDocument, ctx: ScreenplayContext): ScreenplayFinding[] {
  const out: ScreenplayFinding[] = [];
  const hard = (check: string, detail: string) => out.push({ severity: 'HARD_CONFLICT', check, detail });
  const warn = (check: string, detail: string) => out.push({ severity: 'WARNING', check, detail });
  const meta = doc.meta as unknown as Record<string, Record<string, unknown>>;
  for (const [section, fields] of Object.entries(REQUIRED_META)) {
    if (!meta[section]) {
      hard('SCHEMA', `missing section ${section.toUpperCase()}`);
      continue;
    }
    for (const f of fields) {
      const v = meta[section][f];
      if (v === undefined || v === null || v === '') hard('SCHEMA', `${section}.${f} is empty`);
    }
  }
  const id = doc.meta.identity;
  const release = ctx.master.releases.find((r) => r.id === id?.releaseId);
  if (!release) {
    hard('RELEASE', `release ${id?.releaseId} is not in the approved master`);
    return out;
  }
  if (id.title.toUpperCase() !== release.title.toUpperCase()) hard('RELEASE', `title "${id.title}" does not match master "${release.title}"`);
  if (id.runtimeTarget !== release.runtimeTarget) hard('RELEASE', `runtime target ${id.runtimeTarget} does not match master ${release.runtimeTarget}`);
  if (id.approvalStatus !== DRAFT_STATUS) hard('APPROVAL', `approvalStatus must stay "${DRAFT_STATUS}" until SCREENPLAY approval is recorded`);

  const cues = cueIndex(ctx.dialogue);
  const declared = new Set(doc.meta.production.characters.map((c) => c.toUpperCase()));
  let dialogueCount = 0;
  for (const scene of doc.scenes) {
    const { set, zone } = resolveSet(ctx.assets, scene.location, scene.subLocation);
    if (!set) hard('SET', `${scene.sceneId}: "${scene.location}" is not a registered set or alias`);
    else if (scene.subLocation && !zone) warn('SET', `${scene.sceneId}: zone "${scene.subLocation}" is not registered on ${set.setId}`);
    for (const e of scene.elements) {
      if (e.kind === 'note' && !(NOTE_TAGS as readonly string[]).includes(e.tag)) hard('NOTE', `${scene.sceneId}: unknown production note [[${e.tag}]]`);
      if (e.kind === 'action' && words(e.text) > PROSE_PARAGRAPH_WORDS) warn('PERFORMABILITY', `${scene.sceneId}: action paragraph of ${words(e.text)} words reads as prose summary`);
      if (e.kind === 'dialogue') {
        dialogueCount += 1;
        if (!cues.has(e.character)) {
          if (declared.has(e.character)) warn('VOICE', `${e.lineId}: ${e.character} has no dialogue registry entry`);
          else hard('VOICE', `${e.lineId}: ${e.character} is neither registered nor declared in PRODUCTION.characters`);
        }
        if (words(e.text) > LONG_SPEECH_WORDS) warn('PERFORMABILITY', `${e.lineId}: ${words(e.text)}-word speech`);
        if (!e.text) hard('PERFORMABILITY', `${e.lineId}: cue without speech`);
      }
    }
  }
  const silent = ctx.silentReleases?.includes(release.id);
  if (silent && dialogueCount) hard('PERFORMABILITY', `${release.id} is a no-dialogue release but has ${dialogueCount} lines`);
  if (!silent && !dialogueCount) hard('PERFORMABILITY', `${release.id} has no performable dialogue`);

  const all = doc.scenes.flatMap((s) => s.elements).map((e) => ('text' in e ? e.text : e.value)).join('\n');
  for (const c of ctx.dialogue.characters) {
    for (const l of c.dialogueContinuity.establishedLines) {
      const n = all.split(l.line).length - 1;
      if (n > ctx.dialogue.maxSignatureUsesPerRelease) warn('SIGNATURE', `"${l.line}" used ${n} times (max ${ctx.dialogue.maxSignatureUsesPerRelease})`);
    }
  }
  return out;
}

export function screenplayFiles(root = process.cwd()): string[] {
  const dir = repoPath(EXCHANGE_PATHS.screenplays, root);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.fountain'))
    .sort()
    .map((f) => path.join(EXCHANGE_PATHS.screenplays, f));
}

export function loadScreenplays(root = process.cwd()): ScreenplayDocument[] {
  return screenplayFiles(root).map((rel) => parseExchangeScreenplay(fs.readFileSync(repoPath(rel, root), 'utf8'), rel));
}
