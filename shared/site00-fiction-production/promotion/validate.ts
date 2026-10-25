import crypto from 'node:crypto';
import fs from 'node:fs';
import { PROTECTED_BASELINE } from '../audit/baseline.js';
import { PROPOSALS } from '../audit/proposals/index.js';
import { validateAudit } from '../audit/validate.js';
import { EXCHANGE_PATHS, repoPath } from '../paths.js';
import { directedSceneBundle } from '../scenes/index.js';
import type { SeasonMaster } from '../types.js';
import { LIVING_WORLD_AMENDMENTS, LIVING_WORLD_PREFIX, withoutLivingWorldAmendments } from './amendments.js';
import { ASSET_REQUIREMENTS, PRODUCTION_HOLDS } from './assets.js';
import { BACKGROUND_IDENTITIES } from './background.js';
import { APPROVED_GROUPS, EXPECTED_APPROVED, EXPECTED_REMAINING, FOUNDER_ANSWERS, FOUNDER_APPROVED_IDS, NOT_APPROVED, PROMOTION_ORDER, S101_TIERS } from './founder.js';
import { PROMOTIONS, RECONCILIATION } from './promotions.js';
import { SOUND_MOTIFS, WORLD_RULES } from './rules.js';
import { S101_GUARDS, S101_PATCH } from './s101Patch.js';

export type PromotionCheck = { id: string; title: string; checked: number; errors: string[] };

const S = EXCHANGE_PATHS.season;
/** Files this sprint must leave exactly as PR #1693 left them (sha256 at f43aa1f0). */
export const UNCHANGED_BY_PROMOTION: Array<{ path: string; sha256: string }> = [
  { path: `${S}/APPROVAL_STATE_V1.json`, sha256: 'c8a242fab0b9b1aaf69a30aba4676a26052ae46cddcc80c3be89e57b2398c12e' },
  { path: `${S}/PRODUCTION_ASSET_REGISTRY_V1.json`, sha256: '69ed91e28de757107f955c40d05df4779759b2b38dce7cccc7727ee316f333c8' },
  { path: `${S}/CAST_REGISTRY_V1.json`, sha256: '879f744d11be6a0f8c2a029573d4d436476ddad42753a8fd546e83166d18bd35' },
  { path: `${S}/CAST_REGISTRY_EDITS_V1.json`, sha256: 'b849380e98e33b1413e9f32b574dc3c89e053b62e60c878ba0ee4b56465b9dca' },
  { path: `${S}/ACTIVE_PRODUCTION_V1.json`, sha256: '67a904726222fa55d3543afb563d4929ad88e707cf20d4b6ae925386a75122a8' },
  { path: `${S}/CANON_PROMOTION_LEDGER_V1.json`, sha256: 'efbfcc19810a2d3876a64657662e227dce00201527c68d100c589c3c9821f7cd' },
  { path: `${S}/KNOWLEDGE_AND_CONTINUITY_LEDGER_V1.json`, sha256: '3d616c8d60c6d400834af3a7ed66f9a9c0ba8f6b2464cd71d4a61dc11efe27b2' },
  { path: EXCHANGE_PATHS.approvalMatrix, sha256: '51f68aa75ad3827c0880d23f66cd5716832cf2268ee3274613898ece88f04924' },
];

export const sha256 = (body: string | Buffer) => crypto.createHash('sha256').update(body).digest('hex');
export const serializeJson = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
export const releaseText = (r: SeasonMaster['releases'][number]) => [r.narrativeDevelopment, r.setting, r.endingTransition, r.continuityDependencies, r.openingHook.text, r.featuredCharacters].join(' ');

const GRAPH = 'docs/site00/the-exchange/living-world-audit-v1/12_PROPOSAL_DEPENDENCY_AND_CANON_RISK_GRAPH.json';
const WORLD_OR_RULE_ONLY = new Set(['T-02', 'T-11']);
const strings = (o: unknown, out: string[] = []): string[] => {
  if (typeof o === 'string') out.push(o);
  else if (Array.isArray(o)) for (const v of o) strings(v, out);
  else if (o && typeof o === 'object') for (const v of Object.values(o)) strings(v, out);
  return out;
};

