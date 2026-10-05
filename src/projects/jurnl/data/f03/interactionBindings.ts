export const F03_OVERLAYS: Record<string, readonly string[]> = {
  'F03.00': ['see-why', 'quick-add', 'ask'],
};

export const F03_COMPONENT_RUNTIME: Record<string, { component: string; variant?: string; primitive: string }> = {
  JURNL_DRAWER_LONG: { component: 'JurnlDrawer', variant: 'long', primitive: 'DRAWER' },
  JURNL_DRAWER_SHORT: { component: 'JurnlDrawer', variant: 'short', primitive: 'DRAWER' },
  JURNL_BUTTON_PRIMARY: { component: 'JurnlButton', variant: 'primary', primitive: 'BUTTON' },
  JURNL_BUTTON_SECONDARY: { component: 'JurnlButton', variant: 'secondary', primitive: 'BUTTON' },
  JURNL_INLINE_ACTION: { component: 'JurnlInlineAction', variant: 'panel_header_action', primitive: 'BUTTON' },
  JURNL_ICON_BUTTON: { component: 'JurnlIconButton', primitive: 'BUTTON' },
  JURNL_TRANSACTION_ROW: { component: 'JurnlTransactionRow', primitive: 'ROW' },
  JURNL_NAV: { component: 'JurnlProductNav', primitive: 'NAV' },
};
