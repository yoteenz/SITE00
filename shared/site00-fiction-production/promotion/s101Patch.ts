/**
 * The update the founder's decisions call for, written as a patch plan: each `before` is quoted from the packet the founder
 * reviewed, each `after` is what the packet says once the revision is accepted. The founder authorized all seven on
 * 2026-10-25 and they are applied: `applied.present` must now appear in the packet and `applied.absent` must not (the
 * validator checks both). Applying it changes no shot, frame, keyframe count, cue or runtime. Every S1-01 decision the
 * founder did not settle stays open.
 */
export type PatchItem = {
  patchId: string;
  authority: string[];
  /** The approved proposals this item serves. */
  proposals: string[];
  subject: string;
  targets: Array<{ sourceModule: string; generatedFile: string; locator: string }>;
  before: string[];
  after: string[];
  affects: string[];
  unchanged: string;
  status: 'PROPOSED_PENDING_FOUNDER_PACKET_REVIEW' | 'APPLIED_FOUNDER_AUTHORIZED';
  /** How the patch landed: exact packet strings that must now be present, `before` strings that must be gone, and any deviation. */
  applied?: { authority: string; date: string; present: string[]; absent: string[]; note?: string };
};

const PACKET = 'THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json';
const DECISIONS = 'shared/site00-fiction-production/scenes/s1-01/decisions.ts';
const SPATIAL = 'shared/site00-fiction-production/scenes/s1-01/spatial.ts';
const SHOTS = 'shared/site00-fiction-production/scenes/s1-01/shotsA.ts';
const BUILD = 'scripts/the-exchange/build-directorial-production.ts';
const JIT = 'shared/site00-fiction-production/jitCast.ts';
const NO_TIMING = 'No shot, frame, keyframe count, cue, dialogue or runtime changes.';
const STATUS = 'APPLIED_FOUNDER_AUTHORIZED' as const;
const AUTH = 'Founder sprint P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1 §03 A';
const applied = (present: string[], absent: string[], note?: string) => ({ authority: AUTH, date: '2026-10-25', present, absent, ...(note ? { note } : {}) });

