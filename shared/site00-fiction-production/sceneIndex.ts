import type { ApprovalBook } from './approvals.js';
import { BATCH_SIZE, SCREENPLAY_GATE } from './backlog.js';
import { dialogueLines, notes } from './fountain.js';
import { KNOWLEDGE_FACTS, type KnowledgeFact } from './knowledge.js';
import type { AssetRegistry } from './registries.js';
import { DRAFT_STATUS, estimateRuntime } from './screenplay.js';
import { WORLD_RULES } from './promotion/rules.js';
import type { MasterRelease, ScreenplayDocument, SeasonMaster } from './types.js';

/** Level A (sprint V2 §01): one writing brief per release. Master text is SOURCE-ESTABLISHED; identity notes are DIRECTORIAL INTERPRETATION. */
export const PLANNED_FROM_MASTER = 'PLANNED_FROM_MASTER';
export const STORY_APPROVAL_SCOPE = 'Season story structure approved 2026-10-23 (S-2 Option A). That approval does not cover any script, performance, shot or music cue.';

export type PlannedScene = { sceneId: string; source: 'SCREENPLAY_DRAFT' | 'MASTER_SETTING'; heading: string; objective: string | null; characters: string[]; lineIds: string[]; estimatedSec: number | null };

export const MOTIFS: Array<{ motif: string; pattern: RegExp }> = [
  { motif: 'The Ember (copper no)', pattern: /\bEmber\b|copper/i },
  { motif: 'The ledger', pattern: /ledger/i },
  { motif: 'Notes and envelopes', pattern: /\bnote\b|envelope/i },
  { motif: 'The lantern', pattern: /lantern/i },
  { motif: 'Doors and steps', pattern: /\bdoors?\b|\bsteps\b/i },
  { motif: 'Balconies', pattern: /balcon/i },
  { motif: 'Freeze-frame introductions', pattern: /freeze-frame/i },
  { motif: 'The orange jacket', pattern: /orange jacket/i },
  { motif: 'Phones and capture', pattern: /\bphones?\b|captur/i },
  { motif: 'Live music in the room', pattern: /\bband\b|orchestra|record player|choir/i },
  { motif: 'The river', pattern: /river/i },
];

const CATEGORY_IDENTITY: Record<string, { music: string; camera: string }> = {
  WORLD: { music: 'An ensemble groove carries the city; wordless wherever the master quotes no dialogue.', camera: 'Fluid public grammar: varied vignettes, each move with a reason.' },
  LIFE: { music: 'Small-room sound: a Rhodes, a jazz trio, a record on, or silence.', camera: 'Patient and observant; the room is allowed to breathe.' },
  STORY: { music: 'Score held back; silence at the turn.', camera: 'Observant coverage that follows where the power sits in the room.' },
  HYBRID: { music: 'Patron story and family story share one cue palette; source music wherever the room has a band.', camera: 'Public beats fluid, private beats patient.' },
};
const ARC_RELATION: Record<number, string> = {
  1: 'The Host: introduces the house band and its warm-up theme.',
  2: 'Nominations: the theme travels the city in small arrangements.',
  3: 'The Toast: the house sound meets rival rooms.',
  4: 'Inference: sparser arrangements; more silence.',
  5: 'Whose Light: the theme in fragments.',
  6: 'The Grand Exchange: the full band.',
  7: 'Afterlight: a stripped-back reprise.',
};

