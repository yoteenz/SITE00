/**
 * CAST NDX — founder character reference upload + bible storage tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  decomposeFounderCastingReference,
  founderReferencePromptNotes,
  storeFounderCastingReferenceInBible,
  uploadFounderCastingReference,
} from '../shared/site00-studio-world-production/characterVisualCasting/founderReferenceIngestion.js';
import { buildEmptyVisualCastingState } from '../shared/site00-studio-world-production/characterVisualCasting/stateMachine.js';
import { buildCharacterTruthSnapshot } from '../shared/site00-studio-world-production/characterVisualCasting/characterTruthSnapshot.js';
import { buildNdxFounderCharacterDiscoveryRun } from '../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';
import {
  initializeFounderCharacterDiscoveryRoom,
} from '../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js';
import {
  resetFounderCharacterDiscoveryMemory,
  resetFounderCharacterDiscoveryStoreModeCache,
  saveFounderCharacterDiscoveryRun,
} from '../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js';
import {
  storeFounderCastingReferenceInBible as storeReferenceBibleApi,
  uploadFounderCastingReference as uploadFounderCastingReferenceApi,
} from '../api/_lib/site00Evolve/characterVisualCasting/characterVisualCastingService.js';
import { resetCharacterContinuityMemory } from '../api/_lib/site00Evolve/characterContinuity/characterContinuityMemoryStore.js';
import { resetCharacterContinuityStoreModeCache } from '../api/_lib/site00Evolve/characterContinuity/characterContinuityStoreAdapter.js';

const ROOT = join(process.cwd());
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('CAST NDX founder reference ingestion', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetFounderCharacterDiscoveryMemory();
    resetFounderCharacterDiscoveryStoreModeCache();
    resetCharacterContinuityMemory();
    resetCharacterContinuityStoreModeCache();
  });

  it('upload → decompose → bible store lifecycle', () => {
    let state = buildEmptyVisualCastingState();
    const snapshot = buildCharacterTruthSnapshot({
      run: buildNdxFounderCharacterDiscoveryRun(),
      version: 1,
      lockedForCasting: true,
    });
    state = {
      ...state,
      visualCastingReady: true,
      truthSnapshots: [snapshot],
      activeTruthSnapshotId: snapshot.snapshotId,
    };

    state = uploadFounderCastingReference(state, {
      previewUrl: 'https://example.test/face.webp',
      storagePath: 'site00/character-casting-references/ndxbook/ref-1.webp',
      role: 'FACE',
      label: 'North star face',
    });
    expect(state.founderReferences).toHaveLength(1);

    state = decomposeFounderCastingReference(state, state.founderReferences[0]!.referenceId);
    expect(state.founderReferences[0]?.decomposedSignals.length).toBeGreaterThan(0);
    expect(state.castingAuthority?.projectVisualCanonNotes.length).toBeGreaterThan(0);

    state = storeFounderCastingReferenceInBible(state, state.founderReferences[0]!.referenceId, 'receipt-1');
    expect(state.founderReferences[0]?.storedInBible).toBe(true);
    expect(state.referencePackSummary.faceAnchors).toBeGreaterThan(0);
    expect(founderReferencePromptNotes(state).length).toBeGreaterThan(0);
  });

  it('API upload + bible store path', async () => {
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    let run = buildNdxFounderCharacterDiscoveryRun();
    const snapshot = buildCharacterTruthSnapshot({ run, version: 1, lockedForCasting: true });
    run = {
      ...run,
      visualCastingState: {
        ...buildEmptyVisualCastingState(),
        visualCastingReady: true,
        founderIKnowHerConfirmed: true,
        characterTruthLockedForCasting: true,
        truthSnapshots: [snapshot],
        activeTruthSnapshotId: snapshot.snapshotId,
      },
    };
    await saveFounderCharacterDiscoveryRun(run);

    const uploaded = await uploadFounderCastingReferenceApi({
      projectId: 'ndxbook',
      imageData: TINY_PNG,
      role: 'FULL_LOOK',
      label: 'Founder board',
    });
    const referenceId = uploaded.visualCastingState?.founderReferences.at(-1)?.referenceId;
    expect(referenceId).toBeTruthy();
    expect(uploaded.visualCastingState?.founderReferences.at(-1)?.status).toBe('DECOMPOSED');

    const stored = await storeReferenceBibleApi({ projectId: 'ndxbook', referenceId: referenceId! });
    expect(
      stored.visualCastingState?.founderReferences.find((entry) => entry.referenceId === referenceId)?.storedInBible,
    ).toBe(true);
  });

  it('casting page exposes upload UI', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectCharacterCastingPage.tsx'), 'utf8');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-character-casting.css'), 'utf8');
    expect(page).toContain('TAP TO UPLOAD');
    expect(page).toContain('STORE IN BIBLE');
    expect(page).toContain('REGENERATE CASTING FROM REFERENCES');
    expect(css).toContain('upload-zone');
  });
});
