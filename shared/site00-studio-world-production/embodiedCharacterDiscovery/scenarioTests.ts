/**
 * P0.5E.3 — Character scenario stress tests.
 */

import { randomId } from './id.js';
import type { CharacterScenarioTest } from './types.js';

export function buildCharacterScenarioTest(params: Omit<CharacterScenarioTest, 'testId'>): CharacterScenarioTest {
  return { testId: randomId('scn'), ...params };
}

export function scenarioTestsRequireContinuity(tests: CharacterScenarioTest[]): boolean {
  return tests.length >= 12;
}

export function evaluateScenarioContinuity(tests: CharacterScenarioTest[]): boolean {
  if (tests.length < 12) return false;
  return tests.every((t) => Boolean(t.thought && t.whatSheWouldNotDo));
}
