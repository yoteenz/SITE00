import fs from 'node:fs';
import { EXCHANGE_PATHS, repoPath } from './paths.js';

export type EstablishedLine = { line: string; release: string; note?: string };

export type DialogueCharacter = {
  characterId: string;
  cue: string;
  displayName: string;
  age: number | null;
  voiceIdentity: string | Record<string, unknown>;
  linguisticPersonality: Record<string, unknown>;
  relationshipLanguage: Record<string, unknown>;
  emotionalPerformance: Record<string, string>;
  dialogueContinuity: { establishedLines: EstablishedLine[]; recurringReferences?: string[]; signaturePhrases?: string[]; [k: string]: unknown };
  voiceAsset: VoiceLink & { voiceId: string | null };
};

/** Connector-derived evidence: the founder's workspace confirmed the voice, this environment did not. */
export type VoiceEvidence = { source: string; date: string; composerIndependentVerification: string; founderDirective?: string; castEdit?: string; verifiedThrough?: string };
export type VoiceLink = { provider: string; status: string; evidence?: VoiceEvidence; note?: string };

/** A voice id is acceptable when verified here, or connector-verified with recorded evidence. */
export function voiceLinkProblem(voiceId: string | null, link: VoiceLink): string | null {
  if (!voiceId) return null;
  if (link.status === 'VERIFIED') return null;
  if (link.status === 'CONNECTOR_VERIFIED') return link.evidence?.source?.trim() && link.evidence.date?.trim() && link.evidence.composerIndependentVerification?.trim() ? null : 'CONNECTOR_VERIFIED voice id without source, date and verification scope';
  return 'voice id present without verification';
}

export type DialogueRegistry = {
  schemaVersion: string;
  registryId: string;
  classification: string;
  globalRules: string[];
  maxSignatureUsesPerRelease: number;
  characters: DialogueCharacter[];
};

export type SetRecord = {
  setId: string;
  name: string;
  aliases: string[];
  zones: string[];
  releases?: string[];
  releaseCount?: number;
  classification: string;
  establishingAngles: string[];
  reverseAngles: string[];
  lightingRefs: string[];
  timeOfDayVariants: string[];
  [k: string]: unknown;
};

export type WardrobeRecord = {
  wardrobeId: string;
  owner: string;
  description: string;
  releases: string[];
  continuity: string;
  accessories: string[];
  approvedReferenceFiles: string[];
  status: string;
  dependency?: string;
};

export type PropRecord = {
  propId: string;
  name: string;
  owner: string | null;
  narrativeImportance: string;
  releases: string[];
  handoffChain?: string[];
  status: string;
  [k: string]: unknown;
};

export type AssetCharacter = {
  characterId: string;
  cue: string;
  visualRegistryRef: string | null;
  voice: VoiceLink & { voiceAssetId: string | null };
  [k: string]: unknown;
};

export type AssetRegistry = {
  registryId: string;
  classification: string;
  rules: string[];
  characters: AssetCharacter[];
  sets: SetRecord[];
  wardrobe: WardrobeRecord[];
  props: PropRecord[];
  libraryPlanned: unknown;
  audio: Record<string, Array<{ ref: string; classification?: string; [k: string]: unknown }>>;
  video: { canonical: Array<{ path: string; [k: string]: unknown }>; productionTestRecord: string };
};

const readJson = <T>(rel: string, root: string): T => JSON.parse(fs.readFileSync(repoPath(rel, root), 'utf8')) as T;

export const loadDialogueRegistry = (root = process.cwd()) => readJson<DialogueRegistry>(EXCHANGE_PATHS.dialogue, root);
export const loadAssetRegistry = (root = process.cwd()) => readJson<AssetRegistry>(EXCHANGE_PATHS.assets, root);

export type RegistryFinding = { severity: 'HARD_CONFLICT' | 'WARNING' | 'BLOCKER'; registry: string; subject: string; detail: string };

const RELEASE_ID = /^S1-(0[1-9]|[1-7]\d|8[0-6])$/;
const EMOTIONS = ['amused', 'afraid', 'angry', 'grieving', 'lying', 'vulnerable'];

export function validateDialogueRegistry(reg: DialogueRegistry): RegistryFinding[] {
  const out: RegistryFinding[] = [];
  const cues = new Set<string>();
  for (const c of reg.characters) {
    const add = (severity: RegistryFinding['severity'], detail: string) => out.push({ severity, registry: 'dialogue', subject: c.characterId, detail });
    if (!c.cue || c.cue !== c.cue.toUpperCase()) add('HARD_CONFLICT', `cue must be upper case: ${c.cue}`);
    if (cues.has(c.cue)) add('HARD_CONFLICT', `duplicate cue ${c.cue}`);
    cues.add(c.cue);
    if (typeof c.voiceIdentity === 'string' ? !c.voiceIdentity.trim() : !c.voiceIdentity || typeof c.voiceIdentity !== 'object') add('HARD_CONFLICT', 'missing voiceIdentity');
    for (const section of ['linguisticPersonality', 'relationshipLanguage', 'emotionalPerformance', 'dialogueContinuity'] as const) {
      if (!c[section] || typeof c[section] !== 'object') add('HARD_CONFLICT', `missing ${section}`);
    }
    for (const e of EMOTIONS) if (!c.emotionalPerformance?.[e]) add('WARNING', `emotionalPerformance.${e} not written`);
    for (const l of c.dialogueContinuity?.establishedLines ?? []) {
      if (!RELEASE_ID.test(l.release)) add('HARD_CONFLICT', `established line cites unknown release ${l.release}`);
      if (!l.line.trim()) add('HARD_CONFLICT', 'empty established line');
    }
    const voiceProblem = c.voiceAsset ? voiceLinkProblem(c.voiceAsset.voiceId, c.voiceAsset) : null;
    if (voiceProblem) add('HARD_CONFLICT', voiceProblem);
    if (!c.voiceAsset?.voiceId) add('BLOCKER', 'no verified voice asset (CHARACTER_VOICE approval cannot start)');
  }
  return out;
}

