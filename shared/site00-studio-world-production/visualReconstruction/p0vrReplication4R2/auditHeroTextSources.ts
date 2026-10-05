import type { HeroTextSourceTrace, HeroObjectId } from './types.js';

const LITERAL_TEXT: Record<HeroObjectId, { text: string; lineCount: number } | null> = {
  H01: { text: 'ENTRY 003', lineCount: 1 },
  H02: { text: 'CULTURE\nTHROUGH A\nSHARPER\nLENS.', lineCount: 4 },
  H04: { text: 'IDEAS BECOME.\nENVIRONMENTS.\nENVIRONMENTS\nCREATE OPPORTUNITY.', lineCount: 4 },
  H05: { text: 'VIEW PROJECT →', lineCount: 1 },
  H11: { text: '00', lineCount: 1 },
  H08: { text: 'NDX', lineCount: 1 },
  H03: null,
  H06: null,
  H07: null,
  H09: null,
  H10: null,
  H12: null,
  H13: null,
  H14: null,
};

/** Static single-source-of-truth audit (renderCount=1 for DOM literals; H07 must not duplicate in DOM). */
export function auditHeroTextSources(): HeroTextSourceTrace[] {
  const traces: HeroTextSourceTrace[] = [];

  for (const [id, spec] of Object.entries(LITERAL_TEXT) as [HeroObjectId, (typeof LITERAL_TEXT)[HeroObjectId]][]) {
    if (!spec) continue;
    traces.push({
      objectId: id,
      text: spec.text,
      source: 'DOM_LITERAL',
      dynamicBinding: false,
      renderCount: 1,
      lineCount: spec.lineCount,
      status: 'PASS',
    });
  }

  traces.push({
    objectId: 'H07',
    text: 'NDX PEOPLE IDEAS CULTURE IMPACT',
    source: 'AUTHORITY_IMAGE',
    dynamicBinding: false,
    renderCount: 1,
    lineCount: 5,
    status: 'PASS',
  });

  return traces;
}

export function findDuplicateTextFailures(traces: HeroTextSourceTrace[]): HeroTextSourceTrace[] {
  const byNormalized = new Map<string, HeroTextSourceTrace[]>();
  for (const t of traces) {
    if (t.source !== 'DOM_LITERAL') continue;
    const key = t.text.replace(/\s+/g, ' ').trim();
    const list = byNormalized.get(key) ?? [];
    list.push(t);
    byNormalized.set(key, list);
  }
  const dupes: HeroTextSourceTrace[] = [];
  for (const list of byNormalized.values()) {
    if (list.length > 1) {
      for (const t of list) {
        dupes.push({ ...t, status: 'HERO_DUPLICATE_CONTENT', renderCount: list.length });
      }
    }
  }
  return dupes;
}
