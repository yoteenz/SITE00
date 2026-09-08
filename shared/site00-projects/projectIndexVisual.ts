/**
 * B5.9R2 — Project index visual identity (thumbnail + accent fallback).
 */

import { getSite00ManagedProject } from '../site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import { projectInitialsFromName } from './projectIndexItem.js';

export type ProjectIndexVisual = {
  imageUrl: string | null;
  initials: string;
  accent: string;
  accentBg: string;
};

const ACCENT_MAP: Record<string, { accent: string; accentBg: string }> = {
  SITE00_HOST: { accent: '#e10600', accentBg: '#fde8e8' },
  STUDIO_WORLD_WEBSITE: { accent: '#111111', accentBg: '#ececec' },
  NDX_LIME: { accent: '#8bc34a', accentBg: '#eef8e3' },
  PROJECT_CANONICAL: { accent: '#111111', accentBg: '#f0f0f0' },
  NEUTRAL: { accent: '#666666', accentBg: '#f5f5f5' },
};

export function resolveProjectIndexVisual(projectId: string, displayName: string): ProjectIndexVisual {
  const managed = getSite00ManagedProject(projectId);
  const accentKey = managed?.projectAccent ?? 'NEUTRAL';
  const palette = ACCENT_MAP[accentKey] ?? ACCENT_MAP.NEUTRAL;

  return {
    imageUrl: null,
    initials: projectInitialsFromName(displayName),
    accent: palette.accent,
    accentBg: palette.accentBg,
  };
}
