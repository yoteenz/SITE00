/**
 * Session-persistent workflow store for founder actions.
 * P0.VR.6R7
 */

import type { ReconstructionWorkflowState } from './reconstructionJobOrchestrator.js';
import { createInitialWorkflowState } from './reconstructionJobOrchestrator.js';
import { migrateJobToGuidedSequence } from '../p0vr7r1/guidedReconstructionSequence.js';
import { initializeCropReviewsForJob } from './founderCropIntelligence/index.js';

const STORAGE_KEY = 'site00-rri-workflow-v1';

let memoryState: ReconstructionWorkflowState | null = null;
const listeners = new Set<() => void>();

function hydrateStoredState(raw: ReconstructionWorkflowState): ReconstructionWorkflowState {
  if (raw.guidedSequence) return raw;
  return {
    ...raw,
    autoAdvanceEnabled: raw.autoAdvanceEnabled ?? true,
    guidedSequence: migrateJobToGuidedSequence(raw.job, {
      activeCandidateIndex: raw.activeCandidateIndex,
      autoAdvanceEnabled: raw.autoAdvanceEnabled ?? true,
    }),
  };
}

function loadFromStorage(): ReconstructionWorkflowState | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return hydrateStoredState(JSON.parse(raw) as ReconstructionWorkflowState);
  } catch {
    return null;
  }
}

function saveToStorage(state: ReconstructionWorkflowState | null): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    if (state) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota */
  }
}

function hydrateCropReviews(state: ReconstructionWorkflowState): ReconstructionWorkflowState {
  if (state.cropReviews?.length === state.job.candidateAssets.length) return state;
  return {
    ...state,
    cropReviews: initializeCropReviewsForJob(state.job.candidateAssets),
  };
}

export function getReconstructionWorkflowState(): ReconstructionWorkflowState | null {
  if (!memoryState) {
    memoryState = loadFromStorage() ?? createInitialWorkflowState();
    if (memoryState) {
      memoryState = hydrateCropReviews(memoryState);
      saveToStorage(memoryState);
    }
  }
  return memoryState;
}

export function setReconstructionWorkflowState(state: ReconstructionWorkflowState | null): void {
  memoryState = state;
  saveToStorage(state);
  listeners.forEach((fn) => fn());
}

export function updateReconstructionWorkflow(
  updater: (prev: ReconstructionWorkflowState) => ReconstructionWorkflowState,
): ReconstructionWorkflowState | null {
  const prev = getReconstructionWorkflowState();
  if (!prev) return null;
  const next = updater(prev);
  setReconstructionWorkflowState(next);
  return next;
}

export function subscribeReconstructionWorkflow(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetReconstructionWorkflowForTest(): void {
  memoryState = null;
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
  listeners.forEach((fn) => fn());
}
