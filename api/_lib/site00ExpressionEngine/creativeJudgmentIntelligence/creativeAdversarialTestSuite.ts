/**
 * CreativeAdversarialTestSuite
 */

import type { AdversarialTestCase } from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

export const CREATIVE_ADVERSARIAL_TEST_SUITE: AdversarialTestCase[] = [
  { testId: 'adv-01', name: 'TWO SIMILAR BEAUTY BRANDS', description: 'Distinct personalities same category', expectedFailureClasses: ['TOO_CLOSE', 'BRAND_GENERICITY'] },
  { testId: 'adv-02', name: 'BORING PRODUCT', description: 'Ordinary utility — must find human mechanism', expectedFailureClasses: ['TOO_GENERIC', 'STYLE_ONLY_NO_IDEA'] },
  { testId: 'adv-03', name: 'TRENDY CLICHE CATEGORY', description: 'Trend-prone category resists cliché', expectedFailureClasses: ['TOO_SAFE', 'OBVIOUS_FIRST_ANSWER'] },
  { testId: 'adv-04', name: 'CONTRADICTORY BRAND TRAITS', description: 'Conflicting brand signals', expectedFailureClasses: ['BRAND_DRIFT', 'NEEDS_FOUNDER_JUDGMENT'] },
  { testId: 'adv-05', name: 'NO OBVIOUS EMOTIONAL HOOK', description: 'Must invent mechanism without default emotion', expectedFailureClasses: ['WEAK_MECHANISM'] },
  { testId: 'adv-06', name: 'CONSERVATIVE REGULATED BRAND', description: 'Regulated copy boundaries', expectedFailureClasses: ['UNSUPPORTED_CULTURAL_CLAIM'] },
  { testId: 'adv-07', name: 'PLAYFUL AFTER NDXBOOK', description: 'NDX leak after editorial run', expectedFailureClasses: ['NDX_LEAK'] },
  { testId: 'adv-08', name: 'FIVE COUSIN TERRITORIES', description: 'Same mechanism variants', expectedFailureClasses: ['TOO_CLOSE'] },
  { testId: 'adv-09', name: 'HIGH ABSTRACTION BRAND', description: 'Abstract brand tolerance', expectedFailureClasses: ['UNDERDEVELOPED'] },
  { testId: 'adv-10', name: 'LOW ABSTRACTION DIRECT BRAND', description: 'Direct brand rejects editorial abstraction', expectedFailureClasses: ['COPY_DRIFT'] },
];

export function getAdversarialTest(testId: string): AdversarialTestCase | undefined {
  return CREATIVE_ADVERSARIAL_TEST_SUITE.find((t) => t.testId === testId);
}
