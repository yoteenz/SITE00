/**
 * Technical session hook — Opus may replace UI; this hook stays the integration boundary.
 */
import { useCallback, useMemo, useState } from 'react';
import { clientEstimatePreviewEnabled } from '../../../studioos/estimation/flags';
import { snapshotFromSpatialState, revealEstimateForRoom } from './blueprintSessionContract';
import { buildObjectParametersFromSpatialState } from './buildObjectContract';
import { canEnterRoom, spatialSelectionToBuilder } from './mapping';
import { clearSpatialBuilderState, loadSpatialBuilderState, saveSpatialBuilderState } from './persistence';
import type { SpatialBuilderState, SpatialRoomId } from './types';

export function useBuilderSpatialSession() {
  const [state, setState] = useState<SpatialBuilderState>(() => loadSpatialBuilderState());

  const persist = useCallback((next: SpatialBuilderState) => {
    const saved = saveSpatialBuilderState(next);
    setState(saved);
    return saved;
  }, []);

  const selection = useMemo(() => spatialSelectionToBuilder(state), [state]);

  const showEstimate = revealEstimateForRoom(state.room, clientEstimatePreviewEnabled());

  const snapshot = useMemo(
    () => snapshotFromSpatialState(state, { allowEstimate: showEstimate }),
    [state, showEstimate],
  );

  const buildObject = useMemo(
    () =>
      buildObjectParametersFromSpatialState({
        placePath: state.placePath,
        feelVibe: state.feelVibe,
        workModules: state.workModules,
        pace: state.pace,
      }),
    [state.placePath, state.feelVibe, state.workModules, state.pace],
  );

  const goRoom = useCallback(
    (room: SpatialRoomId) => {
      if (!canEnterRoom(state, room)) return false;
      persist({ ...state, room });
      return true;
    },
    [persist, state],
  );

  const resetSession = useCallback(() => {
    clearSpatialBuilderState();
    setState(loadSpatialBuilderState());
  }, []);

  return {
    state,
    persist,
    selection,
    snapshot,
    buildObject,
    goRoom,
    resetSession,
    showEstimate,
  };
}

export type BuilderSpatialSession = ReturnType<typeof useBuilderSpatialSession>;
