import { useCallback, useEffect, useState } from 'react';
import type { SpatialBuilderState } from '../../builder-experience/spatialStudio/types';
import type { StudioRoomId } from '../studioModel';
import * as ctrl from './controller';
import type { DrilldownUiState, FeelSubOptionId } from './types';
import { emptyDrilldownUi } from './types';

const ENTER_MS = 680;

export function useSpatialDrilldown(room: StudioRoomId) {
  const [ui, setUi] = useState<DrilldownUiState>(emptyDrilldownUi);

  useEffect(() => {
    setUi(emptyDrilldownUi());
  }, [room]);

  const selectWorkShop = useCallback(() => {
    setUi((s) => ctrl.selectTarget(s, { room: 'work', id: 'SHOP' }));
  }, []);

  const selectFeelBold = useCallback(() => {
    setUi((s) => ctrl.selectTarget(s, { room: 'feel', id: 'BOLD' }));
  }, []);

  const enter = useCallback(() => {
    setUi((s) => ctrl.enterFocus(s));
    window.setTimeout(() => setUi((s) => ctrl.markFocused(s)), ENTER_MS);
  }, []);

  const back = useCallback(() => {
    setUi((s) => ctrl.returnToRoom(s));
    window.setTimeout(() => setUi(() => ctrl.resetDrilldown()), ENTER_MS);
  }, []);

  const applyFeelOption = useCallback((id: FeelSubOptionId, update: (patch: Partial<SpatialBuilderState>) => void) => {
    setUi((s) => ctrl.beginEditing(s));
    if (id === 'TYPE_CONDENSED') update({ feelType: 'CONDENSED_DISPLAY' });
    if (id === 'TYPE_EXPRESSIVE') update({ feelType: 'EXPRESSIVE_DISPLAY' });
    if (id === 'COLOR_SATURATED') update({ feelColor: 'SATURATED_EDITORIAL' });
    if (id === 'COLOR_HIGH_CONTRAST') update({ feelColor: 'HIGH_CONTRAST_MONO' });
    setUi((s) => ({ ...s, feelType: id.startsWith('TYPE') ? (id === 'TYPE_CONDENSED' ? 'CONDENSED_DISPLAY' : 'EXPRESSIVE_DISPLAY') : s.feelType, feelColor: id.startsWith('COLOR') ? (id === 'COLOR_SATURATED' ? 'SATURATED_EDITORIAL' : 'HIGH_CONTRAST_MONO') : s.feelColor }));
  }, []);

  const applyWorkAccounts = useCallback(
    (on: boolean, update: (patch: Partial<SpatialBuilderState>) => void) => {
      setUi((s) => ctrl.beginEditing(s));
      update({ shopAccounts: on });
    },
    [],
  );

  return {
    ui,
    selectWorkShop,
    selectFeelBold,
    enter,
    back,
    applyFeelOption,
    applyWorkAccounts,
  };
}
