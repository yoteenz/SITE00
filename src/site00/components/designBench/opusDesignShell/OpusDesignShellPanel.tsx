/**
 * P0.VR.OPUS-NATIVE-SHELL-SERVICE1 — native Anthropic visual shell workflow (staged only).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { OPUS_DESIGN_SHELL_MODEL } from '../../../../../shared/site00-opus-design-shell/constants.js';
import type {
  OpusDesignShellEligibilityInput,
  OpusDesignShellResult,
} from '../../../../../shared/site00-opus-design-shell/types.js';
import { getPageConceptSourceCaptures } from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import { loadPageAuthorityWorkflow } from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { compilePageFunctionContract } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import {
  approveOpusShell,
  createComposerShellHandoff,
  createOpusDesignShellPackage,
  fetchOpusDesignShellServiceInfo,
  preflightOpusDesignShell,
  requestOpusShellChanges,
  runOpusDesignShell,
} from '../../../services/opusDesignShellClient.js';
import { useDesignAgentTarget } from '../designAgent/useDesignAgentTarget';
import { AiConsoleButton, AiConsoleSection } from '../aiConsoles/AiConsoleShell';

export function OpusDesignShellPanel() {
  const targeting = useDesignAgentTarget();
  const projectId = targeting.projectSlug || 'ndxbook';
  const pageId = targeting.pageId ?? `${projectId}:overview:/projects/${projectId}`;

  const [serviceReady, setServiceReady] = useState<boolean | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [primaryAction, setPrimaryAction] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('');
  const [changeInstruction, setChangeInstruction] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<OpusDesignShellResult | null>(null);
  const [handoffId, setHandoffId] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eligibilityInput = useMemo((): OpusDesignShellEligibilityInput => {
    const wf = loadPageAuthorityWorkflow(projectId, pageId);
    const captures = getPageConceptSourceCaptures(projectId, pageId);
    const fc = compilePageFunctionContract(projectId, pageId);
    return {
      targetType: 'PAGE',
      projectId,
      pageId,
      mobilePromoted: Boolean(wf.promoted.mobileConceptId),
      desktopPromoted: Boolean(wf.promoted.desktopConceptId),
      pairReviewCompleted: Boolean(wf.twinReviewedAt ?? wf.pairReviewOpenedAt),
      pairLocked: Boolean(wf.pairLockedAt),
      hasFunctionContract: Boolean(fc),
      hasMobileCapture: Boolean(captures.mobile?.artifactPath),
      hasDesktopCapture: Boolean(captures.desktop?.artifactPath),
      anthropicConfigured: serviceReady ?? false,
      modelAvailable: true,
    };
  }, [pageId, projectId, serviceReady]);

  const refreshPreflight = useCallback(async () => {
    try {
      const info = await fetchOpusDesignShellServiceInfo();
      setServiceReady(info.anthropicConfigured);
      const eligibility = await preflightOpusDesignShell(
        { ...eligibilityInput, anthropicConfigured: info.anthropicConfigured },
        result?.packageId,
      );
      setBlockedReason(eligibility.blockedReason);
      setPrimaryAction(eligibility.primaryAction);
    } catch (e) {
      setBlockedReason(e instanceof Error ? e.message : 'Preflight failed');
      setPrimaryAction(null);
    }
  }, [eligibilityInput, result?.packageId]);

  useEffect(() => {
    void refreshPreflight();
  }, [refreshPreflight]);

  const onRunOpus = async () => {
    setBusy(true);
    setError(null);
    try {
      const pkg = await createOpusDesignShellPackage(eligibilityInput, instruction.trim() || undefined);
      const { result: staged } = await runOpusDesignShell({
        package: pkg,
        mode: primaryAction === 'REFINE DESIGN SHELL' ? 'REFINE' : 'CREATE',
        founderConfirmedRun: true,
      });
      setResult(staged);
      setConfirmOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'RUN_FAILED');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="s00-aic__shellWorkflow" data-testid="opus-design-shell-panel">
      <AiConsoleSection label="ELIGIBILITY">
        {blockedReason ?
          <p data-testid="opus-shell-blocked">{blockedReason}</p>
        : <p data-testid="opus-shell-ready">Ready for {primaryAction ?? 'DESIGN SHELL'}.</p>}
      </AiConsoleSection>

      <AiConsoleSection label="COST GUARD">
        <p>MODEL: CLAUDE OPUS 5 ({OPUS_DESIGN_SHELL_MODEL})</p>
        <p>PROMPT CACHE: enabled (stable prefix)</p>
        <p>CONTEXT: scoped presentation files only</p>
      </AiConsoleSection>

      {!result ?
        <>
          <label className="s00-aic__field">
            Founder instruction (optional)
            <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={3} />
          </label>
          <AiConsoleButton
            label={primaryAction ?? 'CREATE DESIGN SHELL'}
            interactionId="opus-shell-primary-action"
            disabled={Boolean(blockedReason) || busy}
            disabledReason={blockedReason}
            onClick={() => {
              if (blockedReason) return;
              setConfirmOpen(true);
            }}
          />
        </>
      : null}

      {confirmOpen ?
        <div data-testid="opus-shell-cost-confirm" role="dialog" className="s00-aic__confirm">
          <p>RUN OPUS — explicit confirmation required. No automatic dispatch.</p>
          <AiConsoleButton label="RUN OPUS" interactionId="opus-shell-run" disabled={busy} onClick={() => void onRunOpus()} primary />
          <AiConsoleButton
            label="CANCEL"
            interactionId="opus-shell-cancel"
            disabled={busy}
            onClick={() => setConfirmOpen(false)}
          />
        </div>
      : null}

      {result ?
        <AiConsoleSection label="OPUS SHELL REVIEW">
          <p>{result.summary}</p>
          <p>{result.shellStrategy}</p>
          <ul>
            {result.proposedFiles.map((f) => (
              <li key={f.path}>
                {f.path} — {f.summary}
              </li>
            ))}
          </ul>
          <textarea
            className="s00-aic__field"
            placeholder="Scoped visual instruction for request changes"
            value={changeInstruction}
            onChange={(e) => setChangeInstruction(e.target.value)}
            rows={2}
          />
          <AiConsoleButton
            label="REQUEST CHANGES"
            interactionId="opus-shell-request-changes"
            disabled={busy || !changeInstruction.trim()}
            onClick={() => {
              void (async () => {
                setBusy(true);
                try {
                  const next = await requestOpusShellChanges({
                    shellResultId: result.shellResultId,
                    changeInstruction: changeInstruction.trim(),
                    founderConfirmedRun: true,
                  });
                  if (next.result) setResult(next.result);
                } finally {
                  setBusy(false);
                }
              })();
            }}
          />
          <AiConsoleButton
            label="APPROVE SHELL"
            interactionId="opus-shell-approve"
            disabled={busy || result.status === 'APPROVED'}
            onClick={() => void approveOpusShell(result.shellResultId).then(setResult)}
            primary
          />
          <AiConsoleButton
            label="SEND TO COMPOSER"
            interactionId="opus-shell-send-composer"
            disabled={busy || result.status !== 'APPROVED' || Boolean(handoffId)}
            onClick={() =>
              void createComposerShellHandoff(result.shellResultId).then((h) => setHandoffId(h.packageId))
            }
          />
          {handoffId ? <p data-testid="opus-shell-handoff">Composer handoff: {handoffId}</p> : null}
        </AiConsoleSection>
      : null}

      {error ? <p className="s00-aic__notice s00-aic__notice--error">{error}</p> : null}

      <AiConsoleButton
        label={showTechnical ? 'HIDE TECHNICAL DETAILS' : 'VIEW TECHNICAL DETAILS'}
        onClick={() => setShowTechnical((v) => !v)}
      />
      {showTechnical && result ?
        <pre data-testid="opus-shell-telemetry">{JSON.stringify(result.usageReceipt, null, 2)}</pre>
      : null}
    </div>
  );
}
