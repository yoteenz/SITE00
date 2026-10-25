import * as X from '../../../shared/site00-fiction-production/index.js';
import { BOARD_KEY } from './impactDocs.js';
import { compactMatrix, releaseVerdict } from './matrix.js';
import { A, BOARD_ORDER, bullets, CLOSING, countBy, citeRef, generatedNote, list, plusSec, PROPOSAL_NOTE, secs, table, waitsOn, type Ctx } from './md.js';

type Proposal = X.Audit.Proposal;
const live = (p: Proposal) => p.board === 'APPROVE' || p.board === 'REVISE';
const byBoard = (b: X.Audit.BoardAction) => A.PROPOSALS.filter((p) => p.board === b);
const placementCites = (p: Proposal) => p.cites.filter((x) => x.releaseId === p.releases[0]).map(citeRef).join('; ') || p.placement;
const fromS101 = (p: Proposal) => Boolean(p.s101) || Boolean(p.callback?.characterRef.startsWith('scene:S1-01:'));

/** Release IDs grouped by verdict. */
export function releaseVerdicts(c: Ctx) {
  const of = (v: ReturnType<typeof releaseVerdict>) => c.master.releases.filter((r) => releaseVerdict(c, r.id) === v).map((r) => r.id);
  return { enhanced: of('ENHANCE'), continuity: of('CONTINUITY'), heldOnly: of('HELD'), noChange: of('NO_CHANGE') };
}

function part1(c: Ctx): string {
  const v = releaseVerdicts(c);
  const cats = countBy(A.PROPOSALS, (p) => p.category);
  return [
    '## Part 1. Executive findings',
    '',
    `The audit read all ${c.master.releases.length} releases (${c.index.totals.scenes} scenes, ${c.index.releases.reduce((n, r) => n + r.beats.length, 0)} beats), ${A.EXISTING_TECHNOLOGY.length} technologies already in the season, the knowledge ledger and the S1-01 packet. It wrote ${A.PROPOSALS.length} proposals and ${A.INVENTION_CANDIDATES.length} invention candidates. It recommends ${byBoard('APPROVE').length} outright and ${byBoard('REVISE').length} after a change, holds ${byBoard('HOLD').length} and rejects ${byBoard('REJECT').length}. Adopting every outright recommendation keeps ${c.master.releases.length} releases and ${secs(A.AUDIT_BASELINE_RUNTIME_SEC)}. No canon file, screenplay, Fountain draft or directorial packet was changed.`,
    '',
    '### What already works and should be left alone',
    '',
    bullets([
      'The season already reveals technology through behaviour. In S1-01 a neighbour\'s lens glows copper and he lowers it, embarrassed; in S1-15 Tina\'s card goes blank and Sloane says only "It\'s not ours anymore." Later drafts should copy this, not explain it.',
      'Memory already lives in speech, paper and sound. The master has two pictures of the past (S1-58 and S1-77). The audit keeps it that way.',
      'The city already has background life the master never labels: night-shift nurses, couriers, barbers, market people, church communities, kids. The audit names ten such groups and gives a few of them one recurring face.',
      'The reveal order is tight. Every fact reaches the audience in the release the ledger names, and no proposal moves one.',
      `${v.noChange.length} releases get NO CHANGE RECOMMENDED. That is a judgment, recorded release by release, not a gap.`,
    ]),
    '',
    '### Strongest opportunities',
    '',
    bullets([
      'Write down the rules the season already obeys, before the remaining screenplays are drafted: the Relay (T-02), what the Ember governs (T-10), the gold ladder (T-11), the brass key (T-09), the Threshold (T-13).',
      'Let sound carry memory: the fruit truck (F-01), Dee\'s 1985 crowd (F-04), Yaz\'s laugh (F-05), Clarence\'s two bars (F-19), and one honest grammar for the two flashbacks (F-06, F-07).',
      'Give the climax a public: the far bank as the city\'s own party (W-01), with S1-01\'s grandmother, tailor and teenager returning without a word, a name or a connection (R-01 to R-04, S-02).',
      'Plant before paying off: copper wax that holds until S1-86 (V-07), the lantern flicker before the failure (T-12).',
    ]),
    '',
    '### What stays exactly as it is',
    '',
    bullets([
      'Every arc, relationship and the direction of Sloane\'s story. Vivienne\'s outcome and its timing.',
      'No new relatives, murders, conspiracies, betrayals or hidden identities. Patron cases are untouched.',
      `All ${c.master.releases.filter((r) => r.exchangeNight).length} Exchange Night releases stay where they are. No Night is added.`,
      'The S1-01 packet (45 s, 19 shots, 22 keyframes) is unchanged. One choreography note (S-02) is proposed, and it waits on the founder.',
      'No technology fixes the past, reads a mind, finds a person, proves a message true, or lets anyone speak with the dead.',
    ]),
    '',
    '### Counts',
    '',
    table(
      ['Measure', 'Count'],
      [
        ['Releases audited', `${A.RELEASE_JUDGMENTS.length} of ${c.master.releases.length}`],
        ['Releases with a recommendation placed in them', v.enhanced.length],
        ['Releases that must stay consistent with a recommendation placed elsewhere', v.continuity.length],
        ['Releases with only a held idea', v.heldOnly.length],
        ['Releases with NO CHANGE RECOMMENDED', v.noChange.length],
        ['Proposals', A.PROPOSALS.length],
        ...Object.entries(A.CATEGORIES).map(([k, name]) => [`Category ${k} (${name})`, cats[k] ?? 0]),
        ['Existing technologies reviewed', A.EXISTING_TECHNOLOGY.length],
        ['New invention candidates', A.INVENTION_CANDIDATES.length],
        ['Places where the sources disagree', A.SOURCE_DISCREPANCIES.length],
        ['Validator checks passing', `${c.checks.filter((k) => !k.errors.length).length} of ${c.checks.length}`],
      ],
    ),
  ].join('\n');
}

