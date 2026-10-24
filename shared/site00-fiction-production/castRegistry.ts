import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { EXCHANGE_PATHS, repoPath } from './paths.js';
import type { AssetRegistry, DialogueRegistry } from './registries.js';
import type { ApprovalBook } from './approvals.js';

/**
 * Cast registry (sprint V2 §03). One editable surface over the existing registries, not a parallel copy:
 * a field owned by the dialogue, asset or visual registry is read through from its owner, and an edit to it is written to the owner.
 * Fields no registry held before live here, applied from an append-only edit log. Nothing here changes ElevenLabs itself.
 */
export type FieldOwner = 'CAST_REGISTRY' | 'DIALOGUE_REGISTRY' | 'ASSET_REGISTRY' | 'VISUAL_REGISTRY' | 'APPROVAL_BOOK';
export type FieldStatus = 'RECORDED' | 'NOT_RECORDED' | 'NOT_IMPORTED' | 'NO_OWNER_RECORD';

export const CAST_FIELDS: Record<string, { owner: FieldOwner; path?: string }> = {
  displayName: { owner: 'DIALOGUE_REGISTRY', path: 'displayName' },
  aliases: { owner: 'CAST_REGISTRY' },
  age: { owner: 'DIALOGUE_REGISTRY', path: 'age' },
  physicalAppearance: { owner: 'ASSET_REGISTRY', path: 'appearance' },
  heightAndProportions: { owner: 'ASSET_REGISTRY', path: 'bodyProportions' },
  hairAndGrooming: { owner: 'ASSET_REGISTRY', path: 'grooming' },
  fashionPreferences: { owner: 'CAST_REGISTRY' },
  personality: { owner: 'CAST_REGISTRY' },
  relationships: { owner: 'DIALOGUE_REGISTRY', path: 'relationshipLanguage' },
  history: { owner: 'CAST_REGISTRY' },
  emotionalDevelopment: { owner: 'CAST_REGISTRY' },
  dialoguePersonality: { owner: 'DIALOGUE_REGISTRY', path: 'voiceIdentity' },
  speechCadence: { owner: 'DIALOGUE_REGISTRY', path: 'linguisticPersonality.rhythm' },
  humor: { owner: 'DIALOGUE_REGISTRY', path: 'linguisticPersonality.humor' },
  culturalFluency: { owner: 'DIALOGUE_REGISTRY', path: 'linguisticPersonality.vocabulary' },
  voiceId: { owner: 'DIALOGUE_REGISTRY', path: 'voiceAsset.voiceId' },
  voiceDescription: { owner: 'CAST_REGISTRY' },
  voiceTags: { owner: 'CAST_REGISTRY' },
  approvedAudioTakes: { owner: 'CAST_REGISTRY' },
  pronunciation: { owner: 'CAST_REGISTRY' },
  facialMasters: { owner: 'VISUAL_REGISTRY', path: 'assets' },
  angleReferences: { owner: 'CAST_REGISTRY' },
  wardrobeReferences: { owner: 'CAST_REGISTRY' },
  approvalStatus: { owner: 'APPROVAL_BOOK' },
};

/** Visual asset status vocabulary (sprint V2 §04). */
export const ASSET_STATUSES = ['APPROVED', 'PROVISIONAL', 'UNIMPORTED', 'MISSING', 'REJECTED', 'ARCHIVED'] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];
export type CastAssetRef = { label: string; status: AssetStatus; assetId: string | null; repoPath: string | null; sha256: string | null; region: string | null; source: string };

export type CastEdit = { editId: string; at: string; actor: string; recordedBy: string; characterId: string; field: string; from: unknown; to: unknown; reason: string; source: string };
export type CastEditLog = { schemaVersion: string; logId: string; rules: string[]; edits: CastEdit[] };

export const CAST_EDITS_PATH = `${EXCHANGE_PATHS.season}/CAST_REGISTRY_EDITS_V1.json`;
export const CAST_REGISTRY_PATH = `${EXCHANGE_PATHS.season}/CAST_REGISTRY_V1.json`;
export const loadCastEdits = (root = process.cwd()): CastEditLog => JSON.parse(fs.readFileSync(repoPath(CAST_EDITS_PATH, root), 'utf8')) as CastEditLog;

type VisualCharacter = { characterId: string; canonicalName: string; approvedAppearanceDetails?: string[]; assets?: Array<{ assetId: string; sourceAssetPath: string; sha256: string; assetType: string; visualApprovalStatus: string }> };

