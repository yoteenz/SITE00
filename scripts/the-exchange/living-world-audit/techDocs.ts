import * as X from '../../../shared/site00-fiction-production/index.js';
import { A, bullets, catName, citeLine, generatedNote, list, PROPOSAL_NOTE, table, type Ctx } from './md.js';

type Proposal = X.Audit.Proposal;
const SRC = ['shared/site00-fiction-production/audit/technology.ts', 'shared/site00-fiction-production/audit/inventions.ts', 'shared/site00-fiction-production/audit/proposals/technology.ts'];

const HARD_LIMITS: Array<{ rule: string; capability: X.Audit.ForbiddenCapability; source: string }> = [
  { rule: 'The Echo Archive cannot reconstruct unrecorded memories or consciousness.', capability: 'RECONSTRUCT_UNRECORDED_MEMORY', source: 'Sprint section 04; Bible 06 ("only stored, consented content").' },
  { rule: 'The Interval is not time travel and not communication with the dead.', capability: 'SPEAK_WITH_THE_DEAD', source: 'Bible 06: "Not time travel or communication with dead".' },
  { rule: 'The Interval is not time travel.', capability: 'TIME_TRAVEL', source: 'Bible 06.' },
  { rule: 'The Veil cannot guarantee honest intentions.', capability: 'GUARANTEE_HONEST_INTENT', source: 'Sprint section 04; Bible 06.' },
  { rule: 'The Relay cannot prove truth.', capability: 'PROVE_TRUTH', source: 'Bible 06: "Credential integrity doesn\'t prove message truth or goodwill".' },
  { rule: 'No technology retroactively solves a prior conflict.', capability: 'RETROACTIVE_FIX', source: 'Sprint section 04; Bible 06 invention dossier rule.' },
  { rule: 'No device finds a person who has not chosen to be found.', capability: 'LOCATE_A_PERSON', source: 'S1-15: "you don\'t follow one home".' },
  { rule: 'No device reads minds.', capability: 'READ_MINDS', source: 'Bible 06 (the Constellation "doesn\'t read minds").' },
];

const proposalRow = (p: Proposal) => [p.id, p.title, catName(p.category), p.board, p.releases[0], p.board === 'REJECT' ? p.rejectReason : p.proposed];

export function technologyAuditDoc(_c: Ctx): string {
  const techProposals = A.PROPOSALS.filter((p) => p.type === 'TECHNOLOGY');
  const blocks = A.EXISTING_TECHNOLOGY.map((t) =>
    [
      `### ${t.id} — ${t.name}`,
      '',
      table(
        ['Field', 'Audit'],
        [
          ['Origin', t.origin === 'BIBLE_06' ? 'Bible 06 system' : 'Season-native (in the master)'],
          ['Exact classification', t.exactClassification],
          ['Bible 06 definition', t.bibleDefinition],
          ['Bible 06 limit', t.bibleLimit],
          ['Appears in', t.appearsIn.join(', ') || 'Not on screen in Season 1'],
          ['On screen as', t.onScreenAs],
          ['Tier', t.tier],
          ['Unresolved specifications', t.unresolvedSpecs.join(' / ') || 'None'],
          ['Continuity dependencies', t.continuityDeps.join(' / ') || 'None'],
          ['Contradictions', t.contradictions.join(' / ') || 'None found'],
          ['Limits (shown or proposed)', t.limits.join(' / ') || 'None stated'],
          ['Visual', t.visual],
          ['Social implications', t.social],
          ['Enhancements', t.enhancements.map((id) => `${id} (${A.proposalById(id).board})`).join(', ') || 'None'],
          ['Verdict', t.verdict],
        ],
      ),
    ].join('\n'),
  );
  return [
    '# 03 — Existing technology capability audit',
    '',
    generatedNote(SRC),
    '',
    PROPOSAL_NOTE,
    '',
    'Section 04 asks about the seven Bible 06 systems. The season also puts nine other systems on screen; they are audited the same way so nothing that already exists is reinvented.',
    '',
    '## 1. Summary',
    '',
    table(
      ['ID', 'System', 'Tier', 'On screen in', 'Enhancements', 'Verdict'],
      A.EXISTING_TECHNOLOGY.map((t) => [t.id, t.name, t.tier, t.appearsIn.join(', ') || '—', list(t.enhancements), t.verdict]),
    ),
    '',
    '## 2. Hard limits and how they are protected',
    '',
    'The validator rejects any surviving proposal or invention that claims one of these capabilities. Every proposal that would need one is category E.',
    '',
    table(
      ['Rule', 'Capability code', 'Source', 'Rejected proposals that needed it'],
      HARD_LIMITS.map((h) => [h.rule, `\`${h.capability}\``, h.source, A.PROPOSALS.filter((p) => p.claims?.includes(h.capability)).map((p) => p.id).join(', ') || '—']),
    ),
    '',
    '## 3. System by system',
    '',
    blocks.join('\n\n'),
    '',
    '## 4. Technology proposals',
    '',
    table(['ID', 'Title', 'Category', 'Audit recommendation', 'Placement', 'Proposal or reason'], techProposals.map(proposalRow)),
    '',
    'Citations for each proposal are in deliverable 17 and in the 86-release matrix (02).',
  ].join('\n');
}

