/** Canonical Digital Foundation icon registry metadata. Glyph markup lives in glyphs.ts. */

export type DfIconFamilyId =
  | '01-global'
  | '02-navigation'
  | '03-business'
  | '04-payment'
  | '05-communication'
  | '06-documents'
  | '07-services'
  | '08-actions'
  | '09-status'
  | '10-approval'
  | '11-progress'
  | '12-time'
  | '13-analytics'
  | '14-journey'
  | '15-system'
  | '16-misc';

export type DfIconTone = 'default' | 'muted' | 'danger' | 'success' | 'warning';

export type DfIconMeta = {
  id: string;
  label: string;
  family: DfIconFamilyId;
  /** Legacy DfIcon names that render this glyph. */
  aliases?: string[];
  tone?: DfIconTone;
};

export const DF_ICON_FAMILIES: { id: DfIconFamilyId; label: string }[] = [
  { id: '01-global', label: '01. GLOBAL / BRAND' },
  { id: '02-navigation', label: '02. NAVIGATION' },
  { id: '03-business', label: '03. BUSINESS / IDENTITY' },
  { id: '04-payment', label: '04. E-COMMERCE / PAYMENT' },
  { id: '05-communication', label: '05. COMMUNICATION' },
  { id: '06-documents', label: '06. FILES / DOCUMENTS' },
  { id: '07-services', label: '07. SERVICES' },
  { id: '08-actions', label: '08. ACTIONS' },
  { id: '09-status', label: '09. STATUS' },
  { id: '10-approval', label: '10. APPROVAL' },
  { id: '11-progress', label: '11. PROGRESS / PROCESS' },
  { id: '12-time', label: '12. TIME / CALENDAR' },
  { id: '13-analytics', label: '13. ANALYTICS / BUSINESS' },
  { id: '14-journey', label: '14. CLIENT JOURNEY' },
  { id: '15-system', label: '15. CONSTRUCTION / SYSTEM' },
  { id: '16-misc', label: '16. MISCELLANEOUS' },
];

