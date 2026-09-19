/**
 * P0.DEPLOY.1 — Compact production deployment overview (MORE → DEPLOYMENTS).
 */

import { useEffect, useState } from 'react';
import { MoreToolPageShell } from './MoreToolPageShell';
import { MoreSummaryGrid, MoreSummaryTile } from './MoreSummaryTile';
import {
  P0_DEPLOY_1_BUILD,
  SITE00_PRODUCTION_API_URL,
  SITE00_PRODUCTION_FRONTEND_URL,
  describeCurrentDeploymentTopology,
  checkReleaseCompatibility,
  parseBackendHealthPayload,
  parseFrontendHealthFromManifest,
} from '../../../../../shared/site00-release-engine/index.js';

type Props = {
  onBack: () => void;
};

type LiveReceipt = {
  frontendVersion: string | null;
  apiVersion: string | null;
  workerVersion: string | null;
  releaseId: string | null;
  status: 'READY' | 'PARTIAL' | 'UNKNOWN' | 'CHECKING';
  lastChecked: string | null;
};

export function DesignMoreDeploymentsPage({ onBack }: Props) {
  const topology = describeCurrentDeploymentTopology();
  const [live, setLive] = useState<LiveReceipt>({
    frontendVersion: null,
    apiVersion: null,
    workerVersion: null,
    releaseId: null,
    status: 'CHECKING',
    lastChecked: null,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? SITE00_PRODUCTION_API_URL;
        const [manifestRes, healthRes] = await Promise.all([
          fetch(`${SITE00_PRODUCTION_FRONTEND_URL}/release-manifest.json`, { cache: 'no-store' }).catch(() => null),
          fetch(`${apiBase}/api/health`, { cache: 'no-store' }).catch(() => null),
        ]);
        const manifestRaw = manifestRes?.ok ? await manifestRes.json() : null;
        const healthRaw = healthRes?.ok ? await healthRes.json() : null;
        const frontend = parseFrontendHealthFromManifest(manifestRaw);
        const backend = parseBackendHealthPayload(healthRaw);
        const compat = checkReleaseCompatibility(manifestRaw, backend, frontend);
        if (cancelled) return;
        setLive({
          frontendVersion: compat.frontendVersion ?? P0_DEPLOY_1_BUILD,
          apiVersion: compat.apiVersion ?? P0_DEPLOY_1_BUILD,
          workerVersion: compat.workerVersion ?? P0_DEPLOY_1_BUILD,
          releaseId: frontend.releaseId ?? backend.releaseId,
          status: compat.compatible ? 'READY' : compat.status === 'VERSION_MISMATCH' ? 'PARTIAL' : 'UNKNOWN',
          lastChecked: new Date().toISOString(),
        });
      } catch {
        if (!cancelled) {
          setLive((prev) => ({
            ...prev,
            status: 'UNKNOWN',
            frontendVersion: P0_DEPLOY_1_BUILD,
            apiVersion: P0_DEPLOY_1_BUILD,
            workerVersion: P0_DEPLOY_1_BUILD,
            lastChecked: new Date().toISOString(),
          }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visualState = live.status === 'READY' ? 'ready' : live.status === 'PARTIAL' ? 'attention' : 'neutral';

  return (
    <MoreToolPageShell
      title="DEPLOYMENTS"
      description="Production release status — merge to main triggers the pipeline."
      visualState={visualState}
      statusBadge={live.status === 'READY' ? 'PRODUCTION READY ✓' : live.status}
      headline="PRODUCTION RELEASE"
      support="Normal releases: merge PR → GitHub Actions handles test, build, Railway verify, cPanel deploy."
      onBack={onBack}
      summary={
        <MoreSummaryGrid>
          <MoreSummaryTile label="FRONTEND" value={live.frontendVersion ?? P0_DEPLOY_1_BUILD} tone={visualState} />
          <MoreSummaryTile label="API" value={live.apiVersion ?? P0_DEPLOY_1_BUILD} tone={visualState} />
          <MoreSummaryTile label="WORKER" value={live.workerVersion ?? P0_DEPLOY_1_BUILD} tone={visualState} />
          <MoreSummaryTile label="RELEASE" value={live.releaseId ?? '—'} tone="neutral" />
        </MoreSummaryGrid>
      }
      detailsContent={
        <dl className="site00-dw-more-tool__detail-grid">
          <div>
            <dt>PIPELINE BUILD</dt>
            <dd>{P0_DEPLOY_1_BUILD}</dd>
          </div>
          <div>
            <dt>FRONTEND HOST</dt>
            <dd>{topology.frontend.productionDomain}</dd>
          </div>
          <div>
            <dt>API HOST</dt>
            <dd>{topology.backend.productionDomain}</dd>
          </div>
          <div>
            <dt>TRIGGER</dt>
            <dd>{topology.releaseTrigger}</dd>
          </div>
          <div>
            <dt>FRONTEND STRATEGY</dt>
            <dd>{topology.frontend.deploymentMechanism}</dd>
          </div>
          <div>
            <dt>BACKEND STRATEGY</dt>
            <dd>{topology.backend.deploymentMechanism}</dd>
          </div>
          <div>
            <dt>LAST CHECKED</dt>
            <dd>{live.lastChecked ?? '—'}</dd>
          </div>
        </dl>
      }
    />
  );
}