/** One labelled block per proposal rather than a table: the before and after texts are paragraphs, and the founder reads on a phone. */
function beforeAfter(id: string): string {
  const p = A.proposalById(id);
  const line = (s: string) => s.replace(/\r?\n/g, ' ');
  return [
    `#### ${p.id} (${p.board})`,
    '',
    `- **Where:** ${line(p.placement)}`,
    `- **Before:** ${line(p.current)}`,
    `- **After:** ${line(p.proposed)}`,
    `- **Runtime:** ${plusSec(p.runtimeSec)} · **Waits on:** ${waitsOn(p)}`,
  ].join('\n');
}

function part2(): string {
  const blocks = A.PRIORITIES.map((pr) => [`### ${pr.id}. ${pr.title}`, '', pr.why, '', pr.proposals.map(beforeAfter).join('\n\n')].join('\n'));
  return [
    '## Part 2. The twelve priorities, before and after',
    '',
    'Ratings and written reasons on all ten section 22 dimensions are in deliverable 14. Citations are in deliverable 17.',
    '',
    blocks.join('\n\n'),
  ].join('\n');
}

function part3(): string {
  return [
    '## Part 3. Technology',
    '',
    'Section 04\'s seven Bible 06 systems and nine more that the season puts on screen, audited the same way (deliverable 03).',
    '',
    table(['System', 'Tier', 'On screen in', 'Enhancements', 'Verdict'], A.EXISTING_TECHNOLOGY.map((t) => [t.name, t.tier, t.appearsIn.join(', ') || '—', list(t.enhancements), t.verdict])),
    '',
    'Hard limits held throughout: the Echo Archive cannot reconstruct unrecorded memory; the Interval is not time travel or talk with the dead; the Veil cannot guarantee honest intent; the Relay cannot prove truth; nothing fixes the past. Every idea that needed one of these is rejected.',
    '',
    '### New invention candidates',
    '',
    'None is approved. Every price is UNKNOWN. Bible 06 requires a full invention dossier before any device is used.',
    '',
    table(['ID', 'Name', 'Category', 'Narrative opportunity', 'Used by'], A.INVENTION_CANDIDATES.map((n) => [n.id, n.name, `${n.category} — ${A.CATEGORIES[n.category]}`, n.opportunity, list(n.proposalIds)])),
  ].join('\n');
}

