/**
 * P0.VR.REPLICATION.2 — Shell match gate (macro band fidelity).
 */

import type { AuthorityShellBlueprint } from './authorityShellBlueprint.js';
import { NDX_AUTHORITY_SHELL_BANDS, type NdxAuthorityShellBandId } from './constants.js';

export type ShellBandMatch = {
  bandId: NdxAuthorityShellBandId;
  status: 'PASS' | 'FAIL' | 'WARN';
  reason: string | null;
};

export type ShellMatchResult = {
  resultId: string;
  status: 'PASS' | 'FAIL';
  gateLabel: 'SHELL MATCH' | 'SHELL FAIL — REBUILD REQUIRED';
  score: number;
  bands: ShellBandMatch[];
  blockingReasons: string[];
};

export function evaluateShellMatch(input: {
  blueprint: AuthorityShellBlueprint;
  twinRenderMode: string | null | undefined;
  twinBandPresence: Partial<Record<NdxAuthorityShellBandId, boolean>>;
}): ShellMatchResult {
  const bands: ShellBandMatch[] = NDX_AUTHORITY_SHELL_BANDS.map((bandId) => {
    const present = input.twinBandPresence[bandId] === true;
    if (!present) {
      return { bandId, status: 'FAIL', reason: `${bandId} missing from twin shell` };
    }
    return { bandId, status: 'PASS', reason: null };
  });

  const failCount = bands.filter((b) => b.status === 'FAIL').length;
  const score = Math.round(((bands.length - failCount) / bands.length) * 100);
  const shellFirst = input.twinRenderMode === 'SHELL_FIRST_NDX_OVERVIEW';
  const blockingReasons: string[] = [];
  if (!shellFirst) blockingReasons.push('Twin render mode is not shell-first reconstruction');
  if (failCount > 0) blockingReasons.push(`${failCount} shell bands missing or mis-ordered`);

  const pass = shellFirst && failCount === 0;
  return {
    resultId: `smr_${input.blueprint.blueprintId}`,
    status: pass ? 'PASS' : 'FAIL',
    gateLabel: pass ? 'SHELL MATCH' : 'SHELL FAIL — REBUILD REQUIRED',
    score,
    bands,
    blockingReasons,
  };
}

/** Expected band markers for the shell-first React surface (pilot). */
export function expectedShellFirstTwinBandPresence(): Record<NdxAuthorityShellBandId, boolean> {
  return Object.fromEntries(NDX_AUTHORITY_SHELL_BANDS.map((id) => [id, true])) as Record<
    NdxAuthorityShellBandId,
    boolean
  >;
}