export const DF_ICON_CATALOG: DfIconMeta[] = [
  { id: 'foundation', label: 'FOUNDATION', family: '01-global', aliases: ['cube'] },
  { id: 'build', label: 'BUILD', family: '01-global' },
  { id: 'growth', label: 'GROWTH', family: '01-global' },
  { id: 'aio', label: 'AIO', family: '01-global' },
  { id: 'link', label: 'LINK', family: '01-global' },
  { id: 'qr', label: 'QR CODE', family: '01-global' },
  { id: 'external', label: 'EXTERNAL', family: '01-global' },
  { id: 'security', label: 'SECURITY', family: '01-global', aliases: ['shield'] },

  { id: 'menu', label: 'MENU', family: '02-navigation' },
  { id: 'grid', label: 'GRID', family: '02-navigation' },
  { id: 'home', label: 'HOME', family: '02-navigation' },
  { id: 'back', label: 'BACK', family: '02-navigation' },
  { id: 'next', label: 'NEXT', family: '02-navigation', aliases: ['chevron'] },
  { id: 'close', label: 'CLOSE', family: '02-navigation' },
  { id: 'more', label: 'MORE', family: '02-navigation' },
  { id: 'options', label: 'OPTIONS', family: '02-navigation' },

  { id: 'domain', label: 'DOMAIN', family: '03-business', aliases: ['globe'] },
  { id: 'business', label: 'BUSINESS', family: '03-business', aliases: ['building'] },
  { id: 'user', label: 'USER', family: '03-business' },
  { id: 'users', label: 'USERS', family: '03-business' },
  { id: 'company', label: 'COMPANY', family: '03-business' },
  { id: 'contact', label: 'CONTACT', family: '03-business' },
  { id: 'location', label: 'LOCATION', family: '03-business', aliases: ['pin'] },
  { id: 'telephone', label: 'PHONE', family: '03-business' },
  { id: 'email', label: 'EMAIL', family: '03-business', aliases: ['envelope'] },

  { id: 'payment', label: 'PAYMENT', family: '04-payment', aliases: ['dollar'] },
  { id: 'card', label: 'CARD', family: '04-payment' },
  { id: 'cart', label: 'CART', family: '04-payment' },
  { id: 'receipt', label: 'RECEIPT', family: '04-payment' },
  { id: 'price', label: 'PRICE', family: '04-payment' },
  { id: 'invoice', label: 'INVOICE', family: '04-payment' },
  { id: 'paymentSecure', label: 'PAYMENT SECURE', family: '04-payment' },
  { id: 'refund', label: 'REFUND', family: '04-payment' },
  { id: 'paymentError', label: 'PAYMENT ERROR', family: '04-payment', tone: 'danger' },

  { id: 'message', label: 'MESSAGE', family: '05-communication' },
  { id: 'unread', label: 'UNREAD', family: '05-communication' },
  { id: 'chat', label: 'CHAT', family: '05-communication' },
  { id: 'reply', label: 'REPLY', family: '05-communication' },
  { id: 'send', label: 'SEND', family: '05-communication' },
  { id: 'inbox', label: 'INBOX', family: '05-communication' },
  { id: 'notification', label: 'NOTIFICATION', family: '05-communication' },
  { id: 'commAlert', label: 'ALERT', family: '05-communication' },
  { id: 'announce', label: 'ANNOUNCE', family: '05-communication' },

  { id: 'document', label: 'DOCUMENT', family: '06-documents', aliases: ['overview'] },
  { id: 'text', label: 'TEXT', family: '06-documents' },
  { id: 'image', label: 'IMAGE', family: '06-documents' },
  { id: 'pdf', label: 'PDF', family: '06-documents' },
  { id: 'download', label: 'DOWNLOAD', family: '06-documents' },
  { id: 'upload', label: 'UPLOAD', family: '06-documents' },
  { id: 'folder', label: 'FOLDER', family: '06-documents' },
  { id: 'newFolder', label: 'NEW FOLDER', family: '06-documents' },
  { id: 'addFile', label: 'ADD FILE', family: '06-documents' },

  { id: 'service', label: 'SERVICE', family: '07-services' },
  { id: 'addons', label: 'ADD-ONS', family: '07-services', aliases: ['layers'] },
  { id: 'hosting', label: 'HOSTING', family: '07-services' },
  { id: 'serviceEmail', label: 'EMAIL', family: '07-services' },
  { id: 'aliases', label: 'ALIASES', family: '07-services' },
  { id: 'serviceSecurity', label: 'SECURITY', family: '07-services' },
  { id: 'signature', label: 'SIGNATURE', family: '07-services' },
  { id: 'device', label: 'DEVICE', family: '07-services', aliases: ['phone'] },
  { id: 'migration', label: 'MIGRATION', family: '07-services', aliases: ['cloud'] },

  { id: 'add', label: 'ADD', family: '08-actions' },
  { id: 'edit', label: 'EDIT', family: '08-actions' },
  { id: 'delete', label: 'DELETE', family: '08-actions' },
  { id: 'view', label: 'VIEW', family: '08-actions' },
  { id: 'hide', label: 'HIDE', family: '08-actions' },
  { id: 'duplicate', label: 'DUPLICATE', family: '08-actions' },
  { id: 'share', label: 'SHARE', family: '08-actions' },
  { id: 'import', label: 'IMPORT', family: '08-actions' },
  { id: 'export', label: 'EXPORT', family: '08-actions' },

  { id: 'pending', label: 'PENDING', family: '09-status', tone: 'muted' },
  { id: 'active', label: 'ACTIVE', family: '09-status', tone: 'danger' },
  { id: 'complete', label: 'COMPLETE', family: '09-status', tone: 'success' },
  { id: 'inProgress', label: 'IN PROGRESS', family: '09-status', tone: 'warning' },
  { id: 'attention', label: 'ATTENTION', family: '09-status', tone: 'danger' },
  { id: 'onHold', label: 'ON HOLD', family: '09-status' },
  { id: 'blocked', label: 'BLOCKED', family: '09-status', tone: 'muted' },
  { id: 'cancelled', label: 'CANCELLED', family: '09-status', tone: 'muted' },
  { id: 'retry', label: 'RETRY', family: '09-status' },

  { id: 'approval', label: 'APPROVAL', family: '10-approval' },
  { id: 'approve', label: 'APPROVE', family: '10-approval' },
  { id: 'reject', label: 'REJECT', family: '10-approval', tone: 'danger' },
  { id: 'requestChange', label: 'REQUEST CHANGE', family: '10-approval', aliases: ['swap'] },
  { id: 'feedback', label: 'FEEDBACK', family: '10-approval' },
  { id: 'assigned', label: 'ASSIGNED', family: '10-approval' },
  { id: 'review', label: 'REVIEW', family: '10-approval' },
  { id: 'signed', label: 'SIGNED', family: '10-approval' },
  { id: 'confirmed', label: 'CONFIRMED', family: '10-approval' },

  { id: 'stepCurrent', label: 'STEP CURRENT', family: '11-progress', tone: 'danger' },
  { id: 'stepUpcoming', label: 'STEP UPCOMING', family: '11-progress', tone: 'muted' },
  { id: 'stepFuture', label: 'STEP FUTURE', family: '11-progress', tone: 'muted' },
  { id: 'stepsList', label: 'STEPS LIST', family: '11-progress' },
  { id: 'checklist', label: 'CHECKLIST', family: '11-progress' },
  { id: 'progress', label: 'PROGRESS', family: '11-progress' },
  { id: 'milestone', label: 'MILESTONE', family: '11-progress' },
  { id: 'roadmap', label: 'ROADMAP', family: '11-progress', aliases: ['route'] },
  { id: 'target', label: 'TARGET', family: '11-progress' },

  { id: 'calendar', label: 'CALENDAR', family: '12-time' },
  { id: 'time', label: 'TIME', family: '12-time', aliases: ['clock'] },
  { id: 'duration', label: 'DURATION', family: '12-time' },
  { id: 'schedule', label: 'SCHEDULE', family: '12-time' },
  { id: 'waiting', label: 'WAITING', family: '12-time' },
  { id: 'updated', label: 'UPDATED', family: '12-time' },
  { id: 'date', label: 'DATE', family: '12-time' },
  { id: 'addDate', label: 'ADD DATE', family: '12-time' },
  { id: 'reminder', label: 'REMINDER', family: '12-time' },

  { id: 'analytics', label: 'ANALYTICS', family: '13-analytics' },
  { id: 'insights', label: 'INSIGHTS', family: '13-analytics' },
  { id: 'trend', label: 'TREND', family: '13-analytics' },
  { id: 'performance', label: 'PERFORMANCE', family: '13-analytics' },
  { id: 'metrics', label: 'METRICS', family: '13-analytics' },
  { id: 'report', label: 'REPORT', family: '13-analytics' },
  { id: 'goal', label: 'GOAL', family: '13-analytics' },
  { id: 'opportunity', label: 'OPPORTUNITY', family: '13-analytics' },
  { id: 'idea', label: 'IDEA', family: '13-analytics' },

  { id: 'client', label: 'CLIENT', family: '14-journey' },
  { id: 'team', label: 'TEAM', family: '14-journey' },
  { id: 'needsYou', label: 'NEEDS YOU', family: '14-journey' },
  { id: 'task', label: 'TASK', family: '14-journey' },
  { id: 'stage', label: 'STAGE', family: '14-journey' },
  { id: 'phase', label: 'PHASE', family: '14-journey' },
  { id: 'nextStep', label: 'NEXT STEP', family: '14-journey' },
  { id: 'dependency', label: 'DEPENDENCY', family: '14-journey' },
  { id: 'deliverable', label: 'DELIVERABLE', family: '14-journey' },

  { id: 'setup', label: 'SETUP', family: '15-system', aliases: ['gear'] },
  { id: 'configure', label: 'CONFIGURE', family: '15-system' },
  { id: 'tools', label: 'TOOLS', family: '15-system' },
  { id: 'database', label: 'DATABASE', family: '15-system' },
  { id: 'systemCloud', label: 'CLOUD', family: '15-system' },
  { id: 'server', label: 'SERVER', family: '15-system', aliases: ['dns'] },
  { id: 'integration', label: 'INTEGRATION', family: '15-system' },
  { id: 'api', label: 'API', family: '15-system' },
  { id: 'network', label: 'NETWORK', family: '15-system' },

  { id: 'favorite', label: 'FAVORITE', family: '16-misc' },
  { id: 'favoriteOutline', label: 'FAVORITE OUTLINE', family: '16-misc' },
  { id: 'info', label: 'INFO', family: '16-misc' },
  { id: 'help', label: 'HELP', family: '16-misc' },
  { id: 'warning', label: 'WARNING', family: '16-misc', tone: 'danger', aliases: ['alert'] },
  { id: 'lock', label: 'LOCK', family: '16-misc' },
  { id: 'unlock', label: 'UNLOCK', family: '16-misc' },
  { id: 'search', label: 'SEARCH', family: '16-misc' },
  { id: 'filter', label: 'FILTER', family: '16-misc' },
];

/** Glyphs kept for existing controls that are not a sheet icon (CTA arrow, quantity steppers, bare check). */
export const DF_ICON_LEGACY_EXTRAS: DfIconMeta[] = [
  { id: 'arrow', label: 'ARROW', family: '02-navigation' },
  { id: 'check', label: 'CHECK', family: '10-approval' },
  { id: 'plus', label: 'PLUS', family: '08-actions' },
  { id: 'minus', label: 'MINUS', family: '08-actions' },
  { id: 'laptop', label: 'LAPTOP', family: '07-services' },
  { id: 'bolt', label: 'BOLT', family: '16-misc' },
];
