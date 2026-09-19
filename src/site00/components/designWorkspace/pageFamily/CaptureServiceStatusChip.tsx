/**
 * P0.PCI.3R1 — Secondary capture readiness chip (does not block page family work).
 */

import { captureServiceChipLabel, type CaptureServiceInput } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyDependencyPolicy.js';

type Props = {
  captureService: CaptureServiceInput;
  onFix?: () => void;
};

export function CaptureServiceStatusChip({ captureService, onFix }: Props) {
  const label = captureServiceChipLabel(captureService);
  const ready = label === 'READY';
  const tone = ready ? 'ready' : label === 'OFFLINE' ? 'offline' : 'attention';

  return (
    <div className={`site00-pfw-capture-chip is-${tone}`} data-capture-ready={ready ? '1' : '0'}>
      <div className="site00-pfw-capture-chip__copy">
        <span className="site00-pfw-capture-chip__label">LIVE CAPTURE</span>
        <strong>{ready ? 'READY' : label === 'OFFLINE' ? 'OFFLINE' : 'NEEDS ATTENTION'}</strong>
      </div>
      {!ready && onFix ? (
        <button type="button" className="site00-pfw-capture-chip__fix" onClick={onFix}>
          FIX
        </button>
      ) : null}
    </div>
  );
}
