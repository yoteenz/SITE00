export const F04_OVERLAYS: Record<string, readonly string[]> = {
  'F04.00': ['filter', 'detail', 'quick-add', 'ask'],
};

export const F04_COMPONENT_RUNTIME: Record<string, { component: string; variant?: string; primitive: string }> = {
  JURNL_INPUT: { component: 'JurnlInput', primitive: 'INPUT' },
  JURNL_DRAWER_LONG: { component: 'JurnlDrawer', variant: 'long', primitive: 'DRAWER' },
  JURNL_DRAWER_SHORT: { component: 'JurnlDrawer', variant: 'short', primitive: 'DRAWER' },
  JURNL_ICON_BUTTON: { component: 'JurnlIconButton', primitive: 'BUTTON' },
  JURNL_TRANSACTION_ROW: { component: 'JurnlTransactionRow', primitive: 'ROW' },
  JURNL_NAV: { component: 'JurnlProductNav', primitive: 'NAV' },
};
