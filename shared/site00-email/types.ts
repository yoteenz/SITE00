export type EmailFamily =
  | 'access'
  | 'identity'
  | 'project'
  | 'studio'
  | 'input'
  | 'review'
  | 'assets'
  | 'milestone'
  | 'launch'
  | 'property'
  | 'billing'
  | 'domain'
  | 'support'
  | 'signal'
  | 'internal';

export type EmailArchetype =
  | 'access-credential'
  | 'project-record'
  | 'studio-portal'
  | 'action-required'
  | 'review-dossier'
  | 'milestone-artifact'
  | 'status-notice'
  | 'system-check'
  | 'launch-authorization'
  | 'location-live'
  | 'production-complete'
  | 'signal-editorial'
  | 'internal-notice';

export type EmailClassification = 'transactional' | 'operational' | 'production' | 'marketing' | 'internal';

export type EmailDebugStatus = 'needs-review' | 'approved' | 'revision-needed';

export type EmailTheme = 'light' | 'dark';

export type EmailTemplateVars = {
  clientName?: string;
  clientInitials?: string;
  memberId?: string;
  projectName?: string;
  projectId?: string;
  projectType?: string;
  buildClass?: string;
  reviewName?: string;
  directionCount?: number;
  directionLabel?: string;
  requiredInputCount?: number;
  inputItems?: string[];
  milestoneName?: string;
  launchUrl?: string;
  liveUrl?: string;
  memberSince?: string;
  dueDate?: string;
  timestamp?: string;
  issuedDate?: string;
  statusLabel?: string;
  ctaUrl?: string;
  headline?: string;
  subheadline?: string;
  bodyLines?: string[];
  dataFields?: Array<{ label: string; value: string }>;
  issueNumber?: string;
  signalModules?: Array<{ num: string; title: string; excerpt: string }>;
  theme?: EmailTheme;
  accentScript?: string;
  familyLabel?: string;
  preheaderOverride?: string;
  /** Location / member coordinates */
  locationId?: string;
  firstStop?: string;
  occupancyStatus?: string;
  /** Project production */
  phase?: string;
  phaseProgress?: number;
  currentModule?: string;
  nextMilestone?: string;
  lastUpdate?: string;
  componentCount?: string;
  /** Review */
  responseTime?: string;
  reviewContext?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  /** Milestone */
  milestonePhase?: string;
  milestoneImpact?: string;
  /** Delivery */
  packageId?: string;
  packageContents?: string;
  storageLocation?: string;
  deliveredAt?: string;
  /** Billing */
  invoiceId?: string;
  transactionId?: string;
  amount?: string;
  currency?: string;
  paymentStatus?: 'FUNDED' | 'DUE' | 'FAILED' | 'REFUNDED';
  lineItems?: Array<{ num: string; label: string; detail: string; amount: string; funded: boolean }>;
  /** Blocker */
  holdId?: string;
  stoppedAt?: string;
  waitingOn?: string;
  nextModule?: string;
  blockerReason?: string;
  waitingItems?: string[];
  /** Re-engagement */
  belongingsStatus?: string;
  demolitionStatus?: string;
};

export type EmailTemplateDefinition = {
  id: string;
  num: number;
  name: string;
  family: EmailFamily;
  familyLabel: string;
  event: string;
  archetype: EmailArchetype;
  classification: EmailClassification;
  subject: (vars: EmailTemplateVars) => string;
  preheader: (vars: EmailTemplateVars) => string;
  headline: (vars: EmailTemplateVars) => string;
  subheadline?: (vars: EmailTemplateVars) => string;
  ctaLabel: string;
  debugStatus: EmailDebugStatus;
  enabled: boolean;
  notes?: string;
  defaultTheme?: EmailTheme;
  varsForPreview?: Partial<EmailTemplateVars>;
};

export type RenderedEmail = {
  html: string;
  text: string;
  subject: string;
  preheader: string;
};
