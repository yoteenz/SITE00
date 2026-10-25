/**
 * Renders the THE EXCHANGE readiness deliverables of sprint P0…FIRST-SHOT-READINESS.V1 from the committed canon:
 *
 *   14_THE_EXCHANGE_PROJECT_INTEGRATION.md            project record and #1695 patch re-verification (§20, §21)
 *   15_S101_CREATIVE_APPROVAL_DEPENDENCY_REGISTER.md   every S1-01 decision, step and element group (§22, §23)
 *   16_S101_SH01_FIRST_SHOT_AUTHORIZATION_PACKET.md    the SH01 transaction the founder would authorize (§24)
 *   S101_CREATIVE_APPROVAL_REGISTER_V1.json            the register and the SH01 dependency split, machine-readable
 *
 * Reads only. Nothing in canon is changed, nothing is approved, nothing is quoted.
 *
 *   npx tsx scripts/production/render-readiness-docs.ts [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadSeasonMaster } from '../../shared/site00-fiction-production/seasonMaster.js';
import { sha256Hex } from '../../shared/site00-production-spine/hash.js';
import { MAX_QUOTE_AGE_HOURS } from '../../shared/site00-production-spine/gate.js';
import { DEFAULT_MASTERS_BUCKET } from '../../shared/site00-production-spine/node/storeSelection.js';
import { buildSh01Records, EXCHANGE_PROJECT_ID, SH01 } from '../../shared/site00-production-spine/projects/theExchange.js';
import { getSite00ManagedProject } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';

const root = process.cwd();
export const READINESS_DOCS_DIR = 'docs/site00/production-live-persistence-readiness-v1';
const S = 'THE_EXCHANGE/SEASON_1';
const SCENE = `${S}/PRODUCTION_SCENES/S1-01`;
const P = { packet: `${SCENE}/DIRECTORIAL_PACKET_V1.json`, keyframes: `${SCENE}/KEYFRAME_MANIFEST_V1.json`, shots: `${SCENE}/SHOT_LIST_V1.json`, review: `${SCENE}/REVIEW_STATE_V1.json`, ledger: `${S}/LIVING_WORLD_PROMOTION_LEDGER_V1.json`, background: `${S}/RECURRING_BACKGROUND_REGISTRY_V1.json`, master: `${S}/SEASON1_86_RELEASE_MASTER_V1.json` };

const read = <T>(rel: string): T => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')) as T;
const sha = (rel: string) => sha256Hex(fs.readFileSync(path.join(root, rel)));
const short = (id: string) => id.replace('S1-01-', '');

type Decision = { decisionId: string; question: string; why: string; options: string[]; recommendation: string; blocks: string[]; refs: string[]; status: 'OPEN' | 'ANSWERED'; answer: string | null; note?: string; progress?: string[] };
type Keyframe = { keyframeId: string; kind: string; title: string; usedBy: string[]; derivesFrom: string[]; source: string; effectiveBlockers?: string[]; candidates?: number; spec?: Record<string, unknown> };
type Shot = Record<string, string> & { shotId: string };
type Element = { elementId: string; type: string; state: string };

const packet = read<{ status: string; fps: number; aspect: string; sections: Record<string, unknown> }>(P.packet);
const decisions = packet.sections['9_FOUNDER_DECISIONS'] as Decision[];
const steps = (packet.sections['10_PRODUCTION_AUTHORIZATION'] as { steps: Record<string, { state: string; scope: string[] | null }> }).steps;
const km = read<{ keyframes: Keyframe[]; productionOrder: string[] }>(P.keyframes);
const shotList = read<{ durationFrames: number; fps: number; screenplay: { path: string; version: number; status: string }; shots: Shot[] }>(P.shots);
const review = read<{ elements: Element[] }>(P.review);
const allShots = shotList.shots.map((s) => s.shotId);

/* ── decisions: what each one blocks, from the keyframe manifest's own dependency chains ──────────── */

function keyframesBlockedBy(fd: string) {
  return km.keyframes.filter((k) => (k.effectiveBlockers ?? []).some((b) => b === fd || b.endsWith(`: ${fd}`)));
}
function shotsBlockedBy(fd: string) {
  return [...new Set(keyframesBlockedBy(fd).flatMap((k) => k.usedBy))].sort();
}

type Blocking = 'GLOBAL' | 'SH01_SPECIFIC' | 'LATER_SHOT' | 'NOT_BLOCKING';
type RegisterRow = {
  decisionId: string;
  question: string;
  state: string;
  answer: string | null;
  source: string;
  blocksStep: string[];
  affectedKeyframes: string[];
  affectedShots: string[];
  basis: string;
  impact: string;
  sh01: Blocking;
  sh01Reason: string;
  order: number;
  nextAction: string;
};

