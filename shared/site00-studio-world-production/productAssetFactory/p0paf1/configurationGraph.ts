/**
 * P0.PAF.1 — Valid product configuration graph (Build-A-Wig combination safety).
 */

import { getHairStyleById } from './hairStyleRegistry.js';
import type { VariantSelection, VariationAxis } from './types.js';

export type ConfigurationCombo = Record<string, string>;

export function isValidConfiguration(combo: ConfigurationCombo): boolean {
  const styleId = combo.STYLE;
  const lengthId = combo.LENGTH;
  const textureId = combo.TEXTURE;

  if (styleId && lengthId) {
    const style = getHairStyleById(styleId);
    if (style && !style.compatibleLengths.includes(lengthId)) {
      return false;
    }
  }

  if (styleId && textureId) {
    const style = getHairStyleById(styleId);
    if (style && !style.compatibleTextures.includes(textureId)) {
      return false;
    }
  }

  return true;
}

export function expandSelectionToCombinations(
  selection: VariantSelection,
  axes: VariationAxis[],
): ConfigurationCombo[] {
  const activeAxes = axes.filter((axis) => {
    const values = selection[axis];
    return values && values.length > 0;
  });

  if (activeAxes.length === 0) return [];

  function cartesian(index: number, current: ConfigurationCombo): ConfigurationCombo[] {
    if (index >= activeAxes.length) {
      return isValidConfiguration(current) ? [current] : [];
    }
    const axis = activeAxes[index];
    const values = selection[axis] ?? [];
    const results: ConfigurationCombo[] = [];
    for (const value of values) {
      results.push(...cartesian(index + 1, { ...current, [axis]: value }));
    }
    return results;
  }

  return cartesian(0, {});
}

export function selectAllForAxis(axis: VariationAxis): string[] {
  switch (axis) {
    case 'COLOR':
      return ['natural-black', 'jet-black', 'color-2', 'chocolate', 'honey-blonde', 'burgundy'];
    case 'STYLE':
      return ['straight', 'body-wave', 'loose-wave', 'deep-curl'];
    case 'TEXTURE':
      return ['straight', 'wavy', 'curly'];
    case 'PART':
      return ['middle', 'side', 'free-part'];
    case 'LENGTH':
      return ['16', '18', '20', '22', '24'];
    case 'FINISH':
      return ['natural', 'silky', 'matte'];
    default:
      return [];
  }
}

export function applySelectAll(selection: VariantSelection, axis: VariationAxis): VariantSelection {
  return { ...selection, [axis]: selectAllForAxis(axis) };
}

export function countInvalidCombinations(selection: VariantSelection, axes: VariationAxis[]): number {
  const all = expandAllPossible(selection, axes);
  const valid = expandSelectionToCombinations(selection, axes);
  return all.length - valid.length;
}

function expandAllPossible(selection: VariantSelection, axes: VariationAxis[]): ConfigurationCombo[] {
  const unconstrained = { ...selection };
  for (const axis of axes) {
    if (!unconstrained[axis]?.length) {
      unconstrained[axis] = selectAllForAxis(axis);
    }
  }
  // Cartesian without validity filter
  const activeAxes = axes.filter((a) => unconstrained[a]?.length);
  function cart(index: number, current: ConfigurationCombo): ConfigurationCombo[] {
    if (index >= activeAxes.length) return [current];
    const axis = activeAxes[index];
    const values = unconstrained[axis] ?? [];
    const out: ConfigurationCombo[] = [];
    for (const v of values) {
      out.push(...cart(index + 1, { ...current, [axis]: v }));
    }
    return out;
  }
  return cart(0, {});
}
