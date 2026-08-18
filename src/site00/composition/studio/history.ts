import type { CompositionStudioDocument } from './types';

export type HistoryState = {
  past: CompositionStudioDocument[];
  present: CompositionStudioDocument;
  future: CompositionStudioDocument[];
};

const MAX_HISTORY = 50;

export function createHistoryState(doc: CompositionStudioDocument): HistoryState {
  return { past: [], present: structuredClone(doc), future: [] };
}

export function pushHistory(state: HistoryState, next: CompositionStudioDocument): HistoryState {
  const past = [...state.past, structuredClone(state.present)].slice(-MAX_HISTORY);
  return { past, present: structuredClone(next), future: [] };
}

export function undoHistory(state: HistoryState): HistoryState {
  if (state.past.length === 0) return state;
  const previous = state.past[state.past.length - 1]!;
  const past = state.past.slice(0, -1);
  const future = [structuredClone(state.present), ...state.future].slice(0, MAX_HISTORY);
  return { past, present: structuredClone(previous), future };
}

export function redoHistory(state: HistoryState): HistoryState {
  if (state.future.length === 0) return state;
  const next = state.future[0]!;
  const future = state.future.slice(1);
  const past = [...state.past, structuredClone(state.present)].slice(-MAX_HISTORY);
  return { past, present: structuredClone(next), future };
}

export function canUndo(state: HistoryState): boolean {
  return state.past.length > 0;
}

export function canRedo(state: HistoryState): boolean {
  return state.future.length > 0;
}
