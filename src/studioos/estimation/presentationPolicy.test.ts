import { describe, expect, it } from 'vitest';
import { estimateProject } from './engine';
import { FIXTURES } from './fixtures';
import { toClientBlueprintEstimate } from './clientContract';
import { LIVE_MONEY_MOVEMENT } from '../platform-economics/processor';
import { canonicalPlatformFeeBasisPoints } from '../platform-economics/rate';
import {
  HISTORICAL_STARTING_OFFERS,
  PRESENTATION_POLICY_VERSION,
  WEEKS_PER_MONTH,
  evenRange,
  presentEstimate,
  presentInvestment,
  presentTimeline,
} from './presentation';
import type { ProjectEstimateConfig, ProjectEstimateResult } from './types';

function must(config: ProjectEstimateConfig): ProjectEstimateResult {
  const outcome = estimateProject(config);
  if (!outcome.ok) throw new Error(outcome.errors.join(' '));
  return outcome.result;
}

describe('estimate presentation policy', () => {
  it('turns the standard editorial window into even weeks without moving the raw result', () => {
    const result = must(FIXTURES.STANDARD_EDITORIAL);
    const before = { low: result.lowWeeks, high: result.highWeeks, expected: result.expectedWeeks, money: result.investmentExpected };
    const shown = presentTimeline(15, 19);
    expect(shown.label).toBe('16–20 WEEKS');
    expect(shown.founderReview).toBe(false);
    const timeline = presentTimeline(result.lowWeeks, result.highWeeks);
    expect(timeline.label).toBe('16–20 WEEKS');
    expect(timeline.low).toBeGreaterThanOrEqual(result.lowWeeks);
    expect(timeline.high).toBeGreaterThanOrEqual(result.highWeeks);
    expect(result.lowWeeks).toBe(before.low);
    expect(result.expectedWeeks).toBe(before.expected);
    expect(result.investmentExpected).toBe(before.money);
  });

  it('does not drift when the same canonical values are normalized again', () => {
    const once = presentTimeline(14.79, 18.9);
    const twice = presentTimeline(14.79, 18.9);
    expect(twice).toEqual(once);
    expect(once.label).toBe('16–20 WEEKS');
    const money = presentInvestment(16999.2, 21721.2, 18888);
    const again = presentInvestment(money.low, money.high, 18888);
    expect(again.label).toBe(money.label);
    expect(again.low).toBe(money.low);
    expect(again.high).toBe(money.high);
  });

  it('covers every fixture without promising a shorter window or a cheaper floor', () => {
    const seen = new Map<string, string>();
    for (const [name, config] of Object.entries(FIXTURES)) {
      const result = must(config);
      const presentation = presentEstimate(result);
      const client = toClientBlueprintEstimate(config, result);
      expect(client.productionWindow).toBe(presentation.timeline.label);
      expect(client.investmentRange).toBe(presentation.investment.label);
      expect(client.presentationPolicyVersion).toBe(PRESENTATION_POLICY_VERSION);
      expect(presentation.timeline.low).toBeLessThanOrEqual(presentation.timeline.high);
      expect(presentation.investment.low).toBeLessThanOrEqual(presentation.investment.high);
      expect(presentation.investment.low).toBeLessThanOrEqual(result.investmentLow);
      expect(presentation.investment.high).toBeGreaterThanOrEqual(result.investmentHigh);
      if (presentation.timeline.unit === 'WEEKS') {
        expect(presentation.timeline.low).toBeGreaterThanOrEqual(result.lowWeeks);
        expect(presentation.timeline.high).toBeGreaterThanOrEqual(result.highWeeks);
        expect(presentation.timeline.low % 2).toBe(0);
        expect(presentation.timeline.high % 2).toBe(0);
      } else {
        expect(presentation.timeline.low % 2).toBe(0);
        expect(presentation.timeline.high % 2).toBe(0);
        expect(presentation.timeline.low * WEEKS_PER_MONTH).toBeGreaterThanOrEqual(result.lowWeeks - 0.02);
        expect(presentation.timeline.high * WEEKS_PER_MONTH).toBeGreaterThanOrEqual(result.highWeeks - WEEKS_PER_MONTH);
      }
      seen.set(name, `${presentation.timeline.legacyLabel} => ${presentation.timeline.label} | ${presentation.investment.legacyLabel} => ${presentation.investment.label}`);
    }
    expect(seen.get('SIMPLE_SERVICE')).toBe('8–10 WEEKS => 8–10 WEEKS | $5K–$7K => $5K–$7K');
    expect(seen.get('STANDARD_EDITORIAL')).toBe('15–19 WEEKS => 16–20 WEEKS | $17K–$22K => $16K–$22K');
    expect(seen.get('ADVANCED_COMMERCE')).toBe('5–7 MONTHS => 6–8 MONTHS | $27K–$35K => $27K–$35K');
    expect(seen.get('LARGE_PRODUCT')).toBe('8–10 MONTHS => 8–10 MONTHS | $43K–$55K => $43K–$56K');
    expect(seen.get('PORTAL_SYSTEM')).toBe('9–12 MONTHS => 10–12 MONTHS | $52K–$70K => $51K–$71K');
    expect(seen.get('SPATIAL_WORLD')).toBe('12–16 MONTHS => 12–16 MONTHS | $69K–$94K => $69K–$94K');
    expect(seen.get('ZERO_FAMILIES')).toBe('3–5 WEEKS => 4–6 WEEKS | $3K–$4K => $3K–$4K');
    expect(presentEstimate(must(FIXTURES.ADVANCED_COMMERCE)).timeline.founderReview).toBe(false);
    expect(presentEstimate(must(FIXTURES.PORTAL_SYSTEM)).timeline.founderReview).toBe(false);
    expect(presentEstimate(must(FIXTURES.SPATIAL_WORLD)).timeline.founderReview).toBe(false);
    expect(presentEstimate(must(FIXTURES.LARGE_PRODUCT)).timeline.founderReview).toBe(false);
  });

  it('uses even endpoints for every listed week and month example', () => {
    const examples: Array<[number, number, number, number]> = [
      [1, 1, 2, 2],
      [1, 2, 2, 4],
      [2, 3, 2, 4],
      [3, 5, 4, 6],
      [4, 6, 4, 6],
      [5, 7, 6, 8],
      [6, 7, 6, 8],
      [7, 9, 8, 10],
      [8, 11, 8, 12],
      [9, 12, 10, 12],
      [10, 13, 10, 14],
      [11, 15, 12, 16],
      [12, 16, 12, 16],
      [15, 19, 16, 20],
      [16, 20, 16, 20],
    ];
    for (const [low, high, displayLow, displayHigh] of examples) {
      const snapped = evenRange(low, high);
      expect(snapped).toEqual({ low: displayLow, high: displayHigh });
      expect(snapped.low % 2).toBe(0);
      expect(snapped.high % 2).toBe(0);
      expect(snapped.low).toBeGreaterThan(0);
      expect(snapped.low).toBeLessThanOrEqual(snapped.high);
      if (high < 20) {
        const shown = presentTimeline(low, high);
        expect(shown.unit).toBe('WEEKS');
        expect(shown.low).toBe(displayLow);
        expect(shown.high).toBe(displayHigh);
        expect(shown.label).toBe(`${displayLow}–${displayHigh} WEEKS`);
      }
    }
    expect(presentTimeline(15, 19).label).toBe('16–20 WEEKS');
    expect(presentTimeline(16, 20).unit).toBe('MONTHS');
    const commerce = presentEstimate(must(FIXTURES.ADVANCED_COMMERCE));
    const portal = presentEstimate(must(FIXTURES.PORTAL_SYSTEM));
    expect(commerce.timeline.label).toBe('6–8 MONTHS');
    expect(portal.timeline.label).toBe('10–12 MONTHS');
    expect(commerce.policyVersion).toBe('1.1.0');
  });

  it('keeps a founder timeline override on the result', () => {
    const result = must({
      ...FIXTURES.SIMPLE_SERVICE,
      manualModifiers: [
        {
          id: 'ov-weeks',
          field: 'timelineWeeks',
          value: 12,
          reason: 'Client is away in November.',
          author: 'founder',
          timestamp: '2026-10-08T00:00:00.000Z',
        },
      ],
    });
    expect(result.expectedWeeks).toBe(12);
    expect(result.overridesApplied).toHaveLength(1);
    const shown = presentEstimate(result);
    expect(shown.timeline.label).not.toBe('');
    expect(result.expectedWeeks).toBe(12);
  });

  it('leaves historical floors and platform economics untouched', () => {
    expect(HISTORICAL_STARTING_OFFERS.map((offer) => offer.estimatorFloorUsd)).toEqual([3000, 10000]);
    expect(HISTORICAL_STARTING_OFFERS.every((offer) => offer.publicPriceChangeAuthorized === false)).toBe(true);
    expect(canonicalPlatformFeeBasisPoints()).toBe(200);
    expect(LIVE_MONEY_MOVEMENT).toBe(false);
    const priced = presentInvestment(10_000, 12_000, 11_000);
    expect(priced.label).toBe('$10K–$12K');
    expect(priced.label).not.toContain('%');
  });
});