export const S101_PATCH: PatchItem[] = [
  {
    patchId: 'PATCH-S101-01',
    authority: ['FD-S101-06 RECURRING'],
    proposals: ['R-01', 'R-02', 'R-03', 'R-04', 'S-02'],
    subject: 'Record the answer to FD-S101-06 and change the three inhabitants from scene-scoped to recurring background.',
    targets: [
      { sourceModule: DECISIONS, generatedFile: PACKET, locator: 'FOUNDER_DECISIONS › FD-S101-06 (section 9)' },
      { sourceModule: DECISIONS, generatedFile: PACKET, locator: 'EMBELLISHMENTS › E-09' },
    ],
    before: ["Approve the inhabitants' looks as planned (scene-scoped)?", 'Looks, ages and everyday wardrobe of the five inhabitants (scene-scoped, no permanent packages).'],
    after: [
      'FD-S101-06 status ANSWERED, answer "RECURRING (founder, 2026-10-25): the tailor, the grandmother and the teenager keep reusable recurring-background identities; the woman on the balcony and the neighbour stay scene-scoped."',
      'E-09: Looks, ages and everyday wardrobe of the five inhabitants. The tailor, the grandmother and the teenager are recurring background (FD-S101-06); the woman on the balcony and the neighbour are scene-scoped. The looks are approved with the start frames.',
    ],
    affects: ['S1-01-SH02', 'S1-01-SH03', 'S1-01-SH04', 'S1-01-SH05', 'S1-01-SH06', 'S1-01-SH07', 'S1-01-SH08', 'S1-01-SH09', 'S1-01-SH10', 'S1-01-SH17'],
    unchanged: NO_TIMING,
    status: STATUS,
    applied: applied([
      'RECURRING (founder, 2026-10-25): the tailor, the grandmother and the teenager keep reusable recurring-background identities; the woman on the balcony and the neighbour stay scene-scoped.',
      'Looks, ages and everyday wardrobe of the five inhabitants. The tailor, the grandmother and the teenager are recurring background (FD-S101-06); the woman on the balcony and the neighbour are scene-scoped. The looks are approved with the start frames.',
    ], ['Looks, ages and everyday wardrobe of the five inhabitants (scene-scoped, no permanent packages).'], 'The FD-S101-06 question keeps its original wording; the decision now reads ANSWERED with the founder\'s answer.'),
  },
  {
    patchId: 'PATCH-S101-02',
    authority: ['FD-S101-06 RECURRING'],
    proposals: ['R-01', 'R-02', 'R-03', 'R-04', 'S-02'],
    subject: 'Label the three recurring wardrobes and hair notes, and keep their start frames as identity references after S1-01.',
    targets: [
      { sourceModule: SHOTS, generatedFile: PACKET, locator: 'shots SH02 to SH10 and SH17 › wardrobe' },
      { sourceModule: SPATIAL, generatedFile: PACKET, locator: 'character states › hair' },
      { sourceModule: 'shared/site00-fiction-production/scenes/s1-01/keyframes.ts', generatedFile: 'THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/KEYFRAME_MANIFEST_V1.json', locator: 'KF-SF-SH02, KF-SF-SH05, KF-SF-SH09' },
    ],
    before: [
      'Tailor: shirtsleeves rolled twice, a waistcoat, a tape measure round the neck (scene-scoped)',
      'Teenager: hoodie open over a pressed shirt, clean sneakers (scene-scoped)',
      'Grandmother: house cardigan, reading glasses on a chain (scene-scoped)',
      "As fixed by the vignette's first start frame (scene-scoped, FD-S101-06)",
    ],
    after: [
      'Tailor: shirtsleeves rolled twice, a waistcoat, a tape measure round the neck (recurring background, FD-S101-06)',
      'Teenager: hoodie open over a pressed shirt, clean sneakers (recurring background, FD-S101-06)',
      'Grandmother: house cardigan, reading glasses on a chain (recurring background, FD-S101-06)',
      "For the tailor, the teenager and the grandmother: as fixed by the vignette's first start frame, kept as the identity reference for their later returns (recurring background, FD-S101-06). For the woman on the balcony and the neighbour: unchanged (scene-scoped).",
      'reusableBeyondUnit: KF-SF-SH02 (tailor) gains S1-77; KF-SF-SH05 (teenager) gains S1-51; KF-SF-SH09 (grandmother) gains S1-59 and S1-77. Still to be generated, and still blocked by the open S1-01 decisions.',
    ],
    affects: ['KF-SF-SH02', 'KF-SF-SH05', 'KF-SF-SH09'],
    unchanged: `${NO_TIMING} The woman on the balcony and the neighbour keep their scene-scoped labels.`,
    status: STATUS,
    applied: applied([
      'Tailor: shirtsleeves rolled twice, a waistcoat, a tape measure round the neck (recurring background, FD-S101-06)',
      'Teenager: hoodie open over a pressed shirt, clean sneakers (recurring background, FD-S101-06)',
      'Grandmother: house cardigan, reading glasses on a chain (recurring background, FD-S101-06)',
      "As fixed by the vignette's first start frame, kept as the identity reference for their later returns (recurring background, FD-S101-06)",
      'As fixed by her first face-readable start frame (KF-SF-SH10), kept as the identity reference for her later returns (recurring background, FD-S101-06)',
      "S1-77 (R-03): the tailor's identity reference, once this frame is generated and approved",
      "S1-51 (R-04): the teenager's identity reference, once this frame is generated and approved",
      "S1-59 (R-01): the grandmother's identity reference, once this frame is generated and approved",
      "S1-77 (R-02): the grandmother's identity reference, once this frame is generated and approved",
    ], [
      'Tailor: shirtsleeves rolled twice, a waistcoat, a tape measure round the neck (scene-scoped)',
      'Teenager: hoodie open over a pressed shirt, clean sneakers (scene-scoped)',
      'Grandmother: house cardigan, reading glasses on a chain (scene-scoped)',
    ], "Deviation: the plan named KF-SF-SH09 for the grandmother, but that frame shows only her hands (spec hides her face) and SH08 only the top of her head. Her reuse and identity reference sit on KF-SF-SH10, her first face-readable start frame. The woman on the balcony and the neighbour keep the scene-scoped hair note."),
  },
  {
    patchId: 'PATCH-S101-03',
    authority: ['FD-S101-06 RECURRING'],
    proposals: ['R-01', 'R-02', 'R-03', 'R-04', 'S-02'],
    subject: "Let the packet's cast section show the three as recurring background, without a principal package.",
    targets: [
      { sourceModule: BUILD, generatedFile: PACKET, locator: 'section 6 › cast.rule' },
      { sourceModule: JIT, generatedFile: PACKET, locator: 'section 6 › cast.people[].tier (season cast census)' },
    ],
    before: ['Scene-scoped inhabitants get performance direction and no permanent package (sprint V2 §28).', 'SCENE_SCOPED'],
    after: [
      'Inhabitants get performance direction. The tailor, the grandmother and the teenager keep an identity reference (face, wardrobe, mannerism) for their approved returns; no voice, biography or principal package. The woman on the balcony and the neighbour are scene-scoped.',
      'Census tier RECURRING_BACKGROUND for scene:S1-01:tailor, scene:S1-01:grandmother and scene:S1-01:teenager; SCENE_SCOPED for the other two.',
    ],
    affects: ['scene:S1-01:tailor', 'scene:S1-01:grandmother', 'scene:S1-01:teenager'],
    unchanged: NO_TIMING,
    status: STATUS,
    applied: applied([
      'Inhabitants get performance direction. The tailor, the grandmother and the teenager keep an identity reference (face, wardrobe, mannerism) for their approved returns; no voice, biography or principal package. The woman on the balcony and the neighbour are scene-scoped.',
      'RECURRING_BACKGROUND',
    ], ['Scene-scoped inhabitants get performance direction and no permanent package (sprint V2 §28).']),
  },
  {
    patchId: 'PATCH-S101-04',
    authority: ['FD-S101-07 ANONYMOUS'],
    proposals: ['R-03'],
    subject: 'Record the answer to FD-S101-07 and close E-10.',
    targets: [
      { sourceModule: DECISIONS, generatedFile: PACKET, locator: 'FOUNDER_DECISIONS › FD-S101-07 (section 9)' },
      { sourceModule: DECISIONS, generatedFile: PACKET, locator: 'EMBELLISHMENTS › E-10' },
    ],
    before: ['No for now: keep him scene-scoped and the shop sign unreadable so the choice stays open.', 'Whether the tailor is Wendell Ames, the Ferry Street tailor named later in the season.'],
    after: [
      'FD-S101-07 status ANSWERED, answer "No: an unnamed tailor (ANONYMOUS, founder, 2026-10-25)." The shop sign stays unreadable.',
      'E-10: The tailor is anonymous (FD-S101-07). He is not Wendell Ames and has no biography.',
    ],
    affects: ['S1-01-SH02', 'S1-01-SH03', 'S1-01-SH04'],
    unchanged: NO_TIMING,
    status: STATUS,
    applied: applied([
      'No: an unnamed tailor (ANONYMOUS, founder, 2026-10-25). The shop sign stays unreadable.',
      'The tailor is anonymous (FD-S101-07). He is not Wendell Ames and has no biography.',
    ], ['No for now: keep him scene-scoped and the shop sign unreadable so the choice stays open.', 'Whether the tailor is Wendell Ames, the Ferry Street tailor named later in the season.'], 'E-10 is labelled FOUNDER_DECIDED.'),
  },
  {
    patchId: 'PATCH-S101-05',
    authority: ['S-02 (P-11)', 'FD-S101-06 RECURRING'],
    proposals: ['S-02', 'R-04'],
    subject: "Attach the four-count step to the teenager's three shots.",
    targets: [{ sourceModule: SHOTS, generatedFile: PACKET, locator: 'shots SH05 to SH07 › a choreography note (new embellishment)' }],
    before: ['He tries a two-step turn and stumbles out of it.'],
    after: ['Choreography note on SH05 to SH07: one specific four-count step, missed, tangled, then landed on the downbeat (frame 324, E-06). The same four counts return in S1-51 (R-04). The step itself is still to be choreographed.'],
    affects: ['S1-01-SH05', 'S1-01-SH06', 'S1-01-SH07'],
    unchanged: `${NO_TIMING} E-06 keeps the downbeat at frame 324.`,
    status: STATUS,
    applied: applied([
      'Choreography note on SH05 to SH07: one specific four-count step, missed, tangled, then landed on the downbeat (frame 324, E-06). The same four counts return in S1-51 (R-04). The step itself is still to be choreographed.',
      'He tries the four-count step and stumbles out of it.',
      'CHOREOGRAPHY_LOCK_PENDING',
    ], ['He tries a two-step turn and stumbles out of it.'], "The note is embellishment E-14. The step's lock is open founder decision FD-S101-12, which also blocks KF-SF-SH05; SH06 and SH07 inherit the block. No move is invented."),
  },
  {
    patchId: 'PATCH-S101-06',
    authority: ['FD-S101-05 DRESS_DESIGN_LATER', 'R-02 (P-09)'],
    proposals: ['R-02'],
    subject: 'Record that the dress has a later callback, without choosing its design.',
    targets: [
      { sourceModule: DECISIONS, generatedFile: PACKET, locator: 'FOUNDER_DECISIONS › FD-S101-05 (section 9)' },
      { sourceModule: DECISIONS, generatedFile: PACKET, locator: 'EMBELLISHMENTS › E-08' },
    ],
    before: ['The design of the jewel-green dress.'],
    after: [
      'FD-S101-05 stays OPEN. Note: story continuity approved (founder, 2026-10-25); the design is chosen at S1-01 visual development, and the chosen garment is the one S1-77 uses (R-02). No candidate is chosen.',
      'E-08: The design of the jewel-green dress: one garment for SH08 to SH10, SH17 and the S1-77 callback. KF-WD-GREEN-DRESS stays blocked by FD-S101-05.',
    ],
    affects: ['KF-WD-GREEN-DRESS', 'S1-01-SH08', 'S1-01-SH09', 'S1-01-SH10', 'S1-01-SH17'],
    unchanged: `${NO_TIMING} KF-WD-GREEN-DRESS stays blocked and is not production-ready.`,
    status: STATUS,
    applied: applied([
      'Story continuity approved (founder, 2026-10-25); the design is chosen at S1-01 visual development, and the chosen garment is the one S1-77 uses (R-02). No candidate is chosen.',
      'VISUAL_DESIGN_PENDING',
      'The design of the jewel-green dress: one garment for SH08 to SH10, SH17 and the S1-77 callback. KF-WD-GREEN-DRESS stays blocked by FD-S101-05.',
    ], ['The design of the jewel-green dress.'], 'FD-S101-05 stays OPEN with progress STORY_CONTINUITY_APPROVED, VISUAL_DESIGN_PENDING.'),
  },
  {
    patchId: 'PATCH-S101-07',
    authority: ['R-01', 'R-02', 'R-03', 'R-04'],
    proposals: ['R-01', 'R-02', 'R-03', 'R-04'],
    subject: 'Name the later appearances in the continuity section, so the S1-01 frames are made knowing they will be reused.',
    targets: [{ sourceModule: 'shared/site00-fiction-production/scenes/s1-01/index.ts', generatedFile: PACKET, locator: 'section 6 › continuity (forward references)' }],
    before: [],
    after: ['Forward references: the grandmother in S1-59 (R-01, with her existing line) and S1-77 (R-02, in the jewel-green dress); the tailor in S1-77 (R-03); the teenager in S1-51 (R-04). None of them meet, and none is named.'],
    affects: ['S1-01-SC02', 'S1-01-SC03', 'S1-01-SC04'],
    unchanged: NO_TIMING,
    status: STATUS,
    applied: applied(['Forward references: the grandmother in S1-59 (R-01, with her existing line) and S1-77 (R-02, in the jewel-green dress); the tailor in S1-77 (R-03); the teenager in S1-51 (R-04). None of them meet, and none is named.'], [], 'Section 6 carries forwardReferences: the note plus one structured return per appearance, in the background register\'s wording.'),
  },
];

/** What the patch must not touch (founder §12). */
export const S101_GUARDS = {
  baseline: { durationSec: 45, shots: 19, frames: 1080, fps: 24, keyframes: 22, musicCues: 3, silences: 1, soundCues: 13 },
  untouchedEmbellishments: ['E-02', 'E-03', 'E-07'],
  stillOpen: ['FD-S101-01', 'FD-S101-02', 'FD-S101-03', 'FD-S101-04', 'FD-S101-05', 'FD-S101-08', 'FD-S101-09', 'FD-S101-10', 'FD-S101-11', 'FD-S101-12'],
  answeredBySprint: ['FD-S101-06', 'FD-S101-07'],
  /** Opened by the patch: the four-count step must be locked before the SH05 start frame (PATCH-S101-05). */
  addedByPatch: ['FD-S101-12'],
  notes: ["The Ember's look (E-02, E-03, FD-S101-03) is unchanged; the privacy rule WR-03 is not visual.", 'Halcyon House stays windows only (E-07, FD-S101-04).', 'No shot is added, the runtime stays 45 s, and no dialogue is added.'],
};
