import { DEFAULT_ASSUMPTIONS } from './assumptions';

/**
 * Client-facing presentation only.
 * Canonical weeks and dollars stay on the estimate result.
 * This module never feeds a rounded range back into the estimator.
 */
export const PRESENTATION_POLICY_VERSION = '1.0.0';

/** Same month length the previous client formatter used. */
export const WEEKS_PER_MONTH = 4.345;

/** A window whose canonical high is at least this many weeks is shown in months. */
export const MONTH_THRESHOLD_WEEKS = 20;

const EPSILON = 1e-9;

export const COMMERCIAL_LAYERS = {
  STARTING_INVESTMENT: {
    certainty: 'ENTRY',
    binding: false,
    meaning: 'A public entry price for a defined minimum scope. Not a scoped estimate.',
  },
  PROJECT_ESTIMATE: {
    certainty: 'PROJECTED',
    binding: false,
    meaning: 'A calculated range from the client selections. Not a quote.',
  },
  FINAL_PROPOSAL: {
    certainty: 'REVIEWED',
    binding: false,
    meaning: 'A founder-reviewed commercial offer. The estimator does not create this by itself.',
  },
  AGREED_CONTRACT_VALUE: {
    certainty: 'ACCEPTED',
    binding: true,
    meaning: 'The accepted, versioned commitment. Not an illustrative fixture.',
  },
} as const;

/** Historical entry concepts. They are floors in the estimator, not the fixture outputs. */
export const HISTORICAL_STARTING_OFFERS = [
  {
    id: 'SIMPLE_LAYOUT',
    label: 'Simple layout',
    historicalStartingUsd: 3000,
    estimatorFloorUsd: DEFAULT_ASSUMPTIONS.buildFloors.SIMPLE,
    meaning: 'STARTING_INVESTMENT' as const,
    publicPriceChangeAuthorized: false,
  },
  {
    id: 'CUSTOM_BUILD',
    label: 'Custom build',
    historicalStartingUsd: 10000,
    estimatorFloorUsd: DEFAULT_ASSUMPTIONS.buildFloors.CUSTOM,
    meaning: 'STARTING_INVESTMENT' as const,
    publicPriceChangeAuthorized: false,
  },
] as const;

export type TimelinePresentation = {
  unit: 'WEEKS' | 'MONTHS';
  low: number;
  high: number;
  label: string;
  legacyLabel: string;
  founderReview: boolean;
  note: string | null;
};

export type InvestmentPresentation = {
  currency: 'USD';
  increment: number;
  low: number;
  high: number;
  label: string;
  legacyLabel: string;
  founderReview: boolean;
  note: string | null;
};

export type EstimatePresentation = {
  policyVersion: typeof PRESENTATION_POLICY_VERSION;
  timeline: TimelinePresentation;
  investment: InvestmentPresentation;
  note: string | null;
};

function ceilWhole(value: number): number {
  return Math.ceil(value - EPSILON);
}

/** Smallest even whole number that is not below the canonical week value. */
function evenAtLeast(weeks: number): number {
  const whole = Math.max(1, ceilWhole(weeks));
  return whole % 2 === 0 ? whole : whole + 1;
}

function legacyWindow(lowWeeks: number, highWeeks: number): string {
  const low = Math.max(1, Math.round(lowWeeks));
  const high = Math.max(low, Math.round(highWeeks));
  if (high >= MONTH_THRESHOLD_WEEKS) {
    const lowMonths = Math.max(1, Math.round(low / WEEKS_PER_MONTH));
    const highMonths = Math.max(lowMonths, Math.round(high / WEEKS_PER_MONTH));
    return `${lowMonths}–${highMonths} MONTHS`;
  }
  return `${low}–${high} WEEKS`;
}

function legacyInvestment(low: number, high: number): { low: number; high: number; label: string } {
  const left = Math.max(1, Math.round(low / 1000));
  const right = Math.max(left, Math.round(high / 1000));
  return { low: left * 1000, high: right * 1000, label: `$${left}K–$${right}K` };
}

