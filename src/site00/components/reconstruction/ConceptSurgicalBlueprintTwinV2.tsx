/**
 * P0.VR.TWINV2.7 — Blueprint-exclusive coded twin (no authority visual substrate).
 */

import type { CSSProperties } from 'react';
import type { ConceptDirectedTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import { getActiveConceptCandidate } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import type { SurgicalBlueprintObject } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV27/types.js';
import '../../styles/site00-twin-v2-concept.css';

type Props = {
  session: ConceptDirectedTwinSession;
};

function objStyle(o: SurgicalBlueprintObject): CSSProperties {
  return {
    position: 'absolute',
    left: `${o.x * 100}%`,
    top: `${o.y * 100}%`,
    width: `${o.width * 100}%`,
    minHeight: `${o.height * 100}%`,
    zIndex: o.zIndex,
    opacity: o.opacity,
    color: o.color ?? undefined,
    background: o.background ?? undefined,
    fontSize: o.fontSize ? `${o.fontSize * 375}px` : undefined,
    fontWeight: o.fontWeight ?? undefined,
    textTransform: (o.textTransform as CSSProperties['textTransform']) ?? undefined,
  };
}

export function ConceptSurgicalBlueprintTwinV2({ session }: Props) {
  const active = getActiveConceptCandidate(session);
  const surgical = active
    ? Object.values(session.conceptGallery?.surgicalBlueprintTwins ?? {}).find((b) => b.conceptId === active.conceptId)
    : null;
  const bindings = active ? session.conceptGallery?.surgicalBlueprintCodeBindings?.[active.conceptId] : null;

  if (!surgical || !active) {
    return (
      <p className="site00-twin-v2-sbt__error" role="alert">
        TWIN_V2_SURGICAL_BLUEPRINT: missing surgical twin for active concept
      </p>
    );
  }

  return (
    <div
      className="site00-twin-v2-sbt"
      data-twin-v2="surgical-blueprint-compiler"
      data-composition-state-id={surgical.compositionStateId}
      data-blueprint-twin-id={surgical.blueprintTwinId}
      data-authority-substrate="false"
    >
      <div className="site00-twin-v2-sbt__canvas" style={{ position: 'relative', width: 375, height: 812, margin: '0 auto' }}>
        {surgical.objects.map((o) => {
          const bound = bindings?.find((b) => b.objectId === o.objectId);
          if (o.type === 'SURFACE') {
            return <div key={o.objectId} className={bound?.selector.replace('.', '')} style={objStyle(o)} aria-hidden />;
          }
          if (o.type === 'DIVIDER') {
            return <div key={o.objectId} className={bound?.selector.replace('.', '')} style={objStyle(o)} role="separator" />;
          }
          if (o.type === 'TEXT' || o.type === 'METRIC' || o.type === 'NAV_ITEM' || o.type === 'BUTTON') {
            return (
              <div key={o.objectId} className={bound?.selector.replace('.', '')} style={objStyle(o)} data-exec-object-id={o.objectId}>
                {o.textContent ?? (o.dataVisualState === 'UNKNOWN' ? '—' : o.textContent)}
              </div>
            );
          }
          if (o.renderPrimitive === 'MEDIA' && bound?.canonicalAssetId) {
            return (
              <img
                key={o.objectId}
                className={bound.selector.replace('.', '')}
                style={objStyle(o)}
                src={`/assets/canonical/${bound.canonicalAssetId}.png`}
                alt={o.role}
                data-canonical-asset-id={bound.canonicalAssetId}
              />
            );
          }
          return null;
        })}
      </div>
      <p className="site00-twin-v2-sbt__meta">
        SURGICAL_BLUEPRINT · objects {surgical.objects.length} · bindings {bindings?.length ?? 0}
      </p>
    </div>
  );
}
