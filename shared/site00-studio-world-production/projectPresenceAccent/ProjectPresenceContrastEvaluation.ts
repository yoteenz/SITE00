/**
 * Contrast evaluation for project-presence diamond on host shell surfaces.
 */

import type { ProjectPresenceContrastEvaluation, ProjectPresenceContrastOutcome } from './types.js';
import { SITE00_HOST_ACCENT } from './constants.js';
import { validateProjectPresenceColor } from './ProjectPresenceColorValidation.js';

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return {
      r: parseInt(h[0]! + h[0], 16),
      g: parseInt(h[1]! + h[1], 16),
      b: parseInt(h[2]! + h[2], 16),
    };
  }
  if (h.length >= 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs! + 0.7152 * gs! + 0.0722 * bs!;
}

export function contrastRatio(fgHex: string, bgHex: string): number {
  const fg = parseHexRgb(fgHex);
  const bg = parseHexRgb(bgHex);
  if (!fg || !bg) return 1;
  const l1 = relativeLuminance(fg.r, fg.g, fg.b);
  const l2 = relativeLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Shell surfaces are predominantly light architectural white/cream. */
const DEFAULT_SHELL_SURFACE = '#f5f5f4';

export function evaluateProjectPresenceContrast(
  accentColor: string,
  surfaceColor = DEFAULT_SHELL_SURFACE,
): ProjectPresenceContrastEvaluation {
  const { valid, normalized } = validateProjectPresenceColor(accentColor);
  if (!valid || !normalized) {
    return { outcome: 'FALLBACK_REQUIRED', contrastRatio: 0, useKeyline: false };
  }

  const ratio = contrastRatio(normalized, surfaceColor);
  let outcome: ProjectPresenceContrastOutcome = 'PASS';
  if (ratio < 1.15) outcome = 'FALLBACK_REQUIRED';
  else if (ratio < 3.5) outcome = 'LOW_CONTRAST';

  return {
    outcome,
    contrastRatio: ratio,
    useKeyline: outcome === 'LOW_CONTRAST',
  };
}

export function applyContrastStrategy(
  accent: string,
  evaluation: ProjectPresenceContrastEvaluation,
): string {
  if (evaluation.outcome === 'FALLBACK_REQUIRED') return SITE00_HOST_ACCENT;
  return accent;
}
