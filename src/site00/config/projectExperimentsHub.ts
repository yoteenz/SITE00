/**
 * NDXBOOK methodology & experiments — single hub index and sequential navigation.
 */

import {
  site00ProjectCanonicalCarouselExpansionPath,
  site00ProjectCanonicalCreativeRangePath,
  site00ProjectContentLibraryPath,
  site00ProjectCreativeAppetitePath,
  site00ProjectExperimentDPath,
  site00ProjectExperimentEPath,
  site00ProjectExperimentEVisualDevelopmentPath,
  site00ProjectExperimentFPath,
  site00ProjectExperimentGPath,
  site00ProjectExperimentGDirectionsPath,
  site00ProjectExperimentGFinalistsPath,
  site00ProjectExperimentHPath,
  site00ProjectBrandMarketingExpressionPath,
  site00ProjectBrandMarketingExpressionExperiment01Path,
  site00ProjectContentOperationsPath,
  site00ProjectContentOperationsPerformancePath,
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectContentOperationsDailyPlanPath,
  site00ProjectLoreCalibrationPath,
  site00ProjectPersonalityReplayConsistencyPath,
  site00ProjectPersonalityReplayPath,
} from './routes';

export type ProjectExperimentHubPhase = 'INTAKE' | 'EXPERIMENT' | 'EXPERIENCE' | 'LINEAGE';

export type ProjectExperimentHubChild = {
  id: string;
  title: string;
  path: string;
  description?: string;
};

export type ProjectExperimentHubEntry = {
  id: string;
  phase: ProjectExperimentHubPhase;
  order: number;
  letter?: string;
  title: string;
  headline: string;
  description: string;
  path: string;
  statusNote?: string;
  children?: ProjectExperimentHubChild[];
};

export type ProjectExperimentHubNavItem = {
  id: string;
  title: string;
  path: string;
  letter?: string;
};

const PHASE_LABELS: Record<ProjectExperimentHubPhase, string> = {
  INTAKE: 'INTAKE & INTELLIGENCE',
  EXPERIMENT: 'VALIDATION EXPERIMENTS',
  EXPERIENCE: 'EXPERIENCE & WORKSPACE',
  LINEAGE: 'CREATIVE LINEAGE',
};

export function projectExperimentsHubPhaseLabel(phase: ProjectExperimentHubPhase): string {
  return PHASE_LABELS[phase];
}

