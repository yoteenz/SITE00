import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { site00EvolveApi } from '../../services/evolveApi';
import {
  projectPersonalityReplayPath,
} from '../../../config/personalityReplayRoutes';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

type ReplayRecord = {
  replayId: string;
  status: string;
  loreMode: string;
  personalityReadiness: string | null;
  personalityMissingDomains: string[];
  hardcodingAudit?: { passed: boolean; forbiddenCount: number };
  comparisonReport?: {
    scores?: { personalityConvergence: number; creativeConvergence: number; identityConvergence: number; heroConvergence: number };
  } | null;
  founderValidationJudgment: string | null;
};

const ORG_SLUG = 'ndxbook';

export default function NdxbookPipelineReplayValidationPage() {
  const { replayId } = useParams<{ replayId?: string }>();
  const navigate = useNavigate();
  const [replays, setReplays] = useState<ReplayRecord[]>([]);
  const [active, setActive] = useState<ReplayRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    const list = await site00EvolveApi.personalityReplayList(ORG_SLUG);
    setReplays(list.replays as ReplayRecord[]);
    if (replayId) {
      const detail = await site00EvolveApi.personalityReplayGet(ORG_SLUG, replayId);
      setActive(detail.replay as ReplayRecord);
    } else {
      setActive(null);
    }
  }, [replayId]);

  useEffect(() => {
    void reload().catch((err) => setError(err instanceof Error ? err.message : 'Load failed'));
  }, [reload]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const result = await site00EvolveApi.personalityReplayCreate(ORG_SLUG);
      navigate(`/admin/site00/orchestration/${ORG_SLUG}/evolve/pipeline-replay-validation/${result.replay.replayId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const handleJudgment = async (judgment: 'PIPELINE_VALIDATED' | 'PARTIAL_REVIEW_DIVERGENCE' | 'FAILED_METHODOLOGY_DRIFT') => {
    if (!replayId) return;
    await site00EvolveApi.personalityReplaySetJudgment(ORG_SLUG, replayId, judgment);
    await reload();
  };

  return (
    <Site00AdminShell>
      <div className="site00-admin-panel">
        <h1>NDX BOOK · PIPELINE REPLAY VALIDATION</h1>
        <p className="site00-admin-panel__lede">
          Shadow validation — fresh founder personality intake reproduces NDX creative DNA without benchmark leakage.
        </p>
        <p>
          <Link to={SITE00_ADMIN_ROUTES.evolveCreativeDirection(ORG_SLUG)}>← CREATIVE DIRECTION STUDIO</Link>
        </p>

        {error ? <p className="site00-admin-error">{error}</p> : null}

        {!replayId ? (
          <>
            <button type="button" disabled={creating} onClick={() => void handleCreate()}>
              {creating ? 'CREATING…' : 'START NEW REPLAY VALIDATION'}
            </button>
            <ul>
              {replays.map((r) => (
                <li key={r.replayId}>
                  <Link to={`/admin/site00/orchestration/${ORG_SLUG}/evolve/pipeline-replay-validation/${r.replayId}`}>
                    {r.replayId.slice(0, 8)} — {r.status}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : active ? (
          <>
            <h2>REPLAY {active.replayId.slice(0, 8)}</h2>
            <p>STATUS: {active.status}</p>
            <p>LORE MODE: {active.loreMode}</p>
            <p>PERSONALITY READINESS: {active.personalityReadiness ?? 'INCOMPLETE'}</p>
            {active.personalityMissingDomains.length > 0 ? (
              <p>MISSING: {active.personalityMissingDomains.join(', ')}</p>
            ) : null}

            {['CREATED', 'INTAKE_IN_PROGRESS', 'PERSONALITY_READY', 'FORMATION_READY'].includes(active.status) ? (
              <p>
                <Link to={projectPersonalityReplayPath('ndxbook')}>OPEN BLIND PERSONALITY INTAKE →</Link>
              </p>
            ) : null}

            <section className="site00-admin-panel__section">
              <h3>COMPARISON (POST-GENERATION ONLY)</h3>
              <div className="site00-replay-comparison-grid">
                <div>
                  <h4>CANONICAL</h4>
                  <p>BENCHMARK — CURRENT CANON (loaded only after shadow hero)</p>
                </div>
                <div>
                  <h4>SHADOW REPLAY</h4>
                  <p>Generated without benchmark access</p>
                  {active.comparisonReport?.scores ? (
                    <ul>
                      <li>PERSONALITY: {active.comparisonReport.scores.personalityConvergence}/5</li>
                      <li>CREATIVE: {active.comparisonReport.scores.creativeConvergence}/5</li>
                      <li>IDENTITY: {active.comparisonReport.scores.identityConvergence}/5</li>
                      <li>HERO: {active.comparisonReport.scores.heroConvergence}/5</li>
                    </ul>
                  ) : (
                    <p>Awaiting pipeline completion</p>
                  )}
                </div>
              </div>
            </section>

            <section className="site00-admin-panel__section">
              <h3>FOUNDER VALIDATION (METHODOLOGY ONLY)</h3>
              <div className="site00-admin-button-row">
                <button type="button" onClick={() => void handleJudgment('PIPELINE_VALIDATED')}>
                  PIPELINE VALIDATED
                </button>
                <button type="button" onClick={() => void handleJudgment('PARTIAL_REVIEW_DIVERGENCE')}>
                  PARTIAL — REVIEW DIVERGENCE
                </button>
                <button type="button" onClick={() => void handleJudgment('FAILED_METHODOLOGY_DRIFT')}>
                  FAILED — METHODOLOGY DRIFT
                </button>
              </div>
              <p>CURRENT JUDGMENT: {active.founderValidationJudgment ?? 'NONE'}</p>
            </section>

            <p>HARDCODING AUDIT: {active.hardcodingAudit?.passed ? 'PASS' : 'REVIEW'} ({active.hardcodingAudit?.forbiddenCount ?? 0} forbidden)</p>
          </>
        ) : null}
      </div>
    </Site00AdminShell>
  );
}