/**
 * Step-level decisions name no keyframe; their reach comes from the step they block (packet section 9 `blocks`).
 * The scope of each is stated with its basis rather than guessed.
 */
const STEP_REACH: Record<string, { shots: string[]; basis: string; sh01: Blocking; reason: string }> = {
  'FD-S101-01': { shots: allShots, basis: 'blocks SCREENPLAY, the first step; every shot is planned from screenplay v2', sh01: 'GLOBAL', reason: 'SH01 is planned from screenplay v2; SCREENPLAY precedes every other step' },
  'FD-S101-02': { shots: [], basis: 'blocks DIRECTION through the music cues MX01, MX02, MXS1 and MX03; no picture depends on it', sh01: 'LATER_SHOT', reason: 'audio only: SH01 picture does not depend on the score. It blocks a scene-wide DIRECTION authorization, not one scoped to S1-01/INTENT and SH01' },
  'FD-S101-09': { shots: allShots, basis: 'blocks DIRECTION; every event is timed in frames at 24 fps', sh01: 'GLOBAL', reason: 'SH01 is 96 frames at 24 fps; the frame rate fixes every duration' },
  'FD-S101-10': { shots: [], basis: 'blocks DIRECTION; concerns the end of the release after SH19 (edit only)', sh01: 'LATER_SHOT', reason: 'end card only; nothing generated depends on it' },
  'FD-S101-11': { shots: allShots.filter((s) => s !== 'S1-01-SH19'), basis: 'blocks GENERATION_BUDGET; no job is paid for without it', sh01: 'GLOBAL', reason: 'no credit is spent on any shot, SH01 included, until the founder authorizes an amount' },
};

const ORDER = ['FD-S101-01', 'FD-S101-09', 'FD-S101-08', 'FD-S101-11', 'FD-S101-12', 'FD-S101-05', 'FD-S101-03', 'FD-S101-04', 'FD-S101-02', 'FD-S101-10', 'FD-S101-06', 'FD-S101-07'];

function register(): RegisterRow[] {
  const packetSha = sha(P.packet).slice(0, 12);
  return decisions
    .map((d): RegisterRow => {
      const kfs = keyframesBlockedBy(d.decisionId).map((k) => k.keyframeId);
      const reach = STEP_REACH[d.decisionId];
      const shots = reach ? reach.shots : shotsBlockedBy(d.decisionId);
      const partial = d.progress?.length ? ` (${d.progress.join(', ')})` : '';
      let sh01: Blocking;
      let reason: string;
      if (d.status === 'ANSWERED') [sh01, reason] = ['NOT_BLOCKING', 'the founder has answered it'];
      else if (reach) [sh01, reason] = [reach.sh01, reach.reason];
      else if (shots.includes(SH01.shotId)) [sh01, reason] = ['SH01_SPECIFIC', `it blocks ${kfs.filter((k) => keyframesBlockedBy(d.decisionId).find((x) => x.keyframeId === k)?.usedBy.includes(SH01.shotId)).join(', ')}, the SH01 start frame`];
      else [sh01, reason] = ['LATER_SHOT', `it blocks ${shots.map(short).join(', ') || 'no S1-01 shot directly'}, and SH01 uses none of ${kfs.join(', ')}`];
      const nextAction =
        d.status === 'ANSWERED' ? 'None: recorded.'
        : d.decisionId === 'FD-S101-11' ? 'Founder authorizes an amount for SH01 references and video only after re-reading current quotes (the 255-credit figure is a 24 Oct planning estimate).'
        : `Founder decides: ${d.options.join(' / ')}. Packet recommends: ${d.recommendation}`;
      return {
        decisionId: d.decisionId,
        question: d.question,
        state: `${d.status}${partial}`,
        answer: d.answer,
        source: `${P.packet}#${d.decisionId} (sha256 ${packetSha}…)`,
        blocksStep: d.blocks,
        affectedKeyframes: kfs,
        affectedShots: shots,
        basis: reach ? reach.basis : kfs.length ? `keyframe manifest effectiveBlockers: ${kfs.join(', ')}` : 'no keyframe or step depends on it',
        impact: d.why,
        sh01,
        sh01Reason: reason,
        order: ORDER.indexOf(d.decisionId) + 1 || 99,
        nextAction,
      };
    })
    .sort((a, b) => a.order - b.order);
}

/* ── SH01: the exact dependency split ─────────────────────────────────────────────────────────────── */

