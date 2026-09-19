import type { FounderCreativeParentSequence } from '../../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import { parentReferenceStatusLabel } from '../../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';

export function FounderCreativeSequencePicker({
  sequences,
  activeSequenceId,
  onSelect,
}: {
  sequences: FounderCreativeParentSequence[];
  activeSequenceId: string;
  onSelect: (sequenceId: string) => void;
}) {
  return (
    <section className="site00-fci-gw__sequence-picker" aria-label="Launch row sequences">
      <p className="site00-fci-gw__preview-label">Row 01 sequences</p>
      <div className="site00-fci__row-grid">
        {sequences.map((seq) => (
          <button
            key={seq.sequenceId}
            type="button"
            className={`site00-fci__row-tile${activeSequenceId === seq.sequenceId ? ' site00-fci__row-tile--active' : ''}`}
            onClick={() => onSelect(seq.sequenceId)}
          >
            <span className="site00-fci__row-num">{String(seq.rowIndex + 1).padStart(2, '0')}</span>
            <span className="site00-fci__row-title">{seq.title}</span>
            <span className="site00-fci__row-meta">
              {seq.slideIds.length || '—'} slides · {seq.role.replace(/_/g, ' ')}
              {seq.referenceStatus ? ` · ${parentReferenceStatusLabel(seq.referenceStatus)}` : ''}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
