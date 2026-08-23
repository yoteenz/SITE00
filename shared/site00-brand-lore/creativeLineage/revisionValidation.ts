/**
 * Revision surgicality + world contamination guards.
 */

import type { CreativeAssetRecord } from './types.js';
import type { CreativeRevisionSpec, RevisionGenerationBrief } from './revisionTypes.js';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from '../canonicalCreativeRangeConstants.js';

export type ValidationResult = {
  result: 'PASS' | 'WARNING' | 'FAIL';
  passed: boolean;
  notes: string[];
};

export function runRevisionWorldContaminationTest(params: {
  spec: CreativeRevisionSpec;
  parentAsset: CreativeAssetRecord;
  compiledBrief: RevisionGenerationBrief;
  originDirectionName: string;
}): ValidationResult {
  const notes: string[] = [];
  const delta = params.compiledBrief.deltaPrompt.toLowerCase();
  const origin = params.originDirectionName.toLowerCase();

  for (const other of CANONICAL_NDXBOOK_DIRECTION_NAMES) {
    if (other.toLowerCase() === origin) continue;
    if (delta.includes(other.toLowerCase())) {
      notes.push(`Possible cross-direction contamination: ${other}`);
    }
  }

  if (params.spec.directionId !== params.parentAsset.directionLineage.directionId) {
    notes.push('Revision directionId differs from parent — migration not allowed without explicit request');
  }
  if (params.spec.worldId !== params.parentAsset.directionLineage.worldId) {
    notes.push('Revision worldId differs from parent');
  }
  if (/martian mono|host ui|site 00 ui/i.test(delta) && !/never platform|do not use|avoid:/i.test(delta)) {
    notes.push('Host UI typography leakage detected in compiled brief');
  }

  const failed = notes.some((n) => n.includes('differs') || n.includes('leakage'));
  return {
    result: failed ? 'FAIL' : notes.length ? 'WARNING' : 'PASS',
    passed: !failed,
    notes,
  };
}

export function runRevisionSurgicalityTest(params: {
  spec: CreativeRevisionSpec;
  compiledBrief: RevisionGenerationBrief;
}): ValidationResult {
  const notes: string[] = [];
  const { spec, compiledBrief } = params;

  for (const locked of spec.lockedElements) {
    const label = locked.replace(/_/g, ' ').toLowerCase();
    const inChange = compiledBrief.change.some((c) => c.toLowerCase().includes(label));
    if (inChange) {
      notes.push(`FAIL: locked element ${locked} appears in CHANGE instructions`);
    }
    const inPreserve = compiledBrief.preserve.some((p) => p.toLowerCase().includes(label));
    if (!inPreserve) {
      notes.push(`WARNING: locked element ${locked} not explicitly listed in PRESERVE`);
    }
  }

  for (const mutable of spec.mutableElements) {
    const label = mutable.replace(/_/g, ' ').toLowerCase();
    const represented =
      compiledBrief.change.some((c) => c.toLowerCase().includes(label)) ||
      Object.keys(spec.categoryNotes).some((k) => {
        const map: Record<string, string> = {
          typography: 'TYPOGRAPHY',
          color: 'COLOR',
          composition: 'COMPOSITION',
          copy: 'COPY',
          imagery: 'ASSETS',
        };
        return map[k] === mutable && spec.categoryNotes[k as keyof typeof spec.categoryNotes];
      });
    if (!represented) {
      notes.push(`WARNING: mutable element ${mutable} not represented in compiled brief`);
    }
  }

  if (spec.preserveUnspecified) {
    const hasDefault = compiledBrief.preserve.some((p) => p.includes('unmentioned'));
    if (!hasDefault) notes.push('WARNING: preserveUnspecified=true but default preserve line missing');
  }

  if (/redesign everything|start over|new concept/i.test(compiledBrief.deltaPrompt)) {
    notes.push('FAIL: unrelated full redesign language in delta prompt');
  }

  const failed = notes.some((n) => n.startsWith('FAIL:'));
  return {
    result: failed ? 'FAIL' : notes.length ? 'WARNING' : 'PASS',
    passed: !failed,
    notes,
  };
}

export function runHostFontRevisionLeakageTest(brief: RevisionGenerationBrief): ValidationResult {
  const delta = brief.deltaPrompt;
  const leaked =
    /martian mono|inter\b|system-ui|host ui/i.test(delta) &&
    !/never platform|do not use|avoid:/i.test(delta);
  return {
    result: leaked ? 'FAIL' : 'PASS',
    passed: !leaked,
    notes: leaked ? ['Host font reference in revision brief'] : [],
  };
}

import { detectRevisionLockConflicts, hasBlockingLockConflicts } from './revisionLockConflictDetection.js';

export function canApproveRevisionGeneration(params: {
  spec: CreativeRevisionSpec;
  surgicality: ValidationResult;
  contamination: ValidationResult;
  hostFont?: ValidationResult;
  parentAssetAvailable: boolean;
  parentPromptLineageAvailable: boolean;
  lockConflicts?: ReturnType<typeof detectRevisionLockConflicts>;
}): { approved: boolean; gateReason: string } {
  if (!params.parentAssetAvailable) {
    return { approved: false, gateReason: 'Parent asset unavailable' };
  }
  if (!params.surgicality.passed) {
    return { approved: false, gateReason: 'REVISION_SURGICALITY_TEST failed' };
  }
  if (!params.contamination.passed) {
    return { approved: false, gateReason: 'REVISION_WORLD_CONTAMINATION_TEST failed' };
  }
  if (params.hostFont && !params.hostFont.passed) {
    return { approved: false, gateReason: 'Host font leakage in revision brief' };
  }
  const conflicts = params.lockConflicts ?? detectRevisionLockConflicts(params.spec);
  if (conflicts.length > 0) {
    return { approved: false, gateReason: conflicts[0]!.message };
  }
  if (hasBlockingLockConflicts(params.spec) && conflicts.length > 0) {
    return { approved: false, gateReason: conflicts[0]!.message };
  }
  if (params.spec.status !== 'APPROVED_FOR_GENERATION') {
    return {
      approved: false,
      gateReason: 'Founder must explicitly approve spec for generation (APPROVED_FOR_GENERATION)',
    };
  }
  return { approved: true, gateReason: 'Approved for live revision generation' };
}

export function assessRevisionVsNewExploration(spec: CreativeRevisionSpec): ValidationResult {
  if (spec.severity === 'REINTERPRET' && spec.mutableElements.length >= 6) {
    return {
      result: 'WARNING',
      passed: true,
      notes: ['THIS MAY BE A NEW EXPLORATION RATHER THAN A REVISION — founder should confirm methodology'],
    };
  }
  return { result: 'PASS', passed: true, notes: [] };
}
