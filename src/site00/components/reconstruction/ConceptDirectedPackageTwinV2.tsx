/**
 * P0.VR.TWINV2.3 — Package-driven coded twin (blueprint authority; no semantic fallback / ghost image).
 */

import type { CSSProperties } from 'react';
import type { ConceptDirectedTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import type {
  ConceptBlueprintObject,
  ExecutableConceptPackage,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/types.js';
import { resolveExecutablePackageForConcept } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV23/traceActiveApprovedConceptLineage.js';
import { getActiveConceptCandidate } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import { isHostOwnedBlueprintLabel } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/isHostOwnedBlueprintLabel.js';
import { TwinSite00HostBottomNav } from './TwinSite00HostBottomNav.js';
import '../../styles/site00-twin-v2-concept.css';

type Props = {
  projectSlug: string;
  session: ConceptDirectedTwinSession;
};

function resolvePackage(session: ConceptDirectedTwinSession): ExecutableConceptPackage | null {
  const fromRender = session.renderedTwin?.sourcePackageId;
  const active = getActiveConceptCandidate(session);
  const conceptId = session.renderedTwin?.sourceConceptId ?? active?.conceptId;
  if (!conceptId) return null;
  const galleryPkg = resolveExecutablePackageForConcept(session, conceptId);
  if (galleryPkg && (!fromRender || galleryPkg.packageId === fromRender)) return galleryPkg;
  return galleryPkg;
}

function typographyStyle(
  obj: ConceptBlueprintObject,
  roles: ExecutableConceptPackage['blueprint']['typography']['roles'],
): CSSProperties {
  const roleName = obj.textRole ?? 'body';
  const role = roles.find((r) => r.role === roleName) ?? roles.find((r) => r.role === 'body');
  const sizeNorm = role?.sizeNorm ?? 0.028;
  return {
    fontSize: `clamp(0.65rem, ${sizeNorm * 100}vw, 1.05rem)`,
    fontWeight: role?.weight === '700' ? 700 : role?.weight === '600' ? 600 : 400,
    textTransform: role?.case === 'uppercase' ? 'uppercase' : 'none',
    letterSpacing: role?.case === 'uppercase' ? '0.06em' : 'normal',
  };
}

function functionLinesForObject(
  pkg: ExecutableConceptPackage,
  obj: ConceptBlueprintObject,
  session: ConceptDirectedTwinSession,
): string[] {
  const fg = pkg.functionGraphSnapshot ?? session.functionGraph;
  const roleUpper = obj.role.toUpperCase();
  for (const b of pkg.functionBindingPlan.bindings) {
    if (b.status !== 'BOUND') continue;
    if (!roleUpper.includes(b.visualRegion.split(' ')[0] ?? '')) continue;
    switch (b.functionKey) {
      case 'project_progress':
        return fg.progress;
      case 'current_phase':
        return fg.currentPhase;
      case 'key_metrics':
        return fg.metrics;
      case 'current_focus':
        return fg.currentFocus;
      case 'next_milestone':
        return fg.milestone;
      case 'recent_activity':
        return fg.recentActivity;
      case 'section_nav':
        return fg.sectionNavigation;
      default:
        return [];
    }
  }
  if (obj.type === 'metric') return fg.metrics.length ? fg.metrics : fg.progress;
  if (obj.interactionRole === 'navigation') return fg.sectionNavigation;
  return [];
}

function assetUrlForObject(pkg: ExecutableConceptPackage, obj: ConceptBlueprintObject): string | null {
  const slot = pkg.assetManifest.slots.find((s) => s.objectId === obj.objectId);
  if (!slot) return null;
  if (slot.sourceAsset) return slot.sourceAsset;
  if (slot.derivedAsset) return slot.derivedAsset;
  if (slot.sourceStrategy === 'GENERATED_CONCEPT_ASSET' || slot.sourceStrategy === 'CONCEPT_REGION_DERIVATION') {
    return pkg.visualAuthority.imageUrl;
  }
  return null;
}

export function ConceptDirectedPackageTwinV2({ projectSlug, session }: Props) {
  const pkg = resolvePackage(session);
  if (!pkg) {
    return (
      <p className="site00-twin-v2-pkg__error" role="alert">
        TWIN_V2_PACKAGE_CONSUMPTION_FAILED: no ExecutableConceptPackage for render
      </p>
    );
  }

  const clientObjects = [...pkg.blueprint.objects]
    .filter((o) => !(o.type === 'shell' && isHostOwnedBlueprintLabel(o.role)))
    .sort((a, b) => a.zLayer - b.zLayer);

  const pageIntent = pkg.pageIntentSnapshot ?? session.pageIntent;
  const bg = pkg.blueprint.colors.background[0] ?? '#ffffff';
  const lime = pkg.blueprint.colors.lime[0] ?? '#c8ff00';

  return (
    <div
      className="site00-twin-v2-pkg"
      data-twin-v2="package-driven"
      data-twin-v2-session={session.sessionId}
      data-twin-v2-build={session.buildRef}
      data-source-package-id={pkg.packageId}
      data-source-concept-id={pkg.conceptId}
      data-source-blueprint-id={pkg.blueprint.blueprintId}
      style={{ ['--twin-v2-pkg-bg' as string]: bg, ['--twin-v2-pkg-lime' as string]: lime }}
    >
      <header className="site00-twin-v2-pkg__host">
        <span className="site00-twin-v2-pkg__host-label">SITE 00</span>
        <span className="site00-twin-v2-pkg__host-route">{projectSlug.toUpperCase()}</span>
      </header>

      <div className="site00-twin-v2-pkg__client-canvas" data-client-mount="true">
        <div className="site00-twin-v2-pkg__artboard" aria-label="Package-driven blueprint layout">
          {clientObjects.map((obj) => {
            const style: CSSProperties = {
              left: `${obj.bounds.x * 100}%`,
              top: `${obj.bounds.y * 100}%`,
              width: `${obj.bounds.w * 100}%`,
              minHeight: `${obj.bounds.h * 100}%`,
              zIndex: obj.zLayer,
              background: obj.color ?? undefined,
              ...typographyStyle(obj, pkg.blueprint.typography.roles),
            };
            const fnLines = functionLinesForObject(pkg, obj, session);
            const assetUrl = obj.type === 'image' ? assetUrlForObject(pkg, obj) : null;

            return (
              <div
                key={obj.objectId}
                className={`site00-twin-v2-pkg__obj site00-twin-v2-pkg__obj--${obj.type}`}
                data-object-id={obj.objectId}
                data-blueprint-role={obj.role}
                style={style}
              >
                {obj.type === 'image' && assetUrl ? (
                  <img
                    src={assetUrl}
                    alt=""
                    className="site00-twin-v2-pkg__slot-image"
                    data-asset-slot={obj.assetRole ?? undefined}
                  />
                ) : null}
                {obj.type === 'text' || obj.type === 'surface' ? (
                  <div className="site00-twin-v2-pkg__text">
                    <span className="site00-twin-v2-pkg__role">{obj.role}</span>
                    {obj.textRole === 'headline' ? (
                      <strong>{pageIntent.primaryDecision || pkg.blueprint.pageStructure}</strong>
                    ) : null}
                  </div>
                ) : null}
                {obj.type === 'metric' || fnLines.length ? (
                  <ul className="site00-twin-v2-pkg__fn">
                    {fnLines.slice(0, 6).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}
                {obj.type === 'nav' ? (
                  <div className="site00-twin-v2-pkg__nav">
                    {fnLines.map((item) => (
                      <span key={item} className="site00-twin-v2-pkg__chip">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <aside className="site00-twin-v2-pkg__lineage" aria-label="Build lineage">
        <p>
          BUILT FROM CONCEPT · {pkg.conceptId.slice(0, 12)}… · PACKAGE {pkg.packageId.slice(0, 16)}… · BLUEPRINT{' '}
          {pkg.blueprint.blueprintId.slice(0, 14)}…
        </p>
      </aside>

      <TwinSite00HostBottomNav />
    </div>
  );
}
