/**
 * F02 SETUP interaction groups → runtime overlays.
 * Permission, add, and skip are the three authority groups. Back and continue are the shared nav pair.
 */

export const F02_OVERLAYS: Record<string, readonly string[]> = {
  'F02.02': ['permission', 'skip'],
  'F02.04': ['add', 'skip'],
  'F02.06': ['skip'],
};

export const F02_COMPONENT_RUNTIME: Record<string, { component: string; variant?: string; primitive: string }> = {
  JURNL_BUTTON_PRIMARY: { component: 'JurnlButton', variant: 'primary', primitive: 'BUTTON' },
  JURNL_DRAWER_LONG: { component: 'JurnlDrawer', variant: 'long', primitive: 'DRAWER' },
  JURNL_DRAWER_SHORT: { component: 'JurnlDrawer', variant: 'short', primitive: 'DRAWER' },
  JURNL_ICON_BUTTON: { component: 'JurnlIconButton', primitive: 'BUTTON' },
};
