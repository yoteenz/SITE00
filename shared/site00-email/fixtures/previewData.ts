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
  inputItems: ['DOMAIN ACCESS (Awaiting Connection)', 'BRAND PHOTOS (Awaiting Upload)'],
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

export function mergePreviewVars(overrides?: Partial<EmailTemplateVars>): EmailTemplateVars {
  return { ...DEBUG_EMAIL_FIXTURES, ...overrides };
}
