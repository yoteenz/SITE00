import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  bootstrapAsstsBatch,
  generateAsstsBatch,
  pollAsstsJobs,
  resetAsstsBatchReview,
} from '../services/asstsApi';

type AsstsDevPanelProps = {
  batchId?: string | null;
  onRefresh: () => void;
};

export function AsstsDevPanel({ batchId, onRefresh }: AsstsDevPanelProps) {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(searchParams.get('factory') === '1');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const tapRef = useRef(0);

  const run = useCallback(
    async (label: string, fn: () => Promise<unknown>) => {
      setBusy(label);
      setMessage(null);
      try {
        await fn();
        setMessage(`${label} complete`);
        onRefresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : `${label} failed`);
      } finally {
        setBusy(null);
      }
    },
    [onRefresh],
  );

  return (
    <>
      <button
        type="button"
        className="site00-assts-dev-trigger"
        aria-label="Asset Factory developer controls"
        onClick={() => {
          tapRef.current += 1;
          if (tapRef.current >= 3) {
            setOpen((v) => !v);
            tapRef.current = 0;
          }
          window.setTimeout(() => {
            tapRef.current = 0;
          }, 600);
        }}
      />
      {open ? (
        <div className="site00-assts-dev-panel site00-assts-panel" role="region" aria-label="Asset Factory controls">
          <div className="site00-assts-dev-panel__head">
            <span className="site00-label-red">ASSET FACTORY</span>
            <button type="button" className="site00-assts-dev-panel__close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <p className="site00-assts-dev-panel__hint">Internal pipeline controls — not part of reviewer workflow.</p>
          <div className="site00-assts-dev-panel__actions">
            <button type="button" disabled={!!busy} onClick={() => void run('Bootstrap', () => bootstrapAsstsBatch())}>
              Bootstrap Batch
            </button>
            <button type="button" disabled={!!busy} onClick={() => void run('Generate', () => generateAsstsBatch())}>
              Run FAL Generation
            </button>
            <button type="button" disabled={!!busy} onClick={() => void run('Poll jobs', () => pollAsstsJobs())}>
              Poll Jobs
            </button>
            {batchId ? (
              <button
                type="button"
                disabled={!!busy}
                onClick={() => void run('Reset review', () => resetAsstsBatchReview(batchId))}
              >
                Reset for Review
              </button>
            ) : null}
            <Link to="/assts/composition-studio" className="site00-assts-dev-panel__link">
              Edit Composition
            </Link>
          </div>
          {message ? <p className="site00-assts-dev-panel__msg">{message}</p> : null}
        </div>
      ) : null}
    </>
  );
}

/** Poll faster while generation is active; slow down when idle. */
export function useAsstsAutoRefresh(
  refresh: () => void | Promise<void>,
  opts?: { hasGenerating?: boolean; intervalMs?: number; fastIntervalMs?: number },
) {
  const fast = opts?.fastIntervalMs ?? 4000;
  const slow = opts?.intervalMs ?? 12000;
  const active = opts?.hasGenerating ?? false;

  useEffect(() => {
    void refresh();
    const ms = active ? fast : slow;
    const t = window.setInterval(() => void refresh(), ms);
    return () => window.clearInterval(t);
  }, [refresh, active, fast, slow]);
}
