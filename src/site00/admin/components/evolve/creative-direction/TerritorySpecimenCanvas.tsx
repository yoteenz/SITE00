/** Legacy shim — delegates to territory renderer registry */

import { renderTerritoryView } from '../../../../components/evolve/creative-direction/TerritoryRendererRegistry';

type SpecimenProps = {
  specimenType: string;
  palette: Record<string, string>;
  displayFont: string;
  territoryName: string;
  index: number;
};

export function TerritorySpecimenCanvas({ specimenType, index }: SpecimenProps) {
  return (
    <>
      {renderTerritoryView(index, {
        specimens: [
          {
            id: `legacy-${specimenType}`,
            specimenType,
            title: specimenType.replace(/_/g, ' ').toUpperCase(),
            status: 'SPEC_RENDERED',
          },
        ],
        options: { hideLabels: false },
      })}
    </>
  );
}
