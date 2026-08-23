import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReplayConvergenceReport } from '../../../../shared/site00-brand-lore/personalityReplayTypes';
import type { ReplayExecutionPhase } from '../../../../shared/site00-brand-lore/replayExecutionPhases';
import { PersonalityReplayExecutionProgress } from './PersonalityReplayExecutionProgress';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { site00ProjectPersonalityReplayPath } from '../../config/routes';
import { isPersonalityReplayIntakeSubmitted } from '../../utils/personalityReplaySubmit';
import '../../styles/site00-replay-execution.css';

type ReplayPayload = {
  replayId: string;
  status?: string;
  executionPhase?: ReplayExecutionPhase | null;
  executionError?: string | null;
  executionJobId?: string | null;
  nativeProofFormat?: string | null;
  heroAsset?: { assetId?: string; storagePath?: string } | null;
  comparisonReport?: ReplayConvergenceReport | null;
};

/**
 * Project command surface — shows blind replay execution state after personality submit.
 */
export function ProjectPersonalityReplayStatus({ projectSlug }: { projectSlug: string }) {
  const [replay, setReplay] = useState<ReplayPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectSlug !== 'ndxbook') return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const boot = await site00ProjectsApi.personalityReplayBootstrap(projectSlug);
        const payload: ReplayPayload = {
          ...(boot.replay as ReplayPayload),
          replayId: boot.replay.replayId,
        };
        if (!cancelled) setReplay(payload);
      } catch {
        if (!cancelled) setReplay(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectSlug]);

  if (projectSlug !== 'ndxbook' || loading || !replay) return null;
  if (!isPersonalityReplayIntakeSubmitted(replay.status) && !replay.executionJobId) return null;

  return (
    <div className="site00-project-command__replay-status">
      <p className="site00-project-command__note">BLIND PERSONALITY REPLAY — EXECUTION</p>
      <PersonalityReplayExecutionProgress
        projectSlug={projectSlug}
        replayId={replay.replayId}
        replay={replay}
        onReplayUpdate={(next: Partial<ReplayPayload>) =>
          setReplay({ ...replay, ...next, replayId: replay.replayId })
        }
      />
      <Link className="site00-action-link site00-action-link--red" to={site00ProjectPersonalityReplayPath(projectSlug)}>
        OPEN REPLAY REVIEW →
      </Link>
    </div>
  );
}
