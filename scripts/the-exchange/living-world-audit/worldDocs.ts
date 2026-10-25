import fs from 'node:fs';
import * as X from '../../../shared/site00-fiction-production/index.js';
import { A, bullets, catName, countBy, generatedNote, list, plusSec, PROPOSAL_NOTE, secs, table, type Ctx } from './md.js';

type Proposal = X.Audit.Proposal;
const GUEST_REGISTRY = 'THE_EXCHANGE/MANIFEST/RECURRING_GUEST_CONCEPT_REGISTRY_V1.json';
const live = (p: Proposal) => p.board === 'APPROVE' || p.board === 'REVISE';
const quoteList = (as: Array<{ releaseId: string; quote: string }>) => as.map((a) => `${a.releaseId}: "${a.quote}"`).join('<br>');

export function densityRows() {
  const byRelease = new Map<string, Proposal[]>();
  for (const p of A.PROPOSALS.filter((x) => x.callback && live(x))) byRelease.set(p.releases[0], [...(byRelease.get(p.releases[0]) ?? []), p]);
  return [...byRelease.entries()].map(([r, ps]) => [r, ps.length, ps.filter((p) => p.callback!.recognition === 'DELIBERATE').length, ps.map((p) => `${p.id} (${p.callback!.recognition})`).join(', ')]);
}

export function livingWorldDoc(c: Ctx): string {
  const registry = JSON.parse(fs.readFileSync(X.repoPath(GUEST_REGISTRY, c.root), 'utf8')) as { status: string; note: string; entries: unknown[] };
  const callbacks = A.PROPOSALS.filter((p) => p.callback);
  const ambient = A.PROPOSALS.filter((p) => p.type === 'AMBIENT_RETURN');
  return [
    '# 09 — Living world and background cast audit',
    '',
    generatedNote(['shared/site00-fiction-production/audit/memoryInventory.ts', 'shared/site00-fiction-production/audit/proposals/livingWorld.ts', GUEST_REGISTRY]),
    '',
    PROPOSAL_NOTE,
    '',
    '## 1. Principles (section 13)',
    '',
    bullets([
      'People exist when the camera cuts away. A familiar face can simply be living their life.',
      'Not everyone is named, and nobody is given a biography here.',
      'Not everyone knows everyone. A returning face is not a connection to a principal.',
      'Not every familiar face is an Exchange member, and not every event is invitation-only. Anyone placed at an invited, staff, private or work venue has a stated route in.',
      'Returns add no dialogue, voice or name. Where someone speaks, it is a line the master already gives.',
      'New faces keep arriving. The city stays bigger than its recurring people.',
    ]),
    '',
    '## 2. People the season already reuses without saying so',
    '',
    table(['ID', 'Group', 'Master text', 'Note'], A.BACKGROUND_GROUPS.map((g) => [g.id, g.name, quoteList(g.appearances), g.note])),
    '',
    '## 3. Recurring guest registry',
    '',
    `\`${GUEST_REGISTRY}\` is ${registry.status} with ${registry.entries.length} entries ("${registry.note}"). The audit writes no entries. Section 4 is a proposed extension: each row becomes an entry only if the founder approves it.`,
    '',
    '## 4. Proposed registry extension (section 15)',
    '',
    table(
      ['Proposal', 'Recommendation', 'Class', 'Character reference', 'First', 'Last', 'Proposed return', 'Visual identifier', 'Wardrobe identifier', 'Gesture identifier', 'Location', 'Social context', 'Importance', 'Recognition', 'Venue and access', 'Speaks', 'Canon status', 'Founder approval', 'Asset reuse', 'Production dependency'],
      callbacks.map((p) => {
        const k = p.callback!;
        return [p.id, p.board, k.class, `\`${k.characterRef}\``, k.firstAppearance, k.lastAppearance, k.proposedReturn, k.visualId, k.wardrobeId, k.gestureId, k.location, k.socialContext, k.importance, k.recognition, `${k.venue}: ${k.accessRoute}`, k.speaks, 'NEW_PROPOSAL', 'PENDING', k.assetReuse, k.productionDependency];
      }),
    ),
    '',
    '## 5. Ambient returns',
    '',
    table(['ID', 'Title', 'Category', 'Recommendation', 'Placement', 'Proposal or reason', 'Waits on'], ambient.map((p) => [p.id, p.title, catName(p.category), p.board, p.placement, p.board === 'REJECT' ? p.rejectReason : p.proposed, list([...(p.blockedBy ?? []), ...(p.dependsOn ?? [])])])),
    '',
    '## 6. Callback density',
    '',
    'At most four recommended callbacks in a release, and at most two meant to be noticed. Rewatch and subliminal returns are the default.',
    '',
    table(['Release', 'Recommended callbacks', 'Meant to be noticed', 'Which'], densityRows()),
  ].join('\n');
}