const dig = (o: unknown, p: string): unknown => p.split('.').reduce<unknown>((v, k) => (v && typeof v === 'object' ? (v as Record<string, unknown>)[k] : undefined), o);
const visualStatus = (s: string): AssetStatus => (s === 'FACIAL_IDENTITY_LOCKED' ? 'APPROVED' : s.includes('PROVISIONAL') ? 'PROVISIONAL' : s.includes('REJECT') ? 'REJECTED' : 'PROVISIONAL');

export type CastField = { value: unknown; owner: FieldOwner; status: FieldStatus; source: string | null };

export function buildCastRegistry(input: { dialogue: DialogueRegistry; assets: AssetRegistry; visual: { characters: VisualCharacter[] }; edits: CastEditLog; approvals: ApprovalBook | null }) {
  const { dialogue, assets, visual, edits, approvals } = input;
  const ids = [...new Set([...dialogue.characters.map((c) => c.characterId), ...assets.characters.map((c) => c.characterId), ...visual.characters.map((c) => c.characterId)])].sort();
  const characters = ids.map((id) => {
    const d = dialogue.characters.find((c) => c.characterId === id);
    const a = assets.characters.find((c) => c.characterId === id);
    const v = visual.characters.find((c) => c.characterId === (a?.visualRegistryRef ?? id));
    const mine = edits.edits.filter((e) => e.characterId === id);
    const fields: Record<string, CastField> = {};
    for (const [name, spec] of Object.entries(CAST_FIELDS)) {
      if (spec.owner === 'DIALOGUE_REGISTRY' || spec.owner === 'ASSET_REGISTRY') {
        const rec = spec.owner === 'DIALOGUE_REGISTRY' ? d : a;
        const value = rec ? dig(rec, spec.path!) ?? null : null;
        fields[name] = { value, owner: spec.owner, status: !rec ? 'NO_OWNER_RECORD' : value === null ? 'NOT_RECORDED' : 'RECORDED', source: rec ? `${spec.owner === 'DIALOGUE_REGISTRY' ? EXCHANGE_PATHS.dialogue : EXCHANGE_PATHS.assets} › ${id}.${spec.path}` : null };
      } else if (spec.owner === 'VISUAL_REGISTRY') {
        const masters: CastAssetRef[] = (v?.assets ?? []).map((x) => ({ label: x.assetType, status: visualStatus(x.visualApprovalStatus), assetId: x.assetId, repoPath: x.sourceAssetPath, sha256: x.sha256, region: null, source: EXCHANGE_PATHS.visualRegistry }));
        fields[name] = { value: masters, owner: 'VISUAL_REGISTRY', status: masters.length ? 'RECORDED' : v ? 'NOT_RECORDED' : 'NO_OWNER_RECORD', source: v ? `${EXCHANGE_PATHS.visualRegistry} › ${v.characterId}` : null };
      } else if (spec.owner === 'APPROVAL_BOOK') {
        const recs = (approvals?.records ?? []).filter((r) => r.subjectId === id);
        fields[name] = { value: Object.fromEntries(recs.map((r) => [r.domain, r.state])), owner: 'APPROVAL_BOOK', status: recs.length ? 'RECORDED' : 'NOT_RECORDED', source: EXCHANGE_PATHS.approvals };
      } else {
        const last = [...mine].reverse().find((e) => e.field === name);
        fields[name] = last ? { value: last.to, owner: 'CAST_REGISTRY', status: 'RECORDED', source: `${CAST_EDITS_PATH} › ${last.editId}` } : { value: null, owner: 'CAST_REGISTRY', status: name === 'voiceDescription' || name === 'voiceTags' ? 'NOT_IMPORTED' : 'NOT_RECORDED', source: null };
      }
    }
    const voice = d?.voiceAsset ?? null;
    return {
      characterId: id,
      cue: d?.cue ?? a?.cue ?? null,
      version: 1 + mine.length,
      fields,
      voice: voice ? { provider: voice.provider, voiceId: voice.voiceId, status: voice.status, evidence: (voice as { evidence?: unknown }).evidence ?? null, externalSync: 'NOT_SUPPORTED' as const } : null,
      history: mine.map((e) => ({ editId: e.editId, at: e.at, actor: e.actor, field: e.field, reason: e.reason })),
    };
  });
  return {
    schemaVersion: '2.0.0',
    registryId: 'THE_EXCHANGE.CAST_REGISTRY.V1',
    generatedFrom: ['CHARACTER_DIALOGUE_STYLE_REGISTRY_V1.json', 'PRODUCTION_ASSET_REGISTRY_V1.json', 'CHARACTER_VISUAL_REGISTRY_V1.json', 'CAST_REGISTRY_EDITS_V1.json', 'APPROVAL_STATE_V1.json'],
    rules: [
      'Owner fields are read through from the dialogue, asset and visual registries; editing one writes the owner and logs the change here.',
      'Cast fields are applied from the append-only edit log; nothing is overwritten in place, so every value keeps its history.',
      'Editing this registry never updates the ElevenLabs voice library. External voice-library edits require a verified provider action.',
      'Voice IDs are connector-verified evidence from the founder workspace, not independent verification by this environment.',
      'Visual assets carry APPROVED, PROVISIONAL, UNIMPORTED, MISSING, REJECTED or ARCHIVED. No URL, hash or provider id is recorded unless it is real.',
    ],
    characters,
  };
}
export type CastRegistry = ReturnType<typeof buildCastRegistry>;

