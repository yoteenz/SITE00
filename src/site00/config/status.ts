/**
 * Homepage status strip — development placeholder data only.
 * Do not present as live operational metrics until backend exists.
 */

export type StatusStripItem = {
  id: string;
  label: string;
  value: string;
  icon: 'pulse' | 'globe' | 'crosshair' | 'cube' | 'shield';
};

/** Clearly marked as presentation placeholders */
export const SITE00_STATUS_STRIP: StatusStripItem[] = [
  { id: 'status', label: 'STATUS', value: 'READY TO BEGIN', icon: 'pulse' },
  { id: 'origin', label: 'ORIGIN ENVIRONMENT', value: 'SITE 00', icon: 'globe' },
  { id: 'active-sites', label: 'ACTIVE SITES', value: '047', icon: 'crosshair' },
  { id: 'builds', label: 'BUILDS IN PROGRESS', value: '12', icon: 'cube' },
  { id: 'system', label: 'SYSTEM STATUS', value: 'OPERATIONAL', icon: 'shield' },
];

export const SITE00_ORIGIN_COPY = {
  location: '00.00',
  locationLabel: 'ORIGIN ENVIRONMENT',
  headlineLine1: 'WELCOME TO',
  headlineLine2: 'SITE 00',
  tagline: 'WHERE DIGITAL PLACES BEGIN.',
  description1: 'THIS IS THE ORIGIN ENVIRONMENT.',
  description2: 'EVERY SITE THAT EXISTS ONLINE',
  description3: 'STARTS HERE.',
  originPoint: 'YOU ARE AT 00.00 ORIGIN POINT',
  /** Desktop hero — split so coordinate can be styled independently. */
  originPointLine: {
    prefix: 'YOU ARE AT',
    coordinate: '00.00',
    suffix: 'ORIGIN POINT',
  },
  prompt: 'WHERE DO WE BEGIN?',
  mobileSwipeUp: {
    eyebrow: 'YOU ARE AT',
    coordinate: '00.00',
    suffix: 'ORIGIN POINT',
    enterLabel: 'ENTER SITE 00',
    swipeLabel: 'SWIPE UP',
  },
  idntyCard: {
    number: '01',
    title: 'IDNTY',
    subtitle: 'DEFINE MY BRAND.',
    cta: 'BEGIN IDNTY',
  },
  bldrCard: {
    number: '02',
    title: 'BLDR',
    subtitle: 'START MY BUILD.',
    cta: 'BEGIN BLDR',
  },
  guidance: {
    label: 'NEED GUIDANCE?',
    title: 'TALK TO OUR BUILD GUIDE.',
  },
} as const;

/** Production lifecycle stages — architecture only, not fully implemented */
export const SITE00_LIFECYCLE_STAGES = [
  'ORIGIN',
  'IDNTY',
  'BLDR',
  'BLUPRNT',
  'BUILD',
  'CTRL ROOM',
  'LIVE',
  'EVOLVE',
] as const;

export type LifecycleStage = (typeof SITE00_LIFECYCLE_STAGES)[number];

/** Creative Selection Protocol — types for future IDNTY/BLUPRNT workflows */
export type CreativeDirectionId = 'A' | 'B' | 'C' | 'D';

export type CreativeDirectionState =
  | 'pending'
  | 'presented'
  | 'selected'
  | 'locked'
  | 'hold'
  | 'hybridize'
  | 'recalibrate';

export type OptionDPath = 'hybridize' | 'recalibrate';

/** Future project model — extension point, not persisted this sprint */
export type Site00Project = {
  id: string;
  projectNumber?: string;
  clientId?: string;
  name?: string;
  buildClass?: string;
  identityState?: string;
  currentStage?: LifecycleStage;
  status?: string;
  approvedDirection?: CreativeDirectionId;
  pendingActions?: string[];
};

/** Future production progress granularity */
export type ProductionPhase =
  | 'FOUNDATION'
  | 'SHELL'
  | 'SURFACES'
  | 'SYSTEMS'
  | 'INTERACTION'
  | 'QA';

export type ProductionProgress = {
  phase: ProductionPhase;
  installed: number;
  total: number;
};
