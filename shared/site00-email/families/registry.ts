/** Canonical nine-family email system — approved reference boards 01–09. */
export type EmailFamilyCanon =
  | 'ACCESS_SECURITY'
  | 'WELCOME_ONBOARDING'
  | 'PROJECT_PRODUCTION'
  | 'ACTION_REVIEW'
  | 'MILESTONE_CELEBRATION'
  | 'DELIVERY_COMPLETE'
  | 'BILLING_PAYMENT'
  | 'ALERT_BLOCKER'
  | 'REENGAGEMENT_HUMAN';

export type EmailFamilyCanonSpec = {
  id: EmailFamilyCanon;
  num: string;
  label: string;
  metaphor: string;
  signatureArtifact: string;
  dominantField: 'dark' | 'light' | 'warm';
  subjectTone: string;
  primaryCtaPattern: string;
  prohibited: string[];
};

export const EMAIL_FAMILY_REGISTRY: Record<EmailFamilyCanon, EmailFamilyCanonSpec> = {
  ACCESS_SECURITY: {
    id: 'ACCESS_SECURITY',
    num: '01',
    label: 'ACCESS / SECURITY',
    metaphor: 'Secure SITE 00 credential — protected clearance',
    signatureArtifact: 'DIGITAL CREDENTIAL / ACCESS PASS',
    dominantField: 'dark',
    subjectTone: 'YOUR SITE 00 ACCESS LINK.',
    primaryCtaPattern: 'ENTER SITE 00 →',
    prohibited: ['generic membership card', 'oversized QR', 'SaaS welcome banner'],
  },
  WELCOME_ONBOARDING: {
    id: 'WELCOME_ONBOARDING',
    num: '02',
    label: 'WELCOME / ONBOARDING',
    metaphor: 'SITE 00 assigns a digital location — arrival, not registration',
    signatureArtifact: 'LOCATION KEY',
    dominantField: 'light',
    subjectTone: 'YOUR LOCATION EXISTS NOW.',
    primaryCtaPattern: 'ENTER YOUR LOCATION →',
    prohibited: ['generic welcome banner', 'let\'s get started cliché'],
  },
  PROJECT_PRODUCTION: {
    id: 'PROJECT_PRODUCTION',
    num: '03',
    label: 'PROJECT / PRODUCTION',
    metaphor: 'Digital property visibly under construction',
    signatureArtifact: 'THE LIVING BLUEPRINT',
    dominantField: 'light',
    subjectTone: 'YOUR BUILD IS MOVING.',
    primaryCtaPattern: 'VIEW PROJECT DASHBOARD →',
    prohibited: ['plain status notification', 'dashboard screenshot clone'],
  },
  ACTION_REVIEW: {
    id: 'ACTION_REVIEW',
    num: '04',
    label: 'ACTION REQUIRED / REVIEW',
    metaphor: 'Formal review card / markup request',
    signatureArtifact: 'REVIEW CARD',
    dominantField: 'light',
    subjectTone: 'WE NEED YOUR EYES ON THIS.',
    primaryCtaPattern: 'REVIEW NOW →',
    prohibited: ['red exclamation alert', 'nagging reminder tone'],
  },
  MILESTONE_CELEBRATION: {
    id: 'MILESTONE_CELEBRATION',
    num: '05',
    label: 'MILESTONE / CELEBRATION',
    metaphor: 'Portion of SITE 00 system unlocked',
    signatureArtifact: 'MILESTONE UNLOCKED',
    dominantField: 'dark',
    subjectTone: 'PHASE 01: UNLOCKED.',
    primaryCtaPattern: 'VIEW MILESTONE SUMMARY →',
    prohibited: ['confetti SaaS', 'generic badge celebration'],
  },
  DELIVERY_COMPLETE: {
    id: 'DELIVERY_COMPLETE',
    num: '06',
    label: 'DELIVERY / COMPLETE',
    metaphor: 'Work arrives as SITE 00 package entering the Vault',
    signatureArtifact: 'DELIVERY PACKAGE',
    dominantField: 'light',
    subjectTone: 'YOUR PACKAGE HAS ARRIVED.',
    primaryCtaPattern: 'OPEN VAULT →',
    prohibited: ['download notification clone', 'shipping tracker UI'],
  },
  BILLING_PAYMENT: {
    id: 'BILLING_PAYMENT',
    num: '07',
    label: 'BILLING / PAYMENT',
    metaphor: 'Transaction funds a tangible portion of the build',
    signatureArtifact: 'BUILD RECEIPT',
    dominantField: 'light',
    subjectTone: 'ANOTHER PART OF THE BUILD IS FUNDED.',
    primaryCtaPattern: 'VIEW BUILD RECEIPT →',
    prohibited: ['Stripe receipt clone', 'generic invoice table'],
  },
  ALERT_BLOCKER: {
    id: 'ALERT_BLOCKER',
    num: '08',
    label: 'ALERT / BLOCKER',
    metaphor: 'Construction stopped at physical checkpoint',
    signatureArtifact: 'BUILD HOLD TAG',
    dominantField: 'light',
    subjectTone: 'WE HIT A RED LIGHT.',
    primaryCtaPattern: 'CLEAR THE HOLD →',
    prohibited: ['warning triangle hero', 'panic alert styling'],
  },
  REENGAGEMENT_HUMAN: {
    id: 'REENGAGEMENT_HUMAN',
    num: '09',
    label: 'RE-ENGAGEMENT / THE LOCATION REMEMBERS',
    metaphor: 'Absence without abandonment — location still yours',
    signatureArtifact: 'OCCUPANCY / LOCATION HOLD NOTICE',
    dominantField: 'warm',
    subjectTone: 'GOOD NEWS. WE DIDN\'T RENT IT OUT.',
    primaryCtaPattern: 'I\'M BACK →',
    prohibited: ['chase-y marketing', 'we miss you generic'],
  },
};

export const EMAIL_FAMILY_CANON_LIST: EmailFamilyCanon[] = [
  'ACCESS_SECURITY',
  'WELCOME_ONBOARDING',
  'PROJECT_PRODUCTION',
  'ACTION_REVIEW',
  'MILESTONE_CELEBRATION',
  'DELIVERY_COMPLETE',
  'BILLING_PAYMENT',
  'ALERT_BLOCKER',
  'REENGAGEMENT_HUMAN',
];

export function getFamilySpec(canon: EmailFamilyCanon): EmailFamilyCanonSpec {
  return EMAIL_FAMILY_REGISTRY[canon];
}
