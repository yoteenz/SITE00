/**
 * P0.VR.3L — Design workspace missing targets queue + derivation review.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  buildMissingTargetQueue,
  summarizeMissingTargetQueue,
  getCharacterLabVoiceLabEntry,
  FAMILY_SOURCE_SNAPSHOT_LABEL,
  COMPOSER_DERIVED_DRAFT_LABEL,
  analyzeShellPropagationImpact,
  normalizePropagationScope,
  propagationRequiresFounderConfirmation,
  listSharedShells,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3l/browserClient.js';
import type { ShellPropagationScope } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3l/browserClient.js';
import type { VoiceLabSourceDerivedReview } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3j2/client.js';
import { DesignShellPropagationPanel } from './DesignShellPropagationPanel.js';

function SnapshotThumb({ url, label }: { url: string | null; label: string }) {
  return (
    <figure className="site00-dw-missing-targets__thumb">
      <figcaption>{label}</figcaption>
      {url ? <img src={url} alt={label} loading="lazy" /> : <div className="site00-dw-missing-targets__thumb-missing">NO CAPTURE</div>}
    </figure>
  );
}

export function DesignMissingTargetQueue() {
  const queue = buildMissingTargetQueue();
  const summary = summarizeMissingTargetQueue();
  const voiceLab = getCharacterLabVoiceLabEntry();
  const [propagationTarget, setPropagationTarget] = useState<string | null>(null);
  const [voiceReview, setVoiceReview] = useState<VoiceLabSourceDerivedReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setReviewLoading(true);
      try {
        const res = await fetch('/api/site00/implementation-snapshots?view=voice_lab_review');
        if (res.ok) setVoiceReview((await res.json()) as VoiceLabSourceDerivedReview);
      } catch {
        /* offline */
      } finally {
        setReviewLoading(false);
      }
    })();
  }, []);

  const scopePreview = useMemo(() => {
    if (!propagationTarget || !voiceLab?.sharedShellId) return null;
    return analyzeShellPropagationImpact({
      scope: 'DESIGN_FAMILY',
      projectId: 'NDXBOOK',
      shellId: voiceLab.sharedShellId,
      familyId: 'ndxbook-character-lab-family',
      targetId: propagationTarget,
    });
  }, [propagationTarget, voiceLab?.sharedShellId]);

  return (
    <section className="site00-dw-missing-targets" data-visual-reconstruction="p0vr3l-missing-targets">
      <header className="site00-dw-missing-targets__head">
        <h2>MISSING TARGETS</h2>
        <p className="site00-dw-missing-targets__summary">
          {summary.total} total · {summary.readyForDerivation} ready · {summary.derivedDraft} derived ·{' '}
          {summary.trueMissing} true missing · {summary.existingUnregistered} unregistered
        </p>
      </header>

      {voiceLab && (
        <article className="site00-dw-missing-targets__featured">
          <h3>CHARACTER LAB — VOICE LAB</h3>
          <p>
            Classification: {voiceLab.targetType} · Parent: {voiceLab.experiencePageId} · Source sibling:{' '}
            {voiceLab.sourceSiblingId ?? 'pending'}
          </p>
          <p>
            Shared shell: {voiceLab.sharedShellId ?? 'ndx-character-lab-shell'} · Status: {voiceLab.queueStatus}
          </p>
          <p className="site00-dw-missing-targets__labels">
            Source: {FAMILY_SOURCE_SNAPSHOT_LABEL} · Target: {COMPOSER_DERIVED_DRAFT_LABEL}
          </p>
          <button type="button" onClick={() => setPropagationTarget(voiceLab.targetId)}>
            PREVIEW SHELL PROPAGATION
          </button>
          {reviewLoading ? (
            <p className="site00-dw-missing-targets__loading">LOADING SOURCE VS DERIVED REVIEW…</p>
          ) : voiceReview ? (
            <div className="site00-dw-missing-targets__compare">
              <h4>SOURCE VS DERIVED REVIEW</h4>
              <p>
                Status: {voiceReview.reviewStatus} · Ready: {voiceReview.readyForFounderReview ? 'yes' : 'no'}
              </p>
              <div className="site00-dw-missing-targets__compare-grid">
                <div>
                  <h5>SOURCE — LANGUAGE LAB</h5>
                  <div className="site00-dw-missing-targets__thumbs">
                    <SnapshotThumb url={voiceReview.source.mobile} label="MOBILE" />
                    <SnapshotThumb url={voiceReview.source.tablet} label="TABLET" />
                    <SnapshotThumb url={voiceReview.source.desktop} label="DESKTOP" />
                  </div>
                </div>
                <div>
                  <h5>DERIVED — VOICE LAB</h5>
                  <div className="site00-dw-missing-targets__thumbs">
                    <SnapshotThumb url={voiceReview.derived.mobile} label="MOBILE" />
                    <SnapshotThumb url={voiceReview.derived.tablet} label="TABLET" />
                    <SnapshotThumb url={voiceReview.derived.desktop} label="DESKTOP" />
                  </div>
                </div>
              </div>
              <p>
                Expected diff: {voiceReview.expectedDifferences.join(', ')}
              </p>
              {voiceReview.unexpectedDifferences.length > 0 && (
                <p className="site00-dw-missing-targets__warn">
                  Unexpected: {voiceReview.unexpectedDifferences.join(', ')}
                </p>
              )}
            </div>
          ) : null}
        </article>
      )}

      {propagationTarget && scopePreview && (
        <DesignShellPropagationPanel
          shellId={voiceLab?.sharedShellId ?? 'ndx-character-lab-shell'}
          projectId="NDXBOOK"
          familyId="ndxbook-character-lab-family"
          targetId={propagationTarget}
          impact={scopePreview}
          onClose={() => setPropagationTarget(null)}
        />
      )}

      <div className="site00-dw-missing-targets__shells">
        <h3>SHARED SHELL GRAPH</h3>
        <ul>
          {listSharedShells().map((shell) => (
            <li key={shell.shellId}>
              <strong>{shell.shellId}</strong> ({shell.projectId}) — {shell.consumerPageIds.length} pages · v
              {shell.version}
            </li>
          ))}
        </ul>
      </div>

      <ul className="site00-dw-missing-targets__list">
        {queue.map((entry) => (
          <li key={entry.targetId} className="site00-dw-missing-targets__item">
            <strong>{entry.displayName}</strong>
            <span className="site00-dw-missing-targets__meta">
              {entry.projectId} · {entry.targetType} · {entry.queueStatus}
            </span>
            {entry.experiencePageId && (
              <span className="site00-dw-missing-targets__meta">ExperiencePage: {entry.experiencePageId}</span>
            )}
            {entry.sourceSiblingId && (
              <span className="site00-dw-missing-targets__meta">Source sibling: {entry.sourceSiblingId}</span>
            )}
            {entry.derived && <span className="site00-dw-missing-targets__badge">COMPOSER DERIVED</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function buildPropagationScopeFromUi(input: {
  targetOnly: boolean;
  family: boolean;
  global: boolean;
}): ShellPropagationScope {
  return normalizePropagationScope({
    TARGET_ONLY: input.targetOnly,
    DESIGN_FAMILY: input.family,
    SHARED_SHELL_GLOBAL: input.global,
  });
}

export function shellPropagationNeedsConfirmation(scope: ShellPropagationScope): boolean {
  return propagationRequiresFounderConfirmation(scope);
}