export function inventionRegisterJson(): string {
  return X.serializeJson({
    registerId: 'THE-EXCHANGE.S1.NEW-INVENTION-REGISTER.V1',
    auditId: A.AUDIT_ID,
    classification: 'NEW_PROPOSAL — NOT CANON. No candidate is approved; every price is UNKNOWN.',
    note: 'Section 05 candidates. Category follows the audit\'s A to E scale; approvalStatus stays NEW_PROPOSAL whatever the category. Bible 06 requires a full invention dossier before any device is approved.',
    fieldMap: {
      NAME: 'name',
      PURPOSE: 'purpose',
      'PHYSICAL APPEARANCE': 'appearance',
      'HOW PEOPLE USE IT': 'use',
      'OBSERVABLE EFFECT': 'observableEffect',
      'UNDERLYING SPECULATIVE MECHANISM': 'mechanism',
      'WHAT IT CANNOT DO': 'cannot',
      'FAILURE CONDITIONS': 'failure',
      'PRIVACY AND CONSENT IMPLICATIONS': 'privacy',
      'SOCIAL CONSEQUENCES': 'social',
      'ACCESSIBILITY / PRICE TIER': ['accessTier', 'priceTier'],
      'INSTITUTIONAL OR CIVIC STATUS': 'civicStatus',
      'VISUAL AND AUDIO SIGNATURE': 'signature',
      'NARRATIVE OPPORTUNITY': 'opportunity',
      'CONTINUITY RISK': 'continuityRisk',
      'APPROVAL STATUS': 'approvalStatus',
    },
    counts: { candidates: A.INVENTION_CANDIDATES.length, byCategory: Object.fromEntries(Object.keys(A.CATEGORIES).map((k) => [k, A.INVENTION_CANDIDATES.filter((n) => n.category === k).length])) },
    candidates: A.INVENTION_CANDIDATES,
  });
}

type Example = { id: string; action: string; result: string; reaction: string; infer: string; explained: string };

/** Worked examples. `id` is a proposal, or SOURCE for behaviour the master already has. */
const EXAMPLES: Example[] = [
  { id: 'SOURCE S1-01', action: 'A neighbour lifts a phone toward a woman dancing.', result: 'The lens glows copper. (The draft screenplay adds: "The music stops dead.")', reaction: 'He lowers it, embarrassed; she raises a glass to him and keeps dancing.', infer: 'The city has an everyday no, and it is honoured.', explained: 'Never in S1-01.' },
  { id: 'SOURCE S1-15', action: 'Tina writes her letter on Relay paper.', result: 'The card goes blank in her hand.', reaction: 'Tina: "Did it just—" Sloane: "It\'s not ours anymore."', infer: 'Only the person it is meant for can read it.', explained: 'Only by Sloane\'s one line.' },
  { id: 'T-01', action: 'Celestine writes three lines to Richard.', result: 'The ink sinks into the card while her pen is still lifted.', reaction: 'She lets it go out of frame.', infer: 'Once sent, the words are his, not hers.', explained: 'Never. It rhymes with S1-15.' },
  { id: 'T-03', action: 'The Echo line makes its first run down lane four.', result: 'It thins to nothing for two strides on the bend.', reaction: 'Nobody comments.', infer: 'The archive can only draw what the 1985 camera saw.', explained: 'Never.' },
  { id: 'T-07', action: 'Two kids raise an old phone and shout "Yes?".', result: 'A grown-up who walks into the game glows copper.', reaction: 'Everyone laughs; he does not know why.', infer: 'Children play with the rule the way they play with any rule.', explained: 'Never.' },
  { id: 'T-12', action: 'A lantern flickers copper during rigging (S1-59).', result: 'The same lantern flickers the same pattern before the failure (S1-76).', reaction: 'Nobody on screen connects them.', infer: 'The old rig\'s memory was in the system all along.', explained: 'S1-76 explains the failure; nobody explains the flicker.' },
  { id: 'T-06', action: 'Sloane eats cake while her hair sets.', result: 'A ring of warm air floats behind her, humming.', reaction: 'Gideon moves it aside to reach the coffee.', infer: 'The Halo is as ordinary as a hood dryer.', explained: 'Never.' },
  { id: 'W-08', action: 'Guests arrive at the River Hall doors.', result: 'Staff greet each by name before any key appears.', reaction: 'Mavis leaves her key in her hatband.', infer: 'The door knows the list; the key is a keepsake (T-09).', explained: 'Never.' },
  { id: 'F-04', action: 'Dee stands at the track as Zuri says nobody wants to race her.', result: 'We hear a 1985 stadium crowd; later the Echo Track runs in silence.', reaction: 'Dee says nothing.', infer: 'The archive holds pictures, not her memory. The crowd is hers alone.', explained: 'Never.' },
];

