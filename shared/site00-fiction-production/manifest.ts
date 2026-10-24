import { dialogueLines, notes } from './fountain.js';
import { editingAdapter, imageAdapter, lipSyncAdapter, videoAdapter, voiceAdapter } from './providers.js';
import { cueIndex, resolveSet, type AssetRegistry, type DialogueRegistry } from './registries.js';
import { DRAFT_STATUS, estimateRuntime } from './screenplay.js';
import { summarizeCost, type ShotPlan } from './shotPlanner.js';
import type { ScreenplayDocument } from './types.js';

export type ManifestBlocker = { kind: 'CHARACTER_FACE' | 'CHARACTER_VOICE' | 'SET' | 'WARDROBE' | 'PROP' | 'UNREGISTERED'; subject: string; detail: string };

export function buildProductionManifest(doc: ScreenplayDocument, screenplaySha256: string, plan: ShotPlan, assets: AssetRegistry, dialogue: DialogueRegistry) {
  const releaseId = doc.meta.identity.releaseId;
  const blockers: ManifestBlocker[] = [];
  const cues = cueIndex(dialogue);
  const speaking = [...new Set(dialogueLines(doc).map((l) => l.character))];
  const onScreen = [...new Set([...plan.shots.flatMap((s) => s.onScreen), ...notes(doc, 'ENTER').map((n) => n.value.toUpperCase())])];

  const characters = [...new Set([...speaking, ...onScreen])].sort().map((cue) => {
    const a = assets.characters.find((c) => c.cue === cue);
    const d = cues.get(cue);
    if (!a) blockers.push({ kind: 'UNREGISTERED', subject: cue, detail: 'not in the asset registry; needs casting and a face reference before generation' });
    else if (!a.visualRegistryRef) blockers.push({ kind: 'CHARACTER_FACE', subject: cue, detail: 'no approved face asset' });
    const voiceId = d?.voiceAsset.voiceId ?? a?.voice.voiceAssetId ?? null;
    if (speaking.includes(cue) && !voiceId) blockers.push({ kind: 'CHARACTER_VOICE', subject: cue, detail: 'no approved voice' });
    return { cue, speaks: speaking.includes(cue), faceRef: a?.visualRegistryRef ?? null, voiceId, dialogueRegistry: Boolean(d) };
  });

  const sets = [...new Map(doc.scenes.map((s) => [`${s.location}|${s.subLocation ?? ''}`, s])).values()].map((s) => {
    const { set, zone } = resolveSet(assets, s.location, s.subLocation);
    if (!set) blockers.push({ kind: 'SET', subject: s.location, detail: 'unregistered location' });
    else if (!set.establishingAngles?.length) blockers.push({ kind: 'SET', subject: set.setId, detail: 'no approved establishing reference' });
    return { heading: s.heading, setId: set?.setId ?? null, zone, classification: set?.classification ?? null };
  });
  const uniqueSets = [...new Map(sets.map((s) => [`${s.setId ?? s.heading}|${s.zone ?? ''}`, s])).values()];

  const wardrobeIds = [...new Set(notes(doc, 'WARDROBE').map((n) => n.value.split(':')[1]?.trim()).filter(Boolean))] as string[];
  const wardrobe = wardrobeIds.map((id) => {
    const w = assets.wardrobe.find((x) => x.wardrobeId === id);
    if (!w) blockers.push({ kind: 'UNREGISTERED', subject: id, detail: 'wardrobe not registered' });
    else if (w.status !== 'APPROVED') blockers.push({ kind: 'WARDROBE', subject: id, detail: `${w.status}${w.dependency ? ` (${w.dependency})` : ''}` });
    return { wardrobeId: id, status: w?.status ?? 'UNREGISTERED' };
  });

  const propIds = [...new Set([...notes(doc, 'PROP'), ...notes(doc, 'HANDOFF')].map((n) => n.value.split(':')[0].trim()))];
  const props = propIds.map((id) => {
    const p = assets.props.find((x) => x.propId === id);
    if (!p) blockers.push({ kind: 'UNREGISTERED', subject: id, detail: 'prop not registered' });
    else if (p.status !== 'APPROVED') blockers.push({ kind: 'PROP', subject: id, detail: p.status });
    return { propId: id, status: p?.status ?? 'UNREGISTERED', handoffChain: p?.handoffChain ?? [] };
  });

  const lines = dialogueLines(doc);
  const cueNotes = [...notes(doc, 'MUSIC'), ...notes(doc, 'SFX')];
  const runtime = estimateRuntime(doc);
  const cost = summarizeCost(plan);
  const voiceRows = voiceAdapter.exportRows(lines, (cue) => cues.get(cue)?.voiceAsset.voiceId ?? null);
  const dedupe = (xs: ManifestBlocker[]) => [...new Map(xs.map((b) => [`${b.kind}|${b.subject}`, b])).values()];

  return {
    schemaVersion: '1.0.0',
    releaseId,
    title: doc.meta.identity.title,
    status: DRAFT_STATUS,
    classification: 'PROVISIONAL_IMPLEMENTATION',
    note: 'Planning manifest. Nothing listed here has been generated, recorded or rendered.',
    screenplay: { path: doc.sourcePath, sha256: screenplaySha256, version: doc.meta.identity.version },
    runtime: { targetSec: runtime.targetSec, estimatedSec: runtime.estimatedSec, ratio: runtime.ratio, band: runtime.band, shotListSec: plan.totalSec },
    characters,
    sets: uniqueSets,
    wardrobe,
    props,
    audio: {
      dialogue: voiceRows,
      dialogueCharacters: voiceRows.reduce((a, r) => a + r.characters, 0),
      music: cueNotes.filter((c) => c.tag === 'MUSIC').map((c) => ({ sceneId: c.sceneId, cue: c.value, asset: null })),
      sfx: cueNotes.filter((c) => c.tag === 'SFX').map((c) => ({ sceneId: c.sceneId, cue: c.value, asset: null })),
    },
    effects: notes(doc, 'VFX').map((n) => ({ sceneId: n.sceneId, effect: n.value })),
    shots: { count: plan.shots.length, generated: cost.generatedShots, estimatedUsd: cost.usd, estimatedCredits: cost.credits, actualCost: null },
    providerExports: {
      voice: voiceRows,
      keyframes: imageAdapter.exportRows(plan.shots),
      video: videoAdapter.exportRows(plan.shots),
      lipSync: lipSyncAdapter.exportRows(plan.shots),
      edit: editingAdapter.exportEdl(plan.shots, cueNotes),
    },
    blockers: dedupe(blockers),
  };
}

export type ProductionManifest = ReturnType<typeof buildProductionManifest>;
