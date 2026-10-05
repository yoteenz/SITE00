/**
 * Losing-world visual DNA contamination guard.
 */

export function runLosingWorldVisualDnaContaminationTest(params: {
  translatedPayload: Record<string, unknown>;
  originDirectionName: string;
  winningDirectionName: string;
  explicitTraitPromotion: boolean;
}): { passed: boolean; result: 'PASS' | 'FAIL'; notes: string[] } {
  if (params.explicitTraitPromotion) {
    return { passed: true, result: 'PASS', notes: ['Explicit trait-level canon promotion approved'] };
  }

  const raw = JSON.stringify(params.translatedPayload).toLowerCase();
  const originTokens = params.originDirectionName
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 4);
  const leaks = originTokens.filter((t) => raw.includes(t) && !raw.includes('not ' + t));

  const forbiddenPatterns = ['martian mono', 'site00 red', 'host font', 'exact layout clone'];
  const patternHits = forbiddenPatterns.filter((p) => raw.includes(p));

  const notes = [
    ...leaks.map((l) => `Origin direction token leak: ${l}`),
    ...patternHits.map((p) => `Forbidden pattern: ${p}`),
  ];

  const passed = notes.length === 0;
  return { passed, result: passed ? 'PASS' : 'FAIL', notes: passed ? ['No losing-world visual DNA contamination'] : notes };
}

export function runHostFontLeakageTest(payload: Record<string, unknown>): { passed: boolean; notes: string[] } {
  const raw = JSON.stringify(payload).toLowerCase();
  const hits = ['martian mono', 'host font', 'site00 sans'].filter((h) => raw.includes(h));
  return { passed: hits.length === 0, notes: hits };
}

export function runSite00VisualDnaLeakageTest(payload: Record<string, unknown>): { passed: boolean; notes: string[] } {
  const raw = JSON.stringify(payload).toLowerCase();
  const hits = ['site00 red', 'control room', 'frontal slayer'].filter((h) => raw.includes(h));
  return { passed: hits.length === 0, notes: hits };
}