const CHANNELS: Array<[string, string]> = [
  ['Glance', 'Honora glances at Kai\'s dulled pin (T-08, held).'],
  ['Touch', 'Gideon moves the Halo aside (T-06).'],
  ['Photograph', 'The booth strip with a copper friend (T-21, held); Celestine\'s one consented photograph (S1-67, source).'],
  ['Jewellery and accessories', 'Gold thread that warms when the wearer chooses (NI-04, Season 2 reserve).'],
  ['Gesture', 'A cousin turns his phone over at the cookout (S1-64, source).'],
  ['Mistake', 'A grown-up walks into copper tag (T-07).'],
  ['Dance', 'The Echo Track runs a race, not a dance; dance floors stay human (T-17 rejected).'],
  ['Performance', 'A light on the stage turns gold for Sloane\'s words only (S1-75, source; T-10).'],
  ['Embarrassment', 'The S1-01 neighbour lowering his phone (source).'],
  ['Refusal', 'Copper wax returned unbroken (V-07).'],
  ['Object transformation', 'Ink sinking into Relay paper (T-01).'],
  ['Altered visual result', 'A gap in the Echo line where the footage looked away (T-03).'],
];

const DOMAINS: Array<[string, string, string, string]> = [
  ['Jewellery', 'None in Season 1.', 'NI-04 gold thread (Season 2 reserve).', 'Do not retrofit principals\' approved jewellery (U-4).'],
  ['Accessories', 'Kai\'s Threshold has no visible form.', 'T-08 brass pin (held).', 'Only if the founder wants the Threshold visible at all.'],
  ['Tailoring', 'Wendell Ames\'s tailoring (S1-06, S1-72).', 'NI-02 fitting glass (Season 2 reserve).', 'Never in Sloane\'s closet: her dance test is analogue and defines her.'],
  ['Eveningwear', 'The Ember\'s gold, chosen per guest at the Grand Exchange.', 'None new.', 'Not every stylish object is technology.'],
  ['Objects', 'Relay paper, the Halo, lanterns.', 'T-01, T-06, T-12.', 'No gadget to fill a shot (T-19 rejected).'],
  ['Invitations', 'Cream paper, copper wax, brass keys.', 'V-07, T-09, W-08.', 'Invitations stay personal and cannot be bought (Invitation Culture addendum).'],
  ['Music systems', 'The Hush.', 'NI-05 an origin (Season 2 reserve).', 'Its origin is not a Season 1 story.'],
  ['Installations', 'The lantern rig; Kai\'s consent lights.', 'T-11, T-12, T-05.', 'Keep hand-scale gold small so S1-77 is the first civic gold.'],
  ['Architecture', 'The River Hall, Halcyon House.', 'None.', 'No retrofitted architecture without approval.'],
  ['Hospitality', 'Staff, couriers, the door.', 'W-08, R-08.', 'People, not screens, greet guests.'],
];

