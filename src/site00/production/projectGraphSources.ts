/**
 * Static production truth per project → graph parts (host side; data only, no runtime UI).
 *
 * Every part is built under the project's managed-registry id. A project that has no recorded truth for a domain
 * contributes nothing to it — the domain renders NOT_ESTABLISHED, never another project's data.
 *
 *   jurnl                   family production contracts F01–F16 (src/projects/families.ts)      → DESIGN
 *   all-in-one-enterprises  AIO IFTA visual-authority package (shared/studioos-visual-authority)  → DESIGN
 *   astral-world            Astral World scene system (shared/site00-astral-world/scenes)         → EXPERIENCE
 *   ndxbook                 Entry 002 expression production — live, built from HubData (see useProjectGraph)
 */
import { evaluateFamilyGate } from '../../../shared/site00-product-families/familyGate.js';
import {
  buildFamilyGraphPart,
  buildVisualAuthorityGraphPart,
  buildWorldGraphPart,
  scopedTabHref,
  type GraphPart,
} from '../../../shared/site00-production-graph/index.js';
import { aioIftaGateStatus } from '../../../shared/studioos-visual-authority/projects/aio/ifta.js';
import { AIO_IFTA_ASSETS } from '../../../shared/studioos-visual-authority/projects/aio/ifta-authority/assets.js';
import { AIO_IFTA_AUTHORITIES, AIO_IFTA_FOUNDER_DECISIONS, AIO_IFTA_CLIENT_REFERENCES, AIO_IFTA_STAFF_REFERENCES, AIO_IFTA_PUBLIC_REFERENCES } from '../../../shared/studioos-visual-authority/projects/aio/ifta-authority/authorities.js';
import { AIO_IFTA_DECISIONS } from '../../../shared/studioos-visual-authority/projects/aio/ifta-authority/decisions.js';
import { ASTRAL_HOTSPOTS, ASTRAL_SCENE_CONTRACTS, ASTRAL_SCENE_OBJECTS } from '../../../shared/site00-astral-world/scenes/index.js';
import { ASTRAL_REFERENCE_MANIFEST } from '../../../shared/site00-astral-world/scenes/referenceManifest.js';
import { projectFamilies } from '../../projects/families';

export const AIO_PROJECT_ID = 'all-in-one-enterprises';

function jurnlParts(projectId: string): GraphPart[] {
  const families = projectFamilies(projectId).map((f) => ({ contract: f.contract, gate: evaluateFamilyGate(f.contract, f.coverage) }));
  if (!families.length) return [];
  return [buildFamilyGraphPart(projectId, families, (familyId) => `/production/${projectId}/design?family=${encodeURIComponent(familyId)}`)];
}

function aioParts(projectId: string): GraphPart[] {
  const actors = ['CLIENT', 'FOUNDER_STAFF', 'PUBLIC'] as const;
  return [
    buildVisualAuthorityGraphPart(
      projectId,
      {
        featureId: 'AIO.IFTA',
        label: 'IFTA · FUEL TAX',
        authorities: AIO_IFTA_AUTHORITIES,
        gates: Object.fromEntries(actors.map((a) => [a, aioIftaGateStatus(a)])),
        founderDecisions: AIO_IFTA_FOUNDER_DECISIONS,
        references: [...AIO_IFTA_CLIENT_REFERENCES, ...AIO_IFTA_STAFF_REFERENCES, ...AIO_IFTA_PUBLIC_REFERENCES],
        decisions: AIO_IFTA_DECISIONS,
        assets: AIO_IFTA_ASSETS,
        parentActor: 'CLIENT',
        experienceContractId: 'AIO.IFTA experience contract',
        bundlePath: 'docs/aio/ifta/authority-bundle',
      },
      scopedTabHref('DESIGN', projectId),
    ),
  ];
}

function astralParts(projectId: string): GraphPart[] {
  return [
    buildWorldGraphPart(projectId, {
      worldLabel: 'ASTRAL WORLD',
      scenes: Object.values(ASTRAL_SCENE_CONTRACTS),
      objects: ASTRAL_SCENE_OBJECTS,
      hotspots: ASTRAL_HOTSPOTS,
      references: Object.values(ASTRAL_REFERENCE_MANIFEST),
      liveRoute: (section) => `/projects/astral-world/experience${section && section !== 'home' ? `/${section}` : ''}`,
      workspaceRoute: scopedTabHref('EXPERIENCE', projectId),
    }),
  ];
}

const STATIC: Record<string, (projectId: string) => GraphPart[]> = {
  jurnl: jurnlParts,
  [AIO_PROJECT_ID]: aioParts,
  'astral-world': astralParts,
};

const cache = new Map<string, GraphPart[]>();

/** The project's static truth (memoised per project). Unknown projects have none. */
export function staticGraphParts(projectId: string): GraphPart[] {
  const id = projectId.toLowerCase();
  if (!cache.has(id)) cache.set(id, STATIC[id]?.(id) ?? []);
  return cache.get(id)!;
}
