import { COLOR_DIRECTIONS, TYPE_DIRECTIONS } from '../../builder-experience/registry';
import type { ColorDirectionId, TypeDirectionId } from '../../builder-experience/types';
import type { FeelSubOptionId, InclusionStatus } from './types';

export type FeelSubOptionView = {
  id: FeelSubOptionId;
  dimension: 'TYPE' | 'COLOR';
  label: string;
  plain: string;
  status: InclusionStatus;
  typeId: TypeDirectionId | null;
  colorId: ColorDirectionId | null;
};

const label = <T extends { id: string; label: string }>(list: readonly T[], id: string) =>
  list.find((item) => item.id === id)?.label.toUpperCase() ?? id;

export function boldFeelSubOptions(
  selectedType: 'SYSTEM_DEFAULT' | 'CONDENSED_DISPLAY' | 'EXPRESSIVE_DISPLAY',
  selectedColor: 'SYSTEM_DEFAULT' | 'SATURATED_EDITORIAL' | 'HIGH_CONTRAST_MONO',
): FeelSubOptionView[] {
  return [
    {
      id: 'TYPE_CONDENSED',
      dimension: 'TYPE',
      label: label(TYPE_DIRECTIONS, 'CONDENSED_DISPLAY'),
      plain: 'GRAPHIC DISPLAY TYPE — BIG NUMBERS AND TIGHT HEADLINES.',
      status: selectedType === 'CONDENSED_DISPLAY' ? 'SELECTED' : 'OPTIONAL',
      typeId: 'CONDENSED_DISPLAY',
      colorId: null,
    },
    {
      id: 'TYPE_EXPRESSIVE',
      dimension: 'TYPE',
      label: label(TYPE_DIRECTIONS, 'EXPRESSIVE_DISPLAY'),
      plain: 'EXPRESSIVE DISPLAY FOR EDITORIAL IMPACT.',
      status: selectedType === 'EXPRESSIVE_DISPLAY' ? 'SELECTED' : 'OPTIONAL',
      typeId: 'EXPRESSIVE_DISPLAY',
      colorId: null,
    },
    {
      id: 'COLOR_SATURATED',
      dimension: 'COLOR',
      label: label(COLOR_DIRECTIONS, 'SATURATED_EDITORIAL'),
      plain: 'SATURATED FIELDS AND LOUD ACCENTS — MAGAZINE ENERGY.',
      status: selectedColor === 'SATURATED_EDITORIAL' ? 'SELECTED' : 'OPTIONAL',
      typeId: null,
      colorId: 'SATURATED_EDITORIAL',
    },
    {
      id: 'COLOR_HIGH_CONTRAST',
      dimension: 'COLOR',
      label: label(COLOR_DIRECTIONS, 'HIGH_CONTRAST_MONO'),
      plain: 'INK-ON-PAPER CONTRAST FOR MAXIMUM GRAPHIC CLARITY.',
      status: selectedColor === 'HIGH_CONTRAST_MONO' ? 'SELECTED' : 'OPTIONAL',
      typeId: null,
      colorId: 'HIGH_CONTRAST_MONO',
    },
  ];
}
