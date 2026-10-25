import crypto from 'node:crypto';
import fs from 'node:fs';
import { EXCHANGE_PATHS, repoPath } from '../paths.js';
import type { MasterRelease, SeasonMaster } from '../types.js';
import { PROTECTED_BASELINE } from './baseline.js';
import { INVENTION_CANDIDATES } from './inventions.js';
import { BACKGROUND_GROUPS, MEMORY_INVENTORY } from './memoryInventory.js';
import { PRIORITIES, SECOND_TIER } from './priorities.js';
import { PROPOSALS } from './proposals/index.js';
import { RELEASE_JUDGMENTS } from './releases.js';
import { AUDIT_SOURCES, S101_PACKET, SCENE_INDEX, SOURCE_DISCREPANCIES } from './sources.js';
import { EXISTING_TECHNOLOGY } from './technology.js';
import { WORLD_DENSITY, type WorldLayer } from './world.js';
import {
  AUDIT_BASELINE_RELEASES,
  AUDIT_BASELINE_RUNTIME_SEC,
  FORBIDDEN_CAPABILITIES,
  SCORE_DIMENSIONS,
  VIOLATIONS,
  type BackgroundGroup,
  type ExistingTech,
  type Invention,
  type MemoryMoment,
  type Priority,
  type Proposal,
  type ReleaseJudgment,
} from './types.js';

export type AuditCheck = { id: string; title: string; checked: number; errors: string[] };

/** The audit records under test. Defaults to the committed data; tests pass altered copies to prove each check can fail. */
export type AuditData = {
  proposals: Proposal[];
  inventions: Invention[];
  technology: ExistingTech[];
  judgments: ReleaseJudgment[];
  priorities: Priority[];
  secondTier: string[];
  memory: MemoryMoment[];
  groups: BackgroundGroup[];
  world: WorldLayer[];
};

export const AUDIT_DATA: AuditData = {
  proposals: PROPOSALS,
  inventions: INVENTION_CANDIDATES,
  technology: EXISTING_TECHNOLOGY,
  judgments: RELEASE_JUDGMENTS,
  priorities: PRIORITIES,
  secondTier: SECOND_TIER,
  memory: MEMORY_INVENTORY,
  groups: BACKGROUND_GROUPS,
  world: WORLD_DENSITY,
};

type IndexRelease = {
  releaseId: string;
  beats: string[];
  scenes: Array<{ sceneId: string; heading: string }>;
  knowledge: { audienceKnows: string[]; audienceLearnsHere: string[] };
};
type Packet = {
  sections: {
    '4_SHOT_STORYBOARD': { shots: Array<{ shotId: string; sceneId: string; subject: string }> };
    '9_FOUNDER_DECISIONS': Array<{ decisionId: string }>;
  };
};
type Ledger = {
  facts: Array<{ factId: string; audienceFrom: string | null; guardKeywords: string[] }>;
  openQuestions: Array<{ id: string }>;
};

/** The master fields a citation may quote. */
export const releaseText = (r: MasterRelease) =>
  [r.setting, r.narrativeDevelopment, r.characterPurpose, r.payoff, r.endingTransition, r.featuredCharacters, r.continuityDependencies, r.openingHook.text].join('\n');

export const sha256 = (file: string) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const ID_IN_TEXT = /\b[TFRSCVW]-\d{2}\b/g;
/** A quoted line, or reported speech the master already gives someone. */
const SPOKEN = /[“"].+[”"]|\b(asks?|says?|tells?|calls?)\b/;
const actionable = (p: Proposal) => p.board === 'APPROVE' || p.board === 'REVISE';

