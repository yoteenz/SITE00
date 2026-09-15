import { P0_VR_TWIN_V41_LINEAGE, TWIN_V41_EXTRACTION_VERSION, TWIN_V41_REQUIRED_MAJOR_REGIONS } from './constants.js';
import { buildTwinV41PixelDerivedSceneGraph } from './buildPixelDerivedSceneGraph.js';
import { runForensicPixelAnalysis } from './forensicPixelAnalysis.js';
import { loadForensicRasterFromUri } from './loadForensicRaster.js';
import { resolveTwinV41ForensicPixelAuthority } from './resolveTwinV41ForensicPixelAuthority.js';
import type {
  TwinV41PixelExtractionBundle,
  TwinV41PixelExtractionGateStatus,
  TwinV41ProjectStyleFirewall,
} from './twinV41Types.js';
import { writeTwinV41Bundle } from './twinV41Persistence.js';

export const TWIN_V41_PROJECT_STYLE_FIREWALL: TwinV41ProjectStyleFirewall = {
  forbidNdxbookDarkTheme: true,
  forbidLimePageBackground: true,
  forbidV3ImplementationCards: true,
  forbidProjectPanelStyling: true,
};

function criticalRegionChecks(
  majorRegionIds: string[],
): TwinV41PixelExtractionBundle['criticalRegionChecks'] {
  const set = new Set(majorRegionIds);
  return TWIN_V41_REQUIRED_MAJOR_REGIONS.reduce(
    (acc, id) => {
      acc[id] = set.has(id);
      return acc;
    },
    {} as TwinV41PixelExtractionBundle['criticalRegionChecks'],
  );
}

export async function compileTwinV41PixelExtraction(input: {
  projectId: string;
  sourceActualHash: string;
}): Promise<TwinV41PixelExtractionBundle> {
  const authorityLock = await resolveTwinV41ForensicPixelAuthority(input);
  const raster = await loadForensicRasterFromUri(authorityLock.imageUri);
  const analysis = runForensicPixelAnalysis({
    raster,
    authorityHash: authorityLock.artifactHash,
  });
  const sceneGraph = buildTwinV41PixelDerivedSceneGraph({
    analysis,
    authorityHash: authorityLock.artifactHash,
  });

  const nodesWithoutEvidence = sceneGraph.nodes.filter((n) => n.evidence.evidenceCount === 0).length;
  const checks = criticalRegionChecks(analysis.majorRegions.map((r) => r.regionId));
  const criticalRegionsMissing = TWIN_V41_REQUIRED_MAJOR_REGIONS.filter((id) => !checks[id]);

  const avgConf =
    sceneGraph.nodes.reduce((s, n) => s + n.evidence.confidence, 0) / Math.max(1, sceneGraph.nodes.length);

  let gateStatus: TwinV41PixelExtractionGateStatus =
    criticalRegionsMissing.length === 0 && nodesWithoutEvidence === 0 ?
      'FOUNDER_EXTRACTION_REVIEW'
    : 'BLOCKED';

  if (gateStatus === 'FOUNDER_EXTRACTION_REVIEW') {
    gateStatus = 'FOUNDER_EXTRACTION_REVIEW';
  }

  const receipt: TwinV41PixelExtractionBundle['receipt'] = {
    authorityArtifactId: authorityLock.artifactId,
    authorityHash: authorityLock.artifactHash,
    sourceDimensions: { width: raster.width, height: raster.height },
    extractionVersion: TWIN_V41_EXTRACTION_VERSION,
    majorRegionCount: analysis.majorRegions.length,
    textRegionCount: analysis.textRegionMap.regions.length,
    edgeCount: analysis.edgeMap.edges.length,
    calloutCount: analysis.calloutMap.callouts.length,
    visualObjectCount: analysis.visualObjectRegions.length,
    sceneNodeCount: sceneGraph.nodes.length,
    nodesWithoutEvidence,
    criticalRegionsMissing,
    averageConfidence: avgConf,
    status: gateStatus,
  };

  const bundle: TwinV41PixelExtractionBundle = {
    lineage: P0_VR_TWIN_V41_LINEAGE,
    authorityLock,
    analysis,
    sceneGraph,
    receipt,
    gate: { status: gateStatus },
    reconstructionEngineProof: 'INCONCLUSIVE',
    domReconstructionTriggered: false,
    pixelExtractionReviewRequired: true,
    criticalRegionChecks: checks,
  };

  writeTwinV41Bundle(bundle);
  return bundle;
}
