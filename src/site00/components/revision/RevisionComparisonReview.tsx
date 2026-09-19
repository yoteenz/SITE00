import { useCallback, useEffect, useState } from 'react';
import type {
  CreativeRevisionDiff,
  CreativeRevisionSpec,
  RevisionComparisonState,
  RevisionGenerationReceipt,
} from '../../../../shared/site00-brand-lore/creativeLineage/revisionTypes';
import { site00StoragePublicUrl } from '../../utils/replayStorageUrl';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';

type RevisionComparisonReviewProps = {
  projectSlug: string;
  spec: CreativeRevisionSpec;
  parentPreviewUrl: string;
  parentLabel: string;
  onClose: () => void;
  onReviseAgain: (childAssetId: string) => void;
  onJudgmentRecorded?: () => void;
};

function storageUrl(path: string | null | undefined): string {
  return path ? site00StoragePublicUrl(path) : '';
}

export function RevisionComparisonReview({
  projectSlug,
  spec,
  parentPreviewUrl,
  parentLabel,
  onClose,
  onReviseAgain,
  onJudgmentRecorded,
}: RevisionComparisonReviewProps) {
  const [comparison, setComparison] = useState<RevisionComparisonState | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await site00ProjectsApi.founderRevisionComparison(projectSlug, spec.revisionId);
      setComparison(result.comparison);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  }, [projectSlug, spec.revisionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const childUrl = storageUrl(comparison?.childStoragePath) || '';
  const diff: CreativeRevisionDiff | null = comparison?.diff ?? spec.complianceDiff;
  const receipt: RevisionGenerationReceipt | null = comparison?.generationReceipt ?? spec.generationReceipt;

  const recordJudgment = async (action: 'LOVE_IT' | 'NOT_FOR_ME') => {
    if (!comparison?.childAssetId) return;
    setActing(true);
    setError(null);
    try {
      await site00ProjectsApi.founderCreativeJudgmentRecord(projectSlug, {
        assetId: comparison.childAssetId,
        founderAction: action,
        judgmentReason: `Post-revision comparison — parent ${spec.parentAssetId}`,
      });
      onJudgmentRecorded?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Judgment failed');
    } finally {
      setActing(false);
    }
  };

  const setPreferred = async () => {
    if (!comparison?.childAssetId) return;
    setActing(true);
    try {
      await site00ProjectsApi.founderRevisionPreferredVersion(
        projectSlug,
        spec.rootAssetId,
        comparison.childAssetId,
      );
      onJudgmentRecorded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preferred version failed');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return <p className="site00-revision-studio__pending">LOADING COMPARISON…</p>;
  }

  return (
    <div className="site00-revision-comparison">
      <header className="site00-revision-studio__header">
        <h2>REVISION V{spec.revisionNumber}</h2>
        <button type="button" className="site00-revision-studio__close" onClick={onClose}>
          CLOSE
        </button>
      </header>

      <div className="site00-revision-comparison__grid">
        <section>
          <p className="site00-revision-studio__label">BEFORE</p>
          <p className="site00-revision-studio__meta">{parentLabel}</p>
          {parentPreviewUrl ? (
            <img src={parentPreviewUrl} alt="Before" className="site00-revision-studio__preview" />
          ) : (
            <p>NO PREVIEW</p>
          )}
        </section>
        <section>
          <p className="site00-revision-studio__label">AFTER</p>
          <p className="site00-revision-studio__meta">Child revision</p>
          {childUrl ? (
            <img src={childUrl} alt="After" className="site00-revision-studio__preview" />
          ) : (
            <p>NO CHILD PREVIEW</p>
          )}
        </section>
      </div>

      {diff ? (
        <section className="site00-revision-studio__section">
          <h3>REQUESTED CHANGES</h3>
          <ul>
            {diff.requestedChanges.map((entry) => (
              <li key={entry.requestedChange}>
                {entry.requestedChange}: <strong>{entry.result}</strong> — {entry.evidence}
              </li>
            ))}
          </ul>
          <h3>PRESERVED / LOCKED</h3>
          <ul>
            {diff.lockedElementsPreserved.map((entry) => (
              <li key={entry.requestedChange}>
                {entry.requestedChange}: {entry.result}
              </li>
            ))}
          </ul>
          <h3>UNREQUESTED DRIFT</h3>
          <ul>
            {diff.unrequestedDrift.map((entry) => (
              <li key={entry.requestedChange}>{entry.evidence}</li>
            ))}
          </ul>
          <p>
            Summary compliance: <strong>{diff.summaryCompliance}</strong>
          </p>
        </section>
      ) : null}

      {receipt ? (
        <details className="site00-revision-studio__brief">
          <summary>GENERATION DETAILS</summary>
          <pre>
            {JSON.stringify(
              {
                mode: receipt.generationMode,
                provider: receipt.provider,
                model: receipt.model,
                cost: receipt.costEstimateUsd,
                storagePath: receipt.storagePath,
              },
              null,
              2,
            )}
          </pre>
        </details>
      ) : null}

      {error ? (
        <p className="site00-revision-studio__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="site00-revision-studio__actions">
        <button type="button" disabled={acting} onClick={() => void recordJudgment('LOVE_IT')}>
          LOVE IT
        </button>
        <button
          type="button"
          disabled={acting}
          onClick={() => comparison?.childAssetId && onReviseAgain(comparison.childAssetId)}
        >
          REVISE AGAIN
        </button>
        <button type="button" disabled={acting} onClick={() => void recordJudgment('NOT_FOR_ME')}>
          NOT FOR ME
        </button>
        <button type="button" disabled={acting} onClick={() => void setPreferred()}>
          SET PREFERRED VERSION
        </button>
      </div>
    </div>
  );
}
