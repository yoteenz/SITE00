/**
 * PROJECT × DOMAIN capability map.
 *
 * GLOBAL_TAB_AVAILABLE ≠ PROJECT_DOMAIN_ESTABLISHED. The shell shows seven tabs for every project; whether a work
 * domain is ESTABLISHED for a project is derived from that project's own graph (≥ 1 production node). The declared
 * applicability below documents where a domain is expected — it never invents a domain: an APPLICABLE domain with
 * no nodes renders a truthful project-scoped NOT_ESTABLISHED state.
 */
import type { DomainState, ProductionNode, WorkDomain } from './types.js';

export type DomainApplicability = 'PRIMARY' | 'APPLICABLE' | 'CONDITIONAL' | 'NOT_APPLICABLE';

export type ProjectCapability = {
  project_id: string;
  label: string;
  domains: Record<WorkDomain, { applicability: DomainApplicability; scope: string }>;
};

export const PROJECT_DOMAIN_CAPABILITY_MAP: readonly ProjectCapability[] = [
  {
    project_id: 'ndxbook',
    label: 'NDXBOOK',
    domains: {
      DESIGN: { applicability: 'CONDITIONAL', scope: 'Only where site / interface authority is recorded for NDXBOOK.' },
      EXPERIENCE: { applicability: 'CONDITIONAL', scope: 'Only where a spatial / world experience is developed.' },
      EXPRESSION: { applicability: 'PRIMARY', scope: 'Campaign entries: narrative, casting, look, performance, sets, storyboard, keyframes.' },
    },
  },
  {
    project_id: 'jurnl',
    label: 'JURNL',
    domains: {
      DESIGN: { applicability: 'PRIMARY', scope: 'App / site page families F01–F16 — authorities, implementation, QA, founder approval.' },
      EXPERIENCE: { applicability: 'CONDITIONAL', scope: 'Only where a legitimate spatial / behaviour experience system exists.' },
      EXPRESSION: { applicability: 'CONDITIONAL', scope: 'Only when a campaign, editorial or casting system is explicitly established.' },
    },
  },
  {
    project_id: 'all-in-one-enterprises',
    label: 'ALL IN ONE ENTERPRISES',
    domains: {
      DESIGN: { applicability: 'PRIMARY', scope: 'Site / client / public / founder interfaces (IFTA authority package first).' },
      EXPERIENCE: { applicability: 'CONDITIONAL', scope: 'Only if a spatial / world experience is legitimately developed.' },
      EXPRESSION: { applicability: 'CONDITIONAL', scope: 'Only where real marketing / editorial / campaign systems exist.' },
    },
  },
  {
    project_id: 'studio-world',
    label: 'STUDIO WORLD',
    domains: {
      DESIGN: { applicability: 'APPLICABLE', scope: 'Site / control interface.' },
      EXPERIENCE: { applicability: 'PRIMARY', scope: 'World building — zones, environments, rooms, inhabitants.' },
      EXPRESSION: { applicability: 'APPLICABLE', scope: 'Residents / character / camera / editorial work.' },
    },
  },
  {
    project_id: 'astral-world',
    label: 'ASTRAL WORLD',
    domains: {
      DESIGN: { applicability: 'CONDITIONAL', scope: 'Only where a site / page authority is recorded.' },
      EXPERIENCE: { applicability: 'PRIMARY', scope: 'World entry, districts, rooms, reader spaces, presence, world assets, spatial interactions.' },
      EXPRESSION: { applicability: 'CONDITIONAL', scope: 'Only where editorial / campaign work is established.' },
    },
  },
  {
    project_id: 'frontal-slayer',
    label: 'FRONTAL SLAYER',
    domains: {
      DESIGN: { applicability: 'APPLICABLE', scope: 'Digital-location / site authority.' },
      EXPERIENCE: { applicability: 'APPLICABLE', scope: 'The Mansion — spatial rooms (no room registry is recorded yet).' },
      EXPRESSION: { applicability: 'CONDITIONAL', scope: 'Where campaigns / editorial apply.' },
    },
  },
  {
    project_id: 'site00',
    label: 'SITE 00',
    domains: {
      DESIGN: { applicability: 'APPLICABLE', scope: 'SITE 00 host site / page design.' },
      EXPERIENCE: { applicability: 'CONDITIONAL', scope: 'Only where a spatial experience is developed.' },
      EXPRESSION: { applicability: 'CONDITIONAL', scope: 'Only where campaigns / editorial are established.' },
    },
  },
];

export function projectCapability(projectId: string): ProjectCapability | null {
  return PROJECT_DOMAIN_CAPABILITY_MAP.find((p) => p.project_id === projectId) ?? null;
}

const DOMAIN_NAME: Record<WorkDomain, string> = { DESIGN: 'DESIGN', EXPERIENCE: 'EXPERIENCE', EXPRESSION: 'EXPRESSION' };

export const DOMAIN_ESTABLISH_HINT: Record<WorkDomain, (project: string) => string> = {
  DESIGN: (p) => `Design becomes available when a site, page family or visual authority is recorded for ${p} — a family production contract or a visual-authority package.`,
  EXPERIENCE: (p) => `Experience becomes available when a world, zone, environment, scene or spatial interaction system is recorded for ${p}.`,
  EXPRESSION: (p) => `Expression becomes available when a campaign, editorial system, casting workflow or other expression production node is created for ${p}.`,
};

export function domainHeadline(domain: WorkDomain, projectName: string): string {
  return `NO ${DOMAIN_NAME[domain]} WORKSPACE HAS BEEN ESTABLISHED FOR ${projectName}.`;
}

/** Derived from the project's own nodes — never from another project, never from a global default. */
export function deriveDomainState(domain: WorkDomain, projectId: string, projectName: string, nodes: readonly ProductionNode[], sourceLabels: readonly string[]): DomainState {
  const own = nodes.filter((n) => n.project_id === projectId && n.domain === domain);
  const cap = projectCapability(projectId)?.domains[domain];
  if (own.length > 0)
    return {
      domain,
      established: true,
      node_count: own.length,
      reason: `${own.length} ${domain.toLowerCase()} production node${own.length === 1 ? '' : 's'} recorded for ${projectName}.`,
      establish_hint: '',
      sources: sourceLabels,
    };
  const expectation =
    !cap ? 'No domain capability is declared for this project.'
    : cap.applicability === 'NOT_APPLICABLE' ? `${domain} does not apply to ${projectName}.`
    : cap.applicability === 'CONDITIONAL' ? `${cap.scope}`
    : `${domain} applies to ${projectName} (${cap.scope.replace(/\.$/, '')}), but no production node has been recorded yet.`;
  return {
    domain,
    established: false,
    node_count: 0,
    reason: expectation,
    establish_hint: DOMAIN_ESTABLISH_HINT[domain](projectName),
    sources: [],
  };
}
