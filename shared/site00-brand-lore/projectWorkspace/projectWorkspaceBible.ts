/**
 * Project Workspace Bible — invariant SITE 00 project-working experience.
 */

import {
  PROJECT_WORKSPACE_METHODOLOGY_VERSION,
  PROJECT_WORKSPACE_OWNERSHIP,
  PROJECT_WORKSPACE_CONCEPT_LABEL,
  WORKSPACE_INTERACTION_VERBS,
} from './constants.js';

export type ProjectWorkspaceBible = {
  bibleId: string;
  methodologyVersion: typeof PROJECT_WORKSPACE_METHODOLOGY_VERSION;
  ownership: typeof PROJECT_WORKSPACE_OWNERSHIP;
  conceptLabel: typeof PROJECT_WORKSPACE_CONCEPT_LABEL;
  workspaceThesis: string;
  viewerRole: string;
  informationBehavior: string;
  interactionGrammar: string[];
  hierarchyGrammar: string[];
  compositionGrammar: string[];
  materialGrammar: string;
  responsivePhilosophy: {
    desktop: string;
    mobile: string;
    mobileNotStackedDesktop: true;
  };
  zoneBehavior: Record<
    string,
    { role: string; defaultVisibility: 'DOMINANT' | 'CONDITIONAL' | 'PERIPHERAL' | 'CONTEXTUAL' }
  >;
  literalizationBlocked: string[];
  clientAgnostic: true;
  compiledAt: string;
};

export function buildProjectWorkspaceBible(): ProjectWorkspaceBible {
  return {
    bibleId: 'site00-project-workspace-bible-v1',
    methodologyVersion: PROJECT_WORKSPACE_METHODOLOGY_VERSION,
    ownership: PROJECT_WORKSPACE_OWNERSHIP,
    conceptLabel: PROJECT_WORKSPACE_CONCEPT_LABEL,
    workspaceThesis:
      'SITE 00 is an active place where work is being made, inspected, revised, approved, organized, and moved into production.',
    viewerRole: 'Founder/client as active director and decision-maker inside the project workspace.',
    informationBehavior:
      'Information appears according to its relationship to current work, attention, evidence, history, and production — not as equal dashboard modules.',
    interactionGrammar: [...WORKSPACE_INTERACTION_VERBS],
    hierarchyGrammar: [
      'Current work dominates',
      'Required judgment interrupts',
      'Supporting intelligence recedes until needed',
      'History remains accessible without competing with active work',
      'Dossier behaves as deeper intelligence layer — not primary navigation',
    ],
    compositionGrammar: [
      'Asymmetric',
      'Layered',
      'Artifact-driven',
      'Variable scale',
      'Strong focal hierarchy',
      'No equal-card dashboard',
    ],
    materialGrammar:
      'SITE 00 owns structural/environmental continuity. Client expression alters visual material inhabiting project surfaces — not workspace grammar.',
    responsivePhilosophy: {
      desktop:
        'Broader spatial working field; multiple evidence relationships may coexist; active piece dominates composition.',
      mobile:
        'One dominant current object/state; required review receives priority; supporting evidence in contextual drawers; history/dossier in secondary surfaces.',
      mobileNotStackedDesktop: true,
    },
    zoneBehavior: {
      ON_THE_BENCH: { role: 'Projects receiving active work', defaultVisibility: 'DOMINANT' },
      ACTIVE_PIECE: { role: 'Primary attention target', defaultVisibility: 'DOMINANT' },
      REVIEW_TRAY: { role: 'Judgment waiting — surfaces only when required', defaultVisibility: 'CONDITIONAL' },
      WORK_HISTORY: { role: 'Recent production events — peripheral until opened', defaultVisibility: 'PERIPHERAL' },
      DOSSIER: { role: 'Structured intelligence layer', defaultVisibility: 'CONTEXTUAL' },
      ASSET_VAULT: { role: 'Entered from relevant work context', defaultVisibility: 'CONTEXTUAL' },
      PRODUCTION: { role: 'Emerges according to lifecycle state', defaultVisibility: 'CONDITIONAL' },
    },
    literalizationBlocked: [
      'literal workshop carpentry',
      'investigative case file metaphor',
      'SaaS project management grid',
      'equal KPI tiles',
    ],
    clientAgnostic: true,
    compiledAt: new Date().toISOString(),
  };
}

export function mobilePhilosophyNotStackedDesktop(bible: ProjectWorkspaceBible): boolean {
  return bible.responsivePhilosophy.mobileNotStackedDesktop === true;
}

export function reviewTrayConditional(bible: ProjectWorkspaceBible): boolean {
  return bible.zoneBehavior.REVIEW_TRAY?.defaultVisibility === 'CONDITIONAL';
}

export function activePieceDominant(bible: ProjectWorkspaceBible): boolean {
  return bible.zoneBehavior.ACTIVE_PIECE?.defaultVisibility === 'DOMINANT';
}
