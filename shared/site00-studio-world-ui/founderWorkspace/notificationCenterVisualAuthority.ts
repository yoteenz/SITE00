/**
 * P0.UI.3C.2 — Notification center visual authority (reference-locked NDX paper panel).
 * Closest sibling: approved NDX project menu / founder workspace popover family.
 */

export type NotificationCenterVisualAuthority = {
  referenceAssetId: string;
  panelBounds: { maxWidthPx: number; viewportGutterPx: number; minReadableWidthPx: number };
  panelBackground: string;
  panelBorder: string;
  panelRadius: string;
  panelShadow: string;
  sectionSpacing: string;
  titleTypography: { fontFamily: string; fontSize: string; letterSpacing: string; fontWeight: string };
  tabTypography: { fontFamily: string; fontSize: string; letterSpacing: string };
  rowTypography: { fontFamily: string; fontSize: string; letterSpacing: string; fontWeightUnread: string };
  metadataTypography: { fontFamily: string; fontSize: string; letterSpacing: string; color: string };
  actionTypography: { fontFamily: string; fontSize: string; letterSpacing: string; color: string };
  dividerStyle: string;
  accentTreatment: string;
  footerTreatment: { fontFamily: string; fontSize: string; letterSpacing: string; borderTop: string };
};

export const NOTIFICATION_CENTER_VISUAL_AUTHORITY: NotificationCenterVisualAuthority = {
  referenceAssetId: 'ndx.founder-workspace.project-menu-shell',
  panelBounds: {
    maxWidthPx: 340,
    viewportGutterPx: 16,
    minReadableWidthPx: 280,
  },
  panelBackground: 'var(--ndx-surface-raised)',
  panelBorder: '1px solid var(--ndx-border)',
  panelRadius: '6px',
  panelShadow: '0 8px 32px rgba(17, 17, 17, 0.1)',
  sectionSpacing: '6px',
  titleTypography: {
    fontFamily: 'var(--site00-font-mono, ui-monospace, monospace)',
    fontSize: '10px',
    letterSpacing: '0.12em',
    fontWeight: '700',
  },
  tabTypography: {
    fontFamily: 'var(--site00-font-mono, ui-monospace, monospace)',
    fontSize: '9px',
    letterSpacing: '0.1em',
  },
  rowTypography: {
    fontFamily: 'var(--site00-font-mono, ui-monospace, monospace)',
    fontSize: '10px',
    letterSpacing: '0.06em',
    fontWeightUnread: '700',
  },
  metadataTypography: {
    fontFamily: 'var(--site00-font-mono, ui-monospace, monospace)',
    fontSize: '9px',
    letterSpacing: '0.06em',
    color: 'var(--ndx-muted)',
  },
  actionTypography: {
    fontFamily: 'var(--site00-font-mono, ui-monospace, monospace)',
    fontSize: '9px',
    letterSpacing: '0.1em',
    color: 'var(--ndx-lime)',
  },
  dividerStyle: '1px solid var(--ndx-border)',
  accentTreatment: 'var(--ndx-lime)',
  footerTreatment: {
    fontFamily: 'var(--site00-font-mono, ui-monospace, monospace)',
    fontSize: '9px',
    letterSpacing: '0.1em',
    borderTop: '1px solid var(--ndx-border)',
  },
};

export const FOUNDER_WORKSPACE_POPOVER_SURFACE_CLASS = 'site00-fws-popover-surface';