function sh01Split(rows: RegisterRow[]) {
  const el = (id: string) => review.elements.find((e) => e.elementId === id)!;
  const kfA = km.keyframes.find((k) => k.keyframeId === 'KF-ENV-CITY-DUSK-A')!;
  const { budget, jobs } = buildSh01Records(root);
  const global = [
    ...rows.filter((r) => r.sh01 === 'GLOBAL').map((r) => ({ item: `${r.decisionId} ${r.question}`, kind: 'FOUNDER_DECISION', state: r.state, why: r.sh01Reason })),
    { item: 'SCREENPLAY step', kind: 'AUTHORIZATION_STEP', state: steps.SCREENPLAY!.state, why: 'first step; release-wide (approves S1-01/SCREENPLAY)' },
    { item: 'DIRECTION step (at least S1-01/INTENT and S1-01-SH01)', kind: 'AUTHORIZATION_STEP', state: steps.DIRECTION!.state, why: 'KEYFRAMES needs DIRECTION; S1-01/INTENT is the release intent every shot shares. A scene-wide DIRECTION also needs FD-S101-02 and FD-S101-10' },
    { item: 'Spine budget BUDGET-S1-01-SH01-PILOT authorized by the founder', kind: 'SPEND', state: budget.status, why: 'the spend gate refuses any job with no authorized budget' },
    { item: 'Durable record store deployed (migration 20261026100000, staging then production)', kind: 'INFRASTRUCTURE', state: 'NOT_DEPLOYED', why: 'production decisions must not land in the read-only repository catalogue' },
    { item: `Private media bucket ${DEFAULT_MASTERS_BUCKET} live and verified`, kind: 'INFRASTRUCTURE', state: 'NOT_DEPLOYED', why: 'a take master has nowhere durable and private to go until then' },
    { item: 'Provider execution route (OpenArt) for the deployed API', kind: 'INFRASTRUCTURE', state: 'BLOCKED', why: 'the deployed app has no OpenArt credential or executor; the agent-session connector is the founder’s, not the server’s' },
  ];
  const specific = [
    ...rows.filter((r) => r.sh01 === 'SH01_SPECIFIC').map((r) => ({ item: `${r.decisionId} ${r.question}`, kind: 'FOUNDER_DECISION', state: r.state, why: `${r.sh01Reason}; it is also the root of ${r.affectedShots.length - 1} later shots` })),
    { item: 'S1-01-SH01 shot element approved', kind: 'ELEMENT', state: el('S1-01-SH01').state, why: 'the scene gate checks the target shot element' },
    { item: 'KF-ENV-CITY-DUSK-A spec approved', kind: 'ELEMENT', state: el('KF-ENV-CITY-DUSK-A').state, why: 'the reference job targets this element' },
    { item: 'S1-01/ENV/SET-CITY-DUSK approved', kind: 'ELEMENT', state: el('S1-01/ENV/SET-CITY-DUSK').state, why: 'environment element in the KEYFRAMES step for the street' },
    { item: 'KEYFRAMES step scoped to KF-ENV-CITY-DUSK-A and S1-01/ENV/SET-CITY-DUSK', kind: 'AUTHORIZATION_STEP', state: steps.KEYFRAMES!.state, why: 'GENERATION_BUDGET needs KEYFRAMES; a scoped authorization leaves the dress, Ember, Halcyon and teenager keyframes untouched' },
    { item: 'GENERATION_BUDGET step scoped to KF-ENV-CITY-DUSK-A', kind: 'AUTHORIZATION_STEP', state: steps.GENERATION_BUDGET!.state, why: 'reference image jobs need it; the scene gate now enforces its scope' },
    { item: `Reference image: founder photograph, or ${kfA.candidates ?? 2} look-development candidates (${jobs.filter((j) => j.jobKind !== 'VIDEO_I2V').map((j) => j.id.replace(`JOB-${SH01.shotId}-`, '')).join(', ')})`, kind: 'ASSET', state: 'NOT_CREATED', why: 'SH01 is image-to-video from KF-ENV-CITY-DUSK-A' },
    { item: 'Founder approves the reference (APPROVE_REFERENCE)', kind: 'APPROVAL', state: 'PENDING', why: 'the start frame is bound to the video job by its hash; changing it voids the job authorization' },
    { item: 'PRODUCTION step scoped to S1-01-SH01', kind: 'AUTHORIZATION_STEP', state: steps.PRODUCTION!.state, why: 'the scene gate refuses a video job outside the production scope' },
    { item: `Current quotes read within ${MAX_QUOTE_AGE_HOURS} h for each SH01 job`, kind: 'SPEND', state: 'STALE (24 Oct planning quotes)', why: 'the spend gate refuses a quote older than the limit (QUOTE_STALE)' },
    { item: `Founder authorization of ${jobs.find((j) => j.jobKind === 'VIDEO_I2V')!.id} (one attempt, ceiling, expiry)`, kind: 'SPEND', state: 'DRAFT', why: 'one authorization buys one attempt of exactly this request' },
  ];
  const later = rows.filter((r) => r.sh01 === 'LATER_SHOT').map((r) => ({ item: r.decisionId, kind: 'FOUNDER_DECISION', state: r.state, why: r.sh01Reason, shots: r.affectedShots }));
  return { global, specific, later, answered: rows.filter((r) => r.sh01 === 'NOT_BLOCKING').map((r) => ({ item: r.decisionId, answer: r.answer })) };
}