/** Section 14's five directions, mapped to proposals. */
const S101_OPTIONS: Array<{ option: string; ask: string; ids: string[]; note: string }> = [
  { option: 'A', ask: 'The tailor at a later celebration in a tailored outfit, no dialogue.', ids: ['R-03', 'C-01'], note: 'R-03 returns him on the public far bank with the lapel gesture from SH03. Making him Wendell Ames (C-01) is held: FD-S101-07 recommends "No for now".' },
  { option: 'B', ask: 'The grandmother\'s jewel-green dress recognised in a crowd: the dress before the woman.', ids: ['R-02', 'R-01'], note: 'R-02 shows the dress first on the far bank. R-01 seats her on the S1-59 bench speaking the line the master already gives a grandmother.' },
  { option: 'C', ask: 'Tailor and grandmother at the same occasion, no interaction.', ids: ['R-02', 'R-03', 'W-01'], note: 'Both on the far bank at S1-77, never in the same shot. The far bank is a public party (W-01), so no invitation is implied.' },
  { option: 'D', ask: 'The teenager\'s step in an ordinary setting, with different confidence.', ids: ['S-02', 'R-04', 'R-14'], note: 'S-02 fixes the step as four counts (a choreography note, no shot change); R-04 lands it with the S1-51 drumline. R-14 is held.' },
  { option: 'E', ask: 'The balcony woman or the neighbour, only if it adds something and does not explain her away.', ids: ['R-12', 'R-11', 'R-13', 'S-01'], note: 'Only the neighbour\'s bookend (R-12) survives, held as an alternative to R-03. The woman stays anyone.' },
];