/** Read-only checks over the audit records against the canon they cite. An empty `errors` list is a pass. */
export function validateAudit(root = process.cwd(), data: AuditData = AUDIT_DATA): AuditCheck[] {
  const { proposals: PROPOSALS, inventions: INVENTION_CANDIDATES, technology: EXISTING_TECHNOLOGY, judgments: RELEASE_JUDGMENTS, priorities: PRIORITIES, secondTier: SECOND_TIER, memory: MEMORY_INVENTORY, groups: BACKGROUND_GROUPS, world: WORLD_DENSITY } = data;
  const read = (rel: string) => fs.readFileSync(repoPath(rel, root), 'utf8');
  const master = JSON.parse(read(EXCHANGE_PATHS.master)) as SeasonMaster;
  const index = (JSON.parse(read(SCENE_INDEX)) as { releases: IndexRelease[] }).releases;
  const ledger = JSON.parse(read(EXCHANGE_PATHS.knowledge)) as Ledger;
  const packetRaw = read(S101_PACKET);
  const packet = JSON.parse(packetRaw) as Packet;
  const personIds = new Set([...packetRaw.matchAll(/"personId": "([^"]+)"/g)].map((m) => m[1]));
  const shots = new Set(packet.sections['4_SHOT_STORYBOARD'].shots.map((s) => s.shotId));
  const decisions = new Set(packet.sections['9_FOUNDER_DECISIONS'].map((d) => d.decisionId));
  const questions = new Set(ledger.openQuestions.map((q) => q.id));

  const order = new Map(master.releases.map((r, i) => [r.id, i]));
  const rel = new Map(master.releases.map((r) => [r.id, r]));
  const text = new Map(master.releases.map((r) => [r.id, releaseText(r)]));
  const idx = new Map(index.map((r) => [r.releaseId, r]));
  const byId = new Map(PROPOSALS.map((p) => [p.id, p]));
  const fileCache = new Map<string, string>();
  const fileText = (f: string) => fileCache.get(f) ?? (fileCache.set(f, read(f)), fileCache.get(f)!);

  const checks: AuditCheck[] = [];
  const check = (id: string, title: string, checked: number, errors: string[]) => checks.push({ id, title, checked, errors });

  check('SOURCES', 'Every source the audit cites exists, and every recorded disagreement between sources is quoted verbatim from both', AUDIT_SOURCES.length + SOURCE_DISCREPANCIES.length, [
    ...AUDIT_SOURCES.filter((s) => !fs.existsSync(repoPath(s.path, root))).map((s) => `${s.id}: missing ${s.path}`),
    ...SOURCE_DISCREPANCIES.flatMap((d) => [
      ...[d.a, d.b].filter((side) => !fileText(side.file).includes(side.quote)).map((side) => `${d.id}: "${side.quote}" not in ${side.file}`),
      ...d.proposals.filter((id) => !byId.has(id)).map((id) => `${d.id}: unknown ${id}`),
    ]),
  ]);

  const runtime = master.releases.reduce((n, r) => n + r.runtimeTargetSec, 0);
  check('MASTER_LOCK', 'The master still has 86 releases and 7,660 s', 1, [
    ...(master.releases.length === AUDIT_BASELINE_RELEASES ? [] : [`release count ${master.releases.length}`]),
    ...(runtime === AUDIT_BASELINE_RUNTIME_SEC && master.structure.runtimeTotalSec === AUDIT_BASELINE_RUNTIME_SEC ? [] : [`runtime ${runtime} s`]),
  ]);

  check(
    'PROTECTED_FILES',
    'Master, S1-01 packet files and the five Fountain drafts are byte-identical to the baseline',
    PROTECTED_BASELINE.length,
    PROTECTED_BASELINE.filter((f) => sha256(repoPath(f.path, root)) !== f.sha256).map((f) => `changed: ${f.path}`),
  );

  const judgmentErrors: string[] = [];
  if (RELEASE_JUDGMENTS.map((j) => j.id).join() !== master.releases.map((r) => r.id).join()) judgmentErrors.push('judgments are not the 86 master releases in order');
  for (const j of RELEASE_JUDGMENTS) {
    if (!j.verdict || !j.keep) judgmentErrors.push(`${j.id}: empty verdict or keep`);
    for (const note of Object.values(j.notes ?? {})) for (const m of note?.match(ID_IN_TEXT) ?? []) if (!byId.has(m)) judgmentErrors.push(`${j.id}: note names unknown ${m}`);
  }
  check('RELEASE_COVERAGE', 'One judgment per release, in master order, naming only real proposals', RELEASE_JUDGMENTS.length, judgmentErrors);

  const ids = PROPOSALS.map((p) => p.id);
  check(
    'PROPOSAL_IDS',
    'Proposal IDs are unique',
    ids.length,
    ids.filter((id, i) => ids.indexOf(id) !== i).map((id) => `duplicate ${id}`),
  );

  const citeErrors: string[] = [];
  let citeCount = 0;
  for (const p of PROPOSALS) {
    if (!p.releases.length || p.releases.some((r) => !rel.has(r))) citeErrors.push(`${p.id}: unknown release in ${p.releases.join(', ')}`);
    if (!p.placement.includes(p.releases[0])) citeErrors.push(`${p.id}: placement does not name ${p.releases[0]}`);
    if (!p.cites.some((c) => c.releaseId === p.releases[0])) citeErrors.push(`${p.id}: no citation in its placement release ${p.releases[0]}`);
    for (const c of p.cites) {
      citeCount += 1;
      const at = `${p.id} → ${c.releaseId}`;
      const r = rel.get(c.releaseId);
      const s = idx.get(c.releaseId);
      if (!r || !s) {
        citeErrors.push(`${at}: release not in master or index`);
        continue;
      }
      if (!p.releases.includes(c.releaseId)) citeErrors.push(`${at}: cited release missing from releases[]`);
      if (!s.scenes.some((x) => x.sceneId === c.sceneId)) citeErrors.push(`${at}: no scene ${c.sceneId}`);
      if (!c.quote) citeErrors.push(`${at}: citation has no quote`);
      else if (!(c.file ? fileText(c.file) : text.get(c.releaseId)!).includes(c.quote)) citeErrors.push(`${at}: quote not found "${c.quote}"`);
      if (c.beat !== undefined) {
        const b = s.beats[c.beat - 1];
        if (!b) citeErrors.push(`${at}: beat ${c.beat} out of range`);
        else if (c.quote && !b.includes(c.quote) && !c.quote.includes(b.replace(/^- /, '').slice(0, 20))) citeErrors.push(`${at}: beat ${c.beat} does not hold the quote`);
      }
    }
  }
  check('CITATIONS', 'Every citation resolves to a real release, scene and beat, and its quote is verbatim', citeCount, citeErrors);

  const catErrors: string[] = [];
  for (const p of PROPOSALS) {
    const e = (m: string) => catErrors.push(`${p.id} (${p.category}): ${m}`);
    if (p.impact && p.impact.extraSec !== p.runtimeSec) e('impact.extraSec differs from runtimeSec');
    if (p.category === 'A') {
      if (p.runtimeSec !== 0) e('A must add 0 s');
      if (!p.impact || !p.impact.fitsRuntime) e('A needs an impact that fits the runtime');
      if (!p.benefit) e('A needs a benefit');
    }
    if (p.category === 'B') {
      if (!p.expansion || !p.benefit || !p.impact) e('B needs an expansion, a benefit and an impact');
      if (p.runtimeSec <= 0 && !p.releaseCountDelta) e('B must state the footage it adds');
      if (p.impact?.fitsRuntime) e('B cannot claim to fit the locked runtime');
    }
    if (p.category === 'C') {
      if (!p.expansion || !p.impact) e('C needs an expansion and an impact');
      if (p.runtimeSec !== 0) e('C must add 0 s');
    }
    if (p.category === 'D') {
      if (p.runtimeSec !== 0) e('D must add 0 s');
      if (!p.futureImpact) e('D needs a futureImpact');
    }
    if (p.category === 'E') {
      if (!p.rejectReason || !p.violates?.length) e('E needs a reason and at least one violation');
      if (p.board !== 'REJECT') e('E must be rejected');
    }
    if (p.category !== 'E' && p.violates?.length) e('only rejected proposals carry violations');
    if (p.board === 'REJECT' && !p.rejectReason) e('a rejected proposal needs a reason');
    for (const v of p.violates ?? []) if (!(VIOLATIONS as readonly string[]).includes(v)) e(`unknown violation ${v}`);
    if (p.releaseCountDelta && p.category !== 'B') e('only B may change the release count');
    const live = p.category === 'A' || p.category === 'B' || p.category === 'C';
    if (live && p.type === 'SENSORY_FLASHBACK' && !p.memory) e('a sensory proposal needs a memory spec');
    if (live && p.type === 'AMBIENT_RETURN' && !p.callback) e('an ambient return needs a callback spec');
  }
  check('CATEGORY_RULES', 'Each category carries what section 19 and 20 require (A and C fit the runtime, B states its footage, D its future, E its reason)', PROPOSALS.length, catErrors);

  const forbidErrors: string[] = [];
  for (const p of PROPOSALS) {
    for (const c of p.claims ?? []) if (!(FORBIDDEN_CAPABILITIES as readonly string[]).includes(c)) forbidErrors.push(`${p.id}: unknown capability ${c}`);
    if (p.category !== 'E' && p.claims?.length) forbidErrors.push(`${p.id}: claims ${p.claims.join(', ')} but is not rejected`);
    if (p.category === 'E' && p.claims?.length && !p.violates?.some((v) => ['RECONSTRUCTS_UNRECORDED', 'SPEAKS_FOR_THE_DEAD', 'CONTRADICTS_SOURCE', 'SURVEILLANCE_GADGET'].includes(v)))
      forbidErrors.push(`${p.id}: claims a forbidden capability but names no matching violation`);
  }
  for (const n of INVENTION_CANDIDATES) {
    if (n.category !== 'E' && n.claims.length) forbidErrors.push(`${n.id}: invention claims ${n.claims.join(', ')} but is not rejected`);
  }
  check('FORBIDDEN_CAPABILITY', 'No surviving proposal or invention reconstructs memory, travels in time, speaks for the dead, guarantees intent, proves truth or fixes the past', PROPOSALS.length + INVENTION_CANDIDATES.length, forbidErrors);

  const memErrors: string[] = [];
  const visualReleases = new Set(MEMORY_INVENTORY.filter((m) => m.kind === 'VISUAL_FLASHBACK').map((m) => m.releaseId));
  for (const p of PROPOSALS.filter((x) => x.memory && x.category !== 'E')) {
    const m = p.memory!;
    const e = (msg: string) => memErrors.push(`${p.id}: ${msg}`);
    if (m.memoryType === 'HUMAN_MEMORY' || m.memoryType === 'POTENTIALLY_UNRELIABLE_RECOLLECTION') {
      if (!m.pov || m.povWitnessed !== 'YES') e('a character memory needs a witness');
      else if (!text.get(p.releases[0])!.includes(m.pov)) e(`${m.pov} is not in ${p.releases[0]}`);
    }
    if (['DOCUMENTED_HISTORICAL_FOOTAGE', 'AUTHENTICATED_ARCHIVE', 'SPECULATIVE_ARCHIVAL_TECHNOLOGY'].includes(m.memoryType ?? '') && !m.recordedSource) e('archive or footage needs the recording it comes from');
    if ((m.mode === 'SCORE_MOTIF' || m.mode === 'OBJECT_MATCH') && (m.memoryType !== null || m.pov !== null)) e(`${m.mode} is the film's voice and claims no memory`);
    if (m.memoryType === null && m.povWitnessed !== 'NOT_CLAIMED') e('no memory type, so no witness can be claimed');
    if (m.mode === 'VISUAL_MEMORY' && p.category === 'A' && !visualReleases.has(p.releases[0])) e('a seamless visual flashback may only restyle one the master already has');
  }
  check('MEMORY_POV', 'Every surviving memory moment is witnessed by its point of view, or claims no one\'s memory', PROPOSALS.filter((p) => p.memory).length, memErrors);

  const revealErrors: string[] = [];
  const writersRoomOnly = new Set(['KF-09', 'KF-10']);
  for (const p of PROPOSALS) {
    const facts = p.memory?.revealsFacts ?? [];
    const k = idx.get(p.releases[0])!.knowledge;
    const known = new Set([...k.audienceKnows, ...k.audienceLearnsHere]);
    if (p.category === 'E') {
      if (facts.some((f) => f.startsWith('WR-') || writersRoomOnly.has(f)) && !p.violates?.some((v) => v === 'PREMATURE_REVEAL' || v === 'REVEALS_WRITERS_ROOM_FACT'))
        revealErrors.push(`${p.id}: reveals a writers'-room fact without naming it as the reason`);
      continue;
    }
    for (const f of facts) {
      if (!f.startsWith('KF-') || writersRoomOnly.has(f)) revealErrors.push(`${p.id}: ${f} is not a fact the season reveals`);
      else if (!known.has(f)) revealErrors.push(`${p.id}: ${f} is not known to the audience by ${p.releases[0]}`);
    }
    const pos = order.get(p.releases[0])!;
    for (const fact of ledger.facts) {
      if (!fact.audienceFrom || order.get(fact.audienceFrom)! <= pos) continue;
      for (const kw of fact.guardKeywords) if (p.proposed.includes(kw)) revealErrors.push(`${p.id}: says "${kw}" before ${fact.audienceFrom} (${fact.factId})`);
    }
  }
  check('REVEAL_TIMING', 'No surviving proposal moves a reveal earlier or exposes a writers\'-room fact', PROPOSALS.length, revealErrors);

  const callbacks = PROPOSALS.filter((p) => p.callback);
  check(
    'VENUE_ACCESS',
    'Anyone placed at an invited, staff, private or work venue has a stated route in (invitations cannot be bought)',
    callbacks.length,
    callbacks.filter((p) => p.callback!.venue !== 'PUBLIC' && !p.callback!.accessRoute).map((p) => `${p.id}: ${p.callback!.venue} with no access route`),
  );

  const density = new Map<string, Proposal[]>();
  for (const p of callbacks.filter(actionable)) density.set(p.releases[0], [...(density.get(p.releases[0]) ?? []), p]);
  const densityErrors: string[] = [];
  for (const [r, list] of density) {
    if (list.length > 4) densityErrors.push(`${r}: ${list.length} recommended callbacks`);
    if (list.filter((p) => p.callback!.recognition === 'DELIBERATE').length > 2) densityErrors.push(`${r}: more than two deliberate callbacks`);
  }
  check('CALLBACK_DENSITY', 'No release carries more than four recommended callbacks or more than two meant to be noticed', density.size, densityErrors);

  const refErrors: string[] = [];
  for (const p of callbacks) {
    const c = p.callback!;
    const ref = c.characterRef;
    if (ref.startsWith('scene:S1-01:')) {
      if (!personIds.has(ref)) refErrors.push(`${p.id}: ${ref} is not a packet person`);
    } else if (ref.startsWith('background:')) {
      const [, r, ...rest] = ref.split(':');
      const group = rest.join(':');
      if (!text.get(r)?.includes(group)) refErrors.push(`${p.id}: "${group}" is not in ${r}`);
    } else if (!ref.startsWith('prop:') && !ref.startsWith('place:')) refErrors.push(`${p.id}: unknown reference kind ${ref}`);
    if (c.speaks === 'EXISTING_MASTER_LINE' && !p.cites.some((x) => x.releaseId === p.releases[0] && !x.file && SPOKEN.test(x.quote ?? '')))
      refErrors.push(`${p.id}: speaks an existing line but cites no quoted line in ${p.releases[0]}`);
  }
  check('CALLBACK_REFS', 'Every return points at someone or something already in the source; nobody gets a new line, name or biography', callbacks.length, refErrors);

  const s101Errors: string[] = [];
  for (const p of PROPOSALS) {
    const atS101 = p.releases[0] === 'S1-01';
    const usesS101Person = p.callback?.characterRef.startsWith('scene:S1-01:') ?? false;
    if (((atS101 && p.category !== 'D') || (usesS101Person && p.category !== 'E')) && !p.s101) s101Errors.push(`${p.id}: touches S1-01 with no section 25 block`);
    if (!p.s101) continue;
    for (const s of p.s101.shots) if (!shots.has(s)) s101Errors.push(`${p.id}: no shot ${s}`);
    if (p.s101.runtimeEffectSec !== (atS101 ? p.runtimeSec : 0)) s101Errors.push(`${p.id}: S1-01 runtime effect ${p.s101.runtimeEffectSec} s`);
    if (p.s101.founderApproval !== 'REQUIRED_BEFORE_PACKET_REVISION' || !p.s101.sourceVsDraft || !p.s101.assets) s101Errors.push(`${p.id}: incomplete section 25 block`);
  }
  check('S1-01_PROTECTION', 'Every idea touching S1-01 names its shots, runtime effect and assets, and waits for founder approval', PROPOSALS.filter((p) => p.s101).length, s101Errors);

  const techErrors: string[] = [];
  const techIds = new Set(EXISTING_TECHNOLOGY.map((t) => t.id));
  for (const t of EXISTING_TECHNOLOGY) {
    const re = new RegExp(t.keyword, 'i');
    for (const r of t.appearsIn) if (!re.test(text.get(r) ?? '')) techErrors.push(`${t.id}: "${t.keyword}" not in ${r}`);
    for (const id of t.enhancements) {
      const p = byId.get(id);
      if (!p) techErrors.push(`${t.id}: unknown proposal ${id}`);
      else if (!p.techIds?.includes(t.id)) techErrors.push(`${t.id}: ${id} does not name it back`);
    }
    if (t.tier === 'NOT_PRESENT' && t.appearsIn.length) techErrors.push(`${t.id}: NOT_PRESENT but appears`);
  }
  for (const p of PROPOSALS)
    for (const t of p.techIds ?? []) {
      if (!techIds.has(t)) techErrors.push(`${p.id}: unknown technology ${t}`);
      else if (!EXISTING_TECHNOLOGY.find((x) => x.id === t)!.enhancements.includes(p.id)) techErrors.push(`${p.id}: ${t} does not list it`);
    }
  check('TECHNOLOGY', 'Each existing system appears where the audit says it does, and its proposals point both ways', EXISTING_TECHNOLOGY.length, techErrors);

  const invErrors: string[] = [];
  const invIds = new Set(INVENTION_CANDIDATES.map((n) => n.id));
  for (const n of INVENTION_CANDIDATES) {
    const e = (m: string) => invErrors.push(`${n.id}: ${m}`);
    for (const [k, v] of Object.entries(n)) if (v === '' || (typeof v === 'string' && !v.trim())) e(`empty ${k}`);
    if (!n.cannot.length || !n.failure.length) e('needs limits and failure conditions');
    if (!n.signature.visual || !n.signature.audio) e('needs a visual and an audio signature');
    if (n.approvalStatus !== 'NEW_PROPOSAL') e('must stay NEW_PROPOSAL');
    if (n.duplicateOf && n.category !== 'D' && n.category !== 'E') e('a duplicate must be reserved or rejected');
    if (n.duplicateOf && !techIds.has(n.duplicateOf) && !invIds.has(n.duplicateOf)) e(`duplicates unknown ${n.duplicateOf}`);
    if (!/UNKNOWN/.test(n.priceTier)) e('price must be UNKNOWN');
    for (const id of n.proposalIds) if (byId.get(id)?.inventionId !== n.id) e(`${id} does not name it back`);
  }
  for (const p of PROPOSALS) if (p.inventionId && !INVENTION_CANDIDATES.find((n) => n.id === p.inventionId)?.proposalIds.includes(p.id)) invErrors.push(`${p.id}: ${p.inventionId} does not list it`);
  check('INVENTIONS', 'Every invention candidate has all section 05 fields, limits, failure modes, no price and NEW_PROPOSAL status', INVENTION_CANDIDATES.length, invErrors);

  const depErrors: string[] = [];
  for (const p of PROPOSALS) {
    for (const d of [...(p.dependsOn ?? []), ...(p.conflictsWith ?? [])]) if (!byId.has(d)) depErrors.push(`${p.id}: unknown ${d}`);
    for (const d of p.dependsOn ?? []) {
      const q = byId.get(d);
      if (q && actionable(p) && !actionable(q)) depErrors.push(`${p.id} (${p.board}) depends on ${d} (${q.board})`);
    }
    for (const c of p.conflictsWith ?? []) if (byId.get(c) && !byId.get(c)!.conflictsWith?.includes(p.id)) depErrors.push(`${p.id} conflicts with ${c}, but not the reverse`);
  }
  const visit = (id: string, path: string[]): void => {
    if (path.includes(id)) {
      depErrors.push(`cycle ${[...path, id].join(' → ')}`);
      return;
    }
    for (const d of byId.get(id)?.dependsOn ?? []) visit(d, [...path, id]);
  };
  for (const p of PROPOSALS) visit(p.id, []);
  check('DEPENDENCIES', 'Dependencies resolve, have no cycles, and no recommended proposal leans on a held or rejected one', PROPOSALS.length, [...new Set(depErrors)]);

  const blockErrors: string[] = [];
  for (const p of PROPOSALS)
    for (const b of p.blockedBy ?? []) {
      if (b.startsWith('FD-S101-') ? !decisions.has(b) : b.startsWith('U-') ? !questions.has(b) : true) blockErrors.push(`${p.id}: unknown open decision ${b}`);
    }
  check('OPEN_DECISIONS', 'Every proposal that waits on a founder decision names one that is actually open (FD-S101-*, U-*)', PROPOSALS.filter((p) => p.blockedBy?.length).length, blockErrors);

  const prioErrors: string[] = [];
  if (PRIORITIES.length > 12) prioErrors.push(`${PRIORITIES.length} priorities; the brief allows twelve`);
  const ranked = [...PRIORITIES.flatMap((x) => x.proposals), ...SECOND_TIER];
  for (const id of ranked) {
    if (ranked.indexOf(id) !== ranked.lastIndexOf(id)) prioErrors.push(`${id} ranked twice`);
    const p = byId.get(id);
    if (!p) prioErrors.push(`unknown ${id}`);
    else if (!actionable(p)) prioErrors.push(`${id} is ranked but its board action is ${p.board}`);
  }
  for (const pr of PRIORITIES) {
    if (!pr.why) prioErrors.push(`${pr.id}: no justification`);
    for (const d of SCORE_DIMENSIONS) {
      if (!['HIGH', 'MEDIUM', 'LOW'].includes(pr.scores[d]?.rating)) prioErrors.push(`${pr.id}: no ${d} rating`);
      if (!pr.scores[d]?.reason) prioErrors.push(`${pr.id}: no written reason for ${d}`);
    }
  }
  for (const p of PROPOSALS.filter(actionable)) if (!ranked.includes(p.id)) prioErrors.push(`${p.id} is recommended but unranked`);
  check('PRIORITIES', 'Twelve or fewer priorities, each rated in words with a written reason on all ten dimensions, covering every recommendation once', PRIORITIES.length, [...new Set(prioErrors)]);

  const invQuoteErrors: string[] = [];
  const inventoryQuotes = [
    ...MEMORY_INVENTORY.map((m) => ({ id: `memory ${m.releaseId}`, releaseId: m.releaseId, quote: m.quote })),
    ...BACKGROUND_GROUPS.flatMap((g) => g.appearances.map((a) => ({ id: g.id, ...a }))),
    ...WORLD_DENSITY.flatMap((w) => w.appearances.map((a) => ({ id: w.id, ...a }))),
  ];
  for (const q of inventoryQuotes) if (!text.get(q.releaseId)?.includes(q.quote)) invQuoteErrors.push(`${q.id} → ${q.releaseId}: quote not found "${q.quote}"`);
  for (const w of WORLD_DENSITY) {
    for (const id of w.additions) if (!byId.get(id) || byId.get(id)!.board === 'REJECT') invQuoteErrors.push(`${w.id}: addition ${id} is unknown or rejected`);
    for (const id of w.rejected) if (byId.get(id)?.board !== 'REJECT') invQuoteErrors.push(`${w.id}: ${id} is listed as rejected but is not`);
  }
  check('INVENTORY_QUOTES', 'The memory inventory, background groups and world-density table quote the master verbatim and name real proposals', inventoryQuotes.length, invQuoteErrors);

  const rtErrors: string[] = [];
  for (const p of PROPOSALS) {
    if (p.board === 'APPROVE' && (p.runtimeSec !== 0 || p.releaseCountDelta)) rtErrors.push(`${p.id}: recommended outright but adds ${p.runtimeSec} s`);
    if (p.category !== 'B' && p.runtimeSec !== 0) rtErrors.push(`${p.id}: ${p.category} adds ${p.runtimeSec} s`);
    if (p.impact && p.impact.generationCost !== 'NO_CHANGE' && p.impact.generationCost !== 'LOWER' && p.impact.generationCost !== 'HIGHER' && p.impact.generationCost !== 'UNKNOWN') rtErrors.push(`${p.id}: cost is not a direction`);
    if (p.impact && /\$|USD|credits? ?\d|\d+ ?credits?/i.test(p.impact.note)) rtErrors.push(`${p.id}: impact note states a price`);
  }
  check('RUNTIME_AND_COST', 'Adopting every outright recommendation keeps 86 releases and 7,660 s; costs are directions, never prices', PROPOSALS.length, rtErrors);

  return checks;
}

export const auditErrors = (checks: AuditCheck[]) => checks.flatMap((c) => c.errors.map((e) => `${c.id}: ${e}`));
