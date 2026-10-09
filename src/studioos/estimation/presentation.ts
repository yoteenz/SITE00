import { DEFAULT_ASSUMPTIONS } from './assumptions';

/**
 * Client-facing presentation only.
 * Canonical weeks and dollars stay on the estimate result.
 * This module never feeds a rounded range back into the estimator.
 *
 * Policy 1.1.0: both ends of a client timeline are even numbers, in weeks
 * and in months. Policy 1.0.0 is superseded. That version said months were
 * rounded outward and were not forced even.
 */
export const PRESENTATION_POLICY_VERSION = '1.1.0';

/** Same month length the previous client formatter used. */
export const WEEKS_PER_MONTH = 4.345;

/** A window whose rounded high week is this many weeks or more is shown in months. */
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

/**
 * Even client endpoint. A fractional value rises to the next whole number,
 * then an odd whole number rises to the next even number. 1 becomes 2.
 * Zero and negative inputs become 2 so a display cannot collapse.
 */
export function evenEndpoint(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 2;
  const whole = Math.max(1, ceilWhole(value));
  return whole % 2 === 0 ? whole : whole + 1;
}

/**
 * Both ends even, ordered, and at least 2.
 * A source span that would land on one even number opens to the next even high,
 * so a range does not become a single number.
 */
export function evenRange(low: number, high: number): { low: number; high: number } {
  const orderedLow = Math.min(low, high);
  const orderedHigh = Math.max(low, high);
  const displayLow = evenEndpoint(orderedLow);
  let displayHigh = Math.max(displayLow, evenEndpoint(orderedHigh));
  if (orderedHigh - orderedLow > EPSILON && displayHigh === displayLow) displayHigh += 2;
  return { low: displayLow, high: displayHigh };
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

function roundedWeeks(low: number, high: number): { low: number; high: number } {
  const roundedLow = Math.max(1, Math.round(low));
  const roundedHigh = Math.max(roundedLow, Math.round(high));
  return { low: roundedLow, high: roundedHigh };
}

export function presentTimeline(lowWeeks: number, highWeeks: number): TimelinePresentation {
  const low = Math.min(lowWeeks, highWeeks);
  const high = Math.max(lowWeeks, highWeeks);
  const legacyLabel = legacyWindow(low, high);
  const rounded = roundedWeeks(low, high);
  if (rounded.high >= MONTH_THRESHOLD_WEEKS) {
    const lowMonths = Math.max(1, Math.round(rounded.low / WEEKS_PER_MONTH));
    const highMonths = Math.max(lowMonths, Math.round(rounded.high / WEEKS_PER_MONTH));
    const display = evenRange(lowMonths, highMonths);
    const label = `${display.low}–${display.high} MONTHS`;
    const founderReview = display.low - lowMonths > 2
      || display.high - highMonths > 2
      || display.high - display.low - (highMonths - lowMonths) > 2;
    return {
      unit: 'MONTHS',
      low: display.low,
      high: display.high,
      label,
      legacyLabel,
      founderReview,
      note: founderReview
        ? `Even-month normalization moves this window by more than two months from the rounded window ${lowMonths}–${highMonths}. The previous client window was ${legacyLabel}. Raw weeks are unchanged.`
        : null,
    };
  }
  const display = evenRange(low, high);
  const label = `${display.low}–${display.high} WEEKS`;
  const founderReview = display.low - low > 2 || display.high - high > 2 || display.high - display.low - (high - low) > 2;
  return {
    unit: 'WEEKS',
    low: display.low,
    high: display.high,
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