export function s101EggsDoc(c: Ctx): string {
  const touching = A.PROPOSALS.filter((p) => p.s101 || p.releases.includes('S1-01'));
  const forPerson = (personId: string) => A.PROPOSALS.filter((p) => p.callback?.characterRef === personId);
  const rel = new Set(['FD-S101-05', 'FD-S101-06', 'FD-S101-07', 'FD-S101-08']);
  return [
    '# 10 — S1-01 Easter egg and return opportunities',
    '',
    generatedNote([A.S101_PACKET, A.S101_DECISIONS, 'shared/site00-fiction-production/audit/proposals/livingWorld.ts', 'shared/site00-fiction-production/audit/proposals/worldAndEggs.ts']),
    '',
    PROPOSAL_NOTE,
    '',
    '## 1. S1-01 is in founder review and is not changed',
    '',
    bullets([
      `Packet \`${A.S101_PACKET}\`: status ${c.packet.status}; ${c.packet.duration}, ${c.packet.shots.length} shots, ${c.packet.keyframes} keyframes, ${c.packet.music.musicCues} music cues, ${c.packet.music.silenceCues} silence, ${c.packet.music.soundCues} sound cues. These are planning records, not approved.`,
      'Every idea below is a later appearance unless it says otherwise. The only S1-01 change recommended is S-02, a choreography note on SH05–SH07 that changes no shot, timing, keyframe or cue, and it waits on FD-S101-06.',
      'Returns of an S1-01 inhabitant change no shot, but they move that person from scene-scoped to recurring background. That tier change is the founder\'s FD-S101-06 decision, so each return carries a section 25 block.',
      'The S1-01 packet sha256 is checked on every render (deliverable 18).',
    ]),
    '',
    '## 2. The shots a return would reference',
    '',
    table(['Shot', 'Scene', 'Subject', 'Screen time', 'Referenced by'], c.packet.shots.map((s) => [s.shotId, s.sceneId, s.subject, s.intendedScreenTime, A.PROPOSALS.filter((p) => p.s101?.shots.includes(s.shotId)).map((p) => `${p.id} (${p.board})`).join(', ') || '—'])),
    '',
    '## 3. The five inhabitants',
    '',
    table(
      ['Person', 'Tier now', 'Returns proposed'],
      c.packet.people.map((p) => [`\`${p.personId}\``, p.tier, forPerson(p.personId).map((x) => `${x.id} ${x.title} (${x.board})`).join('<br>') || 'None: she stays anyone']),
    ),
    '',
    '## 4. Section 14 directions',
    '',
    table(['Direction', 'Sprint asked for', 'Proposals (recommendation)', 'How'], S101_OPTIONS.map((o) => [o.option, o.ask, o.ids.map((id) => `${id} (${A.proposalById(id).board})`).join(', '), o.note])),
    '',
    'None of these implies Exchange Night preparation. The grandmother\'s dress "has a date tonight" (SH10) is left unexplained; its return is a public occasion.',
    '',
    '## 5. Section 25 blocks',
    '',
    'For every proposal that touches S1-01: the approved-source versus draft distinction, the exact shots, the runtime effect, the assets, and founder approval before any packet revision.',
    '',
    table(
      ['Proposal', 'Recommendation', 'Source versus draft', 'Shots', 'S1-01 runtime effect', 'Assets', 'Founder approval'],
      touching.filter((p) => p.s101).map((p) => [p.id, p.board, p.s101!.sourceVsDraft, p.s101!.shots.join(', '), plusSec(p.s101!.runtimeEffectSec), p.s101!.assets, p.s101!.founderApproval]),
    ),
    '',
    '## 6. Other S1-01 ideas',
    '',
    table(['Proposal', 'Title', 'Category', 'Recommendation', 'Note'], touching.filter((p) => !p.s101).map((p) => [p.id, p.title, catName(p.category), p.board, p.board === 'REJECT' ? p.rejectReason : p.proposed])),
    '',
    '## 7. Founder decisions these wait on',
    '',
    table(
      ['Decision', 'Question', 'Packet recommendation', 'Status', 'Proposals waiting'],
      c.packet.decisions.filter((d) => rel.has(d.decisionId)).map((d) => [d.decisionId, d.question, d.recommendation, d.status, A.PROPOSALS.filter((p) => p.blockedBy?.includes(d.decisionId)).map((p) => p.id).join(', ') || '—']),
    ),
  ].join('\n');
}

const NIGHT_ELEMENTS: Array<[string, string[]]> = [
  ['Music', ['F-19', 'F-01', 'F-05']],
  ['Fashion', ['R-02', 'R-03', 'V-03']],
  ['Dance', ['R-09', 'R-04']],
  ['Food', ['R-18', 'F-02']],
  ['Hospitality', ['W-08', 'R-08']],
  ['Humour', ['T-07', 'T-06']],
  ['Entertainment and culture', ['W-01', 'V-07']],
  ['Friendship and reunions', ['F-01', 'R-06']],
  ['Discreet technology', ['T-11', 'T-12', 'F-07']],
];

function nightRuns(master: X.SeasonMaster) {
  const nights = master.releases.map((r) => r.exchangeNight);
  const runs: Array<{ night: boolean; from: string; to: string; length: number }> = [];
  master.releases.forEach((r, i) => {
    const last = runs[runs.length - 1];
    if (last && last.night === nights[i]) {
      last.to = r.id;
      last.length += 1;
    } else runs.push({ night: nights[i], from: r.id, to: r.id, length: 1 });
  });
  return runs;
}

function gapJoy(c: Ctx): string {
  const ids = c.master.releases.map((r) => r.id);
  const inGap = new Set(ids.slice(ids.indexOf('S1-51'), ids.indexOf('S1-66') + 1));
  return A.PROPOSALS.filter((p) => live(p) && inGap.has(p.releases[0]))
    .map((p) => `${p.id} (${p.releases[0]})`)
    .join(', ');
}

