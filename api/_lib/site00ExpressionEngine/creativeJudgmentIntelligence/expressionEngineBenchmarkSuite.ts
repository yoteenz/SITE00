/**
 * ExpressionEngineBenchmarkSuite — 50+ diverse briefs.
 */

import type { BenchmarkBrief } from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

export const BENCHMARK_SUITE_VERSION = 'P0.CJ.1-benchmark-v1';

const CATEGORIES = [
  'BEAUTY',
  'HAIR',
  'TRUCKING_LOGISTICS',
  'MYSTIC_SPIRITUAL',
  'CREATIVE_TECHNOLOGY',
  'HEALTH_CLINICAL',
  'FOOD',
  'FASHION',
  'FINANCE',
  'HOME',
  'PLANTS',
  'B2B',
  'CONSUMER_APPS',
  'LUXURY',
  'LOW_COST_UTILITY',
  'REGULATED_CONSERVATIVE',
  'PLAYFUL',
  'CULTURAL_EDITORIAL',
] as const;

function brief(category: string, index: number): BenchmarkBrief {
  const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    briefId: `bench-${slug}-${String(index).padStart(2, '0')}`,
    category,
    brandId: index % 3 === 0 ? 'ndxbook' : index % 3 === 1 ? 'verdant-row' : `benchmark-${slug}`,
    projectId: index % 3 === 0 ? 'ndxbook' : index % 3 === 1 ? 'verdant-row' : `proj-${slug}`,
    title: `${category.replace(/_/g, ' ')} Launch ${index}`,
    objective: `Prove distinct mechanism for ${category} category without generic topic thinking`,
    constraints: ['No resize-only package', 'Brand-specific mechanism required'],
  };
}

export const EXPRESSION_ENGINE_BENCHMARK_BRIEFS: BenchmarkBrief[] = (() => {
  const out: BenchmarkBrief[] = [];
  let n = 0;
  for (const cat of CATEGORIES) {
    for (let i = 1; i <= 3; i++) {
      n++;
      out.push(brief(cat, n));
    }
  }
  while (out.length < 54) {
    n++;
    out.push(brief('CONSUMER_APPS', n));
  }
  return out.slice(0, 60);
})();

export function getBenchmarkBriefsByCategory(category: string): BenchmarkBrief[] {
  return EXPRESSION_ENGINE_BENCHMARK_BRIEFS.filter((b) => b.category === category);
}

export function getBenchmarkCoverage(): { total: number; categories: number; ndxOnly: number } {
  const ndxOnly = EXPRESSION_ENGINE_BENCHMARK_BRIEFS.filter((b) => b.brandId === 'ndxbook').length;
  return {
    total: EXPRESSION_ENGINE_BENCHMARK_BRIEFS.length,
    categories: new Set(EXPRESSION_ENGINE_BENCHMARK_BRIEFS.map((b) => b.category)).size,
    ndxOnly,
  };
}
