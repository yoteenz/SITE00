export type BldrStageArtworkVariant = 'input' | 'align' | 'production' | 'release';

export type BldrHubStage = {
  num: string;
  microLabel: string;
  title: string;
  body: string;
  artwork: BldrStageArtworkVariant;
};

export type BldrSequenceStep = {
  num: string | null;
  label: string;
  terminal?: boolean;
};

export const BLDR_HUB_STAGES: readonly BldrHubStage[] = [
  {
    num: '01',
    microLabel: 'INPUT',
    title: 'SHARE YOUR VISION',
    body: 'TELL US WHAT YOU ARE BUILDING AND WHY IT MATTERS.',
    artwork: 'input',
  },
  {
    num: '02',
    microLabel: 'ALIGN',
    title: 'DISCOVERY & STRATEGY',
    body: 'ALIGN ON SCOPE, TIMELINE, AND CREATIVE DIRECTION.',
    artwork: 'align',
  },
  {
    num: '03',
    microLabel: 'PRODUCTION',
    title: 'DESIGN & BUILD',
    body: 'PRODUCE, ITERATE, AND REFINE WITHIN SITE 00 SYSTEMS.',
    artwork: 'production',
  },
  {
    num: '04',
    microLabel: 'RELEASE',
    title: 'LAUNCH & GROW',
    body: 'DEPLOY, MONITOR, AND EVOLVE YOUR DIGITAL PLACE.',
    artwork: 'release',
  },
] as const;

export const BLDR_SEQUENCE_STEPS: readonly BldrSequenceStep[] = [
  { num: '01', label: 'DEFINE' },
  { num: '02', label: 'DISCOVER' },
  { num: '03', label: 'BUILD' },
  { num: '04', label: 'LAUNCH' },
  { num: null, label: 'GROW', terminal: true },
] as const;