export function socialWorldDoc(c: Ctx): string {
  const nights = c.master.releases.filter((r) => r.exchangeNight);
  const gaps = nightRuns(c.master).filter((r) => !r.night).sort((a, b) => b.length - a.length);
  const social = A.PROPOSALS.filter((p) => p.type === 'SOCIAL_WORLDBUILDING');
  const placed = (r: string) => c.placedIn(r).map((p) => `${p.id} (${p.board})`).join(', ');
  return [
    '# 11 — Social world density and Exchange Nights audit',
    '',
    generatedNote(['shared/site00-fiction-production/audit/world.ts', X.EXCHANGE_PATHS.master, A.NIGHTS_REPAIR, 'THE_EXCHANGE/MANIFEST/EXCHANGE_NIGHTS_SOCIAL_EXPERIENCE_ADDENDUM_V1.md']),
    '',
    PROPOSAL_NOTE,
    '',
    '## 1. World density (section 16)',
    '',
    'Where the season already lives, quoted from the master, and what the audit adds. A layer with no additions is NO CHANGE RECOMMENDED.',
    '',
    table(
      ['Layer', 'Master text', 'Additions (recommendation)', 'Turned down', 'Note'],
      A.WORLD_DENSITY.map((w) => [w.layer, quoteList(w.appearances), w.additions.map((id) => `${id} (${A.proposalById(id).board})`).join(', ') || '—', list(w.rejected), w.note]),
    ),
    '',
    '## 2. Callback density',
    '',
    'No release carries more than four recommended callbacks or more than two meant to be noticed (deliverable 09, section 6). The city keeps adding new faces in every crowd scene.',
    '',
    table(['Release', 'Recommended callbacks', 'Meant to be noticed', 'Which'], densityRows()),
    '',
    '## 3. Exchange Nights, unchanged',
    '',
    `The master flags ${nights.length} releases as Exchange Night releases. The audit moves none of them and adds none.`,
    '',
    table(['Release', 'Title', 'Runtime', 'Setting', 'What makes it legendary (master payoff)', 'Audit proposals placed here'], nights.map((r) => [r.id, r.title, r.runtimeTarget, r.setting, r.payoff, placed(r.id) || 'NO CHANGE RECOMMENDED'])),
    '',
    '## 4. Gaps between Nights',
    '',
    table(['From', 'To', 'Releases without a Night'], gaps.map((g) => [g.from, g.to, g.length])),
    '',
    `The approved Nights repair (\`${A.NIGHTS_REPAIR}\`) records the same longest gaps, 19 (S1-21 to S1-39) and 16 (S1-51 to S1-66), and notes: "No Night between S1-06 and S1-66 exists purely for joy." Whether one should is open question U-2. Adding a Night (W-09) breaks the 86-release lock and is not recommended. Inside the 16-release gap the audit adds public joy instead: ${gapJoy(c)}.`,
    '',
    '## 5. What the Nights must feel like (section 17)',
    '',
    'Legendary parties, not networking or ceremony. The audit\'s additions by ingredient; none turns a device into a plot point.',
    '',
    table(['Ingredient', 'Proposals (recommendation)'], NIGHT_ELEMENTS.map(([k, ids]) => [k, ids.map((id) => `${id} ${A.proposalById(id).title} (${A.proposalById(id).board})`).join('<br>')])),
    '',
    '## 6. Social worldbuilding proposals',
    '',
    table(['ID', 'Title', 'Category', 'Recommendation', 'Placement', 'Proposal or reason', 'Runtime'], social.map((p) => [p.id, p.title, catName(p.category), p.board, p.placement, p.board === 'REJECT' ? p.rejectReason : p.proposed, plusSec(p.runtimeSec)])),
    '',
    `Season runtime stays ${secs(A.AUDIT_BASELINE_RUNTIME_SEC)} unless a REVISE item is adopted without a trim (deliverable 13). Proposals per release: ${Object.keys(countBy(A.PROPOSALS, (p) => p.releases[0])).length} releases have at least one idea placed in them.`,
  ].join('\n');
}
