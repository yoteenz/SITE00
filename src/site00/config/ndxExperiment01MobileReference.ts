/**
 * P0.VR.1D.8 — Mobile Lab / Experiment 01 reference snapshot (visual reconstruction authority).
 */

export const NDX_EXPERIMENT_01_REFERENCE_PATH =
  '/visual-references/founder/ndxbook/mobile-lab-experiment-01-reference.png';

export const NDX_EXPERIMENT_01_CANONICAL_SUBJECT = 'FIND THE NDX PAGE';
export const NDX_EXPERIMENT_01_SUBJECT_COPY =
  'We\u2019re testing how nine unrelated thoughts look when the same person made them.';

export const NDX_EXPERIMENT_01_STATUS = 'IN PRODUCTION';
export const NDX_EXPERIMENT_01_DIRECTION_VERSION = 'V2.3';

export const NDX_EXPERIMENT_01_METRICS = {
  round: { label: 'ROUND 01', value: 'CONTRACTS READY' },
  slide: { label: 'SLIDE 01', value: '8 / 9 COMPLETE' },
  locked: { label: 'LOCKED', value: '0 / 9' },
} as const;

export type NdxExperiment01CardSpec = {
  id: string;
  titleLines: string[];
  accentLine?: string;
  accentTone?: 'lime' | 'underline-lime';
  artworkPath: string;
  artworkObjectPosition: string;
  selected?: boolean;
  showClose?: boolean;
  vrRegionId: string;
};

export const NDX_EXPERIMENT_01_CARDS: NdxExperiment01CardSpec[] = [
  {
    id: 'exp-card-01-subscription',
    titleLines: ['WHY DOES', 'EVERYTHING', 'HAVE A', 'SUBSCRIPTION', 'NOW?'],
    artworkPath: '/visual-references/founder/ndxbook/experiment-01-artwork/exp-card-01-subscription.webp',
    artworkObjectPosition: 'center center',
    selected: true,
    showClose: true,
    vrRegionId: 'ndx.lab.card.1',
  },
  {
    id: 'exp-card-02-save-time',
    titleLines: ['THIS WAS', 'SUPPOSED', 'TO SAVE US', 'TIME.'],
    artworkPath: '/visual-references/founder/ndxbook/experiment-01-artwork/exp-card-02-save-time.webp',
    artworkObjectPosition: 'center center',
    vrRegionId: 'ndx.lab.card.2',
  },
  {
    id: 'exp-card-03-apology',
    titleLines: ['WE OWE', 'HER AN', 'APOLOGY.'],
    artworkPath: '/visual-references/founder/ndxbook/experiment-01-artwork/exp-card-03-apology.webp',
    artworkObjectPosition: 'center center',
    vrRegionId: 'ndx.lab.card.3',
  },
  {
    id: 'exp-card-04-theory',
    titleLines: ['I HAVE A'],
    accentLine: 'THEORY.',
    accentTone: 'underline-lime',
    artworkPath: '/visual-references/founder/ndxbook/experiment-01-artwork/exp-card-04-theory.webp',
    artworkObjectPosition: 'center center',
    vrRegionId: 'ndx.lab.card.4',
  },
  {
    id: 'exp-card-05-serious',
    titleLines: ['BE', 'SERIOUS.'],
    artworkPath: '/visual-references/founder/ndxbook/experiment-01-artwork/exp-card-05-serious.webp',
    artworkObjectPosition: 'center center',
    vrRegionId: 'ndx.lab.card.5',
  },
  {
    id: 'exp-card-06-remember',
    titleLines: ['REMEMBER', 'THIS?'],
    artworkPath: '/visual-references/founder/ndxbook/experiment-01-artwork/exp-card-06-remember.webp',
    artworkObjectPosition: 'center center',
    vrRegionId: 'ndx.lab.card.6',
  },
  {
    id: 'exp-card-07-stupid',
    titleLines: ['I THOUGHT', 'THIS WAS', 'STUPID.'],
    artworkPath: '/visual-references/founder/ndxbook/experiment-01-artwork/exp-card-07-stupid.webp',
    artworkObjectPosition: 'center center',
    vrRegionId: 'ndx.lab.card.7',
  },
  {
    id: 'exp-card-08-decade',
    titleLines: ['DIFFERENT', 'DECADE.', 'SAME MODEL.'],
    artworkPath: '/visual-references/founder/ndxbook/experiment-01-artwork/exp-card-08-decade.webp',
    artworkObjectPosition: 'center center',
    vrRegionId: 'ndx.lab.card.8',
  },
  {
    id: 'exp-card-09-fair',
    titleLines: ['INTERESTING.'],
    accentLine: 'FAIR.',
    accentTone: 'lime',
    artworkPath: '/visual-references/founder/ndxbook/experiment-01-artwork/exp-card-09-fair.webp',
    artworkObjectPosition: 'center center',
    vrRegionId: 'ndx.lab.card.9',
  },
];

export type NdxExperiment01RatingRow = {
  id: string;
  label: string;
  filled: number;
  total: number;
};

export const NDX_EXPERIMENT_01_RATINGS: NdxExperiment01RatingRow[] = [
  { id: 'artistic-energy', label: 'ARTISTIC ENERGY', filled: 5, total: 5 },
  { id: 'editorial-logic', label: 'EDITORIAL LOGIC', filled: 4, total: 5 },
  { id: 'human-history', label: 'HUMAN HISTORY', filled: 4, total: 5 },
  { id: 'founding', label: 'FOUNDING', filled: 4, total: 5 },
];
