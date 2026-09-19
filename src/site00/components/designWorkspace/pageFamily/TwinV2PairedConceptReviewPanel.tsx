/**
 * P0.VR.TWINV2.5 — Founder review: VISUAL / BLUEPRINT / OVERLAY / ASSETS / FUNCTION MAP
 */

import { useMemo, useState } from 'react';
import type { ConceptDirectedTwinSession } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import type { ConceptCandidate } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/types.js';
import { conceptImageDisplayUrl } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptImageDisplayUrl.js';

type ReviewMode = 'VISUAL' | 'BLUEPRINT' | 'OVERLAY' | 'OBJECT_MAP' | 'FUNCTION_MAP' | 'ASSETS';

type Props = {
  session: ConceptDirectedTwinSession;
  candidate: ConceptCandidate;
};

export function TwinV2PairedConceptReviewPanel({ session, candidate }: Props) {
  const [mode, setMode] = useState<ReviewMode>('VISUAL');
  const gallery = session.conceptGallery;
  const pairedMeta = gallery?.pairedArtifacts?.[candidate.conceptId];
  const vbKey = pairedMeta?.conceptVisualBlueprintId;
  const vb =
    (vbKey ? gallery?.reconciledVisualBlueprints?.[vbKey] : undefined) ??
    Object.values(gallery?.reconciledVisualBlueprints ?? {}).find((b) => b.conceptId === candidate.conceptId);
  const visualBlueprint =
    vb ?? Object.values(gallery?.visualBlueprints ?? {}).find((b) => b.conceptId === candidate.conceptId);
  const assets = gallery?.generatedConceptAssets?.[candidate.conceptId] ?? [];
  const coverage = gallery?.blueprintVisualCoverage?.[candidate.conceptId];
  const assetCov = gallery?.assetCoverage?.[candidate.conceptId];
  const fnPlan = gallery?.functionTargetPlans?.[candidate.functionBindingPlanId];
  const surgicalTwin = Object.values(gallery?.surgicalBlueprintTwins ?? {}).find(
    (b) => b.conceptId === candidate.conceptId,
  );
  const contractSet = Object.values(gallery?.assetGenerationContractSets ?? {}).find(
    (s) => s.conceptId === candidate.conceptId,
  );
  const twinReconciliation = gallery?.twinReconciliationReceipts?.[candidate.conceptId];
  const objectList = surgicalTwin?.objects ?? visualBlueprint?.objects ?? [];

  const pairedFlags = useMemo(() => {
    const r = candidate.buildReadiness;
    return {
      visual: r.visualReady,
      blueprint: r.blueprintReady,
      reconciled: candidate.pairedConceptStatus === 'PAIRED_READY' || coverage?.status === 'PASS',
      assets: r.assetsReady && assetCov?.status === 'PASS',
      functions: r.functionsReady,
    };
  }, [candidate, coverage, assetCov]);

  if (candidate.conceptOrigin !== 'DUAL_OUTPUT_PAIRED' || !visualBlueprint) {
    return null;
  }

  const imageUrl = conceptImageDisplayUrl(candidate);

  return (
    <section className="site00-twin-v2-paired-review" aria-label="Paired concept review">
      <div className="site00-twin-v2-paired-review__flags">
        <span>VISUAL {pairedFlags.visual ? '✓' : '—'}</span>
        <span>BLUEPRINT {pairedFlags.blueprint ? '✓' : '—'}</span>
        <span>RECONCILED {pairedFlags.reconciled ? '✓' : '—'}</span>
        <span>ASSETS {pairedFlags.assets ? '✓' : '—'}</span>
        <span>FUNCTIONS {pairedFlags.functions ? '✓' : '—'}</span>
      </div>
      <div className="site00-twin-v2-paired-review__tabs" role="tablist">
        {(['VISUAL', 'BLUEPRINT', 'OVERLAY', 'OBJECT_MAP', 'FUNCTION_MAP', 'ASSETS'] as ReviewMode[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={mode === m ? 'is-active' : undefined}
            onClick={() => setMode(m)}
          >
            {m.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="site00-twin-v2-paired-review__stage">
        {mode === 'VISUAL' && imageUrl ? (
          <img
            key={`${candidate.conceptId}-${candidate.updatedAt}`}
            src={imageUrl}
            alt="Generated concept visual"
            className="site00-twin-v2-paired-review__visual"
          />
        ) : null}
        {(mode === 'BLUEPRINT' || mode === 'OBJECT_MAP') && objectList.length ? (
          <ul className="site00-twin-v2-paired-review__object-list">
            {objectList.map((o) => (
              <li key={o.objectId}>
                <code>{o.objectId}</code> — {o.role} ({'type' in o ? o.type : 'object'})
                {surgicalTwin && 'relationships' in surgicalTwin ? (
                  <span>
                    {' '}
                    · rel{' '}
                    {surgicalTwin.relationships.filter((r) => r.sourceObjectId === o.objectId).length}
                  </span>
                ) : null}
              </li>
            ))}
            {surgicalTwin ? (
              <li>
                <em>Surgical relationships: {surgicalTwin.relationships.length}</em>
                {twinReconciliation ? ` · reconciliation ${twinReconciliation.status}` : ''}
              </li>
            ) : null}
          </ul>
        ) : null}
        {mode === 'OVERLAY' && imageUrl && objectList.length ? (
          <div className="site00-twin-v2-paired-review__overlay-wrap">
            <img src={imageUrl} alt="" className="site00-twin-v2-paired-review__visual" />
            {objectList.map((o) => (
              <div
                key={o.objectId}
                className="site00-twin-v2-paired-review__overlay-box"
                title={o.objectId}
                style={{
                  left: `${o.x * 100}%`,
                  top: `${o.y * 100}%`,
                  width: `${o.width * 100}%`,
                  height: `${o.height * 100}%`,
                }}
              />
            ))}
          </div>
        ) : null}
        {mode === 'FUNCTION_MAP' && fnPlan ? (
          <ul className="site00-twin-v2-paired-review__object-list">
            {fnPlan.targets.map((t) => (
              <li key={t.objectId}>
                <code>{t.objectId}</code> → {t.liveFunction}
              </li>
            ))}
          </ul>
        ) : null}
        {mode === 'ASSETS' ? (
          <ul className="site00-twin-v2-paired-review__object-list">
            {assets.length === 0 ? <li>No standalone assets registered.</li> : null}
            {assets.map((a) => {
              const contract = contractSet?.contracts.find((c) => c.objectId === a.blueprintObjectId);
              return (
                <li key={a.assetId}>
                  <strong>{a.role}</strong> — <code>{a.blueprintObjectId}</code> — {a.assetSlotId} —{' '}
                  {contract?.canonicalAssetId ?? a.assetId} — {a.transparentBackground ? 'transparent' : 'opaque'} —{' '}
                  {contract ? `contract ${contract.assetGenerationContractId.slice(0, 24)}…` : 'no contract'} —{' '}
                  {a.canonicalFile}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