/* ── §20 / §21: project record and patch re-verification ──────────────────────────────────────────── */

function exchangeChecks() {
  const master = loadSeasonMaster(root);
  const runtime = master.releases.reduce((n, r) => n + r.runtimeTargetSec, 0);
  const s101 = master.releases.find((r) => r.id === 'S1-01')!;
  const managed = getSite00ManagedProject(EXCHANGE_PROJECT_ID);
  const ledger = read<{ s101: { patch: Array<{ patchId: string; status: string; targets: Array<{ generatedFile: string }>; applied: { present: string[]; absent: string[] } }> } }>(P.ledger);
  const bg = read<{ identities: Array<{ identityId: string; tier: string; flags: string[]; name: string | null }> }>(P.background);
  const fd = (id: string) => decisions.find((d) => d.decisionId === id)!;
  const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20261026100000_site00_production_spine_records.sql'), 'utf8');
  const masters = fs.readdirSync(path.join(root, S)).filter((f) => /RELEASE_MASTER/i.test(f));
  const patches = ledger.s101.patch.map((p) => {
    const files = [...new Set(p.targets.map((t) => t.generatedFile))].map((f) => fs.readFileSync(path.join(root, f), 'utf8'));
    const text = files.join('\n');
    const has = (s: string) => text.includes(s) || text.includes(JSON.stringify(s).slice(1, -1));
    const present = p.applied.present.filter(has).length;
    const absent = p.applied.absent.filter((s) => !has(s)).length;
    return { patchId: p.patchId, status: p.status, present: `${present}/${p.applied.present.length}`, absent: `${absent}/${p.applied.absent.length}`, ok: p.status === 'APPLIED_FOUNDER_AUTHORIZED' && present === p.applied.present.length && absent === p.applied.absent.length };
  });
  const identity = (id: string) => bg.identities.find((i) => i.identityId === id)!;
  const cues = review.elements.reduce<Record<string, number>>((m, e) => ((m[e.type] = (m[e.type] ?? 0) + 1), m), {});
  const checks: Array<[string, boolean, string]> = [
    ['Managed project the-exchange (TS registry)', !!managed && managed.productionSpine === true && managed.designEnabled === false, `productionSpine ${managed?.productionSpine}, DESIGN ${managed?.designEnabled ? 'on' : 'off'}`],
    ['Managed project row in the spine migration', /'the-exchange', 'THE EXCHANGE'/.test(migration) && /'globalActorCatalogue', 'NOT_IMPORTED'/.test(migration) && /on conflict \(project_key\) do nothing/.test(migration), 'site00_managed_projects row with productionSpine, PROJECT_LOCAL cast, NOT_IMPORTED; never overwrites'],
    ['Season master: 86 releases, 127:40', master.releases.length === 86 && runtime === 7660, `${master.releases.length} releases, ${Math.floor(runtime / 60)}:${String(runtime % 60).padStart(2, '0')}`],
    ['One season master, not duplicated', new Set(masters.map((f) => f.replace(/\.(json|csv)$/, ''))).size === 1, `${masters.join(' + ')} (one master, two formats)`],
    ['S1-01 DUSK: 45 s, 1,080 frames, 19 shots', s101.runtimeTargetSec === 45 && shotList.durationFrames === 1080 && allShots.length === 19 && shotList.fps === 24, `${s101.title}: ${s101.runtimeTargetSec} s, ${shotList.durationFrames} frames at ${shotList.fps} fps, ${allShots.length} shots`],
    ['Cue structure unchanged', cues.MUSIC_CUE === 4 && cues.SOUND_CUE === 13, `${cues.MUSIC_CUE} music cues, ${cues.SOUND_CUE} sound cues, ${cues.KEYFRAME} keyframes, ${cues.SHOT} shots in the review state`],
    ['Screenplay status', shotList.screenplay.status.startsWith('DRAFT') && shotList.screenplay.version === 2, `${shotList.screenplay.path} v${shotList.screenplay.version}: ${shotList.screenplay.status}`],
    ['Seven patches applied (#1695), re-checked in the generated files', patches.length === 7 && patches.every((p) => p.ok), patches.map((p) => `${p.patchId.replace('PATCH-', '')} ${p.ok ? 'OK' : 'FAIL'}`).join(', ')],
    ['Tailor: recurring background, ANONYMOUS', identity('BG-S101-TAILOR').tier === 'RECURRING_BACKGROUND' && identity('BG-S101-TAILOR').flags.includes('ANONYMOUS') && identity('BG-S101-TAILOR').name === null && fd('FD-S101-07').status === 'ANSWERED', `${identity('BG-S101-TAILOR').flags.join(', ')}; FD-S101-07: ${fd('FD-S101-07').answer}`],
    ['Grandmother: the existing S1-59 speaking role', identity('BG-S101-GRANDMOTHER').flags.includes('SPEAKING_IN_S1-59'), identity('BG-S101-GRANDMOTHER').flags.join(', ')],
    ['Green dress: story continuity approved, visual design pending', fd('FD-S101-05').status === 'OPEN' && JSON.stringify(fd('FD-S101-05').progress) === JSON.stringify(['STORY_CONTINUITY_APPROVED', 'VISUAL_DESIGN_PENDING']), `FD-S101-05 ${fd('FD-S101-05').status}: ${fd('FD-S101-05').progress?.join(', ')}`],
    ['Teenager: four-count step, choreography pending', identity('BG-S101-TEENAGER').flags.includes('FOUR_COUNT_DANCE') && fd('FD-S101-12').status === 'OPEN' && fs.readFileSync(path.join(root, P.packet), 'utf8').includes('CHOREOGRAPHY_LOCK_PENDING'), `FD-S101-12 ${fd('FD-S101-12').status}; CHOREOGRAPHY_LOCK_PENDING in the packet`],
    ['Woman on the balcony and neighbour stay scene-scoped', identity('SC-S101-WOMAN-ON-THE-BALCONY').tier === 'SCENE_SCOPED' && identity('SC-S101-NEIGHBOUR').tier === 'SCENE_SCOPED', 'SCENE_SCOPED'],
  ];
  return { checks, patches, hashes: Object.fromEntries(Object.entries(P).map(([k, f]) => [k, sha(f)])) };
}

