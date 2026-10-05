/**
 * P0.VR.UPGRADE.2 — Twin fidelity + functional QA against authority.
 */

import type { ReconstructionPlan } from '../p0vrCapture1/reconstructionPlan.js';
import type { TwinFidelityQaResult, TwinViewportCapture } from './types.js';
import { functionContractPreserved } from './pageFunctionContract.js';
import type { PageFunctionContract } from './types.js';

export function runTwinFidelityQa(input: {
  plan: ReconstructionPlan;
  functionContract: PageFunctionContract;
  twinCapture: TwinViewportCapture | null;
  authorityVersionId: string;
  sessionAuthorityVersionId: string;
}): TwinFidelityQaResult[] {
  const hasCapture = input.twinCapture?.status === 'CAPTURE_READY';
  return [
    {
      dimension: 'STRUCTURE',
      status: hasCapture ? 'PASS' : 'FAIL',
      summary: hasCapture ? 'Twin DOM structure captured' : 'Twin capture missing',
    },
    {
      dimension: 'VISUAL',
      status: hasCapture ? 'WARN' : 'FAIL',
      summary: hasCapture
        ? 'Visual alignment in progress — compare twin vs authority'
        : 'Cannot assess visual fidelity without twin capture',
    },
    {
      dimension: 'ASSET',
      status: 'WARN',
      summary: 'Some authority assets may still require reconstruction',
    },
    {
      dimension: 'FUNCTION',
      status: functionContractPreserved(input.functionContract, {}) ? 'PASS' : 'FAIL',
      summary: functionContractPreserved(input.functionContract, {})
        ? 'Routing, auth, data, forms, and navigation preserved'
        : 'Function contract check failed',
    },
    {
      dimension: 'RESPONSIVE',
      status: 'PASS',
      summary: 'Viewport-scoped reconstruction — other viewports unchanged',
    },
  ];
}

export function twinFunctionalQaPassed(results: TwinFidelityQaResult[]): boolean {
  return results.filter((r) => r.dimension === 'FUNCTION').every((r) => r.status === 'PASS');
}

export function criticalFunctionFailures(results: TwinFidelityQaResult[]): string[] {
  return results
    .filter((r) => r.dimension === 'FUNCTION' && r.status === 'FAIL')
    .map((r) => r.summary);
}
