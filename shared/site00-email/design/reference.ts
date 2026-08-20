import type { EmailArchetype } from '../types.js';

/** Approved reference-sheet composition notes for debug QA review. */
export type ReferenceCompositionSpec = {
  refId: string;
  label: string;
  theme: 'light' | 'dark';
  composition: string;
  copyNotes: string;
  heroElement: string;
};

const SPECS: Record<EmailArchetype, ReferenceCompositionSpec> = {
  'access-credential': {
    refId: 'REF-01',
    label: 'Access / Welcome credential',
    theme: 'dark',
    composition: 'Black field · script “Welcome to” · oversized SITE 00 · hexagonal access mark · white credential card with initials, member ID, real QR · red CTA.',
    copyNotes: 'Welcome to / SITE 00 / YOUR SITE 00 IDENTITY HAS BEEN RECOGNIZED. / ENTER SITE 00 →',
    heroElement: 'Digital business card + QR artifact',
  },
  'project-record': {
    refId: 'REF-02',
    label: 'Project Initiated',
    theme: 'light',
    composition: 'White field · architectural hallway hero band · PROJECT INITIATED. · red project ID · metadata card · black CTA.',
    copyNotes: 'PROJECT INITIATED. / PROJECT {{project_id}} / VIEW PROJECT →',
    heroElement: 'Blueprint hallway perspective',
  },
  'studio-portal': {
    refId: 'REF-03',
    label: 'Studio Access Granted',
    theme: 'dark',
    composition: 'Black portal hall · red doorframe with 00 · STUDIO ACCESS GRANTED. · ceremonial status card (STUDIO ACTIVE) · white CTA.',
    copyNotes: 'STUDIO ACCESS GRANTED. / PAYMENT CONFIRMED. YOUR PROJECT HAS ENTERED THE PRODUCTION ENVIRONMENT. / ENTER STUDIO →',
    heroElement: 'Red portal doorframe',
  },
  'action-required': {
    refId: 'REF-04',
    label: 'Input Required',
    theme: 'light',
    composition: 'White field · coordinate diagram hero · PRODUCTION IS WAITING ON YOU. · numbered input list · red CTA.',
    copyNotes: '{{count}} ITEMS REQUIRED / numbered tasks / OPEN INPUT →',
    heroElement: 'Coordinate target + required items',
  },
  'review-dossier': {
    refId: 'REF-05',
    label: 'Review Ready',
    theme: 'dark',
    composition: 'Black wireframe corridor · direction marker · N DIRECTIONS HAVE ENTERED REVIEW. · red CTA.',
    copyNotes: '3 DIRECTIONS HAVE ENTERED REVIEW. / ENTER REVIEW →',
    heroElement: 'Wireframe corridor + direction badge',
  },
  'milestone-artifact': {
    refId: 'REF-06',
    label: 'Milestone Reached',
    theme: 'light',
    composition: 'White field · glass hexagon with check · MILESTONE RECORDED. · metadata card · black CTA.',
    copyNotes: 'MILESTONE RECORDED. / VIEW MILESTONES →',
    heroElement: 'Hexagon achievement artifact',
  },
  'status-notice': {
    refId: 'REF-07',
    label: 'Status / Revision notice',
    theme: 'light',
    composition: 'Family-accented status field · editorial headline · optional metadata · CTA matched to theme.',
    copyNotes: 'Template-specific approved headline (e.g. REVISION RECEIVED.)',
    heroElement: 'Technical diagram or family mark',
  },
  'system-check': {
    refId: 'REF-08',
    label: 'Final System Check',
    theme: 'light',
    composition: 'White field · circular radar target · FINAL SYSTEM CHECK · QA STATUS card · red CTA.',
    copyNotes: 'FINAL SYSTEM CHECK / QA STATUS: PASSED / AUTHORIZE LAUNCH →',
    heroElement: 'Radar / target diagram',
  },
  'launch-authorization': {
    refId: 'REF-09',
    label: 'Launch Authorization',
    theme: 'light',
    composition: 'White field · vertical launch stack graphic · LAUNCH SEQUENCE READY. · black CTA.',
    copyNotes: 'LAUNCH SEQUENCE READY. / YOUR APPROVAL IS REQUIRED. / AUTHORIZE LAUNCH →',
    heroElement: 'Launch stack / mission control',
  },
  'location-live': {
    refId: 'REF-10',
    label: 'Location Live',
    theme: 'light',
    composition: 'White field · script Congratulations! · YOUR SITE IS NOW LIVE. · live URL · black CTA.',
    copyNotes: 'Congratulations! / YOUR SITE IS NOW LIVE. / VIEW LIVE SITE →',
    heroElement: 'Architectural colonnade band',
  },
  'production-complete': {
    refId: 'REF-11',
    label: 'Production Complete',
    theme: 'light',
    composition: 'White field · corner bracket marks · PRODUCTION RECORD CLOSED. · black CTA.',
    copyNotes: 'PRODUCTION RECORD CLOSED. / YOUR PROPERTY IS ACTIVE. / VIEW PROJECT →',
    heroElement: 'Final artifact + corner marks',
  },
  'signal-editorial': {
    refId: 'REF-12',
    label: 'SITE 00 Signal',
    theme: 'light',
    composition: 'White editorial · SITE 00 SIGNAL · ISSUE ### · numbered modules · black CTA.',
    copyNotes: 'SITE 00 SIGNAL / ISSUE 004 / READ SIGNAL →',
    heroElement: 'Signal transmission diagram',
  },
  'internal-notice': {
    refId: 'INTERNAL',
    label: 'Operator notice',
    theme: 'light',
    composition: 'Restrained SITE 00 system notice for operators.',
    copyNotes: 'Event-specific operational copy.',
    heroElement: 'Minimal system header',
  },
};

export function getReferenceSpec(archetype: EmailArchetype): ReferenceCompositionSpec {
  return SPECS[archetype] ?? SPECS['status-notice'];
}
