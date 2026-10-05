import {
  getActiveCanonicalReference,
  getActiveImplementationCanon,
  getLatestReconstructionRun,
} from './canonicalReferenceRegistry.js';
import { listDesignScreensForProject, resolveDesignScreenRoute } from './designScreenRegistry.js';
import type { DesignScreenMatrixRow, DesignViewportClass, DesignViewportMatrixCell, ImplementationMatchStatus } from './types.js';

function mapImplementationStatus(
  projectId: string,
  screenId: string,
  viewportClass: DesignViewportClass,
): ImplementationMatchStatus {
  const canon = getActiveImplementationCanon(projectId, screenId, viewportClass);
  if (!canon) return 'NOT_STARTED';
  if (canon.status === 'STALE_AGAINST_NEW_REFERENCE') return 'STALE_AGAINST_NEW_REFERENCE';
  if (canon.founderJudgment === 'MATCHES' && canon.visualScore >= 0.8) return 'MATCHED';
  const run = getLatestReconstructionRun(projectId, screenId, viewportClass);
  if (run?.passState === 'BLOCKED') return 'BLOCKED';
  return 'NEEDS_MATCH';
}

function buildViewportCell(
  projectId: string,
  screenId: string,
  viewportClass: DesignViewportClass,
): DesignViewportMatrixCell {
  const ref = getActiveCanonicalReference(projectId, screenId, viewportClass);
  return {
    referenceStatus: ref ? (ref.status === 'DRAFT' ? 'DRAFT' : 'ACTIVE') : 'MISSING',
    referenceVersion: ref?.version ?? null,
    implementationStatus: mapImplementationStatus(projectId, screenId, viewportClass),
    implementationCoverage: ref ? 'PARTIAL' : 'MISSING',
  };
}

export function buildDesignScreenMatrix(projectId: string): DesignScreenMatrixRow[] {
  const screens = listDesignScreensForProject(projectId, true);
  const uniqueScreens = screens.filter(
    (s, index, arr) => arr.findIndex((x) => x.screenId === s.screenId) === index,
  );

  return uniqueScreens.map((screen) => {
    const route = resolveDesignScreenRoute(screen, projectId);
    const row: DesignScreenMatrixRow = {
      screenId: screen.screenId,
      displayName: screen.displayName,
      route,
      routeFamily: screen.routeFamily,
      classification: screen.classification,
      recordKind: screen.recordKind,
      mobile: buildViewportCell(projectId, screen.screenId, 'mobile'),
      tablet: buildViewportCell(projectId, screen.screenId, 'tablet'),
      desktop: buildViewportCell(projectId, screen.screenId, 'desktop'),
    };
    if (screen.supportsUltrawide) {
      row.ultrawide = buildViewportCell(projectId, screen.screenId, 'ultrawide');
    }
    return row;
  });
}

export function formatMatrixCell(status: ImplementationMatchStatus | 'ACTIVE' | 'MISSING' | 'DRAFT'): string {
  switch (status) {
    case 'MATCHED':
      return 'MATCHED';
    case 'NEEDS_MATCH':
      return 'NEEDS MATCH';
    case 'STALE_AGAINST_NEW_REFERENCE':
      return 'STALE';
    case 'NOT_STARTED':
      return 'NOT STARTED';
    case 'BLOCKED':
      return 'BLOCKED';
    case 'ACTIVE':
      return 'CANONICAL';
    case 'MISSING':
      return 'MISSING REFERENCE';
    case 'DRAFT':
      return 'DRAFT';
    default:
      return String(status);
  }
}