const sentences = (s: string) => (s.match(/[^.!?]+[.!?]+["”]?/g) ?? [s]).map((x) => x.trim()).filter(Boolean);

export type IndexInput = { master: SeasonMaster; screenplays: ScreenplayDocument[]; assets: AssetRegistry; approvals: ApprovalBook; activeReleaseId: string; facts?: KnowledgeFact[] };

export function buildSceneIndex(input: IndexInput) {
  const { master, screenplays, assets, approvals, activeReleaseId } = input;
  const facts = input.facts ?? KNOWLEDGE_FACTS;
  const order = new Map(master.releases.map((r) => [r.id, r.order]));
  const ord = (id: string | null) => (id ? (order.get(id) ?? Infinity) : Infinity);
  const docs = new Map(screenplays.map((d) => [d.meta.identity.releaseId, d]));
  let clock = 0;
  const releases = master.releases.map((r: MasterRelease, i) => {
    const doc = docs.get(r.id) ?? null;
    const runtime = doc ? estimateRuntime(doc) : null;
    const startSec = clock;
    clock += r.runtimeTargetSec;
    const scenes: PlannedScene[] = doc
      ? doc.scenes.map((s) => ({
          sceneId: s.sceneId,
          source: 'SCREENPLAY_DRAFT' as const,
          heading: s.heading,
          objective: doc.meta.story.sceneObjectives[s.sceneId] ?? null,
          characters: [...new Set([...notes({ ...doc, scenes: [s] }, 'ENTER').map((n) => n.value.toUpperCase()), ...dialogueLines({ ...doc, scenes: [s] }).map((l) => l.character)])],
          lineIds: dialogueLines({ ...doc, scenes: [s] }).map((l) => l.lineId),
          estimatedSec: runtime!.scenes.find((x) => x.sceneId === s.sceneId)?.estimatedSec ?? null,
        }))
      : r.setting.split(';').map((frag, n) => ({ sceneId: `${r.id}-P${n + 1}`, source: 'MASTER_SETTING' as const, heading: frag.trim(), objective: null, characters: r.principalCharacters, lineIds: [], estimatedSec: null }));
    const here = ord(r.id);
    const known = facts.filter((f) => f.writersRoom === 'KNOWN');
    const characters: Record<string, string[]> = {};
    for (const f of known) for (const k of f.knownBy) if (ord(k.from) <= here) (characters[k.character] ??= []).push(f.factId);
    const text = [r.narrativeDevelopment, r.setting, r.openingHook.text, r.endingTransition, r.continuityDependencies].join(' ');
    const screenplayApproved = approvals.records.some((x) => x.domain === 'SCREENPLAY' && x.subjectId === r.id && x.state === 'APPROVED');
    const identity = CATEGORY_IDENTITY[r.category] ?? CATEGORY_IDENTITY.STORY;
    return {
      releaseId: r.id,
      order: r.order,
      title: r.title,
      arc: `${r.arc.number} — ${r.arc.name}`,
      category: r.category,
      batch: Math.ceil(r.order / BATCH_SIZE),
      fictionalDay: r.fictionalDay,
      layers: r.layers,
      exchangeNight: r.exchangeNight,
      status: {
        story: 'FOUNDER_APPROVED',
        screenplay: screenplayApproved ? 'FOUNDER_APPROVED' : doc ? DRAFT_STATUS : PLANNED_FROM_MASTER,
        screenplayVersion: doc?.meta.identity.version ?? null,
        production: r.id === activeReleaseId ? 'ACTIVE_FOUNDER_REVIEW' : 'QUEUED_SILENT',
        approvalScope: STORY_APPROVAL_SCOPE,
      },
      whatHappens: { text: r.narrativeDevelopment, label: 'SOURCE-ESTABLISHED' },
      whyItMatters: { purpose: r.characterPurpose, payoff: r.payoff, label: 'SOURCE-ESTABLISHED' },
      beats: sentences(r.narrativeDevelopment),
      developmentRequirements: {
        amendments: r.approvedAmendments.map((a) => ({ amendmentId: a.amendmentId, recommendationId: a.recommendationId, text: a.text, classification: a.classification, productionHold: a.productionHold ?? null })),
        worldRules: WORLD_RULES.filter((w) => w.appliesTo.includes(r.id)).map((w) => ({ ruleId: w.ruleId, subject: w.subject })),
        label: 'FOUNDER-APPROVED DIRECTION: the screenplay must carry these; the wording is authored at drafting',
      },
      scenes,
      knowledge: {
        audienceKnows: known.filter((f) => ord(f.audienceFrom) < here).map((f) => f.factId),
        audienceLearnsHere: known.filter((f) => f.audienceFrom === r.id).map((f) => f.factId),
        characters,
        withheldFromAudience: known.filter((f) => ord(f.audienceFrom) > here && f.knownBy.some((k) => ord(k.from) <= here)).map((f) => f.factId),
      },
      wants: doc ? { value: doc.meta.story.characterMotivations, status: DRAFT_STATUS } : { value: null, status: 'AUTHORED AT DRAFTING: the master records purpose, not wants' },
      emotionalChange: doc ? { value: doc.meta.story.emotionalTurningPoint, status: DRAFT_STATUS } : { value: r.emotionalTurningPoint.text, status: r.emotionalTurningPoint.source },
      futureRevelations: { paysOffIn: r.paysOffIn, preparesFacts: known.filter((f) => ord(f.audienceFrom) > here && f.knownBy.some((k) => k.from === r.id)).map((f) => f.factId) },
      openQuestions: { unresolved: r.unresolvedQuestions, pendingReveals: known.filter((f) => ord(f.audienceFrom) > here && f.knownBy.some((k) => ord(k.from) <= here)).map((f) => `${f.factId} (audience learns ${f.audienceFrom})`), writersRoomOpen: facts.filter((f) => f.writersRoom === 'OPEN').map((f) => f.factId) },
      motifs: MOTIFS.filter((m) => m.pattern.test(text)).map((m) => ({ motif: m.motif, evidence: text.match(m.pattern)![0] })),
      locations: { setting: r.setting, sets: assets.sets.filter((s) => s.releases?.includes(r.id) || [s.name, ...s.aliases].some((n) => r.setting.toUpperCase().includes(n.toUpperCase()))).map((s) => s.setId) },
      continuity: { wardrobe: assets.wardrobe.filter((w) => w.releases.includes(r.id)).map((w) => w.wardrobeId), props: assets.props.filter((p) => p.releases.includes(r.id)).map((p) => p.propId), notes: r.continuityDependencies },
      opening: r.openingHook.text,
      ending: r.endingTransition,
      connections: { previous: master.releases[i - 1]?.id ?? null, next: master.releases[i + 1]?.id ?? null, dependsOn: r.dependsOn, paysOffIn: r.paysOffIn, nightDependencies: r.nightDependencies, patronScenarios: r.patronScenarios },
      runtime: { targetSec: r.runtimeTargetSec, startSec, endSec: clock, shareOfSeason: Math.round((r.runtimeTargetSec / master.structure.runtimeTotalSec) * 10000) / 10000, draftedEstimateSec: runtime?.estimatedSec ?? null },
      identity: { music: identity.music, camera: identity.camera, exchangeNight: r.exchangeNight ? 'Exchange Night: the house band is in the world, so cues can cross from source to score.' : null, season: ARC_RELATION[r.arc.number] ?? null, label: 'DIRECTORIAL INTERPRETATION', founderReview: 'NOT REQUESTED UNTIL THE SCENE IS ACTIVE' },
    };
  });
  const batchIds = [...new Set(releases.map((r) => r.batch))];
  return {
    schemaVersion: '2.0.0',
    indexId: 'THE_EXCHANGE.SEASON1_SCENE_INDEX.V1',
    activeReleaseId,
    totals: { releases: releases.length, runtimeSec: clock, drafted: releases.filter((r) => r.status.screenplayVersion !== null).length, plannedFromMaster: releases.filter((r) => r.status.screenplay === PLANNED_FROM_MASTER).length, scenes: releases.reduce((a, r) => a + r.scenes.length, 0) },
    batches: batchIds.map((b) => {
      const rs = releases.filter((r) => r.batch === b);
      const drafted = rs.every((r) => r.status.screenplayVersion !== null);
      return { batch: b, releases: rs.map((r) => r.releaseId), runtimeSec: rs.reduce((a, r) => a + r.runtime.targetSec, 0), status: drafted ? DRAFT_STATUS : `QUEUED: ${SCREENPLAY_GATE}` };
    }),
    releases,
  };
}
export type SceneIndex = ReturnType<typeof buildSceneIndex>;
export type ReleaseBrief = SceneIndex['releases'][number];
export type IndexFinding = { severity: 'HARD_CONFLICT' | 'WARNING'; releaseId: string; detail: string };

export function validateSceneIndex(index: SceneIndex, master: SeasonMaster, screenplays: ScreenplayDocument[], approvals: ApprovalBook): IndexFinding[] {
  const out: IndexFinding[] = [];
  const hard = (releaseId: string, detail: string) => out.push({ severity: 'HARD_CONFLICT', releaseId, detail });
  const order = new Map(master.releases.map((r) => [r.id, r.order]));
  if (index.releases.length !== master.releases.length) hard('SEASON', `${index.releases.length} briefs for ${master.releases.length} releases`);
  index.releases.forEach((b, i) => {
    const r = master.releases[i];
    if (!r || b.releaseId !== r.id || b.order !== r.order || b.title !== r.title) hard(b.releaseId, 'brief out of canonical order or retitled');
    for (const d of b.connections.dependsOn) if ((order.get(d) ?? Infinity) >= b.order) hard(b.releaseId, `depends on ${d}, which is not earlier`);
    for (const p of b.connections.paysOffIn) if ((order.get(p) ?? -1) <= b.order) hard(b.releaseId, `pays off in ${p}, which is not later`);
    const approved = approvals.records.some((x) => x.domain === 'SCREENPLAY' && x.subjectId === b.releaseId && x.state === 'APPROVED');
    if (b.status.screenplay === 'FOUNDER_APPROVED' && !approved) hard(b.releaseId, 'screenplay shown as approved without a founder record');
    if (b.identity.label !== 'DIRECTORIAL INTERPRETATION') hard(b.releaseId, 'identity notes must be labelled DIRECTORIAL INTERPRETATION');
    const doc = screenplays.find((d) => d.meta.identity.releaseId === b.releaseId);
    if (doc) {
      const lines = dialogueLines(doc).map((l) => l.lineId);
      const linked = b.scenes.flatMap((s) => s.lineIds);
      if (lines.length !== linked.length || lines.some((l) => !linked.includes(l))) hard(b.releaseId, 'every dialogue line belongs to exactly one indexed scene');
      if (b.scenes.length !== doc.scenes.length) hard(b.releaseId, 'indexed scenes differ from the draft');
    } else if (b.status.screenplay !== 'PLANNED_FROM_MASTER') hard(b.releaseId, 'undrafted release must stay PLANNED_FROM_MASTER');
    if (!b.wants.value && b.status.screenplay !== 'PLANNED_FROM_MASTER') out.push({ severity: 'WARNING', releaseId: b.releaseId, detail: 'drafted release without recorded wants' });
  });
  if (index.totals.runtimeSec !== master.structure.runtimeTotalSec) hard('SEASON', `runtime ${index.totals.runtimeSec}s differs from ${master.structure.runtimeTotalSec}s`);
  if (index.releases.filter((b) => b.status.production === 'ACTIVE_FOUNDER_REVIEW').length !== 1) hard('SEASON', 'exactly one release is in active founder review');
  return out;
}
