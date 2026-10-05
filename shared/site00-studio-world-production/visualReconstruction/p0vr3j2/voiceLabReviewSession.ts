/**
 * P0.VR.3J.2 — Voice Lab source vs derived founder review session.
 */

import { getLatestImplementationSnapshot } from '../p0vr3e/implementationSnapshotRegistry.js';
import {
  COMPOSER_DERIVED_DRAFT_LABEL,
  FAMILY_SOURCE_SNAPSHOT_LABEL,
} from '../p0vr3l/constants.js';
import { getFamilyDerivedRecord } from '../p0vr3l/familyDerivation.js';
import { runFamilyFidelityQa } from '../p0vr3l/familyFidelityQa.js';
import type { VoiceLabSourceDerivedReview, VoiceLabReviewSnapshotSet } from './types.js';
import { VOICE_LAB_TARGET_ID } from './types.js';

const SOURCE_SCREEN_ID = 'character-lab';
const TARGET_SCREEN_ID = 'character-lab-voice-lab';

function snapshotSet(projectId: string, screenId: string, label?: string): VoiceLabReviewSnapshotSet {
  const viewports = ['mobile', 'tablet', 'desktop'] as const;
  const urls: VoiceLabReviewSnapshotSet = { mobile: null, tablet: null, desktop: null, complete: false };
  let valid = 0;

  for (const vp of viewports) {
    const snap = getLatestImplementationSnapshot(projectId, screenId, vp);
    if (snap?.captureStatus === 'CURRENT' && snap.qaPassed && (!label || snap.snapshotLabel === label)) {
      urls[vp] = snap.publicUrl || null;
      valid++;
    } else if (snap?.captureStatus === 'CURRENT' && snap.qaPassed && !label) {
      urls[vp] = snap.publicUrl || null;
      valid++;
    }
  }

  urls.complete = valid === 3;
  return urls;
}

export function buildVoiceLabSourceDerivedReview(
  targetId: typeof VOICE_LAB_TARGET_ID = 'ndxbook:character-lab:voice-lab-tab',
): VoiceLabSourceDerivedReview {
  const derived = getFamilyDerivedRecord(targetId);

  const source = snapshotSet('ndxbook', SOURCE_SCREEN_ID, FAMILY_SOURCE_SNAPSHOT_LABEL);
  const derivedSet = snapshotSet('ndxbook', TARGET_SCREEN_ID, COMPOSER_DERIVED_DRAFT_LABEL);

  const expectedDifferences = derived?.allowedDifferences ?? [
    'active tab',
    'tab-specific content',
    'tab-specific controls',
    'tab-specific states',
  ];

  const unexpectedDifferences: string[] = [];
  if (derived && !derivedSet.complete) unexpectedDifferences.push('TARGET_SNAPSHOT_INCOMPLETE');
  if (!source.complete) unexpectedDifferences.push('SOURCE_SNAPSHOT_INCOMPLETE');

  const familyQa = derived
    ? runFamilyFidelityQa(derived)
    : {
        targetId,
        passed: false,
        shellDrift: true,
        geometryDrift: false,
        responsiveDrift: false,
        referenceConflict: false,
        issues: ['DERIVATION_RECORD_MISSING'],
      };

  if (familyQa.shellDrift) unexpectedDifferences.push('SHELL_DRIFT');
  if (familyQa.geometryDrift) unexpectedDifferences.push('GEOMETRY_DRIFT');

  const readyForFounderReview =
    source.complete && derivedSet.complete && familyQa.passed && Boolean(derived);

  const reviewStatus: VoiceLabSourceDerivedReview['reviewStatus'] = readyForFounderReview
    ? 'READY_FOR_REVIEW'
    : familyQa.passed
      ? 'UNREVIEWED'
      : 'NEEDS_REVISION';

  return {
    targetId,
    sourceLabel: FAMILY_SOURCE_SNAPSHOT_LABEL,
    derivedLabel: COMPOSER_DERIVED_DRAFT_LABEL,
    source,
    derived: derivedSet,
    expectedDifferences,
    unexpectedDifferences,
    familyQa,
    reviewStatus,
    readyForFounderReview,
    derivation: derived
      ? {
          record: derived,
          receipt: {
            receiptId: `derivation:${targetId}:review`,
            targetId,
            projectId: derived.projectId,
            sourceSiblingId: derived.sourceSiblingId,
            sharedShellId: derived.sharedShellId,
            sourceSnapshotLabel: FAMILY_SOURCE_SNAPSHOT_LABEL,
            targetSnapshotLabel: COMPOSER_DERIVED_DRAFT_LABEL,
            createdAt: derived.derivedAt,
            lineage: derived.createdBySprint,
          },
          queueStatus: 'DERIVED_DRAFT',
          newRouteCreated: false,
          registrationOnly: true,
        }
      : null,
  };
}
