/**
 * Detect lock/change contradictions before paid revision generation.
 */

import type { CreativeRevisionSpec, RevisionElementKey } from './revisionTypes.js';

export type LockConflict = {
  element: RevisionElementKey | string;
  lockSource: string;
  changeSource: string;
  message: string;
};

const ELEMENT_CATEGORY_MAP: Partial<Record<RevisionElementKey, string[]>> = {
  TYPOGRAPHY: ['typography'],
  COLOR: ['color'],
  COMPOSITION: ['composition'],
  COPY: ['copy'],
  ASSETS: ['imagery'],
  CROP: ['crop'],
  FORMAT: ['formatBehavior'],
  ANNOTATIONS: ['annotation'],
  MATERIALS: ['material'],
  INFORMATION: ['hierarchy'],
};

function categoryTouchesElement(
  spec: CreativeRevisionSpec,
  element: RevisionElementKey,
): boolean {
  const cats = ELEMENT_CATEGORY_MAP[element] ?? [];
  return cats.some((cat) => {
    const note = spec.categoryNotes[cat as keyof typeof spec.categoryNotes];
    return Boolean(note?.trim());
  });
}

export function detectRevisionLockConflicts(spec: CreativeRevisionSpec): LockConflict[] {
  const conflicts: LockConflict[] = [];

  for (const locked of spec.lockedElements) {
    if (spec.mutableElements.includes(locked)) {
      conflicts.push({
        element: locked,
        lockSource: 'lockedElements',
        changeSource: 'mutableElements',
        message: `${locked} is both LOCKED and marked CHANGE — resolve before generation`,
      });
    }
  }

  for (const locked of spec.lockedElements) {
    if (categoryTouchesElement(spec, locked)) {
      conflicts.push({
        element: locked,
        lockSource: 'lockedElements',
        changeSource: 'categoryNotes',
        message: `${locked} is LOCKED but category notes request changes — resolve before generation`,
      });
    }
  }

  if (spec.lockedElements.includes('TYPOGRAPHY') && spec.requestedTypographyChanges.length > 0) {
    conflicts.push({
      element: 'TYPOGRAPHY',
      lockSource: 'lockedElements',
      changeSource: 'requestedTypographyChanges',
      message: 'Typography is LOCKED but typography changes were requested',
    });
  }

  if (spec.lockedElements.includes('COPY') && spec.requestedCopyChanges.length > 0) {
    conflicts.push({
      element: 'COPY',
      lockSource: 'lockedElements',
      changeSource: 'requestedCopyChanges',
      message: 'Copy is LOCKED but copy changes were requested',
    });
  }

  if (spec.lockedElements.includes('COLOR') && spec.requestedColorChanges.length > 0) {
    conflicts.push({
      element: 'COLOR',
      lockSource: 'lockedElements',
      changeSource: 'requestedColorChanges',
      message: 'Color is LOCKED but color changes were requested',
    });
  }

  if (spec.lockedElements.includes('COMPOSITION')) {
    const compNote = spec.categoryNotes.composition?.toLowerCase() ?? '';
    if (/move|relocate|opposite|resize|reposition|crop/.test(compNote)) {
      conflicts.push({
        element: 'COMPOSITION',
        lockSource: 'lockedElements',
        changeSource: 'categoryNotes.composition',
        message: 'Composition is LOCKED but composition notes request movement/crop changes',
      });
    }
  }

  return conflicts;
}

export function hasBlockingLockConflicts(spec: CreativeRevisionSpec): boolean {
  return detectRevisionLockConflicts(spec).length > 0;
}
