/**
 * Reusable Studio World LIBRARY SEEDS for Character Fabrication.
 * These are library-asset definitions (provenance LIBRARY_SEED) — reusable catalogue objects, not baked into pages.
 * Photographic material for each item is an EMPTY NAMED SLOT (see assets.ts).
 */
import type {
  AppearanceLayerDef,
  AppearanceRef,
  AppearanceSet,
  BehaviorSkin,
  BodyCheckId,
  GarmentAsset,
  LookCandidate,
  MotionAsset,
  SimTestId,
  WardrobeCategory,
} from './types.js';

const g = (
  code: string,
  name: string,
  category: WardrobeCategory,
  type: string,
  material: string,
  color: string,
  swatch: string,
  availability: GarmentAsset['availability'] = 'IN_STOCK',
): GarmentAsset => ({
  garmentId: `gar-${code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name,
  code,
  category,
  type,
  material,
  color,
  size: 'S',
  availability,
  gender: 'WOMEN',
  sourceProject: 'NDXBOOK',
  compatibleBodyVersions: ['V2.1', 'V2.0'],
  swatch,
  slotId: `wardrobe.sw017.garment.${code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
});

export const WARDROBE_LIBRARY: readonly GarmentAsset[] = [
  g('SPORTS-BRA-01', 'SPORTS BRA - 01', 'TOPS', 'BRA', 'TECH KNIT', 'GREY', '#9a9ca3'),
  g('TANK-TOP-02', 'TANK TOP - 02', 'TOPS', 'TANK', 'COTTON', 'WHITE', '#eceef0'),
  g('COMPRESSION-TOP-01', 'COMPRESSION TOP - 01', 'TOPS', 'LONG SLEEVE', 'PERFORMANCE', 'GREY', '#7d7f86'),
  g('CROP-TOP-01', 'CROP TOP - 01', 'TOPS', 'CROP', 'RIB KNIT', 'BLACK', '#1c1c20'),
  g('LONG-SLEEVE-01', 'LONG SLEEVE - 01', 'TOPS', 'LONG SLEEVE', 'PERFORMANCE', 'GREY', '#6b6d74'),
  g('HOODIE-01', 'HOODIE - 01', 'TOPS', 'HOODIE', 'FLEECE', 'CHARCOAL', '#3b3c41'),
  g('JACKET-02', 'JACKET - 02', 'TOPS', 'JACKET', 'TECH SHELL', 'BLACK', '#202024'),
  g('BODYSUIT-01', 'BODYSUIT - 01', 'TOPS', 'BODYSUIT', 'PERFORMANCE', 'GREY', '#8b8d94', 'LIMITED'),
  g('LEGGING-01', 'LEGGING - 01', 'BOTTOMS', 'LEGGING', 'PERFORMANCE', 'GREY', '#85878e'),
  g('CARGO-01', 'CARGO PANT - 01', 'BOTTOMS', 'CARGO', 'RIPSTOP', 'STONE', '#b9ad96'),
  g('JOGGER-01', 'JOGGER - 01', 'BOTTOMS', 'JOGGER', 'COTTON FLEECE', 'CHARCOAL', '#4a4b50'),
  g('SHORTS-01', 'SHORTS - 01', 'BOTTOMS', 'SHORTS', 'TECH KNIT', 'GREY', '#a3a5ab'),
  g('DENIM-HR-01', 'HIGH-RISE DENIM - 01', 'BOTTOMS', 'DENIM', 'DENIM', 'INDIGO', '#3d4a66'),
  g('LEATHER-JKT-01', 'LEATHER JACKET - 01', 'OUTERWEAR', 'JACKET', 'LEATHER', 'BLACK', '#17171a'),
  g('CANVAS-OVERSHIRT-01', 'CANVAS OVERSHIRT - 01', 'OUTERWEAR', 'OVERSHIRT', 'CANVAS', 'STONE', '#c2b8a3'),
  g('BOMBER-01', 'BOMBER - 01', 'OUTERWEAR', 'BOMBER', 'NYLON', 'OLIVE', '#5b6250', 'LIMITED'),
  g('BOOT-LEATHER-01', 'LEATHER BOOT - 01', 'FOOTWEAR', 'BOOT', 'LEATHER', 'BROWN', '#4a3628'),
  g('SNEAKER-01', 'SNEAKER - 01', 'FOOTWEAR', 'SNEAKER', 'MESH', 'WHITE', '#dcdde0'),
  g('FLAT-LEATHER-01', 'LEATHER FLAT - 01', 'FOOTWEAR', 'FLAT', 'LEATHER', 'BLACK', '#202024'),
  g('BELT-01', 'BELT - 01', 'ACCESSORIES', 'BELT', 'LEATHER', 'BROWN', '#5a4331'),
  g('PENDANT-01', 'PENDANT - 01', 'ACCESSORIES', 'JEWELRY', 'SILVER', 'SILVER', '#b4b6bd'),
];

export const WARDROBE_CATEGORIES: readonly WardrobeCategory[] = ['TOPS', 'BOTTOMS', 'OUTERWEAR', 'FOOTWEAR', 'ACCESSORIES'];

export const LOOK_CANDIDATES: readonly LookCandidate[] = [
  {
    candidateId: 'A',
    label: 'CANDIDATE A',
    basis: 'CANONICAL LOOK · 2026 PRESENT RETURN',
    palette: ['#cbbfa8', '#b8a88f', '#8c8570'],
    materials: 'COTTON RIPSTOP, CANVAS, MESH',
    layers: [
      { layer: 'SHELL', item: 'LIGHT CANVAS' },
      { layer: 'MID', item: 'COTTON SHIRT' },
      { layer: 'BASE', item: 'COTTON TANK' },
      { layer: 'PANTS', item: 'RIPSTOP CARGO' },
      { layer: 'BOOTS', item: 'LEATHER' },
    ],
    sceneCompatibility: [1, 2, 3, 4, 5],
    notes: 'LIGHTWEIGHT. HIGH MOBILITY. BREATHABLE. GOOD FOR PHYSICALITY.',
    stylingNotes: 'FUNCTIONAL, PRACTICAL, AND PHYSICALLY ADAPTIVE. SUPPORTS LONG-FORM PRODUCTION DEMANDS WITH MINIMAL MAINTENANCE AND FLEXIBLE LAYERING OPTIONS.',
    materialContinuity: [
      { k: 'MATERIAL CONTINUITY', v: '92% MATCH' },
      { k: 'TEXTURE ALIGNMENT', v: 'HIGH' },
      { k: 'WEAR & FINISH', v: 'LIGHT DISTRESS' },
      { k: 'REFLECTIVITY', v: 'LOW' },
    ],
    provenance: 'LIBRARY_SEED',
    slotId: 'look.sw017.candidate.a',
  },
  {
    candidateId: 'B',
    label: 'CANDIDATE B',
    basis: 'CANONICAL LOOK · 2016 IG BADDIE (RE-STYLED)',
    palette: ['#2b2b30', '#3a3a40', '#141416'],
    materials: 'NYLON TWILL, LEATHER, MESH',
    layers: [
      { layer: 'SHELL', item: 'LEATHER JACKET' },
      { layer: 'BASE', item: 'RIB KNIT TANK' },
      { layer: 'PANTS', item: 'TWILL CARGO' },
      { layer: 'BOOTS', item: 'LEATHER' },
    ],
    sceneCompatibility: [2, 3, 4, 6],
    notes: 'HIGH DURABILITY. MORE STRUCTURE. OPTIMIZED FOR ACTION SEQUENCES.',
    stylingNotes: 'STRUCTURED SILHOUETTE. HOLDS SHAPE UNDER MOTION.',
    materialContinuity: [
      { k: 'MATERIAL CONTINUITY', v: '78% MATCH' },
      { k: 'TEXTURE ALIGNMENT', v: 'MEDIUM' },
      { k: 'WEAR & FINISH', v: 'CLEAN' },
      { k: 'REFLECTIVITY', v: 'MEDIUM' },
    ],
    provenance: 'LIBRARY_SEED',
    slotId: 'look.sw017.candidate.b',
  },
  {
    candidateId: 'C',
    label: 'CANDIDATE C',
    basis: 'LIBRARY SEED · TRANSITION LOOK',
    palette: ['#5f6650', '#7a6a55', '#8b8d94'],
    materials: 'LINEN BLEND, COTTON, CANVAS',
    layers: [
      { layer: 'MID', item: 'LINEN OVERSHIRT' },
      { layer: 'BASE', item: 'COTTON TEE' },
      { layer: 'PANTS', item: 'CANVAS CARGO' },
      { layer: 'BOOTS', item: 'LEATHER' },
    ],
    sceneCompatibility: [1, 2, 5, 7],
    notes: 'NATURAL FIBERS. SOFT DRAPE. BETTER FOR DIALOGUE-HEAVY SCENES.',
    stylingNotes: 'SOFTER READ. LOWER CONTRAST AGAINST THE SET.',
    materialContinuity: [
      { k: 'MATERIAL CONTINUITY', v: '84% MATCH' },
      { k: 'TEXTURE ALIGNMENT', v: 'HIGH' },
      { k: 'WEAR & FINISH', v: 'WORN-IN' },
      { k: 'REFLECTIVITY', v: 'LOW' },
    ],
    provenance: 'LIBRARY_SEED',
    slotId: 'look.sw017.candidate.c',
  },
];

export const APPEARANCE_LAYERS: readonly AppearanceLayerDef[] = [
  { layerId: 'hairStyle', label: 'HAIR STYLE', value: 'WAVE 03', code: 'REF-H-02', candidateValue: 'WAVE 03', slotId: 'appearance.sw017.layer.hair-style' },
  { layerId: 'hairColor', label: 'HAIR COLOR', value: 'BASELINE', code: 'HC-BL-01', candidateValue: 'ASH TONE', slotId: 'appearance.sw017.layer.hair-color' },
  { layerId: 'rootShadow', label: 'ROOT SHADOW', value: 'MEDIUM', code: 'RS-MED-02', candidateValue: 'DARK', slotId: 'appearance.sw017.layer.root-shadow' },
  { layerId: 'skinFinish', label: 'SKIN FINISH', value: 'NATURAL / SLIGHT SHEEN', code: 'SF-NAT-01', candidateValue: 'MATTE', slotId: 'appearance.sw017.layer.skin-finish' },
  { layerId: 'eyeDetail', label: 'EYE DETAIL', value: 'NEUTRAL', code: 'ED-NT-02', candidateValue: 'SMOKE SOFT', slotId: 'appearance.sw017.layer.eye-detail' },
  { layerId: 'lipTone', label: 'LIP TONE', value: 'NEUTRAL', code: 'LT-NT-01', candidateValue: 'COOL NUDE', slotId: 'appearance.sw017.layer.lip-tone' },
  { layerId: 'grit', label: 'GRIT / IMPERFECTIONS', value: 'LIGHT', code: 'GI-LT-01', candidateValue: 'MEDIUM', slotId: 'appearance.sw017.layer.grit' },
];

export const HAIR_REFS: readonly AppearanceRef[] = [1, 2, 3, 4].map((n) => ({
  refId: `REF-H-0${n}`, kind: 'HAIR' as const, label: `REF-H-0${n}`, slotId: `appearance.sw017.reference.hair.0${n}`,
}));
export const MAKEUP_REFS: readonly AppearanceRef[] = [1, 2, 3, 4].map((n) => ({
  refId: `MU-0${n}`, kind: 'MAKEUP' as const, label: `MU-0${n}`, slotId: `appearance.sw017.reference.makeup.0${n}`,
}));
export const APPEARANCE_SETS: readonly AppearanceSet[] = [
  { setId: 'SET-01', label: 'SET-01', state: 'LOCKED', date: 'APR 12' },
  { setId: 'SET-02', label: 'SET-02', state: 'WORKING', date: 'MAY 02' },
  { setId: 'SET-03', label: 'SET-03', state: 'ALTERNATE', date: 'MAY 07' },
  { setId: 'SET-04', label: 'SET-04', state: 'ALT_LIGHT', date: 'MAY 11' },
];
export const CONTINUITY_TAGS = ['SCENE 12 · DAY', 'LOCATION · STUDIO A', 'LIGHTING · RIG A', 'TIMECODE · 12:14:08:12', 'NOTES · RAIN / WET'];

export const BEHAVIOR_SKINS: readonly BehaviorSkin[] = [
  { skinId: 'bs-observant', name: 'OBSERVANT', summary: 'Reads the room before acting.', tags: ['FOCUS', 'NEUTRAL', 'CONTROLLED'], category: 'FOCUS', compatibility: 9, provenance: 'NDX LIBRARY V2.1', effects: { posture: 'ALERT / CLOSED', decision: 'ANALYTICAL / DEFENSIVE', gaze: 'FOCUSED / EVALUATIVE', reaction: 'CONTROLLED / DELAYED' } },
  { skinId: 'bs-self-conscious', name: 'SELF-CONSCIOUS', summary: 'Monitors how she is being seen.', tags: ['TEMPO', 'GUARDED', 'SOCIAL'], category: 'SOCIAL', compatibility: 8, provenance: 'NDX LIBRARY V2.0', effects: { posture: 'PULLED IN', decision: 'HESITANT', gaze: 'GLANCING', reaction: 'SELF-CORRECTING' } },
  { skinId: 'bs-defiant', name: 'DEFIANT', summary: 'Pushes back against being framed.', tags: ['INTENSITY', 'DIRECT', 'CONFIDENT'], category: 'INTENSITY', compatibility: 8, provenance: 'NDX LIBRARY V2.0', effects: { posture: 'SQUARED', decision: 'DIRECT', gaze: 'HELD', reaction: 'FIRM' } },
  { skinId: 'bs-vulnerable', name: 'VULNERABLE', summary: 'Lets the guard drop briefly.', tags: ['TEMPO', 'OPEN', 'SLOW'], category: 'TEMPO', compatibility: 7, provenance: 'NDX LIBRARY V1.9', effects: { posture: 'SOFTENED', decision: 'DEFERRED', gaze: 'DOWNCAST', reaction: 'EXPOSED' } },
  { skinId: 'bs-focused-observation', name: 'FOCUSED OBSERVATION', summary: 'Maintains attention through environmental scan.', tags: ['FOCUS', 'NEUTRAL', 'CONTROLLED'], category: 'FOCUS', compatibility: 9, provenance: 'NDX LIBRARY V2.1', effects: { posture: 'STILL / ALERT', decision: 'SCANNING', gaze: 'SWEEPING', reaction: 'MEASURED' } },
  { skinId: 'bs-decisive-action', name: 'DECISIVE ACTION', summary: 'Commits quickly with clear intent and follow-through.', tags: ['INTENSITY', 'DIRECT', 'CONFIDENT'], category: 'INTENSITY', compatibility: 8, provenance: 'NDX LIBRARY V2.0', effects: { posture: 'FORWARD', decision: 'IMMEDIATE', gaze: 'LOCKED', reaction: 'COMMITTED' } },
  { skinId: 'bs-controlled-volatility', name: 'CONTROLLED VOLATILITY', summary: 'Surges of intensity under pressure with quick reset.', tags: ['INTENSITY', 'PRESSURE', 'VARIABLE'], category: 'INTENSITY', compatibility: 7, provenance: 'NDX LIBRARY V1.9', effects: { posture: 'COILED', decision: 'REACTIVE', gaze: 'DARTING', reaction: 'SURGING / RESETTING' } },
  { skinId: 'bs-guarded-presence', name: 'GUARDED PRESENCE', summary: 'Protective posture with measured engagement.', tags: ['FOCUS', 'CAUTIOUS', 'RESERVED'], category: 'SOCIAL', compatibility: 8, provenance: 'NDX LIBRARY V2.0', effects: { posture: 'BRACED', decision: 'CAUTIOUS', gaze: 'PERIPHERAL', reaction: 'RESERVED' } },
];

const m = (id: string, label: string, dur: number, key: number, notes: string): MotionAsset => ({
  motionId: id,
  label,
  durationSec: dur,
  fps: 24,
  keyBeatFrame: key,
  capture: { date: 'APR 20, 2024', time: '14:32:11', studio: 'STUDIO WORLD', volume: 'VOLUME 02', rig: 'MX-72 OPTI TRACK', sensors: 'FULL BODY + HAND', resolution: '120 FPS', operator: 'SYS-07 / L. HART', notes },
  biomechanics: [
    { k: 'JOINT ALIGNMENT', v: 98 },
    { k: 'MOTION SMOOTHNESS', v: 96 },
    { k: 'BALANCE STABILITY', v: 97 },
    { k: 'GROUND CONTACT', v: 100 },
    { k: 'ENERGY EFFICIENCY', v: 94 },
  ],
  status: 'PUBLISHED',
  slotId: `motion.sw017.${id.toLowerCase().replace(/_/g, '-')}.preview`,
});

export const MOTION_LIBRARY: readonly MotionAsset[] = [
  m('SIT_V01', 'SEATED TRANSITION', 2.48, 72, 'OPTIMAL QUALITY'),
  m('STAND_V03', 'STAND UP FLOW', 3.12, 60, 'OPTIMAL QUALITY'),
  m('WALK_V07', 'TACTICAL WALK', 4.36, 48, 'OPTIMAL QUALITY'),
  m('TURN_L90', 'LEFT TURN 90', 1.22, 24, 'OPTIMAL QUALITY'),
  m('REACH_V02', 'FORWARD REACH', 1.84, 30, 'OPTIMAL QUALITY'),
  m('OVERHEAD_R01', 'OVERHEAD REACH', 2.31, 36, 'OPTIMAL QUALITY'),
  m('PIVOT_R45', 'PIVOT RIGHT 45', 1.05, 18, 'OPTIMAL QUALITY'),
  m('STEP_UP_V02', 'STEP UP', 2.17, 40, 'OPTIMAL QUALITY'),
];

export const SIM_TEST_DEFS: Record<SimTestId, { label: string; description: string; motionId: string | null }> = {
  WALK: { label: 'WALK', description: 'EVALUATE LOCOMOTION, GAIT CONSISTENCY AND FOOT CONTACT.', motionId: 'WALK_V07' },
  IDLE: { label: 'IDLE', description: 'EVALUATE RESTING POSTURE, BREATH AND MICRO-MOVEMENT.', motionId: null },
  SIT: { label: 'SIT', description: 'EVALUATE SEATED TRANSITION AND WARDROBE RESPONSE.', motionId: 'SIT_V01' },
  TURN: { label: 'TURN', description: 'EVALUATE TURN TIMING, HEAD LEAD AND BALANCE.', motionId: 'TURN_L90' },
  ENTER: { label: 'ENTER', description: 'EVALUATE FRAME ENTRY AND LIGHTING RESPONSE.', motionId: null },
  EXIT: { label: 'EXIT', description: 'EVALUATE FRAME EXIT AND CONTINUITY OF SILHOUETTE.', motionId: null },
  SPEAK: { label: 'SPEAK', description: 'EVALUATE SPEECH-DRIVEN MICRO-EXPRESSION AND AUDIO SYNC.', motionId: null },
  REACT: { label: 'REACT', description: 'EVALUATE REACTION LATENCY AND EXPRESSION RANGE.', motionId: null },
  INTERACT: { label: 'INTERACT', description: 'EVALUATE REAL-TIME RESPONSIVENESS AND APPROPRIATE SOCIAL INTERACTION TO HUMAN CUES AND GESTURES.', motionId: null },
};

export const BODY_CHECK_DEFS: Record<BodyCheckId, { label: string }> = {
  skeletal: { label: 'SKELETAL PROPORTIONS' },
  muscle: { label: 'MUSCLE TOPOLOGY' },
  surface: { label: 'SURFACE ANATOMY' },
  symmetry: { label: 'SYMMETRY + BALANCE' },
  range: { label: 'RANGE OF MOTION' },
  tissue: { label: 'TISSUE INTEGRITY' },
  plausibility: { label: 'PHYSICAL PLAUSIBILITY' },
};

/** Calibration variance readout produced by a calibration RUN. FIXTURE — no measurement backend exists yet. */
export const CALIBRATION_FIXTURE = {
  alignmentPct: 98.7,
  variance: [
    { k: 'HEIGHT', v: 0.3 },
    { k: 'SHOULDER', v: 0.6 },
    { k: 'TORSO', v: 0.4 },
    { k: 'HIP', v: 0.5 },
    { k: 'LEG LENGTH', v: 0.4 },
    { k: 'PROPORTION', v: 0.4 },
  ],
  overall: 0.5,
  tolerance: 1.0,
  referenceModel: 'SW-017_APPROVED_V2',
} as const;

export const MOVEMENT_REFERENCES = [
  { refId: 'walk-cycle', label: 'WALK CYCLE' },
  { refId: 'turn-table', label: 'TURN TABLE' },
  { refId: 'head-turn', label: 'HEAD TURN' },
  { refId: 'arm-lift', label: 'ARM LIFT' },
] as const;

export const DEFECT_LABEL = { WARDROBE_TOP: 'WARDROBE TOP MATERIAL VARIANCE', MOTION_TIMING: 'MOTION TIMING +12 FRAMES' } as const;
