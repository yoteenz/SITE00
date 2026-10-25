import type { Keyframe, KeyframeSpec } from '../../directorial/types.js';
import { WD } from './shot.js';

type K = Omit<Keyframe, 'output' | 'reusableBeyondUnit' | 'blockedBy' | 'essential' | 'derivesFrom' | 'candidates'> & Partial<Keyframe>;
const kf = (k: K): Keyframe => ({ essential: true, derivesFrom: [], candidates: 1, reusableBeyondUnit: [], blockedBy: [], ...k, output: null });
const spec = (s: Partial<KeyframeSpec> & Pick<KeyframeSpec, 'cameraAngle' | 'shotScale'>): KeyframeSpec => ({
  characterPlacement: 'Nobody featured', expression: 'None', wardrobe: 'None', lighting: '', architecture: '', propOwnership: 'None', visible: [], hidden: [], ...s,
});

const GOLDEN = 'LS-GOLDEN: low sun from the west, copper on glass, warm stone, long shadows east';
const LAST = 'LS-LAST-LIGHT: sun just below the roofline, warm bounce off brick, first interior lamps';
const BLUE = 'LS-BLUE-HOUR: blue sky, warm practical windows, street lamps on; no gold anywhere';
const STREET = 'East-west brownstone street; glass tower at the west end of the north side';
/** Approved returns of the recurring inhabitants (PATCH-S101-02). A planned reuse, not an asset: the frame is not generated. */
const RETURN = {
  TAILOR_S177: 'S1-77 (R-03): the tailor\'s identity reference, once this frame is generated and approved',
  TEENAGER_S151: 'S1-51 (R-04): the teenager\'s identity reference, once this frame is generated and approved',
  GRANDMOTHER_S159: 'S1-59 (R-01): the grandmother\'s identity reference, once this frame is generated and approved',
  GRANDMOTHER_S177: 'S1-77 (R-02): the grandmother\'s identity reference, once this frame is generated and approved',
} as const;
const sf = (n: string, usedBy: string, derivesFrom: string[], candidates: number, title: string, s: KeyframeSpec, extra: Partial<Keyframe> = {}) =>
  kf({ keyframeId: `KF-SF-SH${n}`, kind: 'START_FRAME', title, usedBy: [usedBy], source: 'GENERATE', derivesFrom, candidates, spec: s, ...extra });