/* ── rendering ─────────────────────────────────────────────────────────────────────────────────────── */

const tableRow = (cells: string[]) => `| ${cells.map((c) => c.replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`;
const table = (head: string[], rows: string[][]) => [tableRow(head), tableRow(head.map(() => '---')), ...rows.map(tableRow)].join('\n');

export function renderReadinessDocs() {
  const rows = register();
  const split = sh01Split(rows);
  const ex = exchangeChecks();
  const shot = shotList.shots.find((s) => s.shotId === SH01.shotId)!;
  const kfA = km.keyframes.find((k) => k.keyframeId === 'KF-ENV-CITY-DUSK-A')!;
  const { budget, shot: shotRec, jobs } = buildSh01Records(root);
  const video = jobs.find((j) => j.jobKind === 'VIDEO_I2V')!;
  const refs = jobs.filter((j) => j.jobKind !== 'VIDEO_I2V');
  const elementGroups = Object.entries(review.elements.reduce<Record<string, Element[]>>((m, e) => ((m[e.type] ??= []).push(e), m), {})).map(([type, es]) => ({ type, total: es.length, pending: es.filter((e) => e.state === 'PENDING').length, approved: es.filter((e) => e.state === 'APPROVED').length }));
  const out: Record<string, string> = {};

  out['S101_CREATIVE_APPROVAL_REGISTER_V1.json'] = `${JSON.stringify({ schemaVersion: 1, registerId: 'S1-01.CREATIVE_APPROVAL_REGISTER.V1', derivedFrom: Object.fromEntries(Object.entries(P).map(([k, f]) => [k, { path: f, sha256: ex.hashes[k] }])), note: 'Derived from canon by scripts/production/render-readiness-docs.ts. It records state; it decides nothing.', decisions: rows, steps: Object.fromEntries(Object.entries(steps).map(([k, v]) => [k, v.state])), elements: elementGroups, sh01: split }, null, 2)}\n`;

  out['14_THE_EXCHANGE_PROJECT_INTEGRATION.md'] = `# 14 — THE EXCHANGE project integration

Sprint P0.SITE00.STUDIOWORLD.PRODUCTION-LIVE-PERSISTENCE-SECURITY-AND-FIRST-SHOT-READINESS.V1, §20 and §21. Generated by \`scripts/production/render-readiness-docs.ts\` from the committed canon; nothing in canon was changed.

## 1. Checks

${table(['Check', 'Result', 'Evidence'], ex.checks.map(([c, ok, e]) => [c, ok ? 'PASS' : 'FAIL', e]))}

## 2. #1695's seven patches, re-checked

Each patch's ledger entry lists text that must now be present and text that must be gone. This run searched the generated files the patch targets for both.

${table(['Patch', 'Ledger status', 'Present', 'Absent', 'Result'], ex.patches.map((p) => [p.patchId, p.status, p.present, p.absent, p.ok ? 'PASS' : 'FAIL']))}

The repository's own suite \`tests/theExchangeS101PacketAlignment.test.ts\` checks the same baseline and rebuilds the S1-01 files from source (deliverable 20).

## 3. Project-local authority

- **Records.** The project's production records live in the spine tables under \`project_key = 'the-exchange'\`. The project row is added with \`on conflict do nothing\`, so it never overwrites an existing row.
- **Cast.** The cast stays project-local. The migration's row carries \`castAuthority: PROJECT_LOCAL\` and \`globalActorCatalogue: NOT_IMPORTED\`. The actor adapter refuses to import anyone.
- **Canon.** The row references the season master, the S1-01 packet and the cast registry by path. It copies none of them.
- **Season master.** The master is not duplicated and not edited. Its hash is ${ex.hashes.master.slice(0, 16)}….

## 4. Source hashes

${table(['File', 'sha256'], Object.entries(P).map(([k, f]) => [f, ex.hashes[k]!]))}
`;

  out['15_S101_CREATIVE_APPROVAL_DEPENDENCY_REGISTER.md'] = `# 15 — S1-01 creative approval and dependency register

Sprint §22 and §23. Generated from the S1-01 directorial packet (section 9 decisions, section 10 steps), the keyframe manifest's dependency chains and the review state. It records where each decision stands; it answers none of them. The same data is in \`S101_CREATIVE_APPROVAL_REGISTER_V1.json\`.

## 1. Founder decisions (all ${rows.length} in the packet)

The order is a suggested review order. It starts with what everything depends on, then the street that seeds almost every frame, then the budget, then the decisions later shots need.

${table(['Order', 'Decision', 'State', 'Blocks step', 'Affected shots', 'SH01', 'Next action'], rows.map((r) => [String(r.order), `**${r.decisionId}** ${r.question}`, r.state, r.blocksStep.join(', '), r.sh01 === 'NOT_BLOCKING' ? '— (answered)' : r.affectedShots.length === allShots.length ? `all ${allShots.length}` : r.affectedShots.length === allShots.length - 1 ? 'all generated (18)' : r.affectedShots.map(short).join(', ') || 'none (audio/edit)', `${r.sh01}`, r.nextAction]))}

### Detail

${rows.map((r) => `#### ${r.decisionId}: ${r.question}

- **State:** ${r.state}${r.answer ? `. Answer: ${r.answer}` : ''}
- **Source:** \`${r.source}\`
- **Affected:** keyframes ${r.affectedKeyframes.join(', ') || 'none'}; shots ${r.affectedShots.map(short).join(', ') || 'none'}. Basis: ${r.basis}.
- **Production impact:** ${r.impact}
- **SH01:** ${r.sh01}, because ${r.sh01Reason}.
- **Next action:** ${r.nextAction}`).join('\n\n')}

