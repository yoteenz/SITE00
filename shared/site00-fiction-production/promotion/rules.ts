/**
 * Season rules and sound motifs promoted from the founder-approved proposals. Statements keep the approved wording,
 * limits included. `evidence` quotes are verbatim master text; the validator re-reads them. A rule adds no release.
 */
export type Evidence = { releaseId: string; quote: string; reading: string };

export type WorldRule = {
  ruleId: string;
  proposalIds: string[];
  subject: string;
  statement: string[];
  cannot: string[];
  scope: string;
  appliesTo: string[];
  evidence: Evidence[];
  /** Text in the master that looks related but is not governed by the rule. */
  notGoverned: Evidence[];
  classification: 'APPROVED_DEVELOPMENT_DIRECTION';
};

export const WORLD_RULES: WorldRule[] = [
  {
    ruleId: 'WR-01',
    proposalIds: ['V-07'],
    subject: 'Copper wax',
    statement: [
      'Every Exchange envelope carries a copper wax seal (the rule S1-17 states for Exchange paper).',
      "No seal is broken on screen until S1-86. Celestine's opening there is the season's only on-screen break, and the only time the seal-crack sound is heard.",
    ],
    cannot: ['Show a seal breaking in any release but S1-86', 'Use the seal-crack sound anywhere else'],
    scope: "Exchange envelopes and Exchange paper: Vivienne's C. R. envelope, Sloane's Living Legacy invitation to Celestine, the makers' terms and other Exchange invitations. Letters, cards and notes are ordinary paper and carry no rule; Relay paper has its own (WR-02).",
    appliesTo: ['S1-07', 'S1-11', 'S1-17', 'S1-57', 'S1-78', 'S1-86'],
    evidence: [
      { releaseId: 'S1-17', quote: 'sealed in copper wax', reading: 'The source of the rule. The makers read their terms, so the terms are shown already opened.' },
      { releaseId: 'S1-07', quote: 'He puts it back face down.', reading: 'Envelope unopened; seal intact.' },
      { releaseId: 'S1-11', quote: "a courier returns it to Sloane's office, unopened", reading: 'Seal unbroken.' },
      { releaseId: 'S1-57', quote: 'She doesn\'t open it.', reading: 'Seal intact.' },
      { releaseId: 'S1-78', quote: 'Celestine holds it without opening it.', reading: 'Seal intact.' },
      { releaseId: 'S1-86', quote: 'Celestine opens the envelope.', reading: 'The one on-screen break.' },
    ],
    notGoverned: [
      { releaseId: 'S1-20', quote: "The invitation has one line: *Dress like it's 1986.*", reading: 'An Exchange invitation read by guests; no opening is shown, so no seal breaks on screen.' },
      { releaseId: 'S1-13', quote: 'With it she sends a handwritten letter', reading: "Sloane's own letter: ordinary paper." },
      { releaseId: 'S1-52', quote: 'Sloane writes Celestine a card by hand.', reading: 'A posted card: ordinary paper, no envelope seal.' },
    ],
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
  },
  {
    ruleId: 'WR-02',
    proposalIds: ['T-02', 'T-01'],
    subject: 'Relay',
    statement: [
      '1. "Relay" is the paper; a message on it is "a Relay".',
      '2. It is blank to everyone except its addressee, including the person who wrote it.',
      '3. It never finds anyone: people carry it, as the sewing circle does.',
      "4. It proves nothing about the truth of the message or the sender's goodwill, and it gives no receipt.",
    ],
    cannot: ['Locate, track or deliver to a recipient', 'Prove that a message is true or that its sender means well', 'Give a receipt', 'Stay readable to its writer once written'],
    scope: 'Every Relay in Season 1, and every later use of Relay paper.',
    appliesTo: ['S1-15', 'S1-34', 'S1-86'],
    evidence: [
      { releaseId: 'S1-15', quote: "Relay paper, which stays blank for everyone except the person it's meant for", reading: 'Rule 2.' },
      { releaseId: 'S1-15', quote: 'The card goes blank in Tina\'s hand.', reading: 'Rule 2: blank to its own writer. T-01 repeats this effect in S1-86.' },
      { releaseId: 'S1-15', quote: "you don't follow one home", reading: 'Rule 3 is the culture as well as the paper.' },
      { releaseId: 'S1-34', quote: 'The blank Relay card travels hand to hand around the sewing circle.', reading: 'Rule 3: people carry it.' },
      { releaseId: 'S1-34', quote: "In Ophelia Grant's hand, Tina's writing blooms.", reading: 'Rule 2: readable only to its addressee.' },
      { releaseId: 'S1-86', quote: 'She sends one Relay, to Richard', reading: 'Rule 1 naming. T-01: it blanks in her hand; no courier or delivery is shown.' },
    ],
    notGoverned: [{ releaseId: 'S1-40', quote: "Dee's 1985 relay teammates", reading: 'A track relay team, not the device.' }],
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
  },
  {
    ruleId: 'WR-03',
    proposalIds: ['T-10'],
    subject: 'The Ember governs capture, not memory',
    statement: ['The Ember governs devices. It does not stop anyone hearing, remembering or repeating.'],
    cannot: ['Stop hearing', 'Stop remembering', 'Stop human speech', 'Stop human repetition', 'Stop gossip'],
    scope: 'Season rule. Shown once, without explanation, at the end of S1-75. The S1-54 breach stays a human leak.',
    appliesTo: ['S1-75'],
    evidence: [
      { releaseId: 'S1-01', quote: 'The lens glows copper: the Ember, the city\'s everyday "no."', reading: 'A device declines; the neighbour still saw her.' },
      { releaseId: 'S1-54', quote: 'repeated it to his boss to impress him', reading: 'The breach travels by mouth, which the Ember never governed.' },
      { releaseId: 'S1-75', quote: 'The light returns to copper.', reading: 'Where the room is shown repeating her words.' },
    ],
    notGoverned: [],
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
  },
  {
    ruleId: 'WR-04',
    proposalIds: ['T-11'],
    subject: 'Gold: hand, room, city',
    statement: [
      'Hand scale: a person makes a light bloom gold for themselves in one room (S1-22, S1-30).',
      'Room scale: a host asks a room for consented capture under one gold light (S1-75).',
      "City scale: gold binds the city's capture to revocation (S1-77), and is made public under Celestine's name (S1-82).",
      'Only the city scale is new in Season 1. Before S1-77, gold never binds anyone outside the room.',
    ],
    cannot: ['Bind anyone outside the room before S1-77', 'Act as unlimited consent', 'Surveil', 'Read minds', 'Exercise social control'],
    scope: "A writers' reading rule, never explained on screen. It does not move the S1-58 reveal of the Ember's authors (KF-06).",
    appliesTo: ['S1-22', 'S1-30', 'S1-75', 'S1-77', 'S1-82'],
    evidence: [
      { releaseId: 'S1-22', quote: 'Kai teaches four kids to make a light that blooms when you choose to let it.', reading: 'Hand.' },
      { releaseId: 'S1-30', quote: 'The child makes the light bloom gold.', reading: 'Hand, in one ward.' },
      { releaseId: 'S1-75', quote: 'a light on the stage turns gold', reading: 'Room.' },
      { releaseId: 'S1-77', quote: 'On the far bank, crowds see the gold, and their capture is bound to revocation.', reading: 'City: the first time gold reaches past the room.' },
      { releaseId: 'S1-82', quote: 'Celestine gives the *yes* to the city under her own name.', reading: 'City, made public.' },
    ],
    notGoverned: [
      { releaseId: 'S1-26', quote: 'Somebody once designed a second state. Gold.', reading: 'History told in a lecture, not a use.' },
      { releaseId: 'S1-65', quote: "Celestine's revised design is fully revocable.", reading: 'The design before the night; it binds no one yet.' },
      { releaseId: 'S1-67', quote: 'Kai, alone, switches one lantern to gold, then back to copper.', reading: 'A rehearsal test by its builder; it binds no one.' },
    ],
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
  },
  {
    ruleId: 'WR-05',
    proposalIds: ['T-12'],
    subject: 'The lantern that flickers',
    statement: [
      'The lantern that flickers copper on its own in S1-59 is one specific lantern in a fixed position on the promenade.',
      'A moment before the S1-76 failure, the same lantern flickers the same copper pattern. Nobody says so. On rewatch, the S1-59 flicker was the old record already in the system.',
    ],
    cannot: ['Explain the flicker on screen', 'Reveal the failure before S1-76', 'Change what the failure is'],
    scope: 'S1-59 and S1-76 only.',
    appliesTo: ['S1-59', 'S1-76'],
    evidence: [
      { releaseId: 'S1-59', quote: 'One lantern flickers copper on its own, then goes dark.', reading: 'The first flicker.' },
      { releaseId: 'S1-76', quote: "The old rig's memory still holds the first pavilion's consent keys", reading: 'The failure the flicker anticipates, unchanged.' },
      { releaseId: 'S1-76', quote: 'The promenade, alone among a thousand lanterns.', reading: 'The same place.' },
    ],
    notGoverned: [{ releaseId: 'S1-67', quote: 'Kai, alone, switches one lantern to gold, then back to copper.', reading: 'A deliberate switch, not the flicker.' }],
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
  },
  {
    ruleId: 'WR-06',
    proposalIds: ['F-04'],
    subject: 'The Echo Track is silent',
    statement: ['The Echo Track is silent: it carries light, not sound.', "Dee's remembered 1985 crowd is her memory alone. The archive behind the Echo Track holds footage, never anyone's memory."],
    cannot: ['Play sound', "Recreate a memory, a mind or anything the archive's footage did not record"],
    scope: 'S1-37 (the memory) and S1-40 (the track).',
    appliesTo: ['S1-37', 'S1-40'],
    evidence: [
      { releaseId: 'S1-40', quote: "the Echo Track, a pale line of light that runs Dee's 1985 record stride for stride, drawn from the city's archive footage of her own race", reading: 'Light, from footage.' },
      { releaseId: 'S1-37', quote: 'Dee has been stretching the whole time.', reading: 'Where only Dee hears the 1985 crowd.' },
    ],
    notGoverned: [],
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
  },
  {
    ruleId: 'WR-07',
    proposalIds: ['F-06', 'F-07'],
    subject: 'Two witnesses, two flashbacks',
    statement: [
      "The season has two visual memories, both already in the master: S1-58 (Richard's recollection) and S1-77 (Celestine's).",
      "S1-58 is shot from the garage doorway, where Richard stood; what he did not witness appears as objects, not scenes. S1-77 is shot from inside the dance. Same set, costumes and faces; different camera positions.",
    ],
    cannot: ['Add a visual flashback', "Show what a memory's owner did not witness as a scene", 'Reveal anything before the release the knowledge ledger names'],
    scope: 'S1-58 and S1-77.',
    appliesTo: ['S1-58', 'S1-77'],
    evidence: [
      { releaseId: 'S1-58', quote: "A memory moment, explicitly Richard's recollection, warm and imperfect", reading: 'The master already defines S1-58 as a memory.' },
      { releaseId: 'S1-58', quote: 'Celestine found out from a newspaper.', reading: 'Not witnessed by Richard: the newspaper appears as an object.' },
      { releaseId: 'S1-77', quote: "A memory flash, in Celestine's recollection: two young women dancing in a garage under the first gold light.", reading: 'The master already defines S1-77 beat 8 as a memory.' },
    ],
    notGoverned: [],
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
  },
];

