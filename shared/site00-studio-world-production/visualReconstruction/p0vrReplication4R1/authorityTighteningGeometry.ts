import { PARENT_GEOMETRY } from './constants.js';

/** CSS custom properties applied to forensic twin root (authority-locked tightening). */
export function buildAuthorityTighteningCssPatch(): Record<string, string> {
  const g = PARENT_GEOMETRY;
  return {
    '--fb-page-gutter': `${g.pageGutter}px`,
    '--fb-shell-host-h': `${g.hostHeaderHeight}px`,
    '--fb-masthead-h': `${g.mastheadHeight}px`,
    '--fb-nav-h': `${g.sectionNavHeight}px`,
    '--fb-hero-h': `${g.heroHeight}px`,
    '--fb-progress-h': `${g.progressBandHeight}px`,
    '--fb-metrics-h': `${g.metricsRowHeight}px`,
    '--fb-bottom-nav-h': `${g.bottomNavHeight}px`,
    '--fb-progress-fill-w': '57%',
    '--fb-hero-photo-size': '260% auto',
    '--fb-hero-photo-position': '58% 22%',
    '--fb-lime': '#b7f75f',
    '--fb-bg': '#f7f7f5',
  };
}

export type RegionDriftEntry = {
  regionId: string;
  label: string;
  status: 'TIGHTENED' | 'REMAINING_GAP';
  notes: string;
};

export function buildAuthorityTighteningDriftSummary(): RegionDriftEntry[] {
  return [
    { regionId: 'host-header', label: 'Shell header', status: 'TIGHTENED', notes: '44px band · 24px gutter · diamond/menu/avatar grid' },
    { regionId: 'masthead', label: 'Masthead', status: 'TIGHTENED', notes: 'Right colophon isolated · badge row locked' },
    { regionId: 'section-nav', label: 'Section nav', status: 'TIGHTENED', notes: 'Blueprint tab widths · 32px band' },
    { regionId: 'hero', label: 'Hero', status: 'TIGHTENED', notes: 'Subregion grid · cropped photo · left scrim · no full-page text bleed' },
    { regionId: 'progress', label: 'Progress', status: 'TIGHTENED', notes: '72px band · phase column right-aligned' },
    { regionId: 'metrics', label: 'Metrics', status: 'TIGHTENED', notes: '4 equal columns · 96px row' },
    { regionId: 'focus-milestone', label: 'Focus / milestone', status: 'TIGHTENED', notes: '3-column grid placement' },
    { regionId: 'activity', label: 'Activity', status: 'REMAINING_GAP', notes: 'Row density vs authority — verify on device' },
    { regionId: 'bottom-host-nav', label: 'Host bottom nav', status: 'REMAINING_GAP', notes: 'Icon pixel match — verify red PROJECTS active' },
  ];
}
