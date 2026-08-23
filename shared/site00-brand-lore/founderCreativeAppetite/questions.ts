/**
 * Founder Creative Appetite questionnaire — tolerance domains, not style choices.
 */

import type { LoreResponseMode } from '../loreAnswerTypes.js';

export type AppetiteQuestionOption = {
  id: string;
  label: string;
  description?: string;
  band: 'CONSERVATIVE' | 'CONTROLLED' | 'OPEN' | 'ADVENTUROUS' | 'HIGH_EXPERIMENTATION';
};

export type AppetiteQuestionStep = {
  id: string;
  title: string;
  subtitle?: string;
  helper?: string;
  responseMode: LoreResponseMode;
  type: 'single' | 'textarea';
  options?: AppetiteQuestionOption[];
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  skippable?: boolean;
  domain: string;
};

const TOLERANCE_OPTIONS: AppetiteQuestionOption[] = [
  { id: 'conservative', label: 'KEEP IT CLOSE TO WHAT FEELS SAFE', band: 'CONSERVATIVE' },
  { id: 'controlled', label: 'SOME SURPRISE — BUT ALWAYS LEGIBLE', band: 'CONTROLLED' },
  { id: 'open', label: 'COMFORTABLE EXPLORING UNEXPECTED IDEAS', band: 'OPEN' },
  { id: 'adventurous', label: 'PUSH UNTIL IT FEELS ALIVE', band: 'ADVENTUROUS' },
  { id: 'high', label: 'MAXIMUM RANGE — SURPRISE ME', band: 'HIGH_EXPERIMENTATION' },
];

export const FOUNDER_CREATIVE_APPETITE_QUESTIONS: AppetiteQuestionStep[] = [
  {
    id: 'creative-risk',
    title: 'HOW FAR CAN CREATIVE GO BEFORE IT FEELS WRONG?',
    subtitle: 'Creative risk',
    helper: 'Not whether you like a specific look — how much initial discomfort is acceptable before an idea proves itself.',
    responseMode: 'SINGLE_SELECT',
    type: 'single',
    options: TOLERANCE_OPTIONS,
    required: true,
    domain: 'CREATIVE_RISK',
  },
  {
    id: 'abstraction',
    title: 'DOES THE AUDIENCE NEED TO GET IT IMMEDIATELY?',
    subtitle: 'Abstraction tolerance',
    helper: 'Literal clarity vs. discovered meaning.',
    responseMode: 'SINGLE_SELECT',
    type: 'single',
    options: TOLERANCE_OPTIONS,
    required: true,
    domain: 'ABSTRACTION_TOLERANCE',
  },
  {
    id: 'visual-experimentation',
    title: 'HOW UNCONVENTIONAL CAN VISUAL SYSTEMS BE?',
    subtitle: 'Visual experimentation',
    helper: 'Composition, type, photography, motion, graphic behavior — not picking fonts or colors.',
    responseMode: 'SINGLE_SELECT',
    type: 'single',
    options: TOLERANCE_OPTIONS,
    required: true,
    domain: 'VISUAL_EXPERIMENTATION',
  },
  {
    id: 'cultural-specificity',
    title: 'HOW CULTURALLY SPECIFIC CAN IDEAS GET?',
    subtitle: 'Cultural specificity',
    responseMode: 'SINGLE_SELECT',
    type: 'single',
    options: TOLERANCE_OPTIONS,
    required: true,
    domain: 'CULTURAL_SPECIFICITY',
  },
  {
    id: 'wit-risk',
    title: 'HOW FAR CAN WIT OR IRONY GO?',
    subtitle: 'Humor / wit risk',
    responseMode: 'SINGLE_SELECT',
    type: 'single',
    options: TOLERANCE_OPTIONS,
    required: true,
    domain: 'WIT_RISK',
  },
  {
    id: 'polarization',
    title: 'CAN STRONG CREATIVE DIVIDE OPINION?',
    subtitle: 'Polarization tolerance',
    responseMode: 'SINGLE_SELECT',
    type: 'single',
    options: TOLERANCE_OPTIONS,
    required: true,
    domain: 'POLARIZATION_TOLERANCE',
  },
  {
    id: 'polish-vs-rawness',
    title: 'CAN CREATIVE FEEL ROUGH OR IN-PROCESS?',
    subtitle: 'Polish vs rawness',
    responseMode: 'SINGLE_SELECT',
    type: 'single',
    options: TOLERANCE_OPTIONS,
    required: true,
    domain: 'RAWNESS_TOLERANCE',
  },
  {
    id: 'density-vs-restraint',
    title: 'MAXIMAL LAYERING OR DELIBERATE RESTRAINT?',
    subtitle: 'Density vs restraint',
    responseMode: 'SINGLE_SELECT',
    type: 'single',
    options: TOLERANCE_OPTIONS,
    required: true,
    domain: 'DENSITY_TOLERANCE',
  },
  {
    id: 'format-experimentation',
    title: 'HOW FAR CAN FORMAT BEHAVIOR PUSH?',
    subtitle: 'Format experimentation',
    helper: 'Still native to feed, carousel, story, reel — but challenging expectations.',
    responseMode: 'SINGLE_SELECT',
    type: 'single',
    options: TOLERANCE_OPTIONS,
    required: true,
    domain: 'FORMAT_EXPERIMENTATION',
  },
  {
    id: 'creative-surprise',
    title: 'HOW IMPORTANT IS UNPREDICTABILITY?',
    subtitle: 'Creative surprise',
    responseMode: 'SINGLE_SELECT',
    type: 'single',
    options: TOLERANCE_OPTIONS,
    required: true,
    domain: 'SURPRISE_PREFERENCE',
  },
  {
    id: 'founder-control',
    title: 'HOW MUCH LATITUDE SHOULD CREATIVE DIRECTORS HAVE?',
    subtitle: 'Founder control comfort',
    responseMode: 'SINGLE_SELECT',
    type: 'single',
    options: TOLERANCE_OPTIONS,
    required: true,
    domain: 'CREATIVE_DIRECTOR_LATITUDE',
  },
  {
    id: 'hard-boundaries',
    title: 'WHAT COULD BE BRILLIANT BUT STILL ABSOLUTELY NOT FOR YOUR BRAND?',
    subtitle: 'Hard creative boundaries',
    helper: 'Strategic lines — not color or font preferences.',
    responseMode: 'FREE_TEXT',
    type: 'textarea',
    maxLength: 800,
    placeholder: 'What would make you say no — even if it worked?',
    required: false,
    skippable: true,
    domain: 'HARD_CREATIVE_BOUNDARIES',
  },
];

export function getAppetiteQuestion(id: string): AppetiteQuestionStep | undefined {
  return FOUNDER_CREATIVE_APPETITE_QUESTIONS.find((q) => q.id === id);
}
