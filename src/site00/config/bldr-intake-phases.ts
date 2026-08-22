/**
 * BLDR intake — conceptual phase labels mapped to existing step ids.
 */

import type { BldrAssessmentStateId } from './bldr-assessment';

export type BldrIntakePhase = {
  num: string;
  label: string;
  sectionTitle?: string;
};

const SITE_PHASES: Record<string, BldrIntakePhase> = {
  landing: { num: '01', label: 'PROPERTY', sectionTitle: 'WHAT IS THIS SITE RESPONSIBLE FOR?' },
  type: { num: '01', label: 'PROPERTY', sectionTitle: 'WHAT IS THIS SITE RESPONSIBLE FOR?' },
  audience: { num: '03', label: 'AUDIENCE', sectionTitle: 'WHO IS IT FOR?' },
  features: { num: '04', label: 'CAPABILITIES', sectionTitle: 'WHAT MUST IT DO?' },
  content: { num: '05', label: 'CONTENT', sectionTitle: 'WHAT ALREADY EXISTS?' },
  technical: { num: '05', label: 'CONTENT', sectionTitle: 'TECHNICAL REQUIREMENTS' },
  timeline: { num: '06', label: 'SCOPE', sectionTitle: 'TIMELINE & INVESTMENT' },
  budget: { num: '06', label: 'SCOPE', sectionTitle: 'TIMELINE & INVESTMENT' },
};

const WORLD_PHASES: Record<string, BldrIntakePhase> = {
  landing: { num: '01', label: 'WORLD', sectionTitle: 'DEFINE THE ENVIRONMENT.' },
  type: { num: '01', label: 'WORLD', sectionTitle: 'DEFINE THE ENVIRONMENT.' },
  audience: { num: '02', label: 'DESTINATIONS', sectionTitle: 'WHO EXISTS INSIDE IT?' },
  experience: { num: '03', label: 'EXPERIENCE', sectionTitle: 'HOW SHOULD USERS MOVE THROUGH IT?' },
  roles: { num: '04', label: 'SYSTEMS', sectionTitle: 'WHAT CAPABILITIES POWER IT?' },
  integrations: { num: '05', label: 'CONNECTIONS', sectionTitle: 'WHAT MUST COMMUNICATE WITH WHAT?' },
  scale: { num: '06', label: 'SCOPE', sectionTitle: 'REVIEW THE PROPOSED WORLD.' },
  timeline: { num: '06', label: 'SCOPE', sectionTitle: 'TIMELINE & INVESTMENT' },
  budget: { num: '06', label: 'SCOPE', sectionTitle: 'TIMELINE & INVESTMENT' },
};

const ENTERPRISE_PHASES: Record<string, BldrIntakePhase> = {
  landing: { num: '01', label: 'ORGANIZATION', sectionTitle: 'WHAT OPERATION IS BEING SUPPORTED?' },
  need: { num: '01', label: 'ORGANIZATION', sectionTitle: 'WHAT OPERATION IS BEING SUPPORTED?' },
  audience: { num: '02', label: 'USERS', sectionTitle: 'WHO NEEDS ACCESS?' },
  context: { num: '02', label: 'USERS', sectionTitle: 'ADDITIONAL CONTEXT' },
  workflows: { num: '03', label: 'SYSTEMS', sectionTitle: 'WHAT SYSTEMS ARE INVOLVED?' },
  data: { num: '04', label: 'DATA', sectionTitle: 'WHAT INFORMATION MOVES BETWEEN THEM?' },
  integrations: { num: '05', label: 'INTEGRATIONS', sectionTitle: 'WHAT EXTERNAL SERVICES MUST CONNECT?' },
  security: { num: '06', label: 'SECURITY', sectionTitle: 'WHAT ACCESS/CONTROL REQUIREMENTS EXIST?' },
  scale: { num: '07', label: 'SCOPE', sectionTitle: 'REVIEW THE ARCHITECTURE.' },
  timeline: { num: '07', label: 'SCOPE', sectionTitle: 'TIMELINE & PRIORITY' },
};

const DISCOVERY_PHASES: Record<string, BldrIntakePhase> = {
  landing: { num: '01', label: 'IDEA', sectionTitle: 'WHAT BEST DESCRIBES YOU?' },
  q1: { num: '01', label: 'IDEA' },
  q2: { num: '02', label: 'EXPERIENCE' },
  q3: { num: '02', label: 'EXPERIENCE' },
  q4: { num: '03', label: 'SYSTEMS' },
  q5: { num: '04', label: 'SCALE' },
  recommendation: { num: 'RESULT', label: 'CLASSIFICATION' },
};

const PHASE_MAP: Record<BldrAssessmentStateId, Record<string, BldrIntakePhase>> = {
  site: SITE_PHASES,
  world: WORLD_PHASES,
  enterprise: ENTERPRISE_PHASES,
  'not-sure': DISCOVERY_PHASES,
};

export function getBldrIntakePhase(classId: BldrAssessmentStateId, stepId: string): BldrIntakePhase {
  const map = PHASE_MAP[classId];
  return map[stepId] ?? { num: '—', label: 'INTAKE' };
}

export const BLDR_CLASS_RECEIVED_COPY: Record<BldrAssessmentStateId, { descriptor: string; next: string }> = {
  site: { descriptor: 'FOCUSED DIGITAL PROPERTY.', next: "NOW LET'S DEFINE THE PROPERTY." },
  world: { descriptor: 'IMMERSIVE DIGITAL ENVIRONMENT.', next: "NOW LET'S MAP THE EXPERIENCE." },
  enterprise: { descriptor: 'CONNECTED DIGITAL INFRASTRUCTURE.', next: "NOW LET'S MAP THE SYSTEM." },
  'not-sure': { descriptor: "THAT'S WHAT BLDR IS FOR.", next: "LET'S CLASSIFY THE BUILD." },
};
