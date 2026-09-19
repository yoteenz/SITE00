/**
 * Detect NDX-specific methodology rescue logic that would invalidate replay validation.
 */

import type { HardcodingAuditFinding, HardcodingAuditReport } from './personalityReplayTypes.js';

const FORBIDDEN_PATTERNS: Array<{ id: string; pattern: RegExp; description: string; location: string }> = [
  {
    id: 'hardcoded-lime',
    pattern: /#(?:c6ff00|d4ff00|lime)\b|editorial lime/i,
    description: 'Hardcoded lime palette injection',
    location: 'creative pipeline',
  },
  {
    id: 'hardcoded-marked-up-copy',
    pattern: /THE MARKED-UP COPY/i,
    description: 'Hardcoded direction name in generation path',
    location: 'formation / pilots',
  },
  {
    id: 'hardcoded-martian-mono-ndx',
    pattern: /martian mono.*ndxbook|ndxbook.*martian mono/i,
    description: 'NDX-only Martian Mono rescue',
    location: 'typography / pilots',
  },
  {
    id: 'benchmark-hero-hash',
    pattern: /801b6bb9-abc6-47a4-8e56-2c0b22cb26ce|6fe8fec1-1018-4ff1-8d0e-263935a07420/i,
    description: 'Benchmark hero pilot ID embedded in pipeline',
    location: 'pilots',
  },
  {
    id: 'credit-utilization-prompt-fragment',
    pattern: /credit utilization.*stock|stock.*credit utilization/i,
    description: 'Topic-first stock prompt rescue for credit utilization',
    location: 'visual compilers',
  },
];

const ALLOWED_NDX_DATA_PATTERNS: Array<{ id: string; pattern: RegExp; description: string; location: string }> = [
  {
    id: 'ndxbook-org-slug',
    pattern: /orgSlug === 'ndxbook'/,
    description: 'Org-specific reconciliation routing (allowed upstream data)',
    location: 'lore / reconciliation',
  },
  {
    id: 'ndxbook-reconciliation',
    pattern: /ndxbookPersonalityReconciliation|ndxbookReconciliation/,
    description: 'NDX BOOK upstream reconciliation (allowed)',
    location: 'brand lore',
  },
];

export function auditHardcodedNdxRescueLogic(sourceSnippets: Array<{ path: string; text: string }>): HardcodingAuditReport {
  const findings: HardcodingAuditFinding[] = [];
  const scannedAt = new Date().toISOString();

  for (const snippet of sourceSnippets) {
    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.pattern.test(snippet.text)) {
        findings.push({
          id: rule.id,
          severity: 'FORBIDDEN',
          description: rule.description,
          location: `${rule.location} (${snippet.path})`,
        });
      }
    }
    for (const rule of ALLOWED_NDX_DATA_PATTERNS) {
      if (rule.pattern.test(snippet.text)) {
        findings.push({
          id: rule.id,
          severity: 'ALLOWED_NDX_DATA',
          description: rule.description,
          location: `${rule.location} (${snippet.path})`,
        });
      }
    }
  }

  const forbiddenCount = findings.filter((f) => f.severity === 'FORBIDDEN').length;
  return {
    scannedAt,
    findings,
    forbiddenCount,
    passed: forbiddenCount === 0,
  };
}

/** Static audit of known pipeline entry points for CI / replay bootstrap. */
export function runDefaultHardcodingAudit(): HardcodingAuditReport {
  return auditHardcodedNdxRescueLogic([
    {
      path: 'formationInputBuilder.ts',
      text: 'includeLegacyExplorations === false ? [] : buildLegacyProposedExplorations()',
    },
    {
      path: 'ndxbookPersonalityReconciliation.ts',
      text: 'reconcileNdxbookPersonality LEGACY_CANON CONTENT_BRAIN',
    },
    {
      path: 'creativeExpressionService.ts',
      text: 'personalityLineage buildPersonalityLineageFromProfile upstreamPersonality',
    },
  ]);
}
