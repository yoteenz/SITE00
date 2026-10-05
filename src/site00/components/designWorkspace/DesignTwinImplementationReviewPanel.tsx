import { useState } from 'react';
import {
  approveMobileTwinImplementationOnServer,
  compileMobileTwinImplementationRoute,
  requestMobileTwinImplementationCorrectionOnServer,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/requestMobileTwinImplementation.js';
import type {
  CompiledMobileTwinImplementationDocument,
  MobileTwinImplementationCorrectionReason,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';
import { mobileTwinTwinPreviewRoute } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/constants.js';
import { DesignTwinImplementationExpressionTrace } from './DesignTwinImplementationExpressionTrace.js';
import { DesignTwinImplementationTranslationInspector } from './DesignTwinImplementationTranslationInspector.js';
import { DesignTwinImplementationAuthorityInspector } from './DesignTwinImplementationAuthorityInspector.js';
import { DesignTwinForensicImplementationInspector } from './DesignTwinForensicImplementationInspector.js';

type ReviewMode =
  | 'LIVE'
  | 'ACTUAL'
  | 'FORENSIC_BLUEPRINT'
  | 'BLUEPRINT'
  | 'COMPARE_ACTUAL'
  | 'COMPARE_BLUEPRINT'
  | 'PACKAGE';

type Props = {
  projectId: string;
  buildId: string;
  reviewMode: ReviewMode;
  onReviewModeChange: (mode: ReviewMode) => void;
  implementationVersion: string;
  founderStatus: string;
  promotionStatus: string;
  serverBacked?: boolean;
  implementationDocument?: CompiledMobileTwinImplementationDocument | null;
  onUpdated: () => void;
};

const MODES: { id: ReviewMode; label: string }[] = [
  { id: 'LIVE', label: 'LIVE IMPLEMENTATION' },
  { id: 'ACTUAL', label: 'ACTUAL AUTHORITY' },
  { id: 'FORENSIC_BLUEPRINT', label: 'FORENSIC BLUEPRINT' },
  { id: 'BLUEPRINT', label: 'BLUEPRINT AUTHORITY' },
  { id: 'COMPARE_ACTUAL', label: 'COMPARE ACTUAL ↔ LIVE' },
  { id: 'COMPARE_BLUEPRINT', label: 'COMPARE BLUEPRINT ↔ LIVE STRUCTURE' },
  { id: 'PACKAGE', label: 'PACKAGE' },
];

const CORRECTION_REASONS: MobileTwinImplementationCorrectionReason[] = [
  'VISUAL FIDELITY',
  'LAYOUT',
  'TYPOGRAPHY',
  'ASSET',
  'FUNCTION',
  'INTERACTION',
  'HOST/PROJECT FIREWALL',
  'RESPONSIVE',
  'OTHER',
];

export function DesignTwinImplementationReviewPanel({
  projectId,
  buildId,
  reviewMode,
  onReviewModeChange,
  implementationVersion,
  founderStatus,
  promotionStatus,
  serverBacked = true,
  implementationDocument = null,
  onUpdated,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [correctionReason, setCorrectionReason] = useState<MobileTwinImplementationCorrectionReason>('VISUAL FIDELITY');

  const runApprove = () => {
    setBusy(true);
    setMsg(null);
    void approveMobileTwinImplementationOnServer({ projectId, buildId })
      .then(() => {
        setMsg('Implementation founder-approved.');
        onUpdated();
      })
      .catch((e: Error) => setMsg(e.message))
      .finally(() => setBusy(false));
  };

  const runCorrection = () => {
    setBusy(true);
    setMsg(null);
    void requestMobileTwinImplementationCorrectionOnServer({ projectId, buildId, reason: correctionReason })
      .then(() => {
        setMsg('Implementation correction requested (creative package remains locked).');
        onUpdated();
      })
      .catch((e: Error) => setMsg(e.message))
      .finally(() => setBusy(false));
  };

  return (
    <section className="site00-dw-v3-twin-impl-review" data-testid="twin-implementation-review">
      <p>
        {implementationVersion} · {mobileTwinTwinPreviewRoute(projectId)} · founder {founderStatus} · promotion{' '}
        {promotionStatus}
      </p>
      <div className="site00-dw-v3-twin-impl-review__modes">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={reviewMode === m.id ? 'is-active' : undefined}
            onClick={() => onReviewModeChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      {!serverBacked ?
        <p className="site00-dw-v3-authority__hint" data-testid="twin-implementation-local-only">
          Local preview only — founder approve/correction requires BUILD TWIN on Design with API reachable.
        </p>
      : null}
      {serverBacked && founderStatus !== 'FOUNDER_APPROVED' ?
        <>
          <button type="button" data-testid="approve-implementation" disabled={busy} onClick={runApprove}>
            APPROVE IMPLEMENTATION
          </button>
          <label>
            REQUEST IMPLEMENTATION CORRECTION
            <select value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value as MobileTwinImplementationCorrectionReason)}>
              {CORRECTION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <button type="button" data-testid="request-implementation-correction" disabled={busy} onClick={runCorrection}>
            REQUEST IMPLEMENTATION CORRECTION
          </button>
        </>
      : promotionStatus === 'PROMOTION_READY' ?
        <p data-testid="ready-for-promotion">READY FOR PROMOTION (explicit promote sprint required)</p>
      : null}
      {msg ? <p role="status">{msg}</p> : null}
      {implementationDocument ?
        <>
          <DesignTwinImplementationTranslationInspector document={implementationDocument} />
          {implementationDocument.compilerGeneration === 'R8M2R4' ?
            <DesignTwinImplementationAuthorityInspector document={implementationDocument} />
          : null}
          {implementationDocument.compilerGeneration === 'R8M2R5' ?
            <DesignTwinForensicImplementationInspector document={implementationDocument} />
          : null}
          <DesignTwinImplementationExpressionTrace document={implementationDocument} />
        </>
      : null}
    </section>
  );
}

export async function triggerCompileFromDesignSession(session: import('../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js').DesignPageAuthorityReviewSession) {
  return compileMobileTwinImplementationRoute({ session });
}