function part4(): string {
  const mem = A.PROPOSALS.filter((p) => p.type === 'SENSORY_FLASHBACK');
  const kept = mem.filter((p) => p.board !== 'REJECT');
  const rejected = mem.filter((p) => p.board === 'REJECT');
  const whose = (p: Proposal) => (p.memory ? (p.memory.memoryType ? `${p.memory.pov} (${p.memory.memoryType})` : 'The film\'s own voice') : '—');
  return [
    '## Part 4. Sensory memory',
    '',
    'Sound carries memory; the picture stays in the present except where the master already has a flashback. Every moment names whose memory it is, and that person witnessed it (deliverables 06 to 08).',
    '',
    table(['ID', 'Title', 'Recommendation', 'Release', 'Scene and beat', 'Mode', 'Whose memory'], kept.map((p) => [p.id, p.title, p.board, p.releases[0], placementCites(p), p.memory?.mode ?? '—', whose(p)])),
    '',
    `${rejected.length} memory ideas are rejected, mostly because they would put a writers'-room fact on screen, give Vivienne a voice, or spend a reveal early: ${rejected.map((p) => p.id).join(', ')}.`,
  ].join('\n');
}

function part5(c: Ctx): string {
  const s101 = A.PROPOSALS.filter(fromS101);
  const payoffs = A.PROPOSALS.filter((p) => live(p) && p.callback && !fromS101(p));
  const quiet = A.WORLD_DENSITY.filter((w) => !w.additions.length).map((w) => w.layer);
  return [
    '## Part 5. Living world',
    '',
    '### S1-01 inhabitants',
    '',
    `The tailor, teenager, grandmother, woman on the balcony and neighbour are scene-scoped in the packet (${c.packet.people.map((p) => p.tier).filter((t, i, a) => a.indexOf(t) === i).join(', ')}). A return changes no S1-01 shot but needs the founder\'s FD-S101-06 tier decision. The woman on the balcony stays anyone.`,
    '',
    table(['ID', 'Title', 'Recommendation', 'Returns in', 'Recognition', 'Waits on'], s101.map((p) => [p.id, p.title, p.board, p.releases[0], p.callback?.recognition ?? '—', waitsOn(p)])),
    '',
    '### Background continuity already in the master',
    '',
    table(['Group', 'Releases', 'Note'], A.BACKGROUND_GROUPS.map((g) => [g.name, [...new Set(g.appearances.map((a) => a.releaseId))].join(', '), g.note])),
    '',
    '### Cross-release payoffs',
    '',
    table(['ID', 'Title', 'Recommendation', 'Releases', 'Recognition'], payoffs.map((p) => [p.id, p.title, p.board, p.releases.join(', '), p.callback!.recognition])),
    '',
    `No release carries more than four recommended callbacks or more than two meant to be noticed. World layers left as they are: ${quiet.join(', ')} (deliverable 11).`,
  ].join('\n');
}

function part6(c: Ctx): string {
  const v = releaseVerdicts(c);
  return [
    '## Part 6. All 86 releases',
    '',
    `${v.enhanced.length} releases have a recommendation placed in them. ${v.continuity.length} have none, but must stay consistent with one placed elsewhere (an origin, or a prop that has to match). ${v.heldOnly.length} have only a held idea, and ${v.noChange.length} are NO CHANGE RECOMMENDED. The full matrix, with every opportunity type per release, is deliverable 02.`,
    '',
    compactMatrix(c),
  ].join('\n');
}

