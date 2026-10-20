import type { BuildComposition, BuildView } from '../buildObject/composition';
import { compose } from '../buildObject/composition';
import type { BuildSpec } from '../studioModel';
import { feelTargetInspect, workShopInspect } from './regions';
import type { DrilldownUiState } from './types';
import { drilldownCloseness } from './controller';

export function composeStudioRoom(view: BuildView, spec: BuildSpec, drill: DrilldownUiState): BuildComposition {
  const closeness = drilldownCloseness(drill.phase);
  if (view === 'work' && drill.target?.room === 'work' && drill.target.id === 'SHOP' && closeness > 0) {
    return compose('work', spec, { inspect: workShopInspect(closeness) });
  }
  if (view === 'feel' && drill.target?.room === 'feel' && drill.target.id === 'BOLD' && closeness > 0) {
    const highlight =
      drill.phase === 'EDITING' && drill.feelType !== 'SYSTEM_DEFAULT'
        ? 'TYPE'
        : drill.phase === 'EDITING' && drill.feelColor !== 'SYSTEM_DEFAULT'
          ? 'COLOR'
          : undefined;
    return compose('feel', spec, { inspect: feelTargetInspect('BOLD', closeness, highlight) });
  }
  return compose(view, spec);
}
