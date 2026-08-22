/** DEBUG ONLY — representative preview fixtures. Never used in production sends. */
import type { EmailTemplateVars } from '../types.js';
import { getPrimaryFamily } from '../registry/family-map.js';

export const DEBUG_EMAIL_FIXTURES: EmailTemplateVars = {
  clientName: 'Preview Client',
  clientInitials: 'PC',
  memberId: '00-0147',
  locationId: '00-0147',
  firstStop: 'ORIGIN',
  projectName: 'Preview Project',
  projectId: '00-458',
  projectType: 'SITE',
  buildClass: 'SITE',
  phase: 'PHASE 02 / DESIGN & STRUCTURE',
  phaseProgress: 64,
  currentModule: 'VISUAL DEVELOPMENT',
  reviewName: 'Blueprint / Homepage',
  reviewContext: 'Visual development direction for homepage layout.',
  directionCount: 3,
  directionLabel: 'B',
  requiredInputCount: 2,
  inputItems: ['01 BRAND PHOTOS (Awaiting Upload)', '02 DOMAIN ACCESS (Awaiting Connection)'],
  milestoneName: 'Blueprint Approved',
  milestonePhase: 'PHASE 01 / FOUNDATION',
  milestoneImpact: 'SYSTEM STABILITY +24%',
  launchUrl: 'https://site00.com/studio/preview-project/launch',
  liveUrl: 'https://preview-project.site00.com',
  memberSince: 'AUG 2026',
  dueDate: 'AUG 27, 2026',
  responseTime: 'EST. 5 MINUTES',
  timestamp: 'AUG 20, 2026 · 12:32 PM',
  issuedDate: 'AUG 20, 2026',
  statusLabel: 'AUTHORIZED',
  ctaUrl: 'https://site00.com/signin',
  secondaryCtaLabel: 'VIEW PROJECT →',
  secondaryCtaUrl: 'https://site00.com/studio/preview-project',
  issueNumber: '004',
  packageId: '00-458-A',
  packageContents: '12 ASSETS / FULL PACKAGE',
  storageLocation: 'SITE 00 VAULT / SECURE ARCHIVE',
  deliveredAt: 'AUG 20, 2026 · 10:24 AM EST',
  invoiceId: 'INV-00-458',
  transactionId: 'TX-00182',
  amount: '$1,520.00',
  currency: 'USD',
  paymentStatus: 'FUNDED',
  lineItems: [
    { num: '01', label: 'FOUNDATION', detail: 'Production — Phase 01', amount: '$520.00', funded: true },
    { num: '02', label: 'MODULE B', detail: 'Rendering', amount: '$680.00', funded: true },
    { num: '03', label: 'SYSTEM', detail: 'Storage — 30 Days', amount: '$320.00', funded: true },
  ],
  holdId: 'HOLD-00-1827',
  stoppedAt: 'PAYMENTS / CHECKOUT',
  waitingOn: 'PAYMENT CONFIGURATION',
  nextModule: 'CHECKOUT ACTIVATION',
  blockerReason: 'Payment configuration not verified.',
  waitingItems: ['Checkout activation', 'Final testing', 'Launch sequence'],
  occupancyStatus: 'TEMPORARILY AWAY',
  belongingsStatus: 'RIGHT WHERE YOU LEFT THEM',
  demolitionStatus: 'ABSOLUTELY NOT.',
  signalModules: [
    { num: '01', title: 'BUILD SPOTLIGHT', excerpt: 'Inside a recent SITE launch — structure, signal, and deployment.' },
    { num: '02', title: 'SYSTEM UPDATE', excerpt: 'Studio production spine and review gate improvements.' },
    { num: '03', title: 'FROM THE CONTROL ROOM', excerpt: 'What operators are watching across active engagements.' },
  ],
  dataFields: [
    { label: 'PROJECT ID', value: '00-458' },
    { label: 'MODULE', value: 'VISUAL DEVELOPMENT' },
    { label: 'DUE DATE', value: 'AUG 27, 2026' },
    { label: 'RESPONSE TIME', value: 'EST. 5 MINUTES' },
  ],
};

const STRIP_GENERIC_COPY = new Set([
  'sign-in-link',
  'verify-email',
  'password-reset',
  'access-credential-issued',
  'identity-path-received',
  'identity-calibration-complete',
  're-engagement',
  'abandoned-intake',
]);

export function mergePreviewVars(templateId: string, overrides?: Partial<EmailTemplateVars>): EmailTemplateVars {
  const base = { ...DEBUG_EMAIL_FIXTURES };
  if (STRIP_GENERIC_COPY.has(templateId)) {
    delete base.bodyLines;
  }
  const canon = getPrimaryFamily(templateId);
  if (canon === 'BILLING_PAYMENT' && templateId === 'payment-failed') {
    base.paymentStatus = 'FAILED';
  }
  if (canon === 'BILLING_PAYMENT' && templateId === 'upcoming-payment') {
    base.paymentStatus = 'DUE';
  }
  if (canon === 'ACCESS_SECURITY') {
    delete base.bodyLines;
    delete base.inputItems;
  }
  return { ...base, ...overrides };
}