## 2. Authorization steps (packet section 10)

${table(['Step', 'State', 'Prerequisite', 'What it approves'], [['SCREENPLAY', steps.SCREENPLAY!.state, 'none', 'S1-01/SCREENPLAY'], ['DIRECTION', steps.DIRECTION!.state, 'SCREENPLAY', 'INTENT, SHOT, MUSIC_CUE and SOUND_CUE elements in scope'], ['KEYFRAMES', steps.KEYFRAMES!.state, 'DIRECTION', 'KEYFRAME, ENVIRONMENT and WARDROBE elements in scope (each must be approved first)'], ['GENERATION_BUDGET', steps.GENERATION_BUDGET!.state, 'KEYFRAMES', 'BUDGET element; reference and keyframe jobs (scope enforced)'], ['PRODUCTION', steps.PRODUCTION!.state, 'GENERATION_BUDGET', 'video jobs for shots in scope (scope enforced)']])}

Each step may be scoped. A scoped step satisfies the next step's prerequisite. Every generation job still needs its own target element approved, so a scope covering SH01 opens no other shot.

## 3. Review elements

${table(['Type', 'Total', 'Pending', 'Approved'], elementGroups.map((g) => [g.type, String(g.total), String(g.pending), String(g.approved)]))}

## 4. SH01 dependency split (§23)