/** Nine reference images, fifteen generated start frames, two frames taken from approved footage. No principal appears, so no character reference is needed. */
export const KEYFRAMES: Keyframe[] = [
  kf({ keyframeId: 'KF-ENV-CITY-DUSK-A', kind: 'ENVIRONMENT_REFERENCE', title: 'North side of the street at golden hour (also the SH01 start frame)', usedBy: ['S1-01-SH01'], source: 'GENERATE', candidates: 2,
    noReferenceJustification: 'SET-CITY-DUSK has no approved establishing angle. The founder chooses how the street is seeded: a founder-supplied photograph or a look-development frame (FD-S101-08).',
    blockedBy: ['FD-S101-08'], reusableBeyondUnit: ['Any release on SET-CITY-DUSK'],
    spec: spec({ cameraAngle: 'High, looking east along the street', shotScale: 'Wide', lighting: GOLDEN, architecture: `${STREET}; tailor shop, fire escapes and a fourth-floor balcony on the north side`,
      visible: ['glass tower (copper reflection)', 'brownstone stoops', 'street lamps', 'tailor shop grille', 'third-floor fire-escape rail', 'fourth-floor balcony ledge'], hidden: ['Halcyon House', 'any principal', 'any readable signage brand'] }) }),
  kf({ keyframeId: 'KF-ENV-CITY-DUSK-B', kind: 'ENVIRONMENT_REFERENCE', title: 'South side of the street: bus shelter and the neighbour\'s window', usedBy: [], source: 'GENERATE', derivesFrom: ['KF-ENV-CITY-DUSK-A'],
    reusableBeyondUnit: ['Any release on SET-CITY-DUSK'],
    spec: spec({ cameraAngle: 'Eye level from the north pavement looking south', shotScale: 'Wide', lighting: `${GOLDEN}; frames that derive from it set their own state`, architecture: `${STREET}; bus shelter and a second-floor window with a reading lamp on the south side`,
      visible: ['bus shelter glass', "neighbour's window frame", 'street lamps'], hidden: ['the glass tower', 'Halcyon House'] }) }),
  kf({ keyframeId: 'KF-ENV-HALCYON-EXT', kind: 'ENVIRONMENT_REFERENCE', title: 'Halcyon House ballroom windows across the rooftops (SH18 end frame)', usedBy: ['S1-01-SH18'], source: 'GENERATE', candidates: 2,
    derivesFrom: ['KF-ENV-CITY-DUSK-A'], blockedBy: ['FD-S101-04'], reusableBeyondUnit: ['S1-02 to S1-05 arrivals, once an exterior is approved'],
    spec: spec({ cameraAngle: 'Level across the rooftops, looking east', shotScale: 'Wide', lighting: `${BLUE}; tall ballroom windows glow amber`,
      architecture: 'Water towers and roofs in silhouette; one row of tall arched or rectangular ballroom windows lit on the far side (window shape is a founder choice)',
      visible: ['water towers', 'Halcyon House ballroom windows'], hidden: ['facade detail', 'roofline silhouette of the hotel', 'signage', 'front steps and door'] }) }),
  kf({ keyframeId: 'KF-WD-GREEN-DRESS', kind: 'WARDROBE_REFERENCE', title: "The grandmother's jewel-green dress", usedBy: [], source: 'GENERATE', candidates: 2,
    noReferenceJustification: 'No wardrobe design exists (U-4). The founder approves the design before any frame uses it (FD-S101-05).', blockedBy: ['FD-S101-05'],
    spec: spec({ cameraAngle: 'Straight on, dress hanging', shotScale: 'Full length of the dress', wardrobe: WD.DRESS, lighting: LAST, architecture: 'Neutral brick behind',
      visible: ['the whole dress', 'neckline', 'hem'], hidden: ['a wearer'] }) }),
  kf({ keyframeId: 'KF-EMBER-LOOK', kind: 'PROP_REFERENCE', title: "The Ember on the neighbour's phone lens", usedBy: [], source: 'GENERATE', candidates: 2,
    noReferenceJustification: 'No approved visual reference for the Ember exists; the source fixes only its function and colour (soft copper glow, capture declined). The founder approves the look (FD-S101-03).',
    blockedBy: ['FD-S101-03'], reusableBeyondUnit: ['Every release that shows the Ember; S1-58 adds the gold state'],
    spec: spec({ cameraAngle: 'Front three-quarter on a phone camera lens', shotScale: 'Extreme close', lighting: `${BLUE}; the copper glow is the brightest thing in frame`,
      architecture: 'None', propOwnership: "Neighbour's phone (PR-NEIGHBOUR-PHONE, design required)", visible: ['lens ring', 'soft copper glow'], hidden: ['any gold tone', 'any logo'] }) }),

  sf('02', 'S1-01-SH02', ['KF-ENV-CITY-DUSK-A'], 2, 'Tailor reaching for the grille', spec({ cameraAngle: 'Eye level, three-quarter front from west of the door', shotScale: 'Medium full',
    characterPlacement: 'Tailor frame left, arms up to the grille', expression: 'Focused, end-of-day calm', wardrobe: WD.TAILOR, lighting: GOLDEN, architecture: 'Shopfront, grille up, mannequin in the window',
    propOwnership: 'Grille up', visible: ['tailor shop grille', 'mannequin in the window'], hidden: ['the bus stop'] }), { reusableBeyondUnit: [RETURN.TAILOR_S177] }),
  sf('03', 'S1-01-SH03', ['KF-SF-SH02'], 1, 'Hands on the lapel through the window', spec({ cameraAngle: 'Chest height through the window glass', shotScale: 'Medium close',
    characterPlacement: 'Hands entering frame left', expression: 'Face cropped', wardrobe: WD.TAILOR, lighting: GOLDEN, architecture: 'Window glass with street reflection, grille half down at top of frame',
    propOwnership: 'Grille half down', visible: ['mannequin in the window', 'tailor shop grille'], hidden: [] })),
  sf('04', 'S1-01-SH04', ['KF-SF-SH02'], 1, 'Side-on shopfront, grille half down', spec({ cameraAngle: 'Eye level, side-on from the west', shotScale: 'Medium',
    characterPlacement: 'Tailor frame right, hand on the grille', expression: 'Satisfied', wardrobe: WD.TAILOR, lighting: GOLDEN, architecture: 'Shopfront along frame', propOwnership: 'Grille half down', visible: ['tailor shop grille'], hidden: [] })),
  sf('05', 'S1-01-SH05', ['KF-ENV-CITY-DUSK-B'], 2, 'Teenager and his reflection at the shelter', spec({ cameraAngle: 'Waist height behind his shoulder toward the shelter glass', shotScale: 'Medium full',
    characterPlacement: 'Teenager frame right, reflection frame left', expression: 'Concentrating', wardrobe: WD.TEENAGER, lighting: GOLDEN, architecture: 'Bus shelter glass and the street behind it', visible: ['bus shelter glass'], hidden: ['other people waiting'] }), { reusableBeyondUnit: [RETURN.TEENAGER_S151], blockedBy: ['FD-S101-12'] }),
  sf('06', 'S1-01-SH06', ['KF-SF-SH05'], 1, 'Sneakers on the kerb', spec({ cameraAngle: 'Ground level, side-on', shotScale: 'Insert', characterPlacement: 'Feet centre', wardrobe: WD.TEENAGER, lighting: GOLDEN, architecture: 'Kerb and pavement', visible: ['sneakers', 'kerb'], hidden: ['his face'] })),
  kf({ keyframeId: 'KF-SF-SH07', kind: 'START_FRAME', title: 'Landing take starts where the first attempt ended', usedBy: ['S1-01-SH07'], source: 'EXTRACT_FROM_APPROVED_FOOTAGE', candidates: 0, spec: null, extractFrom: { shotId: 'S1-01-SH05', position: 'LAST_FRAME' } }),
  sf('08', 'S1-01-SH08', ['KF-ENV-CITY-DUSK-A', 'KF-WD-GREEN-DRESS'], 1, 'Dress held above the fire-escape rail', spec({ cameraAngle: 'Street level looking up at the third floor', shotScale: 'Medium wide',
    characterPlacement: 'Grandmother\'s arms and the top of her head above the rail', expression: 'Not readable', wardrobe: `${WD.DRESS}; ${WD.GRANDMOTHER}`, lighting: LAST, architecture: 'Brownstone brick, third-floor fire escape',
    propOwnership: 'Dress in her hands, folded', visible: ['third-floor fire-escape rail', 'the dress'], hidden: [] })),
  sf('09', 'S1-01-SH09', ['KF-SF-SH08', 'KF-WD-GREEN-DRESS'], 1, 'Hands on the hanging skirt', spec({ cameraAngle: 'Rail height, side-on along the rail', shotScale: 'Close',
    characterPlacement: 'Hands entering frame left', wardrobe: `${WD.DRESS}; ${WD.GRANDMOTHER}`, lighting: LAST, architecture: 'Fire-escape rail', propOwnership: 'Dress hanging on the rail', visible: ['third-floor fire-escape rail', 'skirt'], hidden: ['her face'] })),
  sf('10', 'S1-01-SH10', ['KF-SF-SH08', 'KF-WD-GREEN-DRESS'], 2, "Grandmother's look at the dress", spec({ cameraAngle: 'Her eye level, three-quarter front', shotScale: 'Medium close',
    characterPlacement: 'Face frame right, dress soft frame left', expression: 'Quiet approval with a trace of mischief', wardrobe: `${WD.DRESS}; ${WD.GRANDMOTHER}`, lighting: LAST, architecture: 'Fire escape, window behind her',
    propOwnership: 'Dress hanging on the rail', visible: ['third-floor fire-escape rail'], hidden: [] }), { reusableBeyondUnit: [RETURN.GRANDMOTHER_S159, RETURN.GRANDMOTHER_S177] }),
  sf('11', 'S1-01-SH11', ['KF-ENV-CITY-DUSK-A'], 2, 'Woman dancing through the balcony door, glass on the ledge', spec({ cameraAngle: 'Balcony height from outside, straight into the kitchen', shotScale: 'Medium wide',
    characterPlacement: 'Woman right of centre inside the door frame', expression: 'Eyes half closed, pleased', wardrobe: WD.WOMAN, lighting: LAST, architecture: 'Fourth-floor balcony on a converted brownstone, open door, small kitchen',
    propOwnership: 'Glass on the ledge; spoon in her right hand', visible: ['fourth-floor balcony ledge', 'open balcony door', 'wine glass', 'wooden spoon'], hidden: [] })),
  sf('12', 'S1-01-SH12', ['KF-SF-SH11'], 1, 'Woman mid-twirl', spec({ cameraAngle: 'Her eye level, three-quarter front', shotScale: 'Medium close',
    characterPlacement: 'Face centre', expression: 'Laughing to herself', wardrobe: WD.WOMAN, lighting: LAST, architecture: 'Kitchen interior, door frame edge', propOwnership: 'Spoon in her right hand', visible: ['wooden spoon'], hidden: ['wine glass'] })),
  sf('13', 'S1-01-SH13', ['KF-ENV-CITY-DUSK-B'], 2, 'Neighbour at his window, phone at his side', spec({ cameraAngle: 'His eye level from outside the window, three-quarter front', shotScale: 'Medium',
    characterPlacement: 'Neighbour frame right, looking screen left', expression: 'Idle amusement', wardrobe: WD.NEIGHBOUR, lighting: BLUE, architecture: 'Second-floor window, reading lamp behind',
    propOwnership: 'Phone in his hand, lowered', visible: ["neighbour's window frame", 'phone'], hidden: ['her balcony'] })),
  sf('14', 'S1-01-SH14', ['KF-SF-SH13', 'KF-EMBER-LOOK'], 1, 'Phone lens before the bloom', spec({ cameraAngle: 'Front three-quarter on the lens', shotScale: 'Extreme close',
    characterPlacement: 'Fingers soft at frame edge', lighting: BLUE, architecture: 'None', propOwnership: "Neighbour's phone, raised", visible: ['lens ring'], hidden: ['his face', 'any logo'] })),
  sf('15', 'S1-01-SH15', ['KF-SF-SH13'], 1, 'Neighbour, phone raised, lens copper', spec({ cameraAngle: 'His eye level, three-quarter front, tighter than SH13', shotScale: 'Medium close',
    characterPlacement: 'Face frame right', expression: 'Caught out', wardrobe: WD.NEIGHBOUR, lighting: BLUE, architecture: 'Window frame', propOwnership: 'Phone raised, copper glow at frame edge', visible: ["neighbour's window frame"], hidden: ['her balcony'] })),
  sf('16', 'S1-01-SH16', ['KF-SF-SH11', 'KF-ENV-CITY-DUSK-A'], 1, 'Her balcony from his window', spec({ cameraAngle: 'Across the street from his window height, slightly up', shotScale: 'Medium wide',
    characterPlacement: 'Woman at the ledge, centre', expression: 'Amused, generous', wardrobe: WD.WOMAN, lighting: BLUE, architecture: 'Balcony, open door, lit kitchen',
    propOwnership: 'Glass in her left hand at the ledge; spoon in her right', visible: ['fourth-floor balcony ledge', 'open balcony door', 'wine glass'], hidden: [] })),
  sf('17', 'S1-01-SH17', ['KF-ENV-CITY-DUSK-A', 'KF-SF-SH11', 'KF-SF-SH08'], 1, 'Start of the rise: kitchen and dress', spec({ cameraAngle: 'Level at the fourth floor', shotScale: 'Wide',
    characterPlacement: 'Woman small in her kitchen, frame left', expression: 'Not readable', wardrobe: `${WD.WOMAN}; ${WD.DRESS}`, lighting: BLUE, architecture: 'North side facades, fire escapes, balcony',
    propOwnership: 'Dress hanging on the rail', visible: ['fourth-floor balcony ledge', 'third-floor fire-escape rail', 'water towers'], hidden: ['Halcyon House'] })),
  kf({ keyframeId: 'KF-SF-SH18', kind: 'START_FRAME', title: 'Rise continues from the last frame of SH17', usedBy: ['S1-01-SH18'], source: 'EXTRACT_FROM_APPROVED_FOOTAGE', candidates: 0, spec: null, extractFrom: { shotId: 'S1-01-SH17', position: 'LAST_FRAME' } }),
];