export function cueIndex(reg: DialogueRegistry): Map<string, DialogueCharacter> {
  return new Map(reg.characters.map((c) => [c.cue, c]));
}

type VisualRegistry = { characters: Array<{ characterId: string; assets?: Array<{ path?: string; repoPath?: string }> }> };

export function validateAssetRegistry(reg: AssetRegistry, root = process.cwd()): RegistryFinding[] {
  const out: RegistryFinding[] = [];
  const add = (severity: RegistryFinding['severity'], subject: string, detail: string) => out.push({ severity, registry: 'assets', subject, detail });
  const visual = readJson<VisualRegistry>(EXCHANGE_PATHS.visualRegistry, root);
  const visualIds = new Set(visual.characters.map((c) => c.characterId));
  const propIds = new Set(reg.props.map((p) => p.propId));
  const exists = (rel: string) => fs.existsSync(repoPath(rel, root));

  for (const c of reg.characters) {
    if (c.visualRegistryRef && !visualIds.has(c.visualRegistryRef)) add('HARD_CONFLICT', c.characterId, `visualRegistryRef ${c.visualRegistryRef} not in CHARACTER_VISUAL_REGISTRY_V1`);
    if (!c.visualRegistryRef) add('BLOCKER', c.characterId, 'no approved facial identity asset');
    const voiceProblem = voiceLinkProblem(c.voice.voiceAssetId, c.voice);
    if (voiceProblem) add('HARD_CONFLICT', c.characterId, voiceProblem);
    if (!c.voice.voiceAssetId) add('BLOCKER', c.characterId, 'voice asset missing');
  }
  const setIds = new Set<string>();
  for (const s of reg.sets) {
    if (setIds.has(s.setId)) add('HARD_CONFLICT', s.setId, 'duplicate set id');
    setIds.add(s.setId);
    for (const f of [...(s.establishingAngles ?? []), ...(s.reverseAngles ?? []), ...(s.lightingRefs ?? [])]) if (!exists(f)) add('HARD_CONFLICT', s.setId, `reference file missing: ${f}`);
    if (!s.establishingAngles?.length) add('BLOCKER', s.setId, 'no approved establishing reference');
  }
  for (const w of reg.wardrobe) {
    for (const f of w.approvedReferenceFiles) if (!exists(f)) add('HARD_CONFLICT', w.wardrobeId, `reference file missing: ${f}`);
    for (const a of w.accessories) if (!propIds.has(a)) add('HARD_CONFLICT', w.wardrobeId, `accessory ${a} not in props`);
    if (w.status !== 'APPROVED') add('BLOCKER', w.wardrobeId, `wardrobe ${w.status}${w.dependency ? ` (${w.dependency})` : ''}`);
  }
  for (const p of reg.props) if (p.status !== 'APPROVED') add('BLOCKER', p.propId, `prop ${p.status}`);
  for (const v of reg.video.canonical) if (!exists(v.path)) add('HARD_CONFLICT', 'video', `canonical video missing: ${v.path}`);
  if (!exists(reg.video.productionTestRecord)) add('HARD_CONFLICT', 'video', `production test record missing: ${reg.video.productionTestRecord}`);
  for (const [bucket, items] of Object.entries(reg.audio)) {
    for (const item of items) {
      const file = item.ref.split(' › ')[0];
      const rel = file.includes('/') ? file : `${EXCHANGE_PATHS.season}/PRODUCTION_TEST_RECORDS/${file}`;
      if (!exists(rel)) add('HARD_CONFLICT', `audio.${bucket}`, `reference record missing: ${rel}`);
      if (bucket !== 'productionTest' && item.classification === 'PRODUCTION_TEST_ONLY') add('HARD_CONFLICT', `audio.${bucket}`, 'production test asset filed as canonical');
    }
  }
  return out;
}

const norm = (s: string) => s.toUpperCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();

/** Resolve a scene heading location (and optional sub-location) to a registered set and zone. */
export function resolveSet(reg: AssetRegistry, location: string, subLocation: string | null): { set: SetRecord | null; zone: string | null } {
  const loc = norm(location);
  const set = reg.sets.find((s) => norm(s.name) === loc || s.aliases.some((a) => norm(a) === loc)) ?? null;
  if (!set) return { set: null, zone: null };
  if (!subLocation) return { set, zone: null };
  const sub = norm(subLocation);
  return { set, zone: set.zones.find((z) => norm(z) === sub) ?? null };
}