export function presentTimeline(lowWeeks: number, highWeeks: number): TimelinePresentation {
  const low = Math.min(lowWeeks, highWeeks);
  const high = Math.max(lowWeeks, highWeeks);
  const legacyLabel = legacyWindow(low, high);
  if (high >= MONTH_THRESHOLD_WEEKS) {
    const lowMonths = Math.max(1, ceilWhole(low / WEEKS_PER_MONTH));
    const highMonths = Math.max(lowMonths, ceilWhole(high / WEEKS_PER_MONTH));
    const label = `${lowMonths}–${highMonths} MONTHS`;
    const founderReview = label !== legacyLabel;
    return {
      unit: 'MONTHS',
      low: lowMonths,
      high: highMonths,
      label,
      legacyLabel,
      founderReview,
      note: founderReview
        ? `Months are rounded outward from the canonical weeks. They are not snapped to even months. The previous rounded window was ${legacyLabel}.`
        : null,
    };
  }
  const displayLow = evenAtLeast(low);
  const displayHigh = Math.max(displayLow, evenAtLeast(high));
  const label = `${displayLow}–${displayHigh} WEEKS`;
  const founderReview = displayLow - low > 2 || displayHigh - high > 2 || displayHigh - displayLow - (high - low) > 2;
  return {
    unit: 'WEEKS',
    low: displayLow,
    high: displayHigh,
    label,
    legacyLabel,
    founderReview,
    note: founderReview
      ? 'Even-week normalization moves this window by more than two weeks. Review it before treating the display as the client commitment.'
      : null,
  };
}

function incrementsFor(expected: number): number[] {
  if (expected < 10_000) return [500, 1000];
  if (expected < 50_000) return [1000, 2000];
  return [1000, 5000];
}

function cover(low: number, high: number, increment: number): { low: number; high: number } {
  const displayLow = Math.floor((low + EPSILON) / increment) * increment;
  const displayHigh = Math.ceil((high - EPSILON) / increment) * increment;
  return { low: displayLow, high: Math.max(displayLow, displayHigh) };
}

function formatUsd(value: number): string {
  if (value % 1000 === 0) return `$${value / 1000}K`;
  const thousands = value / 1000;
  return `$${Number.isInteger(thousands) ? thousands : thousands.toFixed(1).replace(/\.0$/, '')}K`;
}

export function presentInvestment(low: number, high: number, expected: number): InvestmentPresentation {
  const canonicalLow = Math.min(low, high);
  const canonicalHigh = Math.max(low, high);
  let chosen: { low: number; high: number; increment: number; extra: number } | null = null;
  for (const increment of incrementsFor(expected)) {
    const band = cover(canonicalLow, canonicalHigh, increment);
    const extra = band.high - band.low - (canonicalHigh - canonicalLow);
    if (!chosen || extra < chosen.extra - 0.5) chosen = { ...band, increment, extra };
  }
  const band = chosen ?? { ...cover(canonicalLow, canonicalHigh, 1000), increment: 1000, extra: 0 };
  const legacy = legacyInvestment(canonicalLow, canonicalHigh);
  const label = `${formatUsd(band.low)}–${formatUsd(band.high)}`;
  const founderReview = Math.abs(band.low - legacy.low) > band.increment || Math.abs(band.high - legacy.high) > band.increment;
  return {
    currency: 'USD',
    increment: band.increment,
    low: band.low,
    high: band.high,
    label,
    legacyLabel: legacy.label,
    founderReview,
    note: founderReview
      ? `The covering band differs from the previous thousand-rounding (${legacy.label}) by more than one increment. The internal cost is unchanged.`
      : null,
  };
}

export function presentEstimate(result: {
  lowWeeks: number;
  highWeeks: number;
  investmentLow: number;
  investmentExpected: number;
  investmentHigh: number;
}): EstimatePresentation {
  const timeline = presentTimeline(result.lowWeeks, result.highWeeks);
  const investment = presentInvestment(result.investmentLow, result.investmentHigh, result.investmentExpected);
  const note = [timeline.note, investment.note].filter(Boolean).join(' ') || null;
  return { policyVersion: PRESENTATION_POLICY_VERSION, timeline, investment, note };
}