/** Canonical ordered hub for NDXBOOK founder methodology surfaces. */
export function getProjectExperimentsHubEntries(projectSlug: string): ProjectExperimentHubEntry[] {
  if (projectSlug !== 'ndxbook') return [];

  return [
    {
      id: 'lore-calibration',
      phase: 'INTAKE',
      order: 1,
      title: 'LORE CALIBRATION',
      headline: 'BRAND LORE GAPS',
      description: 'Targeted XXIX/XXX calibration before creative direction can proceed.',
      path: site00ProjectLoreCalibrationPath(projectSlug),
    },
    {
      id: 'creative-appetite',
      phase: 'INTAKE',
      order: 2,
      title: 'CREATIVE APPETITE',
      headline: 'HOW FAR CAN WE TAKE IT?',
      description: 'Founder creative appetite questionnaire and intelligence inspector.',
      path: site00ProjectCreativeAppetitePath(projectSlug),
    },
    {
      id: 'personality-replay',
      phase: 'INTAKE',
      order: 3,
      title: 'PERSONALITY REPLAY',
      headline: 'HOW YOU SHOW UP',
      description: 'Blind personality intake and replay execution — no benchmark exposure during answers.',
      path: site00ProjectPersonalityReplayPath(projectSlug),
    },
    {
      id: 'experiment-a',
      phase: 'EXPERIMENT',
      order: 4,
      letter: 'A',
      title: 'BLIND FORMATION CONSISTENCY',
      headline: 'EXPERIMENT A',
      description: 'Six-direction blind creative consistency validation from shadow formations.',
      path: site00ProjectPersonalityReplayConsistencyPath(projectSlug),
    },
    {
      id: 'experiment-b',
      phase: 'EXPERIMENT',
      order: 5,
      letter: 'B',
      title: 'CANONICAL CREATIVE RANGE',
      headline: 'EXPERIMENT B',
      description: 'One first-pass hero per established canonical direction (v1 + v2 roster).',
      path: site00ProjectCanonicalCreativeRangePath(projectSlug),
    },
    {
      id: 'experiment-c',
      phase: 'EXPERIMENT',
      order: 6,
      letter: 'C',
      title: 'SAME-TOPIC CAROUSEL EXPANSION',
      headline: 'EXPERIMENT C',
      description: 'Six-slide CREDIT UTILIZATION carousels per direction — preserved; generation superseded.',
      path: site00ProjectCanonicalCarouselExpansionPath(projectSlug),
      statusNote: 'SUPERSEDED — evidence preserved; no new carousel generation',
    },
    {
      id: 'experiment-d',
      phase: 'EXPERIMENT',
      order: 7,
      letter: 'D',
      title: 'CONCEPT TERRITORY V1',
      headline: 'EXPERIMENT D',
      description: 'Six concept territory heroes — frozen snapshot; no appetite injection.',
      path: site00ProjectExperimentDPath(projectSlug),
      statusNote: 'FROZEN V1',
    },
    {
      id: 'experiment-f',
      phase: 'EXPERIMENT',
      order: 8,
      letter: 'F',
      title: 'SIX-CONCEPT REFORMATION',
      headline: 'EXPERIMENT F',
      description:
        'Content concept territory (Credit Utilization topic) — preserved historical research; not brand-presentation authority.',
      path: site00ProjectExperimentFPath(projectSlug),
      statusNote: 'CONTENT CONCEPTS — see Experiment G for brand presentation',
    },
    {
      id: 'brand-character-formation',
      phase: 'EXPERIMENT',
      order: 85,
      title: 'BRAND CHARACTER FORMATION',
      headline: 'P0.5B',
      description:
        'Six topic-blind Brand Character Territories — WHO NDXBOOK is before presentation, identity, or content expression.',
      path: site00ProjectExperimentHPath(projectSlug),
      statusNote: 'UPSTREAM WHO LAYER — no visual generation in this sprint',
    },
    {
      id: 'brand-marketing-expression',
      phase: 'EXPERIMENT',
      order: 86,
      title: 'MARKETING EXPRESSION',
      headline: 'P0.5C',
      description:
        'Character-led marketing expression — public behavior thesis, North-Star calibration, Experiment 01 feed (not final identity).',
      path: site00ProjectBrandMarketingExpressionPath(projectSlug),
      statusNote: 'CHARACTER → MARKETING — not template library',
      children: [
        {
          id: 'marketing-expression-experiment-01',
          title: 'EXPERIMENT 01 — NDX FEED',
          path: site00ProjectBrandMarketingExpressionExperiment01Path(projectSlug),
          description: 'V1 original expression test + V2 editorial information architecture (contract review before generate).',
        },
      ],
    },
    {
      id: 'content-operations',
      phase: 'EXPERIMENT',
      order: 87,
      title: 'CONTENT OPERATIONS',
      headline: 'P0.5D / P0.5E',
      description:
        'Content opportunity engine, editorial slate, campaign production board, horizontal sequence rounds, client approval — ASSISTED_AUTONOMY.',
      path: site00ProjectContentOperationsPath(projectSlug),
      statusNote: 'Founder approval required before publish — no autonomous posting',
      children: [
        {
          id: 'content-operations-campaign-board',
          title: 'CAMPAIGN BOARD',
          path: site00ProjectContentOperationsCampaignBoardPath(projectSlug),
          description: 'Horizontal sequence production — campaign wall, round review, lock workflow.',
        },
        {
          id: 'content-operations-daily-plan',
          title: 'DAILY PLAN + CROSS-PLATFORM',
          path: site00ProjectContentOperationsDailyPlanPath(projectSlug),
          description: 'P0.5E.1 — 3 primary events/day → platform-native expressions. Weekly intelligence slate.',
        },
        {
          id: 'content-operations-performance',
          title: 'PERFORMANCE + LEARNING',
          path: site00ProjectContentOperationsPerformancePath(projectSlug),
          description: 'What happened, what people said, what NOT to conclude.',
        },
      ],
    },
    {
      id: 'experiment-g',
      phase: 'EXPERIMENT',
      order: 9,
      letter: 'G',
      title: 'BRAND PRESENTATION CONCEPTS',
      headline: 'EXPERIMENT G',
      description:
        'Six topic-blind brand-presentation territories — how NDXBOOK exists as a persistent social brand before direction work.',
      path: site00ProjectExperimentGPath(projectSlug),
      children: [
        {
          id: 'experiment-g-directions',
          title: 'BRAND PRESENTATION DIRECTIONS',
          path: site00ProjectExperimentGDirectionsPath(projectSlug),
          description: 'Direction review — 9 written directions (3 per parent concept).',
        },
        {
          id: 'experiment-g-finalists',
          title: 'PARENT FINALIST VISUAL REVIEW',
          path: site00ProjectExperimentGFinalistsPath(projectSlug),
          description: '6 direction visual benchmarks — Room + Noticing, 1 visual per direction.',
        },
      ],
    },
    {
      id: 'experiment-e',
      phase: 'EXPERIENCE',
      order: 10,
      letter: 'E',
      title: 'EXPERIENCE EXPRESSION',
      headline: 'EXPERIMENT E',
      description: 'How the interactive product feels, organizes information, and behaves.',
      path: site00ProjectExperimentEPath(projectSlug),
      children: [
        {
          id: 'visual-development',
          title: 'PROJECT WORKSPACE VISUAL DEVELOPMENT',
          path: site00ProjectExperimentEVisualDevelopmentPath(projectSlug),
          description: 'Design proofs for Projects Index + NDXBOOK project home before implementation.',
        },
      ],
    },
    {
      id: 'content-library',
      phase: 'LINEAGE',
      order: 11,
      title: 'CONTENT LIBRARY',
      headline: 'CREATIVE LINEAGE',
      description: 'Normalized assets from validation runs — founder judgment, promotion, and salvage.',
      path: site00ProjectContentLibraryPath(projectSlug),
    },
  ];
}

export function flattenProjectExperimentsHubNav(
  entries: ProjectExperimentHubEntry[],
): ProjectExperimentHubNavItem[] {
  const flat: ProjectExperimentHubNavItem[] = [];
  for (const entry of entries) {
    flat.push({ id: entry.id, title: entry.title, path: entry.path, letter: entry.letter });
    for (const child of entry.children ?? []) {
      flat.push({ id: child.id, title: child.title, path: child.path, letter: entry.letter });
    }
  }
  return flat;
}

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

export function resolveProjectExperimentsHubNavIndex(
  pathname: string,
  items: ProjectExperimentHubNavItem[],
): number {
  const current = normalizePath(pathname);
  return items.findIndex((item) => normalizePath(item.path) === current);
}