function part7(c: Ctx): string {
  const sum = (ps: Proposal[]) => ps.reduce((n, p) => n + p.runtimeSec, 0);
  const approve = byBoard('APPROVE');
  const costs = countBy(approve, (p) => p.impact?.generationCost ?? 'NO_CHANGE');
  const costly = approve.filter((p) => p.impact && (p.impact.generationCost === 'HIGHER' || p.impact.generationCost === 'UNKNOWN'));
  const rules = A.PROPOSALS.filter((p) => p.category === 'C');
  const decisions = countBy(A.PROPOSALS.filter((p) => p.board !== 'REJECT').flatMap((p) => p.blockedBy ?? []), (d) => d);
  const protectedCheck = c.checks.find((k) => k.id === 'PROTECTED_FILES')!;
  return [
    '## Part 7. Runtime, cost and canon impact',
    '',
    table(
      ['Scenario', 'Runtime'],
      [
        ['Baseline', `${secs(A.AUDIT_BASELINE_RUNTIME_SEC)} across ${c.master.releases.length} releases`],
        [`Adopt all ${approve.length} APPROVE items`, `${secs(A.AUDIT_BASELINE_RUNTIME_SEC + sum(approve))} (${plusSec(sum(approve))})`],
        ...byBoard('REVISE').map((p) => [`Also adopt ${p.id} without a trim`, `${plusSec(p.runtimeSec)}; the audit asks for the seconds to come from the same release`]),
      ],
    ),
    '',
    `Cost direction across the APPROVE items: ${Object.entries(costs).map(([k, n]) => `${k} ${n}`).join(', ')}. No price is estimated. Items that raise cost or have an unknown cost: ${costly.map((p) => `${p.id} (${p.impact!.generationCost}: ${p.impact!.note})`).join('; ')}.`,
    '',
    '### Canon impact',
    '',
    table(['ID', 'Season rule', 'Recommendation', 'Canon impact'], rules.map((p) => [p.id, p.title, p.board, p.canonImpact])),
    '',
    table(['Open decision', 'Surviving proposals waiting on it'], Object.entries(decisions).sort().map(([d, n]) => [d, n])),
    '',
    bullets([
      `Protected files: ${protectedCheck.errors.length ? `CHANGED — ${protectedCheck.errors.join('; ')}` : `all ${protectedCheck.checked} unchanged (master, nine S1-01 packet files, five Fountain drafts)`}.`,
      `Five places where the sources disagree are recorded with both quotes and a governing source (deliverable 01): ${A.SOURCE_DISCREPANCIES.map((d) => `${d.id} (${d.issue.replace(/\.$/, '')})`).join('; ')}.`,
      'No provider job was dispatched. No ElevenLabs or OpenArt credit was spent.',
    ]),
  ].join('\n');
}

function part8(): string {
  const rows: Record<X.Audit.BoardAction, (p: Proposal) => Array<string | number>> = {
    APPROVE: (p) => [p.id, p.title, p.releases[0], plusSec(p.runtimeSec), waitsOn(p), 'PENDING'],
    REVISE: (p) => [p.id, p.title, p.releases[0], plusSec(p.runtimeSec), p.founderDecision, 'PENDING'],
    HOLD: (p) => [p.id, p.title, p.releases[0], plusSec(p.runtimeSec), p.category === 'D' ? `Season 2: ${p.futureImpact}` : `${p.founderDecision}${p.blockedBy?.length ? ` Waits on ${list(p.blockedBy)}.` : ''}`, 'PENDING'],
    REJECT: (p) => [p.id, p.title, p.releases[0], plusSec(p.runtimeSec), p.rejectReason ?? '', 'PENDING'],
  };
  const lastColumn: Record<X.Audit.BoardAction, string> = { APPROVE: 'Waits on', REVISE: 'What must change', HOLD: 'Why held', REJECT: 'Why not' };
  return [
    '## Part 8. Approval board',
    '',
    'The board shows the audit\'s recommendation. The founder\'s decision on every item is PENDING. Nothing is applied until the founder decides; the full records are in deliverable 16.',
    '',
    ...BOARD_ORDER.flatMap((b) => [
      `### ${b} (${byBoard(b).length})`,
      '',
      BOARD_KEY[b],
      '',
      table(['ID', 'Title', 'Placement', 'Runtime', lastColumn[b], 'Founder decision'], byBoard(b).map(rows[b])),
      '',
    ]),
    CLOSING,
  ].join('\n');
}

export function founderReviewDoc(c: Ctx): string {
  return [
    '# 00 — Founder review: Season 1 living-world audit',
    '',
    generatedNote(['shared/site00-fiction-production/audit/', X.EXCHANGE_PATHS.master, A.SCENE_INDEX, A.S101_PACKET]),
    '',
    PROPOSAL_NOTE,
    '',
    `Sprint \`${A.AUDIT_SPRINT_ID}\`. Canon read at \`${A.AUDIT_BASELINE_COMMIT}\` (head of PR #1692).`,
    '',
    part1(c),
    '',
    part2(),
    '',
    part3(),
    '',
    part4(),
    '',
    part5(c),
    '',
    part6(c),
    '',
    part7(c),
    '',
    part8(),
  ].join('\n');
}
