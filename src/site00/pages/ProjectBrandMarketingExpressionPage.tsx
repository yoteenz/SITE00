import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { NdxFounderWorkspacePage, FounderWorkspacePanel } from '../components/founderWorkspace';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectBrandMarketingExpressionExperiment01Path } from '../config/routes';
import type { BrandMarketingExpressionRun } from '../../../shared/site00-brand-lore/brandMarketingExpression/types';
import { NDX_PUBLIC_BEHAVIOR_THESIS } from '../../../shared/site00-brand-lore/brandMarketingExpression/constants';

const POLL_MS = 5000;

export default function ProjectBrandMarketingExpressionPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandMarketingExpressionRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!hasProjectCapability(projectSlug, 'BRAND_MARKETING_EXPRESSION')) return;
    try {
      const result = await site00ProjectsApi.marketingExpressionGet(projectSlug);
      setRun((result.run as BrandMarketingExpressionRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (run?.status !== 'EXPERIMENT_01_FORMULATING') return;
    const id = window.setInterval(() => void reload(), POLL_MS);
    return () => window.clearInterval(id);
  }, [run?.status, reload]);

  const prepare = async () => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.marketingExpressionPrepare(projectSlug);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  const compile = async () => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.marketingExpressionCompile(projectSlug);
      setRun((result.run as BrandMarketingExpressionRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  const sys = run?.expressionSystem;
  const northStar = run?.northStarArtifact;

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title="MARKETING EXPRESSION"
      subtitle="CHARACTER-LED MARKETING EXPRESSION"
      loading={loading}
      loadingLabel="LOADING MARKETING EXPRESSION…"
      nonNdxFallback={<p>Marketing Expression is NDXBOOK-only.</p>}
      operate={
        <>
          <FounderWorkspacePanel title="PUBLIC BEHAVIOR THESIS">
            <p>{sys?.publicBehaviorThesis ?? NDX_PUBLIC_BEHAVIOR_THESIS}</p>
            <ul>
              <li>
                <strong>How NDX enters a topic:</strong> {sys?.contentInitiationRules[0] ?? 'Character Event precedes artifact'}
              </li>
              <li>
                <strong>How NDX reacts:</strong> {sys?.reactionBehavior}
              </li>
              <li>
                <strong>How NDX investigates:</strong> {sys?.investigationBehavior}
              </li>
              <li>
                <strong>How NDX connects:</strong> {sys?.connectionBehavior}
              </li>
              <li>
                <strong>How NDX judges:</strong> {sys?.judgmentBehavior}
              </li>
              <li>
                <strong>How NDX remembers:</strong> {sys?.memoryBehavior}
              </li>
              <li>
                <strong>How NDX jokes:</strong> {sys?.humorBehavior}
              </li>
              <li>
                <strong>How NDX corrects itself:</strong> {sys?.correctionBehavior}
              </li>
              <li>
                <strong>How NDX uses evidence:</strong> {sys?.evidenceBehavior}
              </li>
              <li>
                <strong>How NDX becomes visual:</strong> {sys?.makerBehavior}
              </li>
              <li>
                <strong>Must never become template:</strong> {sys?.mustNeverBecome.join('; ') ?? 'Social template library'}
              </li>
            </ul>
          </FounderWorkspacePanel>

          {northStar ? (
            <FounderWorkspacePanel title="FOUNDER NORTH STAR — CHARACTER EXPRESSION CALIBRATION">
              <p>
                <strong>Classification:</strong> {northStar.classification} — NOT FINAL IDENTITY
              </p>
              <p>
                <strong>Founder judgment:</strong> {northStar.founderJudgment ?? 'Pending'}
              </p>
              <p>
                <strong>Character authority:</strong> {northStar.characterExpressionAuthority} | <strong>Identity authority:</strong>{' '}
                {northStar.identityAuthority}
              </p>
              <h3>WHY THIS FEELS LIKE NDX</h3>
              <ul>
                {northStar.panels.map((p) => (
                  <li key={p.panelCode}>
                    {p.panelCode}: {p.whyFeelsLikeNdx}
                  </li>
                ))}
              </ul>
              <h3>WHAT WE ARE NOT AUTOMATICALLY COPYING</h3>
              <p>{sys?.mustNotRequire.join(', ') ?? 'lime, cream paper, collage, handwriting, receipts'}</p>
            </FounderWorkspacePanel>
          ) : null}

          <FounderWorkspacePanel title="STATUS">
            <p>Status: {run?.status ?? 'NOT_STARTED'}</p>
            {!run && (
              <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void prepare()}>
                RUN FORENSIC AUDIT + PREPARE
              </button>
            )}
            {run && !sys && (
              <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void compile()}>
                COMPILE MARKETING EXPRESSION SYSTEM
              </button>
            )}
            {sys && (
              <Link className="site00-btn site00-btn--primary" to={site00ProjectBrandMarketingExpressionExperiment01Path(projectSlug)}>
                OPEN EXPERIMENT 01 →
              </Link>
            )}
          </FounderWorkspacePanel>
        </>
      }
    />
  );
}
