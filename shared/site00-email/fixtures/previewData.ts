/** DEBUG ONLY — representative preview fixtures. Never used in production sends. */
import type { EmailTemplateVars } from '../types.js';

export const DEBUG_EMAIL_FIXTURES: EmailTemplateVars = {
  clientName: 'Preview Client',
  clientInitials: 'PC',
  memberId: '00-0147',
  projectName: 'Preview Project',
  projectId: '00-0147',
  projectType: 'SITE',
  buildClass: 'SITE',
  reviewName: 'Blueprint / Homepage',
  directionCount: 3,
  directionLabel: 'B',
  requiredInputCount: 2,
  inputItems: ['01 BRAND PHOTOS (Awaiting Upload)', '02 DOMAIN ACCESS (Awaiting Connection)'],
  milestoneName: 'Blueprint Approved',
  launchUrl: 'https://site00.com/studio/preview-project/launch',
  liveUrl: 'https://preview-project.site00.com',
  memberSince: 'AUG 2026',
  dueDate: 'AUG 22, 2026',
  timestamp: 'AUG 20, 2026 · 12:32 PM',
  issuedDate: 'AUG 20, 2026',
  statusLabel: 'AUTHORIZED',
  ctaUrl: 'https://site00.com/signin',
  issueNumber: '004',
  signalModules: [
    { num: '01', title: 'BUILD SPOTLIGHT', excerpt: 'Inside a recent SITE launch — structure, signal, and deployment.' },
    { num: '02', title: 'SYSTEM UPDATE', excerpt: 'Studio production spine and review gate improvements.' },
    { num: '03', title: 'FROM THE CONTROL ROOM', excerpt: 'What operators are watching across active engagements.' },
  ],
  bodyLines: ['Your project has entered the next production phase.', 'Open Studio to review details and take action.'],
  dataFields: [
    { label: 'PROJECT', value: 'PREVIEW PROJECT' },
    { label: 'PROJECT ID', value: '00-0147' },
    { label: 'TYPE', value: 'SITE' },
    { label: 'CREATED', value: 'AUG 20, 2026' },
  ],
};

/** Access templates omit production-stage bodyLines and inputItems. */
const ACCESS_TEMPLATE_IDS = new Set(['access-credential-issued', 'sign-in-link', 'verify-email', 'password-reset']);

export function mergePreviewVars(templateId: string, overrides?: Partial<EmailTemplateVars>): EmailTemplateVars {
  const base = { ...DEBUG_EMAIL_FIXTURES };
  if (ACCESS_TEMPLATE_IDS.has(templateId)) {
    delete base.bodyLines;
    delete base.inputItems;
    delete base.dataFields;
  }
  if (templateId === 'sign-in-link') {
    base.accentScript = 'WELCOME TO';
  }
  return { ...base, ...overrides };
}
