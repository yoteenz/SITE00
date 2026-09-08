/**
 * B5.10 — Build technical readiness from evidence-backed domains.
 */

import type {
  ProjectCodebaseIntelligence,
  ProjectTechnicalReadiness,
  ReadinessDomain,
  ReadinessDomainStatus,
  OverallReadiness,
} from './types.js';

function domain(
  name: string,
  status: ReadinessDomainStatus,
  opts?: Partial<ReadinessDomain>,
): ReadinessDomain {
  return {
    domain: name,
    status,
    reason: opts?.reason ?? null,
    evidence: opts?.evidence ?? null,
    lastCheckedAt: opts?.lastCheckedAt ?? null,
    recommendedAction: opts?.recommendedAction ?? null,
    blockingRelease: opts?.blockingRelease ?? status === 'BLOCKED',
  };
}

function ciToDomain(name: string, state: { status: string; failureSummary: string | null }): ReadinessDomain {
  if (state.status === 'PASSING') return domain(name, 'PASS', { evidence: `${name} PASSING` });
  if (state.status === 'FAILING') {
    return domain(name, 'BLOCKED', {
      reason: state.failureSummary ?? `${name} FAILING`,
      recommendedAction: `FIX ${name} BEFORE RELEASE`,
      blockingRelease: true,
    });
  }
  if (state.status === 'WARNING') return domain(name, 'WARNING', { reason: `${name} NEEDS ATTENTION` });
  if (state.status === 'NOT_CONFIGURED') return domain(name, 'NOT_APPLICABLE');
  return domain(name, 'UNKNOWN');
}

export function buildProjectTechnicalReadiness(intelligence: ProjectCodebaseIntelligence): ProjectTechnicalReadiness {
  const conn = intelligence.repositoryConnection;
  const domains: ReadinessDomain[] = [];

  if (!conn.connected) {
    domains.push(
      domain('CODE HEALTH', 'UNKNOWN', { reason: 'REPOSITORY NOT CONNECTED' }),
      domain('BUILD', 'UNKNOWN'),
      domain('TESTS', 'UNKNOWN'),
      domain('SECURITY', 'UNKNOWN'),
      domain('DEPENDENCIES', 'UNKNOWN'),
      domain('ENVIRONMENTS', 'UNKNOWN'),
      domain('DEPLOYMENT', 'UNKNOWN'),
      domain('LAUNCH CHECKLIST', 'UNKNOWN'),
    );
    return {
      overall: 'UNKNOWN',
      overallPercent: null,
      percentDerivation: null,
      blockerCount: 0,
      warningCount: 0,
      domains,
      blockers: ['REPOSITORY NOT CONNECTED'],
      warnings: [],
    };
  }

  domains.push(
    domain('CODE HEALTH', conn.connectionHealth === 'HEALTHY' ? 'PASS' : 'WARNING', {
      evidence: `SYNC ${conn.syncConfidence}`,
    }),
    ciToDomain('BUILD', intelligence.buildState),
    ciToDomain('TESTS', intelligence.testState),
    ciToDomain('LINT', intelligence.lintState),
    ciToDomain('TYPECHECK', intelligence.typecheckState),
    domain('SECURITY', intelligence.securityState.dependencyRisk === 'HIGH' ? 'BLOCKED' : intelligence.securityState.knownAdvisories > 0 ? 'WARNING' : 'PASS', {
      evidence: `${intelligence.securityState.knownAdvisories} ADVISORIES`,
      blockingRelease: intelligence.securityState.criticalCount > 0,
    }),
    domain('DEPENDENCIES', intelligence.dependencyState.outdated.length > 5 ? 'WARNING' : 'PASS', {
      evidence: `${intelligence.dependencyState.outdated.length} OUTDATED`,
    }),
    domain('ENVIRONMENTS', intelligence.environmentState.some((e) => e.envVarMissingCount > 0) ? 'WARNING' : 'PASS'),
    domain('DEPLOYMENT', intelligence.deploymentState.find((d) => d.environment === 'PRODUCTION')?.status === 'NOT_DEPLOYED' ? 'BLOCKED' : 'PASS', {
      blockingRelease: intelligence.deploymentState.find((d) => d.environment === 'PRODUCTION')?.status === 'NOT_DEPLOYED',
    }),
    domain('DATABASE / MIGRATIONS', intelligence.migrationState.pending > 0 ? 'WARNING' : 'PASS'),
    domain('DOMAIN / DNS', 'UNKNOWN'),
    domain('PERFORMANCE', 'UNKNOWN'),
    domain('UPTIME', 'UNKNOWN'),
    domain('LAUNCH CHECKLIST', intelligence.blockers.length ? 'BLOCKED' : 'PASS'),
  );

  const blockers = domains.filter((d) => d.blockingRelease).map((d) => d.reason ?? d.domain);
  const warnings = domains.filter((d) => d.status === 'WARNING').map((d) => d.reason ?? d.domain);

  let overall: OverallReadiness = 'UNKNOWN';
  if (blockers.length) overall = 'NOT_READY';
  else if (warnings.length) overall = 'READY_WITH_WARNINGS';
  else if (domains.every((d) => d.status === 'PASS' || d.status === 'NOT_APPLICABLE')) overall = 'READY';

  const passCount = domains.filter((d) => d.status === 'PASS').length;
  const measurable = domains.filter((d) => d.status !== 'NOT_APPLICABLE' && d.status !== 'UNKNOWN').length;
  const overallPercent = measurable > 0 ? Math.round((passCount / measurable) * 100) : null;

  return {
    overall,
    overallPercent,
    percentDerivation: overallPercent != null ? `${passCount}/${measurable} DOMAINS PASSING` : null,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    domains,
    blockers,
    warnings,
  };
}
