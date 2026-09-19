/**
 * P0.5E.4 — NDX scenario-based discovery prompts.
 */

import { buildDiscoveryScenario } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/discoveryScenarios.js';
import type { CharacterDiscoveryScenario } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/types.js';

export function buildNdxCharacterDiscoveryScenarios(): CharacterDiscoveryScenario[] {
  return [
    buildDiscoveryScenario({
      scenarioId: 'ndx-wrong-receipt',
      domain: 'CONFLICT',
      situation:
        "She's been arguing a point for two days and finds a receipt proving she was wrong.",
      possibleResponses: [
        'Immediately posts Errata and makes the correction funnier than the original argument.',
        'Sits there staring at the receipt in complete silence for 30 seconds first.',
        'Tries one final search hoping reality will change.',
        'Texts her friend "DELETE EVERYTHING."',
        'Laughs at herself and publicly corrects it.',
      ],
      behavioralImplication: 'Reveals how she handles being publicly wrong.',
    }),
    buildDiscoveryScenario({
      scenarioId: 'ndx-excellent-point-enemy',
      domain: 'SOCIAL_BEHAVIOR',
      situation: "Someone she doesn't like makes an excellent point.",
      possibleResponses: [
        'Gives them credit immediately.',
        'Reluctantly admits it.',
        'Quietly Bookmarks it.',
        'Spends an hour trying to disprove it first.',
        'Agrees with the idea while refusing to praise the person.',
      ],
      behavioralImplication: 'Reveals ego vs intellectual honesty.',
    }),
    buildDiscoveryScenario({
      scenarioId: 'ndx-rabbit-hole-143am',
      domain: 'DIGITAL_LIFE',
      situation: "She's 14 tabs deep into a rabbit hole at 1:43 AM.",
      possibleResponses: [
        'Room messy, one lamp, podcast in background, forgot to reply to a text from hours ago.',
        'Still fully dressed, snack untouched, stops when she finds the original source.',
        'Notes app open with three half-sentences that contradict each other.',
        'Stops only because her phone dies.',
      ],
      behavioralImplication: 'Reveals private research behavior and environment.',
    }),
    buildDiscoveryScenario({
      scenarioId: 'ndx-wrong-at-dinner',
      domain: 'CONFLICT',
      situation: "She's at dinner and someone confidently says something she knows is wrong.",
      possibleResponses: [
        'Looks at her friend first.',
        'Corrects them immediately.',
        'Asks a question that lets them expose themselves.',
        'Googles it under the table.',
        'Says nothing and puts it in the Book later.',
        'Depends entirely on who said it.',
      ],
      behavioralImplication: 'Reveals social conflict calibration.',
    }),
  ];
}
