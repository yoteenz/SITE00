import {
  getActiveCanonicalReference,
  getActiveImplementationCanon,
  getLatestReconstructionRun,
} from './canonicalReferenceRegistry.js';
import { listDesignScreensForProject, resolveDesignScreenRoute } from './designScreenRegistry.js';
import type { DesignScreenMatrixRow, ImplementationMatchStatus } from './types.js';

function mapImplementationStatus(
  projectId: string,
  screenId: string,
  viewportClass: 'mobile' | 'desktop',
): ImplementationMatchStatus {
  const canon = getActiveImplementationCanon(projectId, screenId, viewportClass);
  if (!canon) return 'NOT_STARTED';
  if (canon.status === 'STALE_AGAINST_NEW_REFERENCE') return 'STALE_AGAINST_NEW_REFERENCE';
  if (canon.founderJudgment === 'MATCHES' && canon.visualScore >= 0.8) return 'MATCHED';
  const run = getLatestReconstructionRun(projectId, screenId, viewportClass);
  if (run?.passState === 'BLOCKED') return 'BLOCKED';
  return 'NEEDS_MATCH';
}

export function buildDesignScreenMatrix(projectId: string): DesignScreenMatrixRow[] {
  const screens = listDesignScreensForProject(projectId);
  const uniqueScreens = screens.filter(
    (s, index, arr) => arr.findIndex((x) => x.screenId === s.screenId) === index,
  );

  return uniqueScreens.map((screen) => {
    const route = resolveDesignScreenRoute(screen, projectId);
    const mobileRef = getActiveCanonicalReference(projectId, screen.screenId, 'mobile');
    const desktopRef = getActiveCanonicalReference(projectId, screen.screenId, 'desktop');

    return {
      screenId: screen.screenId,
      displayName: screen.displayName,
      route,
      mobile: {
        referenceStatus: mobileRef
          ? mobileRef.status === 'DRAFT'
            ? 'DRAFT'
            : 'ACTIVE'
          : 'MISSING',
        referenceVersion: mobileRef?.version ?? null,
        implementationStatus: mapImplementationStatus(projectId, screen.screenId, 'mobile'),
      },
      desktop: {
        referenceStatus: desktopRef
          ? desktopRef.status === 'DRAFT'
            ? 'DRAFT'
            : 'ACTIVE'
          : 'MISSING',
        referenceVersion: desktopRef?.version ?? null,
        implementationStatus: mapImplementationStatus(projectId, screen.screenId, 'desktop'),
      },
    };
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
