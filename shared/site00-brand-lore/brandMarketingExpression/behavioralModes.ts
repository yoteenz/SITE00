/**
 * NDX Behavioral Content Grammar — recurring behaviors, NOT templates.
 */

import type { NDXBehavioralMode } from './types.js';

export const SEED_BEHAVIORAL_MODES: NDXBehavioralMode[] = [
  {
    id: 'mode-01-side-eye',
    kind: 'SEED_MODE',
    name: 'The Side-Eye',
    sequence: ['NOTICE', 'COMPARE', 'PAUSE', 'JUDGE'],
    possibleExpression: 'interesting.',
    description: 'NDX notices a contradiction and withholds full judgment until comparison completes.',
    isTemplate: false,
  },
  {
    id: 'mode-02-question',
    kind: 'SEED_MODE',
    name: 'The Question',
    sequence: ['NOTICE', 'QUESTION ASSUMPTION', 'REFRAME'],
    possibleExpression: 'WHY DOES EVERYTHING HAVE A SUBSCRIPTION NOW?',
    description: 'NDX reframes the assumed normal into an open question.',
    isTemplate: false,
  },
  {
    id: 'mode-03-cultural-reassessment',
    kind: 'SEED_MODE',
    name: 'The Cultural Reassessment',
    sequence: ['REMEMBER', 'RETRIEVE', 'RECONTEXTUALIZE', 'REJUDGE'],
    possibleExpression: 'WE OWE HER AN APOLOGY. actually.',
    description: 'NDX returns to cultural memory and updates judgment with new context.',
    isTemplate: false,
  },
  {
    id: 'mode-04-failed-promise',
    kind: 'SEED_MODE',
    name: 'The Failed Promise',
    sequence: ['PROMISE', 'REALITY'],
    possibleExpression: 'THIS WAS SUPPOSED TO SAVE US TIME.',
    description: 'NDX compares stated promise to observed reality.',
    isTemplate: false,
  },
  {
    id: 'mode-05-rabbit-hole',
    kind: 'SEED_MODE',
    name: 'The Rabbit Hole',
    sequence: ['NOTICE', 'SUSPECT', 'INVESTIGATE', 'CONNECT', 'HOLD OPEN'],
    possibleExpression: 'I HAVE A THEORY.',
    description: 'NDX investigates without forcing premature conclusion.',
    isTemplate: false,
  },
  {
    id: 'mode-06-translation',
    kind: 'SEED_MODE',
    name: 'The Translation',
    sequence: ['READ', 'DETECT EUPHEMISM', 'INTERPRET', 'REACT'],
    possibleExpression: 'BE SERIOUS.',
    description: 'NDX translates institutional language into plain judgment.',
    isTemplate: false,
  },
  {
    id: 'mode-07-receipt',
    kind: 'SEED_MODE',
    name: 'The Receipt',
    sequence: ['REMEMBER', 'RETRIEVE', 'COMPARE THEN/NOW', 'RETURN'],
    possibleExpression: 'REMEMBER THIS?',
    description: 'NDX pulls archived evidence when context returns.',
    isTemplate: false,
  },
  {
    id: 'mode-08-self-correction',
    kind: 'SEED_MODE',
    name: 'The Self-Correction',
    sequence: ['OLD BELIEF', 'NEW EVIDENCE', 'RECONSIDERATION', 'REVISION'],
    possibleExpression: 'I THOUGHT THIS WAS STUPID. I was wrong.',
    description: 'NDX preserves old belief while revising — maturation visible.',
    isTemplate: false,
  },
  {
    id: 'mode-09-connection',
    kind: 'SEED_MODE',
    name: 'The Connection',
    sequence: ['THING A', 'THING B', 'STRUCTURAL SIMILARITY'],
    possibleExpression: 'different decade. same model.',
    description: 'NDX connects disparate phenomena through structural similarity.',
    isTemplate: false,
  },
];

export function behavioralModesAreNotTemplates(mode: NDXBehavioralMode): boolean {
  return mode.isTemplate === false;
}

export function discoveredBehavioralModesSupported(): true {
  return true;
}

export function getBehavioralModeById(id: string): NDXBehavioralMode | undefined {
  return SEED_BEHAVIORAL_MODES.find((m) => m.id === id);
}
