import fs from 'node:fs';
import * as X from '../../shared/site00-fiction-production/index.js';

/**
 * Append one cast edit. Usage:
 *   npx tsx scripts/the-exchange/edit-cast.ts --character kai-fontaine --field pronunciation --value '"FON-tayn"' \
 *     --actor founder --reason "..." --source "..." [--founder-confirmed] [--write]
 * Without --write it prints the edit and changes nothing. It never contacts ElevenLabs.
 */
const args = process.argv.slice(2);
const opt = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const flag = (name: string) => args.includes(`--${name}`);
const fail = (msg: string): never => {
  console.error(`edit-cast: ${msg}`);
  process.exit(1);
};

const root = process.cwd();
const characterId = opt('character') ?? fail('--character is required');
const field = opt('field') ?? fail('--field is required');
const raw = opt('value') ?? fail('--value is required (JSON)');
const actor = opt('actor') ?? fail('--actor is required');
const reason = opt('reason') ?? fail('--reason is required');
const source = opt('source') ?? fail('--source is required');
let to: unknown;
try {
  to = JSON.parse(raw);
} catch {
  fail('--value must be JSON (quote strings: \'"text"\')');
}

const spec = X.CAST_FIELDS[field] ?? fail(`unknown field ${field}; fields: ${Object.keys(X.CAST_FIELDS).join(', ')}`);
if (spec.owner === 'APPROVAL_BOOK') fail('approval status changes go through the approval book (founder decisions), not the cast log');
if (spec.owner === 'VISUAL_REGISTRY') fail('facial masters change by importing a file into CHARACTER_VISUAL_REGISTRY_V1 with its hash');

const dialoguePath = X.repoPath(X.EXCHANGE_PATHS.dialogue, root);
const assetPath = X.repoPath(X.EXCHANGE_PATHS.assets, root);
const dialogue = JSON.parse(fs.readFileSync(dialoguePath, 'utf8')) as X.DialogueRegistry;
const assets = JSON.parse(fs.readFileSync(assetPath, 'utf8')) as X.AssetRegistry;
const log = X.loadCastEdits(root);
const d = dialogue.characters.find((c) => c.characterId === characterId);
const a = assets.characters.find((c) => c.characterId === characterId);
if (!d && !a) fail(`unknown character ${characterId}`);

const get = (o: unknown, p: string) => p.split('.').reduce<unknown>((v, k) => (v && typeof v === 'object' ? (v as Record<string, unknown>)[k] : undefined), o);
const set = (o: Record<string, unknown>, p: string, v: unknown) => {
  const keys = p.split('.');
  const last = keys.pop()!;
  const parent = keys.reduce<Record<string, unknown>>((acc, k) => (acc[k] ??= {}) as Record<string, unknown>, o);
  parent[last] = v;
};

let from: unknown = null;
if (spec.owner === 'DIALOGUE_REGISTRY') {
  if (!d) fail(`${characterId} has no dialogue registry record`);
  from = get(d, spec.path!) ?? null;
} else if (spec.owner === 'ASSET_REGISTRY') {
  if (!a) fail(`${characterId} has no asset registry record`);
  from = get(a, spec.path!) ?? null;
} else {
  from = [...log.edits].reverse().find((e) => e.characterId === characterId && e.field === field)?.to ?? null;
}
if (JSON.stringify(from) === JSON.stringify(to)) fail('value unchanged');

let evidence: X.VoiceEvidence | undefined;
if (field === 'voiceId') {
  if (!d) fail('voice ids live on the dialogue registry record');
  if (d!.voiceAsset.voiceId && !flag('founder-confirmed')) fail('this character already has a linked voice; changing it needs --founder-confirmed and --actor founder');
  if (flag('founder-confirmed') && actor !== X.FOUNDER_ACTOR) fail('--founder-confirmed requires --actor founder');
  if (to) {
    try {
      evidence = JSON.parse(opt('evidence') ?? fail('a new voice id needs --evidence JSON {source, date, composerIndependentVerification}')) as X.VoiceEvidence;
    } catch {
      fail('--evidence must be JSON');
    }
    if (X.voiceLinkProblem(to as string, { provider: 'ElevenLabs', status: 'CONNECTOR_VERIFIED', evidence })) fail('--evidence needs source, date and composerIndependentVerification');
  }
}
if (field === 'angleReferences' || field === 'wardrobeReferences') {
  for (const r of (Array.isArray(to) ? to : []) as X.CastAssetRef[]) {
    if (!(X.ASSET_STATUSES as readonly string[]).includes(r.status)) fail(`unknown asset status ${r.status}`);
    if (r.repoPath && !fs.existsSync(X.repoPath(r.repoPath, root))) fail(`${r.repoPath} is not in the repository; record it as UNIMPORTED with no path or hash`);
  }
}

const next = log.edits.length ? Math.max(...log.edits.map((e) => Number(e.editId.slice(3)))) + 1 : 1;
const at = new Date().toISOString().slice(0, 16) + 'Z';
const last = log.edits[log.edits.length - 1];
if (last && at < last.at) fail(`clock ${at} is earlier than the last edit ${last.at}; the log is append-only in time order`);
const edit: X.CastEdit = { editId: `CE-${String(next).padStart(4, '0')}`, at, actor, recordedBy: opt('recorded-by') ?? actor, characterId, field, from, to, reason, source };

if (!flag('write')) {
  console.log(JSON.stringify({ dryRun: true, edit, writesOwner: spec.owner }, null, 2));
  process.exit(0);
}
if (spec.owner === 'DIALOGUE_REGISTRY') set(d as unknown as Record<string, unknown>, spec.path!, to);
if (spec.owner === 'ASSET_REGISTRY') set(a as unknown as Record<string, unknown>, spec.path!, to);
if (field === 'voiceId') {
  d!.voiceAsset = { ...d!.voiceAsset, voiceId: to as string | null, status: to ? 'CONNECTOR_VERIFIED' : 'NOT_VERIFIED', evidence: evidence ? { ...evidence, castEdit: edit.editId } : undefined };
  if (a) a.voice = { ...a.voice, voiceAssetId: to as string | null, status: to ? 'CONNECTOR_VERIFIED' : 'MISSING', evidence: evidence ? { ...evidence, castEdit: edit.editId } : undefined };
}
log.edits.push(edit);
if (spec.owner === 'DIALOGUE_REGISTRY' || field === 'voiceId') fs.writeFileSync(dialoguePath, `${JSON.stringify(dialogue, null, 2)}\n`);
if (spec.owner === 'ASSET_REGISTRY' || (field === 'voiceId' && a)) fs.writeFileSync(assetPath, `${JSON.stringify(assets, null, 2)}\n`);
fs.writeFileSync(X.repoPath(X.CAST_EDITS_PATH, root), `${JSON.stringify(log, null, 2)}\n`);
console.log(`appended ${edit.editId} (${field} of ${characterId}); rebuild with scripts/the-exchange/build-directorial-production.ts`);