export type SoundMotif = { motifId: string; proposalIds: string[]; name: string; placements: Array<{ releaseId: string; use: string }>; composition: string; status: 'PENDING_DESIGN' | 'PENDING_PRODUCTION' };

/** Registered sound identities. No composition, recording or cue exists; nothing here is a canonical piece of music. */
export const SOUND_MOTIFS: SoundMotif[] = [
  { motifId: 'MO-01', proposalIds: ['F-01'], name: 'The fruit-truck song', placements: [{ releaseId: 'S1-12', use: 'Thin, on a truck radio, under one line' }, { releaseId: 'S1-20', use: 'Full big-band arrangement: the slow number Clarence counts off' }], composition: 'Not chosen. One song, chosen or commissioned once for both releases (founder choice).', status: 'PENDING_DESIGN' },
  { motifId: 'MO-02', proposalIds: ['F-05'], name: "Yaz's real laugh", placements: [{ releaseId: 'S1-33', use: 'Once, on air, through the bakery radio' }, { releaseId: 'S1-50', use: 'The laugh Tad recognizes' }], composition: 'A performance, not a sound effect: the same take or the same performer in both releases.', status: 'PENDING_PRODUCTION' },
  { motifId: 'MO-03', proposalIds: ['F-19'], name: "Clarence's two bars", placements: [{ releaseId: 'S1-20', use: 'Clarence plays; Noelle writes it down' }, { releaseId: 'S1-35', use: "Inside Noelle's melody; Clarence hears his phrase" }, { releaseId: 'S1-74', use: 'The trumpet section carries it' }, { releaseId: 'S1-82', use: "Closes the Crescent Room's Saturdays" }], composition: 'Not written. The composer writes the two bars once and carries them into Noelle\'s melody.', status: 'PENDING_DESIGN' },
  { motifId: 'MO-04', proposalIds: ['F-07'], name: 'The hum of the first gold light', placements: [{ releaseId: 'S1-59', use: "The lanterns' hum the grandmother hears (\"They're humming.\")" }, { releaseId: 'S1-77', use: "The lanterns' hum becomes the garage light's hum" }], composition: 'Not designed.', status: 'PENDING_DESIGN' },
  { motifId: 'MO-05', proposalIds: ['V-07'], name: 'The seal crack', placements: [{ releaseId: 'S1-86', use: 'Once, the only time it is heard' }], composition: 'Not designed.', status: 'PENDING_DESIGN' },
  { motifId: 'MO-06', proposalIds: ['F-04'], name: "Dee's 1985 crowd and starter's pistol", placements: [{ releaseId: 'S1-37', use: 'Faint, under the dusk track; only Dee hears it' }], composition: 'Not recorded. Never heard in S1-40.', status: 'PENDING_PRODUCTION' },
  { motifId: 'MO-07', proposalIds: ['F-06'], name: 'Needle drop and needle lift', placements: [{ releaseId: 'S1-58', use: 'In and out of the memory' }], composition: 'Not recorded.', status: 'PENDING_PRODUCTION' },
];