The 255-credit figure is the 24 October planning estimate (${budget.lines.map((l) => `${l.lineId} ${l.credits} cr`).join(', ')}). It is not a current quote.

### 4.1 Global production blockers: shared by SH01 and every other shot

${table(['Item', 'Kind', 'State', 'Why'], split.global.map((g) => [g.item, g.kind, g.state, g.why]))}

### 4.2 SH01-specific blockers

${table(['Item', 'Kind', 'State', 'Why'], split.specific.map((g) => [g.item, g.kind, g.state, g.why]))}

### 4.3 Later S1-01 shot blockers: not required for SH01

${table(['Decision', 'State', 'Shots', 'Why SH01 does not need it'], split.later.map((g) => [g.item, g.state, g.shots.map(short).join(', ') || 'none (audio/edit)', g.why]))}

- **The dress design (FD-S101-05)** reaches SH08 to SH10, SH17 and SH18 through KF-WD-GREEN-DRESS. SH01 uses only KF-ENV-CITY-DUSK-A.
- **The teenager's four-count (FD-S101-12)** reaches SH05 to SH07 through KF-SF-SH05.
- **Neither is required for SH01.** Both still use the street that FD-S101-08 seeds, so answering FD-S101-08 first unblocks both lines later.

### 4.4 Already answered

${table(['Decision', 'Answer'], split.answered.map((a) => [a.item, a.answer ?? '']))}
`;

  const unresolved = [...split.global, ...split.specific].filter((g) => !/AUTHORIZED|APPROVED|ANSWERED/.test(g.state));
  out['16_S101_SH01_FIRST_SHOT_AUTHORIZATION_PACKET.md'] = `# 16 — S1-01 SH01 first-shot authorization packet

For the founder: the exact production transaction SH01 would be. Nothing here is authorized, and nothing has been generated or quoted in this sprint. Generated from canon and the SH01 production records.