export const PROMOTION_DATA = {
  approvedIds: FOUNDER_APPROVED_IDS,
  groups: APPROVED_GROUPS,
  order: PROMOTION_ORDER,
  answers: FOUNDER_ANSWERS,
  notApproved: NOT_APPROVED,
  tiers: S101_TIERS,
  amendments: LIVING_WORLD_AMENDMENTS,
  rules: WORLD_RULES,
  motifs: SOUND_MOTIFS,
  background: BACKGROUND_IDENTITIES,
  patch: S101_PATCH,
  assets: ASSET_REQUIREMENTS,
  holds: PRODUCTION_HOLDS,
  promotions: PROMOTIONS,
  reconciliation: RECONCILIATION,
};
export type PromotionData = typeof PROMOTION_DATA;

/** Read-only checks over the promotion against the canon it changes. An empty `errors` list is a pass. */
export function validatePromotion(root = process.cwd(), data: PromotionData = PROMOTION_DATA): PromotionCheck[] {
  const {
    approvedIds: FOUNDER_APPROVED_IDS,
    groups: APPROVED_GROUPS,
    order: PROMOTION_ORDER,
    answers: FOUNDER_ANSWERS,
    notApproved: NOT_APPROVED,
    tiers: S101_TIERS,
    amendments: LIVING_WORLD_AMENDMENTS,
    rules: WORLD_RULES,
    motifs: SOUND_MOTIFS,
    background: BACKGROUND_IDENTITIES,
    patch: S101_PATCH,
    assets: ASSET_REQUIREMENTS,
    holds: PRODUCTION_HOLDS,
    promotions: PROMOTIONS,
    reconciliation: RECONCILIATION,
  } = data;
  const read = (rel: string) => fs.readFileSync(repoPath(rel, root), 'utf8');
  const master = JSON.parse(read(EXCHANGE_PATHS.master)) as SeasonMaster;
  const byRelease = new Map(master.releases.map((r) => [r.id, r]));
  const order = new Map(master.releases.map((r) => [r.id, r.order]));
  const text = (id: string) => (byRelease.get(id) ? releaseText(byRelease.get(id)!) : '');
  const approved = new Set(FOUNDER_APPROVED_IDS);
  const audit = new Map(PROPOSALS.map((p) => [p.id, p]));
  const lw = Object.values(LIVING_WORLD_AMENDMENTS).flat();
  const checks: PromotionCheck[] = [];
  const check = (id: string, title: string, checked: number, errors: string[]) => checks.push({ id, title, checked, errors });

  const groupIds = APPROVED_GROUPS.flatMap((g) => g.proposals);
  check('APPROVED_COUNT', 'Exactly 19 founder-approved IDs, each real, none duplicated, matching the twelve priority groups', FOUNDER_APPROVED_IDS.length, [
    ...(FOUNDER_APPROVED_IDS.length !== EXPECTED_APPROVED ? [`${FOUNDER_APPROVED_IDS.length} approved; expected ${EXPECTED_APPROVED}`] : []),
    ...(new Set(FOUNDER_APPROVED_IDS).size !== FOUNDER_APPROVED_IDS.length ? ['duplicate approval'] : []),
    ...FOUNDER_APPROVED_IDS.filter((id) => !audit.has(id)).map((id) => `${id} is not an audit proposal`),
    ...(groupIds.slice().sort().join() !== FOUNDER_APPROVED_IDS.slice().sort().join() ? ['priority groups and the approved list differ'] : []),
    ...(PROMOTION_ORDER.slice().sort().join() !== FOUNDER_APPROVED_IDS.slice().sort().join() ? ['promotion order and the approved list differ'] : []),
    ...RECONCILIATION.filter((r) => (r.founderDecision === 'FOUNDER_APPROVED') !== approved.has(r.proposalId)).map((r) => `${r.proposalId}: decision state disagrees with the founder list`),
  ]);

  const rest = RECONCILIATION.filter((r) => !approved.has(r.proposalId));
  const restIds = new Set(rest.map((r) => r.proposalId));
  const usedBy = (id: string) => [
    ...(lw.some((a) => a.recommendationId === id) ? ['a master amendment'] : []),
    ...(WORLD_RULES.some((w) => w.proposalIds.includes(id)) ? ['a world rule'] : []),
    ...(SOUND_MOTIFS.some((m) => m.proposalIds.includes(id)) ? ['a sound motif'] : []),
    ...(BACKGROUND_IDENTITIES.some((b) => b.approvedAppearances.some((a) => a.proposalId === id)) ? ['an approved appearance'] : []),
    ...(S101_PATCH.some((x) => x.proposals.includes(id)) ? ['the S1-01 patch'] : []),
    ...(ASSET_REQUIREMENTS.some((x) => x.proposalIds.includes(id)) ? ['the asset ledger'] : []),
  ];
  check('REMAINING_53', 'The other 53 stay PENDING_FOUNDER with their audit recommendation, and nothing promotes them', rest.length, [
    ...(RECONCILIATION.length !== PROPOSALS.length ? [`${RECONCILIATION.length} reconciled of ${PROPOSALS.length}`] : []),
    ...(rest.length !== EXPECTED_REMAINING ? [`${rest.length} remaining; expected ${EXPECTED_REMAINING}`] : []),
    ...rest.filter((r) => r.founderDecision !== 'PENDING_FOUNDER' || r.promoted).map((r) => `${r.proposalId}: not pending`),
    ...rest.filter((r) => r.auditRecommendation !== (audit.get(r.proposalId)!.board ?? 'NONE')).map((r) => `${r.proposalId}: audit recommendation changed`),
    ...[...restIds].flatMap((id) => usedBy(id).map((u) => `${id} is used by ${u}`)),
  ]);

  const r01 = PROMOTIONS.find((p) => p.proposalId === 'R-01')!;
  check('DECLINED_ALTERNATIVES', 'R-12, R-01-ALT, C-01 and R-14 are not promoted, and nothing names the tailor', NOT_APPROVED.length, [
    ...NOT_APPROVED.filter((n) => approved.has(n.id)).map((n) => `${n.id} is approved`),
    ...(/R-01-ALT|another grandmother/i.test(r01.approvedBehavior) ? ['R-01 carries its alternative'] : []),
    ...lw.filter((a) => /Wendell/i.test(a.text)).map((a) => `${a.amendmentId} names Wendell`),
    ...lw.filter((a) => a.amendmentId.startsWith(`${LIVING_WORLD_PREFIX}S1-69`)).map((a) => `${a.amendmentId}: S1-69 return is not approved`),
    ...(lw.some((a) => /neighbour (raises|photographs)|takes the picture/i.test(a.text)) ? ['an amendment applies R-12'] : []),
  ]);

  const census = (JSON.parse(read(`${S}/FUTURE_PRODUCTION_DEPENDENCIES_V1.json`)) as { census: Array<{ personId: string }> }).census.map((p) => p.personId);
  const tierErrors: string[] = [];
  for (const [personId, flags] of Object.entries(S101_TIERS)) {
    const b = BACKGROUND_IDENTITIES.find((x) => x.censusPersonId === personId);
    if (!b) tierErrors.push(`${personId}: not registered`);
    else {
      if (b.tier !== flags[0]) tierErrors.push(`${personId}: tier ${b.tier}, founder ${flags[0]}`);
      for (const f of flags.slice(1)) if (!b.flags.includes(f)) tierErrors.push(`${personId}: missing ${f}`);
      if (b.tier === 'SCENE_SCOPED' && b.approvedAppearances.length) tierErrors.push(`${personId}: scene-scoped with a later appearance`);
    }
  }
  for (const b of BACKGROUND_IDENTITIES) {
    if (!census.includes(b.censusPersonId)) tierErrors.push(`${b.identityId}: ${b.censusPersonId} is not in the cast census`);
    if (b.name !== null) tierErrors.push(`${b.identityId}: has a name`);
    if (b.relationships.length) tierErrors.push(`${b.identityId}: has relationships`);
    if (b.tierHistory[b.tierHistory.length - 1].tier !== b.tier) tierErrors.push(`${b.identityId}: tier history does not end on the current tier`);
    for (const a of b.approvedAppearances) {
      if (!approved.has(a.proposalId)) tierErrors.push(`${b.identityId}: appearance by unapproved ${a.proposalId}`);
      if (!byRelease.has(a.releaseId)) tierErrors.push(`${b.identityId}: unknown release ${a.releaseId}`);
      if (!lw.some((x) => x.recommendationId === a.proposalId && x.amendmentId.includes(a.releaseId))) tierErrors.push(`${b.identityId}: ${a.releaseId} appearance has no master amendment`);
    }
  }
  check('BACKGROUND_IDENTITIES', 'Tailor, grandmother and teenager are recurring background; balcony woman and neighbour stay scene-scoped; nobody is named or related', BACKGROUND_IDENTITIES.length, tierErrors);

  const tailor = BACKGROUND_IDENTITIES.find((b) => b.identityId === 'BG-S101-TAILOR')!;
  check('ANONYMOUS_TAILOR', 'The S1-01 tailor stays anonymous and is never merged into Wendell Ames', 1, [
    ...(tailor.flags.includes('ANONYMOUS') ? [] : ['tailor not flagged ANONYMOUS']),
    ...(JSON.stringify(tailor).match(/Wendell/g)?.length !== 1 ? ['the tailor record mentions Wendell other than to rule it out'] : []),
    ...(approved.has('C-01') ? ['C-01 is approved'] : []),
    ...(FOUNDER_ANSWERS.find((a) => a.decisionId === 'FD-S101-07')?.answer !== 'ANONYMOUS' ? ['FD-S101-07 is not ANONYMOUS'] : []),
  ]);

  const LINE = "Something good. They're humming.";
  const grandmother = BACKGROUND_IDENTITIES.find((b) => b.identityId === 'BG-S101-GRANDMOTHER')!;
  check('GRANDMOTHER_LINE', 'The S1-59 line is the master line, spoken once, by the S1-01 grandmother', 1, [
    ...(text('S1-59').split(LINE).length !== 2 ? ['the master S1-59 line is missing or doubled'] : []),
    ...(grandmother.dialogue.length !== 1 || grandmother.dialogue[0].line !== LINE || grandmother.dialogue[0].releaseId !== 'S1-59' ? ['register dialogue is not the one master line'] : []),
    ...(LIVING_WORLD_AMENDMENTS['S1-59']?.find((a) => a.recommendationId === 'R-01')?.text.includes(LINE) ? [] : ['R-01 amendment does not carry the master line']),
    ...(grandmother.voice.status !== 'NOT_AUTHORIZED' ? ['grandmother voice marked authorized'] : []),
  ]);

  const dress = ASSET_REQUIREMENTS.find((a) => a.assetId === 'LW-WD-GREEN-DRESS')!;
  const fd05 = FOUNDER_ANSWERS.find((a) => a.decisionId === 'FD-S101-05')!;
  const plan = directedSceneBundle('S1-01', root).direction.plan;
  const kfDress = plan.keyframes.find((k) => k.keyframeId === 'KF-WD-GREEN-DRESS');
  check('DRESS_OPEN', 'The dress keeps one undecided design; R-02 is creatively approved and production-held', 1, [
    ...(fd05.stillOpen ? [] : ['FD-S101-05 recorded as fully decided']),
    ...(dress.status !== 'PENDING_DESIGN' ? [`dress status ${dress.status}`] : []),
    ...(PRODUCTION_HOLDS.find((h) => h.holdId === 'HOLD-FD-S101-05')?.blocks.includes('R-02') ? [] : ['no hold on R-02']),
    ...(PROMOTIONS.find((p) => p.proposalId === 'R-02')!.productionState !== 'CONDITIONAL_PRODUCTION_HOLD' ? ['R-02 is not production-held'] : []),
    ...lw.filter((a) => /satin|bias-cut|cocktail/i.test(a.text)).map((a) => `${a.amendmentId} picks a silhouette`),
    ...(!kfDress || !kfDress.blockedBy?.includes('FD-S101-05') ? ['KF-WD-GREEN-DRESS is no longer blocked by FD-S101-05'] : []),
  ]);

  const graph = JSON.parse(read(GRAPH)) as { edges: Array<{ from: string; to: string; kind: string }> };
  const depErrors: string[] = [];
  for (const [a, b] of [['T-02', 'T-01'], ['W-01', 'R-02'], ['W-01', 'R-03'], ['S-02', 'R-04']]) if (PROMOTION_ORDER.indexOf(a) > PROMOTION_ORDER.indexOf(b)) depErrors.push(`${a} must precede ${b}`);
  for (const p of PROMOTIONS) for (const d of p.dependencies) if (d.open && !(d.kind === 'WAITS_ON_DECISION' && d.to === 'FD-S101-05' && p.productionHolds.includes('HOLD-FD-S101-05'))) depErrors.push(`${p.proposalId} → ${d.to}: ${d.resolution}`);
  for (const e of graph.edges.filter((x) => approved.has(x.from) && x.kind !== 'USES_TECHNOLOGY' && x.kind !== 'USES_INVENTION')) {
    const rec = PROMOTIONS.find((p) => p.proposalId === e.from);
    if (!rec) depErrors.push(`${e.from} is approved but has no promotion record`);
    else if (!rec.dependencies.some((d) => d.to === e.to && d.kind === e.kind)) depErrors.push(`graph edge ${e.from} ${e.kind} ${e.to} is not accounted for`);
  }
  check('DEPENDENCIES', 'Every graph edge of an approved proposal is resolved in order; only the dress design stays open, as a production hold', graph.edges.filter((x) => approved.has(x.from)).length, depErrors);

  const masterLw = master.releases.flatMap((r) => r.approvedAmendments.filter((a) => a.amendmentId.startsWith(LIVING_WORLD_PREFIX)));
  const amendErrors: string[] = [];
  if (serializeJson(masterLw) !== serializeJson(lw)) amendErrors.push('master living-world amendments differ from the promotion record (rebuild the master)');
  for (const a of lw) {
    const releaseId = a.amendmentId.slice(LIVING_WORLD_PREFIX.length, LIVING_WORLD_PREFIX.length + 5);
    const quote = a.placementEvidence.match(/"(.*)" \(/)?.[1];
    if (!approved.has(a.recommendationId) && !FOUNDER_ANSWERS.some((f) => f.decisionId === a.recommendationId)) amendErrors.push(`${a.amendmentId}: ${a.recommendationId} is not approved`);
    if (!quote || !text(releaseId).includes(quote)) amendErrors.push(`${a.amendmentId}: placement quote not in the master`);
    if (!/^None/.test(a.runtimeEffect)) amendErrors.push(`${a.amendmentId}: runtime effect`);
  }
  for (const id of FOUNDER_APPROVED_IDS) if (!WORLD_OR_RULE_ONLY.has(id) && !lw.some((a) => a.recommendationId === id)) amendErrors.push(`${id}: no master amendment`);
  check('MASTER_AMENDMENTS', 'Each approved release-level change is one master amendment, placed on a quoted master line, adding no time', lw.length, amendErrors);

  const stripped = sha256(serializeJson(withoutLivingWorldAmendments(master)));
  const baseline = PROTECTED_BASELINE.find((f) => f.path === EXCHANGE_PATHS.master)!.sha256;
  check('MASTER_BASELINE', 'Without the promoted amendments the master is byte-identical to the audit baseline: 86 releases, 127:40, nothing else changed', 1, [
    ...(stripped !== baseline ? [`master minus amendments is ${stripped.slice(0, 12)}…, baseline ${baseline.slice(0, 12)}…`] : []),
    ...(master.releases.length !== 86 ? [`${master.releases.length} releases`] : []),
    ...(master.structure.runtimeTotalSec !== 7660 ? [`runtime ${master.structure.runtimeTotalSec} s`] : []),
  ]);

  const QUOTE = /["“]([^"”]+)["”]/g;
  check('NO_NEW_DIALOGUE', 'Every quoted line in an amendment is a line the master already has in that release', lw.length, lw.flatMap((a) => {
    const releaseId = a.amendmentId.slice(LIVING_WORLD_PREFIX.length, LIVING_WORLD_PREFIX.length + 5);
    return [...a.text.matchAll(QUOTE)].map((m) => m[1]).filter((q) => !text(releaseId).includes(q)).map((q) => `${a.amendmentId}: new line "${q}"`);
  }));

  const wr = (id: string) => WORLD_RULES.find((w) => w.ruleId === id)!;
  const ruleErrors: string[] = [];
  for (const w of WORLD_RULES) for (const e of [...w.evidence, ...w.notGoverned]) if (!text(e.releaseId).includes(e.quote)) ruleErrors.push(`${w.ruleId}: "${e.quote}" not in ${e.releaseId}`);
  const sealBreaks = lw.filter((a) => /seal cracks|seal breaks|breaks the seal/i.test(a.text)).map((a) => a.amendmentId);
  if (sealBreaks.join() !== `${LIVING_WORLD_PREFIX}S1-86-V07`) ruleErrors.push(`copper wax: on-screen breaks in ${sealBreaks.join(', ') || 'no release'}`);
  const v07 = lw.filter((a) => a.recommendationId === 'V-07').map((a) => a.amendmentId.slice(6, 11));
  if (v07.join() !== wr('WR-01').appliesTo.join()) ruleErrors.push(`copper wax releases ${v07.join()} differ from WR-01`);
  for (const k of ['hearing', 'remembering', 'speech', 'repetition', 'gossip']) if (!wr('WR-03').cannot.some((c) => c.toLowerCase().includes(k))) ruleErrors.push(`Ember rule does not leave ${k} free`);
  if (lw.some((a) => /Ember (stops|prevents|blocks) (talk|speech|hearing|gossip)/i.test(a.text))) ruleErrors.push('an amendment lets the Ember stop people');
  if (!text('S1-54').includes('repeated it to his boss to impress him')) ruleErrors.push('the S1-54 breach is no longer a human leak');
  const ladder = wr('WR-04').appliesTo.map((id) => order.get(id)!);
  if (ladder.some((n, i) => i > 0 && n < ladder[i - 1])) ruleErrors.push('gold ladder out of release order');
  if (lw.some((a) => order.get(a.amendmentId.slice(6, 11))! < order.get('S1-77')! && /bound to revocation|binds the city/i.test(a.text))) ruleErrors.push('city-scale gold before S1-77');
  if (wr('WR-05').appliesTo.join() !== 'S1-59,S1-76' || !LIVING_WORLD_AMENDMENTS['S1-59']?.some((a) => a.recommendationId === 'T-12') || !LIVING_WORLD_AMENDMENTS['S1-76']?.some((a) => a.recommendationId === 'T-12')) ruleErrors.push('lantern flicker not placed in both S1-59 and S1-76');
  if (!byRelease.get('S1-76')!.setting.includes('The promenade')) ruleErrors.push('S1-76 is no longer on the promenade');
  check('WORLD_RULES', 'Copper wax, Relay, Ember, gold ladder, lantern, Echo Track and flashback rules hold against every release they cite', WORLD_RULES.length, ruleErrors);

  const memoryIds = PROMOTIONS.filter((p) => audit.get(p.proposalId)!.memory).map((p) => p.proposalId);
  const auditChecks = validateAudit(root);
  const auditErr = auditChecks.filter((c) => ['MEMORY_POV', 'REVEAL_TIMING', 'CITATIONS', 'FORBIDDEN_CAPABILITY'].includes(c.id)).flatMap((c) => c.errors.filter((e) => FOUNDER_APPROVED_IDS.some((id) => e.startsWith(`${id}`))));
  const visual = PROMOTIONS.filter((p) => audit.get(p.proposalId)!.memory?.mode === 'VISUAL_MEMORY');
  check('MEMORY', 'Approved memories are witnessed, reveal nothing early, and add no visual flashback beyond the master\'s two', memoryIds.length, [
    ...auditErr,
    ...visual.filter((p) => !['F-06', 'F-07'].includes(p.proposalId)).map((p) => `${p.proposalId}: a new visual flashback`),
    ...(text('S1-58').includes('A memory moment') && text('S1-77').includes('A memory flash') ? [] : ['S1-58 or S1-77 is no longer a master memory']),
  ]);

  check('RUNTIME', 'Every approved change adds 0 s; 86 releases and 127:40 hold at release and season level', PROMOTIONS.length, [
    ...PROMOTIONS.filter((p) => p.runtimeImpactSec !== 0 || audit.get(p.proposalId)!.runtimeSec !== 0).map((p) => `${p.proposalId}: adds time`),
    ...(master.releases.reduce((n, r) => n + r.runtimeTargetSec, 0) !== 7660 ? ['season runtime changed'] : []),
  ]);

  const protectedFiles = [...PROTECTED_BASELINE.filter((f) => f.path !== EXCHANGE_PATHS.master), ...UNCHANGED_BY_PROMOTION];
  check('UNCHANGED_FILES', 'The S1-01 packet, the five Fountain drafts, the approval book, registries, ledgers and active production are untouched', protectedFiles.length, protectedFiles.filter((f) => sha256(fs.readFileSync(repoPath(f.path, root))) !== f.sha256).map((f) => `changed: ${f.path}`));

  const packetStrings = strings(JSON.parse(read(`${S}/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json`)));
  const shotIds = new Set(plan.shots.map((s) => s.shotId));
  const kfIds = new Set(plan.keyframes.map((k) => k.keyframeId));
  const decisions = (JSON.parse(read(`${S}/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json`)) as { sections: { '9_FOUNDER_DECISIONS': Array<{ decisionId: string; status: string }> } }).sections['9_FOUNDER_DECISIONS'];
  const g = S101_GUARDS.baseline;
  check('S1-01_PATCH', 'The S1-01 patch plan quotes the current packet, touches real shots and keyframes, and leaves shots, frames, cues and open decisions as they are', S101_PATCH.length, [
    ...S101_PATCH.flatMap((x) => x.before.filter((b) => !packetStrings.some((s) => s.includes(b))).map((b) => `${x.patchId}: "${b}" is not in the packet`)),
    ...S101_PATCH.flatMap((x) => x.affects.filter((a) => a.startsWith('S1-01-SH') && !shotIds.has(a)).map((a) => `${x.patchId}: no shot ${a}`)),
    ...S101_PATCH.flatMap((x) => x.affects.filter((a) => a.startsWith('KF-') && !kfIds.has(a)).map((a) => `${x.patchId}: no keyframe ${a}`)),
    ...S101_PATCH.flatMap((x) => x.proposals.filter((p) => !approved.has(p)).map((p) => `${x.patchId}: serves unapproved ${p}`)),
    ...(plan.shots.length !== g.shots || plan.durationFrames !== g.frames || plan.fps !== g.fps || plan.keyframes.length !== g.keyframes ? ['S1-01 shot, frame or keyframe count changed'] : []),
    ...(plan.music.filter((m) => m.cueType !== 'SILENCE').length !== g.musicCues || plan.music.filter((m) => m.cueType === 'SILENCE').length !== g.silences || plan.sound.length !== g.soundCues ? ['S1-01 music or sound cue count changed'] : []),
    ...S101_GUARDS.stillOpen.filter((id) => decisions.find((d) => d.decisionId === id)?.status !== 'OPEN').map((id) => `${id} is no longer open`),
  ]);

  const holdIds = new Set(PRODUCTION_HOLDS.map((h) => h.holdId));
  check('ASSETS', 'No approved direction claims an asset that does not exist, invents a location for one, or spends anything', ASSET_REQUIREMENTS.length, [
    ...ASSET_REQUIREMENTS.filter((a) => a.status === 'EXISTS_VERIFIED' || a.status === 'FOUNDER_APPROVED').map((a) => `${a.assetId}: claims ${a.status}`),
    ...ASSET_REQUIREMENTS.flatMap((a) => a.holds.filter((h) => !holdIds.has(h)).map((h) => `${a.assetId}: unknown hold ${h}`)),
    ...ASSET_REQUIREMENTS.flatMap((a) => a.proposalIds.filter((p) => !approved.has(p)).map((p) => `${a.assetId}: unapproved ${p}`)),
    ...(JSON.stringify(ASSET_REQUIREMENTS).match(/https?:\/\/|supabase/i) ? ['an asset URL was written'] : []),
    ...FOUNDER_APPROVED_IDS.filter((id) => !ASSET_REQUIREMENTS.some((a) => a.proposalIds.includes(id))).map((id) => `${id}: no asset line`),
    ...PRODUCTION_HOLDS.flatMap((h) => h.blocks.filter((p) => !approved.has(p)).map((p) => `${h.holdId}: holds unapproved ${p}`)),
  ]);

  return checks;
}

export const promotionErrors = (checks: PromotionCheck[]) => checks.flatMap((c) => c.errors.map((e) => `${c.id}: ${e}`));
