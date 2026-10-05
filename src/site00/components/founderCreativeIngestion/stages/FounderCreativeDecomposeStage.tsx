import type { SlideReconstructionSpec } from '../../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import { deriveSlideDisplayStatus, slideDisplayStatusLabel } from '../../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import { FounderCreativeWorkflowStageHeader } from '../FounderCreativeWorkflowShell';

export function FounderCreativeDecomposeStage({
  sequenceTitle,
  draftVersionLabel,
  specs,
  busy,
  generatingSlideId,
}: {
  sequenceTitle: string;
  draftVersionLabel: string;
  specs: SlideReconstructionSpec[];
  busy: boolean;
  generatingSlideId: string | null;
}) {
  const total = specs.length;
  const readyCount = specs.filter((entry) => deriveSlideDisplayStatus(entry, generatingSlideId) !== 'NOT_STARTED').length;

  return (
    <section className="site00-fci-gw__stage" aria-live="polite">
      <FounderCreativeWorkflowStageHeader
        step="DECOMPOSE"
        sequenceTitle={sequenceTitle}
        subtitle={draftVersionLabel}
        badge={busy ? 'Decomposing…' : `${readyCount} / ${total || '—'} slides ready`}
      />

      <p className="site00-fci-gw__help">
        Splitting your reference board into slide references and reconstruction specs. This continues
        automatically — no extra confirmation needed.
      </p>

      <div className="site00-fci-gw__decompose-progress">
        <div
          className="site00-fci-gw__decompose-bar"
          style={{ width: total > 0 ? `${Math.round((readyCount / total) * 100)}%` : '12%' }}
        />
      </div>

      <div className="site00-fci-gw__slide-rail">
        {(total > 0 ? specs : Array.from({ length: 3 }, () => null)).map((spec, index) => {
          if (!spec) {
            return (
              <div key={`placeholder-${index}`} className="site00-fci-gw__slide-rail-item site00-fci-gw__slide-rail-item--pending">
                {String(index + 1).padStart(2, '0')}
              </div>
            );
          }
          const status = deriveSlideDisplayStatus(spec, generatingSlideId);
          return (
            <div
              key={spec.slideId}
              className={`site00-fci-gw__slide-rail-item site00-fci-gw__slide-rail-item--${status.toLowerCase()}`}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span>{slideDisplayStatusLabel(status)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
