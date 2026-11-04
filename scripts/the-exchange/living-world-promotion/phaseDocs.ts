import { A, BANNER, CLOSING, generatedNote, P, promotionBlock, SRC, table, type Ctx } from './md.js';

const phase = (k: 'A' | 'B' | 'C') => P.PROMOTIONS.filter((p) => p.phase === k);
const head = (n: string, title: string, sources: string[]) => [`# ${n} — ${title}`, '', generatedNote(sources), '', BANNER, ''];
const evidenceTable = (w: X_Rule) =>
  table(['Release', 'Master text', 'Reading'], [...w.evidence.map((e) => [e.releaseId, `"${e.quote}"`, e.reading]), ...w.notGoverned.map((e) => [e.releaseId, `"${e.quote}"`, `Not governed: ${e.reading}`])]);
type X_Rule = (typeof P.WORLD_RULES)[number];

function ruleBlock(w: X_Rule): string[] {
  return [
    `### ${w.ruleId}. ${w.subject} (${w.proposalIds.join(', ')})`,
    '',
    ...w.statement.map((s) => `> ${s}`),
    '',
    `- **Cannot:** ${w.cannot.join('; ')}.`,
    `- **Scope:** ${w.scope}`,
    `- **Named in the briefs of:** ${w.appliesTo.join(', ')}`,
    '',
    evidenceTable(w),
    '',
  ];
}

export function technologyDoc(): string {
  return [
    ...head('04', 'Technology and physical rules (phase A)', [SRC.promotion, SRC.master]),
    'Promoted in this order: V-07, T-02, T-10, T-11, T-12, then T-01 after T-02. Each rule keeps its limits; none adds a power or a release.',
    '',
    '## 1. Season rules',
    '',
    ...P.WORLD_RULES.filter((w) => w.proposalIds.some((id) => P.PHASE[id] === 'A')).flatMap(ruleBlock),
    '## 2. The six promotions',
    '',
    phase('A').map(promotionBlock).join('\n\n'),
    '',
    CLOSING,
  ].join('\n');
}

export function sensoryDoc(): string {
  const memory = phase('B').map((p) => ({ p, m: A.proposalById(p.proposalId).memory! }));
  return [
    ...head('05', 'Sensory memory and audio continuity (phase B)', [SRC.promotion, SRC.master]),
    'Creative and screenplay directions only. No sound, score or recording is made, and no composition becomes canon.',
    '',
    '## 1. Whose memory, and what it may show',
    '',
    table(
      ['Proposal', 'Mode', 'Kind of memory', 'Whose', 'Witnessed', 'Reveals', 'Premature reveal'],
      memory.map(({ p, m }) => [p.proposalId, m.mode, m.memoryType ?? 'Not a memory (a motif)', m.pov ?? '—', m.povWitnessed, m.revealsFacts.join(', ') || 'Nothing', m.prematureReveal]),
    ),
    '',
    'Only F-06 and F-07 are visual, and both sit in releases the master already defines as memories (S1-58, S1-77 beat 8). Every other approved memory is sound.',
    '',
    ...P.WORLD_RULES.filter((w) => w.proposalIds.some((id) => P.PHASE[id] === 'B')).flatMap(ruleBlock),
    '## 2. Registered sound identities',
    '',
    table(['Motif', 'From', 'Name', 'Placements', 'Composition', 'Status'], P.SOUND_MOTIFS.map((m) => [m.motifId, m.proposalIds.join(', '), m.name, m.placements.map((x) => `${x.releaseId}: ${x.use}`).join('<br>'), m.composition, m.status])),
    '',
    '## 3. The six promotions',
    '',
    phase('B').map(promotionBlock).join('\n\n'),
    '',
    CLOSING,
  ].join('\n');
}

export function livingWorldDoc(c: Ctx): string {
  const appearances = P.BACKGROUND_IDENTITIES.flatMap((b) => b.approvedAppearances.map((a) => [b.identityId, b.label, a.releaseId, c.master.releases.find((r) => r.id === a.releaseId)!.title, a.placement, a.proposalId, `${a.venue}: ${a.access}`]));
  return [
    ...head('06', 'Living world (phase C)', [SRC.promotion, SRC.registry, SRC.master]),
    'Promoted in this order: W-01 before R-02 and R-03, S-02 before R-04; R-01 and R-05 have no dependency. Every return is in a public place, needs no invitation, and adds no name, line or relationship.',
    '',
    '## 1. Approved returns',
    '',
    table(['Identity', 'Who', 'Release', 'Title', 'Where', 'Proposal', 'Access'], appearances),
    '',
    '## 2. Guards',
    '',
    '- The far bank (W-01) is the city\'s own party, not the private Night; nobody there is implied to have Exchange access.',
    "- The tailor (R-03) and the grandmother (R-02) are separate moments in the far-bank coverage. No shared shot or interaction is required or implied, and they do not know each other.",
    '- The tailor is anonymous: no name, no shop sign, no orange (FD-S101-07). C-01 is not applied.',
    '- The grandmother speaks only the existing S1-59 line. R-01-ALT is not applied and no second grandmother exists.',
    "- The teenager's step (S-02) returns only in S1-51 (R-04). R-14's S1-69 return is not approved. Sloane's four beats at the end of S1-51 stay her own.",
    "- The girl from Kai's workshop (R-05) gets nothing beyond her S1-22 source and her S1-59 bike: no name, no line, no new tie to Kai.",
    '',
    '## 3. The seven promotions',
    '',
    phase('C').map(promotionBlock).join('\n\n'),
    '',
    CLOSING,
  ].join('\n');
}