| Field | Value |
| --- | --- |
| **EPISODE** | S1-01 DUSK (${shotList.durationFrames} frames, 45 s, 19 shots) |
| **SHOT** | SH01 (${shot.shotId}), ${shot.sceneId}: ${shot.purpose} |
| **CURRENT SCRIPT STATUS** | Screenplay v${shotList.screenplay.version} ${shotList.screenplay.status}. FD-S101-01 is open. The SCREENPLAY step is ${steps.SCREENPLAY!.state}. |
| **VISUAL AUTHORITY STATUS** | No approved reference for SET-CITY-DUSK. KF-ENV-CITY-DUSK-A is ${shotRec.references[0]?.status ?? 'NOT_CREATED'} and blocked by FD-S101-08. It needs a founder photograph or one of ${kfA.candidates ?? 2} look-development candidates, approved by the founder. |
| **INTENDED SHOT DURATION** | ${shot.intendedScreenTime} on screen, at ${shotList.fps} fps |
| **EXPECTED GENERATED SOURCE DURATION** | ${shot.generationDuration} (one 5 s generation, trimmed to 4 s in the edit) |
| **CAMERA INSTRUCTIONS** | ${shot.framing}. Camera: ${shot.cameraHeight}; ${shot.cameraAngle}. Lens intent: ${shot.lensIntent}. Depth of field: ${shot.depthOfField}. Movement: ${shot.cameraMovement}, ${shot.movementSpeed}. Composition: ${shot.composition}. Action: ${shot.primaryAction}. Edit: ${shot.editTransition}. |
| **ENVIRONMENT REFERENCE** | KF-ENV-CITY-DUSK-A: ${kfA.title}. ${(kfA.spec?.lighting as string) ?? ''}. Visible: ${((kfA.spec?.visible as string[]) ?? []).join(', ')}. Hidden: ${((kfA.spec?.hidden as string[]) ?? []).join(', ')}. |
| **PROVIDER** | OpenArt, route ${video.routeId}. Execution is DISABLED: the deployed API has no OpenArt executor, and the founder's connected app is not server authentication. |
| **MODEL** | Video: ${video.model} ${video.mode}, ${Object.entries(video.settings).map(([k, v]) => `${k} ${String(v)}`).join(', ')}. References: ${refs[0]!.model} ${refs[0]!.mode} (${Object.entries(refs[0]!.settings).map(([k, v]) => `${k} ${String(v)}`).join(', ')}). |
| **OUTPUT FORMAT** | Video ${video.requestedOutputs.aspect}, ${video.requestedOutputs.resolution}, ${video.requestedOutputs.durationSec} s, sound ${video.requestedOutputs.audio ? 'on' : 'off'}, MP4. Reference images ${refs[0]!.requestedOutputs.aspect} ${refs[0]!.requestedOutputs.resolution}. |
| **CURRENT QUOTE** | None current. The records hold the 24 Oct planning quotes: ${refs.map((j) => `${j.id.replace(`JOB-${SH01.shotId}-`, '')} ${j.quotedCost.credits} cr`).join(', ')} and VIDEO-01 ${video.quotedCost.credits} cr, ${budget.plannedCredits} cr in total, quoted ${video.quotedCost.quotedAt}. The gate treats a quote older than ${MAX_QUOTE_AGE_HOURS} h as planning information (QUOTE_STALE). Each job is quoted again before authorization. |
| **MAXIMUM PROPOSED SPEND** | Proposed for the founder's decision, not authorized. Two steps: (1) references up to 80 cr (2 × 40, or 0 with a founder photograph); (2) after a reference is approved, the video up to the re-read quote, planned at 175 cr. Each job's ceiling equals its fresh quote. One authorization buys one attempt. |
| **PRODUCTION ASSET DESTINATION** | Private Supabase Storage bucket \`${DEFAULT_MASTERS_BUCKET}\`, object \`${EXCHANGE_PROJECT_ID}/<sha256>.mp4\` (content-addressed, re-read and hash-verified). Reads are signed links that expire within 5 minutes (900 s maximum). The bucket exists only once migration 20261026100000 is deployed. |
| **CONTINUITY REQUIREMENTS** | ${shot.continuityRisk}. Lighting LS-GOLDEN. Screen direction: ${shot.screenDirection}. KF-ENV-CITY-DUSK-A is also the root of ${km.keyframes.filter((k) => (k.effectiveBlockers ?? []).some((b) => b.includes('KF-ENV-CITY-DUSK-A'))).length} later keyframes, so its approval fixes the street for the release. Nobody is featured. |
| **RETAKE POLICY** | No automatic retry. A failed, uncertain or rejected attempt never resubmits. A retake is a new founder request and a new authorization against a fresh quote. Spend on a failed attempt counts at its quote when the provider reports none. A capture failure is recaptured from the stored output and never regenerated. |
| **REVIEW WORKFLOW** | Take arrives READY FOR REVIEW. A reviewer may HOLD and record continuity findings. The founder APPROVES or REJECTS. The founder or an authorized editor may SELECT FOR EDIT (one take per shot). Each decision is an append-only event naming its before and after state and the take version. A canonical continuity frame for SH02 comes only from an approved take. |
| **UNRESOLVED BLOCKERS** | ${unresolved.map((u) => u.item).join('; ')} |
| **APPROVAL STATE** | Steps: ${Object.entries(steps).map(([k, v]) => `${k} ${v.state}`).join(', ')}. Spine budget ${budget.status}, authorized ${budget.authorizedCredits} cr. Jobs: ${jobs.map((j) => `${j.id.replace(`JOB-${SH01.shotId}-`, '')} ${j.status}`).join(', ')}. Shot ${shotRec.setup} / ${shotRec.generation}. |

## What authorizing would mean, step by step

1. **Founder decides FD-S101-01, FD-S101-09 and FD-S101-08**, and authorizes SCREENPLAY, DIRECTION (at least S1-01/INTENT and SH01) and KEYFRAMES (for KF-ENV-CITY-DUSK-A and SET-CITY-DUSK).
2. **References are quoted again**, and the founder answers FD-S101-11 for the references. Then GENERATION_BUDGET is authorized (scoped) and the spine budget is authorized.
3. **Reference images are generated**, or the founder supplies a photograph. The founder approves one as KF-ENV-CITY-DUSK-A.
4. **The video is quoted again.** The founder authorizes PRODUCTION for SH01 and the one VIDEO-01 attempt, with its ceiling and expiry.
5. **The infrastructure must already be live** before any of this spends: the durable store, the private bucket and an enabled provider route. Today none is deployed, and the route is BLOCKED (deliverable 19).
`;
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const docs = renderReadinessDocs();
  const dir = path.join(root, READINESS_DOCS_DIR);
  const check = process.argv.includes('--check');
  let stale = 0;
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, text] of Object.entries(docs)) {
    const f = path.join(dir, name);
    if (check) {
      if (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== text) (stale++, console.log(`STALE ${name}`));
    } else fs.writeFileSync(f, text);
  }
  console.log(check ? (stale ? `${stale} stale` : 'all current') : `wrote ${Object.keys(docs).length} files to ${READINESS_DOCS_DIR}`);
  if (stale) process.exit(1);
}