export type CastFinding = { severity: 'HARD_CONFLICT' | 'WARNING' | 'BLOCKER'; subject: string; detail: string };

const fileSha = (rel: string, root: string): string | null => {
  const abs = repoPath(rel, root);
  return fs.existsSync(abs) ? createHash('sha256').update(fs.readFileSync(abs)).digest('hex') : null;
};

export function validateCastRegistry(cast: CastRegistry, log: CastEditLog, dialogue: DialogueRegistry, assets: AssetRegistry, root = process.cwd()): CastFinding[] {
  const out: CastFinding[] = [];
  const hashes = new Map<string, string | null>();
  const ids = new Set<string>();
  for (const e of log.edits) {
    if (ids.has(e.editId)) out.push({ severity: 'HARD_CONFLICT', subject: e.editId, detail: 'duplicate edit id' });
    ids.add(e.editId);
    if (!CAST_FIELDS[e.field]) out.push({ severity: 'HARD_CONFLICT', subject: e.editId, detail: `unknown field ${e.field}` });
    if (!e.reason.trim() || !e.source.trim()) out.push({ severity: 'HARD_CONFLICT', subject: e.editId, detail: 'every edit records a reason and a source' });
  }
  const sorted = [...log.edits].map((e) => e.at);
  if (sorted.some((t, i) => i > 0 && t < sorted[i - 1])) out.push({ severity: 'HARD_CONFLICT', subject: log.logId, detail: 'edit log is append-only and in time order' });
  for (const c of cast.characters) {
    const d = dialogue.characters.find((x) => x.characterId === c.characterId);
    const a = assets.characters.find((x) => x.characterId === c.characterId);
    if (d && a && (d.voiceAsset.voiceId ?? null) !== (a.voice.voiceAssetId ?? null)) out.push({ severity: 'HARD_CONFLICT', subject: c.characterId, detail: 'dialogue and asset registries disagree on the voice id' });
    const refs = [...((c.fields.angleReferences.value as CastAssetRef[] | null) ?? []), ...((c.fields.wardrobeReferences.value as CastAssetRef[] | null) ?? [])];
    for (const r of refs) {
      if (!(ASSET_STATUSES as readonly string[]).includes(r.status)) out.push({ severity: 'HARD_CONFLICT', subject: c.characterId, detail: `unknown asset status ${r.status}` });
      if ((r.status === 'UNIMPORTED' || r.status === 'MISSING') && (r.repoPath || r.sha256 || r.assetId)) out.push({ severity: 'HARD_CONFLICT', subject: c.characterId, detail: `${r.label}: an unimported asset cannot carry a path, hash or id` });
      const masters = (c.fields.facialMasters.value as CastAssetRef[] | null) ?? [];
      if (r.status === 'APPROVED' && !masters.some((m) => m.assetId === r.assetId && m.status === 'APPROVED')) out.push({ severity: 'HARD_CONFLICT', subject: c.characterId, detail: `${r.label}: APPROVED must point at one of this character's approved visual registry assets` });
      if (r.status === 'UNIMPORTED') out.push({ severity: 'BLOCKER', subject: c.characterId, detail: `${r.label}: founder-held, not yet imported` });
      if (r.repoPath) {
        if (!hashes.has(r.repoPath)) hashes.set(r.repoPath, fileSha(r.repoPath, root));
        const actual = hashes.get(r.repoPath);
        if (actual === null) out.push({ severity: 'HARD_CONFLICT', subject: c.characterId, detail: `${r.label}: ${r.repoPath} is not in the repository` });
        else if (actual !== r.sha256) out.push({ severity: 'HARD_CONFLICT', subject: c.characterId, detail: `${r.label}: recorded sha256 does not match ${r.repoPath}` });
      }
      if (!r.repoPath && r.status !== 'UNIMPORTED' && r.status !== 'MISSING') out.push({ severity: 'HARD_CONFLICT', subject: c.characterId, detail: `${r.label}: ${r.status} needs a repository file` });
    }
  }
  return out;
}