const TIERS: Record<X.Audit.TechTier, { who: string }> = {
  CIVIC: { who: 'Everyone has it and nobody thinks about it. Children play with it (T-07). The S1-01 grandmother remembers the city before the Ember; the teenager has never known one without it. People who bear the consequences: anyone who wants to be seen and forgets to say yes.' },
  PROFESSIONAL: { who: 'Supervised, more expensive, used by trades and institutions: the Exchange\'s paper, the Echo Archive, the Threshold. A tailor uses trade equipment and may refuse it on principle (NI-02); a patron receives the Exchange\'s paper and never sees how it is made. Abuse looks like Royce reading public signals too well (S1-43).' },
  LEGACY_EXPERIMENTAL: { who: 'Old or one-off systems with known dangers: the pavilion rig and its memory, the Pledge tokens. Understood by its makers only. Its failure (S1-76) is a story event, and its erasure is permanent by design.' },
};

export function revelationGuideDoc(_c: Ctx): string {
  const rejected = A.PROPOSALS.filter((p) => p.type === 'TECHNOLOGY' && p.board === 'REJECT');
  const exampleRow = (e: Example) => {
    const p = e.id.startsWith('SOURCE') ? null : A.proposalById(e.id);
    return [e.id, p ? p.board : 'Already in the source; no proposal', e.action, e.result, e.reaction, e.infer, e.explained];
  };
  return [
    '# 05 — Behavioural technology revelation guide',
    '',
    generatedNote([...SRC, 'scripts/the-exchange/living-world-audit/techDocs.ts']),
    '',
    PROPOSAL_NOTE,
    '',
    'A writing and directing guide for Season 1 screenplays still planned from the master. It describes how the season already reveals technology, so later drafts can match it. It changes no draft.',
    '',
    '## 1. The pattern',
    '',
    bullets([
      'Ordinary action: someone does something any person might do (writes, lifts a phone, sits for a hair set).',
      'Extraordinary result: the world answers in a way ours would not (ink sinks, a lens blooms copper).',
      'Natural reaction: the character treats it as normal, or is mildly embarrassed. Nobody gasps.',
      'Audience inference: the viewer works out the rule from behaviour.',
      'Explanation later or never. If it comes, it comes from a person with a reason to say it, not from a screen.',
    ]),
    '',
    '## 2. Rules for later drafts',
    '',
    bullets([
      'People stay at the centre of the frame. A device is never the subject of a shot unless the master makes it one (S1-40\'s Echo Track, S1-76\'s rig).',
      'No holograms, glitch effects, floating interfaces or blue light. The season\'s signatures are copper, gold, paper, wax, brass and hum.',
      'Not every invention is about surveillance, identity or control. Some are funny (copper tag), petty, romantic, inconvenient or ordinary (the Halo).',
      'Every device states what it cannot do (Bible 06). The audit\'s season rules T-02, T-09, T-10, T-11 and T-13 write those limits down.',
      'No device fixes the past. S1-77 adds a yes going forward; S1-76 erases a record for good.',
      'Not every detail needs a payoff, and not every stylish object is technology.',
      'Do not retrofit approved wardrobe or architecture with technology without founder approval (U-4).',
    ]),
    '',
    '## 3. Worked examples',
    '',
    table(['From', 'Audit recommendation', 'Ordinary action', 'Extraordinary result', 'Natural reaction', 'What the audience infers', 'Explained'], EXAMPLES.map(exampleRow)),
    '',
    '## 4. Channels of revelation',
    '',
    table(['Channel', 'Season 1 instance or proposal'], CHANNELS),
    '',
    '## 5. Technology as fashion and culture (section 07)',
    '',
    table(['Domain', 'Already in Season 1', 'Proposal or candidate', 'Caution'], DOMAINS),
    '',
    '## 6. Tiers (section 08)',
    '',
    'These are directions for writers, not approved scenes.',
    '',
    table(
      ['Tier', 'Season 1 systems', 'Who affords, understands, maintains, rejects, abuses and bears the consequences'],
      (Object.keys(TIERS) as X.Audit.TechTier[]).map((tier) => [tier, A.EXISTING_TECHNOLOGY.filter((t) => t.tier === tier).map((t) => t.name).join('; '), TIERS[tier].who]),
    ),
    '',
    '## 7. What not to do',
    '',
    'Rejected technology proposals, each with its reason. They show the guide\'s limits in practice.',
    '',
    table(['ID', 'Idea', 'Why not'], rejected.map((p) => [p.id, p.proposed, p.rejectReason])),
    '',
    '## 8. Citations for the examples',
    '',
    bullets(EXAMPLES.filter((e) => !e.id.startsWith('SOURCE')).flatMap((e) => A.proposalById(e.id).cites.map((c) => `${e.id} — ${citeLine(c)}`))),
  ].join('\n');
}
