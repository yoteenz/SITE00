/**
 * C1.9R3 — Temporarily clear Railway fallback/mock flags for live Meridian acceptance.
 * Production may keep SITE00_CREATIVE_REASONING_FORCE_FALLBACK=1 for normal ops;
 * live acceptance runs override it for the duration of the proof only.
 */

export type MeridianLiveAcceptanceEnvSnapshot = {
  forceFallback?: string;
  mockFull?: string;
  meridianLiveAcceptance?: string;
};

export function captureMeridianLiveAcceptanceEnv(): MeridianLiveAcceptanceEnvSnapshot {
  return {
    forceFallback: process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK,
    mockFull: process.env.SITE00_CREATIVE_REASONING_MOCK_FULL,
    meridianLiveAcceptance: process.env.SITE00_MERIDIAN_LIVE_ACCEPTANCE,
  };
}

export function applyMeridianLiveAcceptanceEnv(): void {
  delete process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK;
  delete process.env.SITE00_CREATIVE_REASONING_MOCK_FULL;
  process.env.SITE00_MERIDIAN_LIVE_ACCEPTANCE = '1';
}

export function restoreMeridianLiveAcceptanceEnv(snapshot: MeridianLiveAcceptanceEnvSnapshot): void {
  if (snapshot.forceFallback === undefined) {
    delete process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK;
  } else {
    process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK = snapshot.forceFallback;
  }
  if (snapshot.mockFull === undefined) {
    delete process.env.SITE00_CREATIVE_REASONING_MOCK_FULL;
  } else {
    process.env.SITE00_CREATIVE_REASONING_MOCK_FULL = snapshot.mockFull;
  }
  if (snapshot.meridianLiveAcceptance === undefined) {
    delete process.env.SITE00_MERIDIAN_LIVE_ACCEPTANCE;
  } else {
    process.env.SITE00_MERIDIAN_LIVE_ACCEPTANCE = snapshot.meridianLiveAcceptance;
  }
}

export async function withMeridianLiveAcceptanceEnv<T>(fn: () => Promise<T>): Promise<T> {
  const snapshot = captureMeridianLiveAcceptanceEnv();
  applyMeridianLiveAcceptanceEnv();
  try {
    return await fn();
  } finally {
    restoreMeridianLiveAcceptanceEnv(snapshot);
  }
}
